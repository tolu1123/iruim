// This server action handles every event configuration task.
// Which includes creating, updating, and deleting event card configurations.
// It interacts with the Supabase database to perform these operations.

"use server";

import { createClient } from "@/lib/supabase/server";
import adminClient from "@/lib/supabase/adminClient";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import {
  QRProp,
  IDProp,
} from "@/components/event-configuration/CardConfigDialog";

// This function creates a new event card type in the database.
export async function createEventIv(
  eventId: string,
  cardName: string,
  appliesToPlusOne: boolean
) {
  const supabase = await createClient();

  // Insert a new event card type into the database
  const { error } = await supabase.from("card_types").insert({
    event_id: eventId,
    name: cardName,
    applies_to_plus_one: appliesToPlusOne,
  });

  // Handle any errors that occur during the insertion
  if (error) {
    return {
      error: true,
      message: `Error creating event card type: ${error.message}`,
    };
  }

  revalidatePath(`/list-events/${eventId}/configure-event`);
}

// This function adds to an existing event card's needs
export async function addCardNeed(
  cardTypeId: string,
  need: string,
  eventId: string,
  appliesToPlusOne: boolean
) {
  const supabase = await createClient();

  // Insert a new card need into the database
  const { error } = await supabase.from("card_needs").insert({
    card_type_id: cardTypeId,
    name: need,
    event_id: eventId,
    is_active: true, // We set the need to be active by default, the Admin uses this field to control which need is avaialable to use.
  });

  // Handle any errors that occur during the insertion
  if (error) {
    return {
      error: true,
      message: `Error adding card need: ${error.message}`,
    };
  }

  // Call RPC to update all status that were affected
  // - get all status that applies to the card_type_id and not where guest_id is eq to event_id
  // - for each of them, i add the need to them
  // - return back them to guest_cards
  const { error: rpcError } = await supabase.rpc(
    "add_card_need_to_guest_cards",
    {
      p_event_id: eventId,
      p_card_type_id: cardTypeId,
      p_need_key: need,
    }
  );

  if (rpcError) {
    return {
      error: true,
      message: `Error updating guest cards statuses: ${rpcError.message}`,
    };
  }

  // We rerun the trigger that adds column to the guest_cards function
  const triggerReRunResult = await reRunTableAfterTrigger(
    eventId,
    appliesToPlusOne
  );

  if (triggerReRunResult.error) {
    return triggerReRunResult;
  }

  // Revalidate the path to reflect the new card need
  revalidatePath(`/list-events/${eventId}/configure-event`);
}

// This function delets an existing event card's need
export async function deleteCardNeed(
  needId: string,
  eventId: string,
  cardNeedName: string,
  cardTypeId: string
) {
  const supabase = await createClient();

  // Delete the card need from the database
  const { error } = await supabase.from("card_needs").delete().eq("id", needId);

  // Handle any errors that occur during the deletion
  if (error) {
    return {
      error: true,
      message: `Error deleting card need: ${error.message}`,
    };
  }

  // Call RPC to update all status that will be affected
  // - get all status that applies to the card_type_id and not where guest_id is eq to event_id
  // - for each of them, i remove the need from them
  // - return back them to guest_cards
  // Remove the need key from all affected guest_cards.status
  const { error: rpcError } = await supabase.rpc(
    "remove_card_need_from_guest_cards",
    {
      p_event_id: eventId,
      p_card_type_id: cardTypeId,
      p_need_key: cardNeedName,
    }
  );

  if (rpcError) {
    // Note: this is non-critical — the need is already deleted,
    // but status might still have the old key (harmless but messy)
    console.warn("Failed to clean up status JSONB:", rpcError);
    // You can choose to return error or not
    return {
      error: true,
      message: `Error updating guest cards statuses: ${rpcError.message}`,
    };
  }

  // Revalidate the path to reflect the deleted card need
  revalidatePath(`/list-events/${eventId}/configure-event`);
}

// Server Action to upload template card to supabase storage
// app/actions/uploadTemplate.ts

export interface TemplateLayout {
  card_dimension?: {
    width?: number;
    height?: number;
  };
  qr?: QRProp;
  id?: IDProp;
}

export async function uploadTemplateAction(formData: FormData) {
  const adSupabase = adminClient();

  const file = formData.get("file") as File | null;
  const eventId = formData.get("eventId") as string;
  const cardTypeId = formData.get("cardId") as string;

  if (!file || !eventId) {
    return { error: "Missing file or eventId" };
  }

  // I fetch the existing template layout from the database
  const { data: templateLayoutData, error: templateLayoutError } =
    await adSupabase
      .from("card_types")
      .select("template_layout")
      .eq("id", cardTypeId)
      .single();

  if (templateLayoutError || !templateLayoutData) {
    return {
      error: true,
      message: templateLayoutError?.message || "Error fetching template layout",
    };
  }

  const layout: TemplateLayout = templateLayoutData.template_layout || {};

  // I get fileBuffer so i can pass it to sharp to give
  // me the image's width and height
  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  const imageWidth = metadata.width;
  const imageHeight = metadata.height;

  const card_dimension = {
    width: imageWidth,
    height: imageHeight,
  };
  // Add the card dimensions to the layout object
  layout.card_dimension = card_dimension;

  const fileExt = file.name.split(".").pop();
  // Store the file with the cardTypeId (as the file name)
  // so that you can remove the file later, if you want to so do that.
  const filePath = `${eventId}/${cardTypeId}.${fileExt}`;

  const { error } = await adSupabase.storage
    .from("invitation-templates")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    return {
      error: true,
      message: error.message,
    };
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/invitation-templates/${filePath}`;

  const { error: updateCardTypeError } = await adSupabase
    .from("card_types")
    .update({ template_url: publicUrl, template_layout: layout })
    .eq("id", cardTypeId);

  if (updateCardTypeError) {
    return {
      error: true,
      message: updateCardTypeError.message,
    };
  }

  revalidatePath(`/list-events/${eventId}/configure-event`);
}

export async function deleteTemplateConfig(
  cardTypeId: string,
  eventId: string
) {
  const adSupabase = adminClient();

  const { error: updateCardTypeError } = await adSupabase
    .from("card_types")
    .update({ template_url: null, template_layout: null })
    .eq("id", cardTypeId);

  if (updateCardTypeError) {
    return {
      error: true,
      message: updateCardTypeError.message,
    };
  }

  revalidatePath(`/list-events/${eventId}/configure-event`);
}

// This server action applies the (QR, id) posititon and size, id font-size event
export async function applyCardLayoutConfig(
  cardTypeId: string,
  layoutConfig: { qr: QRProp; id: IDProp },
  eventId: string
) {
  const supabase = await createClient();

  // Fetch the existing template layout from the database
  const { data: templateLayoutData, error: templateLayoutError } =
    await supabase
      .from("card_types")
      .select("template_layout")
      .eq("id", cardTypeId)
      .single();

  if (templateLayoutError || !templateLayoutData) {
    return {
      error: true,
      message: templateLayoutError?.message || "Error fetching template layout",
    };
  }

  const layout: TemplateLayout = templateLayoutData.template_layout || {};
  // Update the layout with the new QR and ID properties
  layout.qr = layoutConfig.qr;
  layout.id = layoutConfig.id;

  // Update the card type with the new layout
  const { error: updateError } = await supabase
    .from("card_types")
    .update({ template_layout: layout })
    .eq("id", cardTypeId);

  if (updateError) {
    return {
      error: true,
      message: `Error updating card layout: ${updateError.message}`,
    };
  }

  revalidatePath(`/list-events/${eventId}/configure-event`);
}

// This function runs the after trigger for the table specified
// depending on whether the table is applicable to plus_one
async function reRunTableAfterTrigger(
  eventId: string,
  appliesToPlusOne: boolean
) {
  const supabase = await createClient();
  const tableName = `event_${eventId}_attendees`;
  let afterInsertSQL: string | null;

  // We determine the SQL that applies based on whether the card appliesToPlusOne
  const guestCardsFunctionName = `insert_into_guest_cards_${eventId}`;
  const guestCardsTriggerName = `trigger_insert_guest_cards_${eventId}`;
  if (appliesToPlusOne) {
    afterInsertSQL = `
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
  } else {
    afterInsertSQL = `
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
  }

  const { error: afterInsertSQLError } = await supabase.rpc("exec_sql", {
    query: afterInsertSQL,
  });

  if (afterInsertSQLError)
    return {
      error: true,
      message: afterInsertSQLError.message,
    };

  return {
    error: false,
    message: "Trigger was sucessfully rerun",
  };
}
