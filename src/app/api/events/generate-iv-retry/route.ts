import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TemplateLayout } from "../generate-iv/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_JWT_SECRET!,
);

export async function GET(req: Request) {
  // 1. Get all empty rows
  const { data: cards, error } = await supabase
    .from("guest_cards")
    .select("*")
    .is("qr_code_url", null);

  if (error)
    // If there's an error fetching the rows, return an error response
    return NextResponse.json({ error: error.message }, { status: 400 });

  // 2. For each row, call the generate-iv API
  for (const card of cards) {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("card_types")
        .select("event_id, template_url, template_layout")
        .eq("id", card.card_type_id)
        .single();

      if (eventError) {
        console.error(
          "Failed to fetch event data for card:",
          card.id,
          eventError,
        );
        continue;
      }

      const templateUrl = eventData.template_url;
      const templateLayout = eventData.template_layout as TemplateLayout;

      const cardPropNotExist = !("card_dimension" in templateLayout);
      const qrPropNotExist = !("qr" in templateLayout);
      const idPropNotExist = !("id" in templateLayout);

      const cardNotConfigured =
        !templateUrl ||
        !templateLayout ||
        cardPropNotExist ||
        qrPropNotExist ||
        idPropNotExist;
      // If card does not satisfy the conditions, we skip it
      if (cardNotConfigured) {
        console.log(
          `Event with id:${eventData.event_id} has a card_type that is not configured properly`,
        );
        continue;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/generate-iv`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId: eventData.event_id,
            guestId: card.guest_id,
            cardTypeId: card.card_type_id,
            templateUrl: eventData.template_url,
            templateLayout: eventData.template_layout,
          }),
        },
      );

      const resJSON = await response.json();

      if (resJSON.success && resJSON.ivUrl) {
        await supabase
          .from("guest_cards")
          .update({ qr_code_url: resJSON.ivUrl })
          .eq("id", card.id);
      }
    } catch (err) {
      console.error("Retry failed for card:", card.id, err);
    }
  }

  return NextResponse.json({ done: true });
}
