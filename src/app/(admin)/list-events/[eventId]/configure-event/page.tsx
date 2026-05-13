import CreateCardForm from "@/components/event-configuration/CreateCardForm";
import EventCardsContainer from "@/components/event-configuration/EventCardsContainer";
import ConfigureEventTableHeader from "@/components/event-configuration/ConfigureEventTableHeader";
import EventConfigurationHeader from "@/components/event-configuration/EventConfigurationHeader";
import { createClient } from "@/lib/supabase/server";

import EditEventButton from "@/components/event-configuration/EditEventButton";
import DashboardTableConfiguration from "@/components/event-configuration/DashboardTableConfiguration";
import { redirect } from "next/navigation";



export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

   // Fetch user data
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    redirect("/sign-in")
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


  // Fetch event card types and their configurations
  const { data: cardTypesData, error: cardTypesError } =
    await supabase.rpc("get_card_types_with_needs", {
      event_uuid: eventId,
    });

  if (cardTypesError)
    throw new Error(cardTypesError?.message || "Error fetching card types");

  // Get the data for the active columns
  const { data: dashboardColumns, error: columnError } = await supabase
    .from("event_column_mappings")
    .select("id, name:supabase_column, is_active")
    .eq("event_id", eventId);

  if(columnError) 
    throw new Error(columnError?.message || "Error fetching column data");

  // Check whether the event supports plus_one
  const { data: plusOneCheck, error: plusOneError } = await supabase
    .from("event_column_mappings")
    .select("*")
    .eq("event_id", eventId)
    .eq("supabase_column", "plus_one");

  if (plusOneError)
    throw new Error(plusOneError?.message || "Error checking for plus_one");

  const eventHasPlusOne = plusOneCheck.length > 0;

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <EventConfigurationHeader eventId={eventId} eventTitle={data.title} />
      <EditEventButton eventId={eventId} />
      <ConfigureEventTableHeader eventId={eventId} />
      <DashboardTableConfiguration eventId={eventId} tableColumns={dashboardColumns} role={profile.role}/>
      <CreateCardForm eventId={eventId} eventHasPlusOne={eventHasPlusOne} />
      {cardTypesData.length > 0 && (
        <EventCardsContainer cardData={cardTypesData} />
      )}
    </div>
  );
}
