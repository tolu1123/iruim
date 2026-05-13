import { getEvents } from "@/actions/events";
import getUserData from "@/actions/getUserData";
import EventsHeader from "@/components/events/EventsHeader";
import PastEvents from "@/components/events/PastEvents";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import { filterEventsByDate } from "@/lib/events/filterEventsByDate";

async function page() {
  const userData = await getUserData();
  const events = await getEvents();
  const { upcoming, past } = filterEventsByDate(events);

  return (
    <div className='flex flex-col p-4'>
      <EventsHeader role={userData[0].role} />
      <UpcomingEvents events={upcoming} />
      <PastEvents events={past} />
    </div>
  );
}

export default page;
