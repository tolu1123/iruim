import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addSheetHeader, getSheetHeaders } from "@/lib/sheets/googleSheets";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_JWT_SECRET!,
);

interface columnMapping {
  sheet: string;
  supabase: string;
  type: string;
}

export async function POST(req: Request) {
  try {
    const { eventId, mappings, sheetUrl } = await req.json();

    const importantColumns = [
      "name",
      "plus_one",
      "phone_no",
      "gender",
      "email",
    ];
    const { error } = await supabase.from("event_column_mappings").insert(
      mappings.map((m: columnMapping) => ({
        event_id: eventId,
        sheet_column: m.sheet,
        supabase_column: m.supabase,
        data_type: m.type,
        is_active: importantColumns.some((ele) => m.supabase.includes(ele)), // If the value of the supabase is included in the importantColumn, it will be displayed by default
      })),
    );

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    // We then automatically create the table for the event based on the mappings
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/create-table`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      },
    );

    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Add a column field to the sheet to track sync status, but first check if it exists;

    // We parse out the sheet ID from the URL
    const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (!sheetId) {
      console.log("SheetId does not match so we have errors");
      return NextResponse.json({ error: "Invalid sheet URL" }, { status: 400 });
    }

    // We get sheetHeaders and check if the sync_status for this event exists or not
    // If it does not, we create one for it.
    const headers = await getSheetHeaders(sheetId);
    const columnName = `sync_status${eventId}`;

    if (!headers.includes(columnName)) {
      const headerLength = headers.length;
      // We find the next empty column in google sheets
      const syncStatusColumn = String.fromCharCode(65 + headerLength); // 65 is ASCII for 'A'

      // We add the sync_status column to the sheet
      const response = await addSheetHeader(
        sheetId,
        `${syncStatusColumn}1`,
        columnName,
      );
      if (response.success !== true) {
        return NextResponse.json(
          {
            error: `Failed to add sync_status column to the sheet: ${response.message}`,
          },
          { status: 500 },
        );
      }
    }

    // We also add the idempotency_key if it is not on the table
    const keyName = "idempotency_key";

    if (!headers.includes(keyName)) {
      const headerLength = headers.length;
      // We find the next empty column in google sheets
      const idempotencyKeyColumn = String.fromCharCode(65 + headerLength + 1); // 65 is ASCII for 'A'

      // We add the sync_status column to the sheet
      const response = await addSheetHeader(
        sheetId,
        `${idempotencyKeyColumn}1`,
        keyName,
      );
      if (response.success !== true) {
        return NextResponse.json(
          {
            error: `Failed to add ${keyName} column to the sheet: ${response.message}`,
          },
          { status: 500 },
        );
      }
    }

    // Here we create the default table columns that will be shown on every specific event dashboard

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mappings API error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
