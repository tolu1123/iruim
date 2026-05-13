import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_JWT_SECRET!,
);

export async function POST(req: Request) {
  try {
    const { card_type_id, guest_id } = await req.json();

    if (!card_type_id || !guest_id) {
      return NextResponse.json(
        { error: "Missing card_type_id or guest_id" },
        { status: 400 },
      );
    }

    // Get the other needed data
    const { data: eventData, error: eventError } = await supabase
      .from("card_types")
      .select("event_id, template_url, template_layout")
      .eq("id", card_type_id)
      .single();

    if (eventError) {
      return NextResponse.json(
        {
          error: `Failed to fetch event data for card id:, ${card_type_id}, error: ${eventError.message} `,
        },
        { status: 500 },
      );
    }

    // Make the request to generate the iv
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/generate-iv`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventData.event_id,
          guestId: guest_id,
          cardTypeId: card_type_id,
          templateUrl: eventData.template_url,
          templateLayout: eventData.template_layout,
        }),
      },
    );

    const resJSON = await response.json();

    // Return the iv url that will be stored in the guest_cards table by the caller
    return NextResponse.json(
      {
        ivUrl: resJSON.ivUrl,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: `Card creation failed with error: ${err}`,
      },
      { status: 500 },
    );
  }
}
