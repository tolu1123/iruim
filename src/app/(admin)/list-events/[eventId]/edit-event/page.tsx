import EditEventForm from "@/components/forms/EditEventForm";
import { createClient } from "@/lib/supabase/server";


export default async function page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = createClient();

  const { data: events, error: eventsError } = await (await supabase)
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  
  if(!events || eventsError) {
    throw new Error(`Failed to fetch event data: ${eventsError}. Please check your internet connection`)
  }
  return (
    <>
      <EditEventForm eventData={events} />
    </>
  );
}
