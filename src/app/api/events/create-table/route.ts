import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_JWT_SECRET!,
);

export async function POST(req: Request) {
  try {
    const { eventId } = await req.json();

    // Get the mapping info from the event_column_mappings table
    const { data: mappings, error } = await supabase
      .from("event_column_mappings")
      .select("supabase_column, data_type")
      .eq("event_id", eventId);

    if (error || !mappings?.length) {
      return NextResponse.json({ error: "No mappings found" }, { status: 400 });
    }

    const tableName = `event_${eventId}_attendees`;

    if (mappings.some((m) => m.supabase_column.trim() === "plus_one")) {
      // We add main_guest_id column to reference the main guest
      mappings.push({ supabase_column: "main_guest_id", data_type: "uuid" });
    }

    // We build the SQL query to create the table based on the mappings
    const generatedColumns = mappings
      .map((m) => {
        if (m.supabase_column.trim() === "phone_no") {
          return `${m.supabase_column} text`; // (We do not add the unique) We ought to add the UNIQUE constraint to ensure no duplicate phone numbers(In short reduce duplicates that may arise as a result of user negligence or errors due to incomplete network requests to supabase when we try to sync sheets to supabase)
        }

        if (m.supabase_column.trim() === "plus_one") {
          return `${m.supabase_column} boolean default false`; //We set default value of plus_one to false, because not all events will require a plus one
        }

        // For all other columns, we return the column name and its data type
        return `${m.supabase_column} ${
          m.data_type === "text" ? "text" : m.data_type
        }`;
      })
      .join(", ");

    const sql = `
    create table if not exists "${tableName}" (
      id uuid primary key default uuid_generate_v4(),
      ${generatedColumns}
    );
  `;

    const { error: sqlError } = await supabase.rpc("exec_sql", { query: sql });
    if (sqlError) {
      console.log(
        "Error happened while creating table:",
        sqlError.message,
        "1",
      );
      return NextResponse.json({ error: sqlError.message }, { status: 400 });
    }

    // Allow RLS policies so i can select and enable realtime
    const realtimeSQL = `
      ALTER TABLE "${tableName}" 
      ENABLE ROW LEVEL SECURITY; 
      
      CREATE POLICY "Allow realtime select" 
      ON "${tableName}"
      FOR SELECT
      USING (true);
      
      ALTER PUBLICATION supabase_realtime
      ADD TABLE "${tableName}";
  `;
    const { error: realtimeError } = await supabase.rpc("exec_sql", {
      query: realtimeSQL,
    });


    if (realtimeError) {
      console.log("Failed to add realtime support:", realtimeError.message, 2);
      return NextResponse.json(
        { error: realtimeError.message },
        { status: 400 },
      );
    }

    await supabase
      .from("events")
      .update({ tableName: tableName })
      .eq("id", eventId);

    // We add a trigger that generates a row for plus_ones
    // But before that we check if plus_one column exists in the mappings
    // If it does, we create the trigger
    if (mappings.some((m) => m.supabase_column.trim() === "plus_one")) {
      // Here i get the column names to be inserted into the table
      const columnNames = mappings.map((m) => m.supabase_column.trim());
      // I generate the values part for the insert statement
      const rowValues = columnNames.map((col) => {
        if (col === "plus_one") return false;
        if (col === "main_guest_id") return "NEW.id";

        // Then we return for any column that has the "name", we append (Plus One) to indicate that this is a plus one guest
        if (col.toLowerCase().includes("name")) {
          return `NEW.${col} || ' (Plus One)'`;
        }

        // For all other columns, we return NULL as we don't have data for them
        return `NULL`;
      });

      const funcName = `create_plus_one_guest${eventId}`;
      const triggerName = `trigger_plus_one${eventId}`;

      const sql = `
      CREATE OR REPLACE FUNCTION "${funcName}"()
      RETURNS trigger AS $$
      BEGIN
        IF NEW.plus_one = true THEN
          INSERT INTO "${tableName}" (
            ${columnNames.join(", ")}
          )
          VALUES (
            ${rowValues.join(", ")}
          );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS "${triggerName}" ON "${tableName}";

      CREATE TRIGGER "${triggerName}"
      BEFORE INSERT ON "${tableName}"
      FOR EACH ROW
      EXECUTE FUNCTION "${funcName}"();
    `;

      const { error } = await supabase.rpc("exec_sql", { query: sql });

      if (error) {
        console.log("Failed to create before trigger:", error, 3);
        return NextResponse.json({ error }, { status: 400 });
      }

      // Then here i must setup a database trigger that will add rows to the
      // guest_card table "AFTER" a new event attendee is added to the generated event table
      const guestCardsFunctionName = `insert_into_guest_cards_${eventId}`;
      const guestCardsTriggerName = `trigger_insert_guest_cards_${eventId}`;

      const afterInsertSQL = `
    CREATE OR REPLACE FUNCTION "${guestCardsFunctionName}"()
      RETURNS trigger AS $$
      DECLARE
        is_plus_one BOOLEAN;
        card_type RECORD;
        needs_json JSONB;
      BEGIN
        -- determine if this row is a plus one
        is_plus_one := NEW.main_guest_id IS NOT NULL;

        -- loop through all card types for this event
        FOR card_type IN
          SELECT *
          FROM card_types
          WHERE event_id = '${eventId}'
        LOOP

          -- skip this card_type if guest is plus one and card does NOT apply
          IF is_plus_one AND card_type.applies_to_plus_one = false THEN
            CONTINUE;
          END IF;

          -- build needs JSON like {"check_in": false, ...}
          SELECT COALESCE(
            jsonb_object_agg(cn.name, false),
            '{}'::jsonb
          )
          INTO needs_json
          FROM card_needs cn
          WHERE cn.card_type_id = card_type.id;

          -- insert guest_cards row
          INSERT INTO guest_cards (
            guest_id,
            event_id,
            card_type_id,
            status
          ) VALUES (
            NEW.id,
            '${eventId}',
            card_type.id,
            needs_json
          );

        END LOOP;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS "${guestCardsTriggerName}" ON "${tableName}";

    CREATE TRIGGER "${guestCardsTriggerName}"
    AFTER INSERT ON "${tableName}"
    FOR EACH ROW
    EXECUTE FUNCTION "${guestCardsFunctionName}"();
  `;

      const { error: afterInsertSQLError } = await supabase.rpc("exec_sql", {
        query: afterInsertSQL,
      });

      if (afterInsertSQLError) {
        console.log(
          "Error creating after trigger:",
          afterInsertSQLError.message,
          "4",
        );
        return NextResponse.json(
          { error: afterInsertSQLError.message },
          { status: 400 },
        );
      }
    } else {
      // ----------This handles when there is no plus_one column------------

      // Then here i must setup a database trigger that will add rows to the
      // guest_card table "AFTER" a new event attendee is added to the generated event table
      const guestCardsFunctionName = `insert_into_guest_cards_${eventId}`;
      const guestCardsTriggerName = `trigger_insert_guest_cards_${eventId}`;

      const afterInsertSQL = `
    CREATE OR REPLACE FUNCTION "${guestCardsFunctionName}"()
      RETURNS trigger AS $$
      DECLARE
        card_type RECORD;
        needs_json JSONB;
      BEGIN

        -- loop through all card types for this event
        FOR card_type IN
          SELECT *
          FROM card_types
          WHERE event_id = '${eventId}'
        LOOP
          -- build needs JSON like {"check_in": false, ...}
          SELECT COALESCE(
            jsonb_object_agg(cn.name, false),
            '{}'::jsonb
          )
          INTO needs_json
          FROM card_needs cn
          WHERE cn.card_type_id = card_type.id;

          -- insert guest_cards row
          INSERT INTO guest_cards (
            guest_id,
            event_id,
            card_type_id,
            status
          ) VALUES (
            NEW.id,
            '${eventId}',
            card_type.id,
            needs_json
          );

        END LOOP;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS "${guestCardsTriggerName}" ON "${tableName}";

    CREATE TRIGGER "${guestCardsTriggerName}"
    AFTER INSERT ON "${tableName}"
    FOR EACH ROW
    EXECUTE FUNCTION "${guestCardsFunctionName}"();
  `;

      const { error: afterInsertSQLError } = await supabase.rpc("exec_sql", {
        query: afterInsertSQL,
      });

      if (afterInsertSQLError) {
        console.log(
          "Error in the not plusOne after trigger:",
          afterInsertSQLError.message,
          "5",
        );
        return NextResponse.json(
          { error: afterInsertSQLError.message },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ success: true, tableName });
  } catch (error) {
    console.error("Create table API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
