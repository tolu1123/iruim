import { createClient } from "@/lib/supabase/server";

import EventsHero from "@/components/events-public/EventsHero";
import EventsPast from "@/components/events-public/EventsPast";
import EventsUpcoming from "@/components/events-public/EventsUpcoming";
import { filterEventsByDate } from "@/lib/events/filterEventsByDate";
import EventsTopImage from "@/components/events-public/EventsTopImage";

export default async function page() {
  const supabase = await createClient();
  const { data: events, error: EventsError } = await supabase
    .from("events")
    .select("*")
    
  if (EventsError) {
    throw new Error(`An error occurred: ${EventsError}`)
  }
  const { upcoming, past } = filterEventsByDate(events);

  return (
    <>
      <EventsTopImage />
      <EventsHero />
      <EventsUpcoming events={upcoming} />
      <EventsPast events={past} />
    </>
  );
}
