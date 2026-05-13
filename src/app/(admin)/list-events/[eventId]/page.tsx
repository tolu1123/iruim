import EventHeader from "@/components/event-dashboard/EventHeader";
import Scan from "@/components/event-dashboard/Scan";
import { createClient } from "@/lib/supabase/server";

import adminClient from "@/lib/supabase/adminClient";

import { computeStats } from "@/lib/events/events";
import RealtimeDashboardWrapper from "@/components/event-dashboard/RealtimeDashboardWrapper";
import { redirect } from "next/navigation";

// Here i force the page to be dynamic and not static
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PageDashboard({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabaseService = adminClient();
  const supabase = await createClient();

  // Fetch user data
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    redirect("/sign-in");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    throw new Error("Error fetching user profile");
  }

  // Fetch event data
  const { data, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (eventError || !data) {
    throw new Error(eventError?.message || "Error fetching event data");
  }

  // Fetch stats data
  const { data: statsData, error: statsError } = await supabase
    .from("guest_cards")
    .select("status")
    .eq("event_id", eventId);

  if (statsError || !statsData) {
    throw new Error(statsError?.message || "Error fetching stats data");
  }

  const statuses = statsData.map((record) => record.status);

  const { data: cardNeeds, error: cardNeedsError } = await supabase
    .from("card_needs")
    .select("id, name, is_active")
    .eq("event_id", eventId);

  if (cardNeedsError || !cardNeeds) {
    throw new Error(cardNeedsError?.message || "Error fetching card needs");
  }

  const needs = cardNeeds.map((need) => need.name);
  const stats = computeStats(statuses, needs);

  // Get the no of event attendees
  const { count: attendeesCount, error: attendeesError } = await supabase
    .from(`event_${eventId}_attendees`)
    .select("*", { count: "exact", head: true });

  if (attendeesError || attendeesCount === null) {
    console.log(attendeesError)
    throw new Error(
      attendeesError?.message || "Error fetching attendees count"
    );
  }
  // Add total attendees to stats
  stats["Total Attendees"] = attendeesCount;

  ////////////
  // Fetch event card types and their configurations
  const { data: cardTypesData, error: cardTypesError } =
    await supabaseService.rpc("get_card_types_with_needs", {
      event_uuid: eventId,
    });

  if (cardTypesError)
    throw new Error(cardTypesError?.message || "Error fetching card types");

  // 1. Get all attendees
  const { data: attendees, error: attendeeError } = await supabase
    .from(`event_${eventId}_attendees`)
    .select("*"); // We intentionally select all fields for merging later

  if (attendeeError) {
    throw new Error(
      attendeeError?.message || "Error fetching event attendees details"
    );
  }

  // 2. Get all the cards
  const { data: cards, error: cardError } = await supabase
    .from("guest_cards")
    .select("guest_id, card_type_id, status, qr_code_url, QRSentStatus")
    .neq("qr_code_url", null)
    .eq("event_id", eventId);

  if (cardError) {
    throw new Error(cardError?.message || "Failed to fetch guest cards");
  }

  // Fetch the columns that must be displayed in the dashboard
  // Get the data for the active columns
  const { data: dashboardColumns, error: columnError } = await supabase
    .from("event_column_mappings")
    .select("name:supabase_column")
    .eq("event_id", eventId)
    .eq("is_active", true);

  if (columnError)
    throw new Error(columnError?.message || "Error fetching column data");

  const necessaryColumns = [
    ...dashboardColumns
      .filter((item) => item.name.toLowerCase().includes("name"))
      .map((item) => item.name),

    ...dashboardColumns
      .filter((item) => !item.name.toLowerCase().includes("name"))
      .map((item) => item.name),
  ];

  // Get merged attendee's data with their status and grouping them by the card type
  // @ts-expect-error ctd variable cannot be typed explicitly
  const cardWithTableData = cardTypesData.map((ctd) => {
    let filteredAttendees = attendees;

    // If the card type does not apply to plus one, filter out plus one attendees
    if (!ctd.applies_to_plus_one) {
      // Because main_guest_id may not be on the table, we check for the existence, if not there
      // then it means all attendees on the table are not plus_ones
      // and if main_guest_id is on the table, all we do is check for instances where main_guest_id is not null
      filteredAttendees = attendees.filter(
        (a) => !("main_guest_id" in a) || a?.main_guest_id === null
      );
    }

    // Filter out the guests that corresponds to the card_type
    const guestCards = cards.filter((c) => c.card_type_id === ctd.id);

    // Turn guest_cards into a lookup map for fast merging
    const cardMap = Object.fromEntries(
      guestCards.map((c) => [
        c.guest_id,
        { ...c.status, qr: c.qr_code_url, QRStatus: c.QRSentStatus },
      ])
    );

    // Merge both attendees and status data
    const mergedData = filteredAttendees.map((attendee, i) => {
      const attendeeData = cardMap[attendee.id]; // Get the attendee's status and data
      // // We get anything in the key that has name in it
      // const anyNameData = Object.entries(attendee).reduce<
      //   Record<string, string>
      // >((acc, [k, v]) => {
      //   if (k.toLowerCase().includes("name") && v != null) {
      //     acc[k] = String(v);
      //   }
      //   return acc;
      // }, {} as { [key: string]: string });
      // const extras = [
      //   "home_club",
      //   "handicap",
      //   "gender",
      //   "shirt_size",
      //   "platinum24_member",
      // ];
      const extraData = {} as { [key: string]: string | number };
      for (const extra of necessaryColumns) {
        if (extra in attendee) {
          extraData[extra] = attendee[extra];
        }
      }
      // Merge both data and status
      return {
        "s/n": i + 1,
        id: attendee.id,
        // ...anyNameData,
        // ...attendee,
        ...extraData,
        ...attendeeData,
      };
    });

    // Return the merged data
    return {
      id: ctd.id,
      name: ctd.name,
      tableData: mergedData,
    };
  });

  ///////////
  const { data: cardNeedsStatus, error: cardNeedsStatusError } = await supabase
    .from("card_needs")
    .select("card_type_id, name, is_active")
    .eq("event_id", eventId);

  if (!cardNeedsStatus || cardNeedsStatusError)
    throw new Error(
      "Failed to fetch card_needs, check your internet connection"
    );

  const { data: statusFields, error: statusFieldsError } = await supabase
    .from("event_column_mappings")
    .select("name:supabase_column")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .neq("data_type", "boolean");

  if(!statusFields || statusFieldsError)
    throw new Error("Failed to fetch status fields");

  const statusCols = statusFields.map(item => item.name);

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <EventHeader
        eventTitle={data.title}
        eventId={eventId}
        sheetUrl={data.sheetLink}
      />
      <Scan eventId={eventId} />
      <RealtimeDashboardWrapper
        EventId={eventId}
        Stats={stats}
        CardNeeds={cardNeeds}
        GuestCards={cards}
        Attendees={attendees}
        CardWithTableData={cardWithTableData}
        CardTypes={cardTypesData}
        Role={profile.role}
        CardNeedsStatus={cardNeedsStatus}
        necessaryColumns={necessaryColumns}
        statusCols={statusCols}
      />
    </div>
  );
}
