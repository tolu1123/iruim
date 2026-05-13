import EventCard from "./EventCard"
import { EventWithId } from "@/lib/events/filterEventsByDate";

function UpcomingEvents({ events }: { events:  EventWithId[]}) {
  return (
    <div className="w-full flex flex-col justify-center text-center md:text-left my-12">
    <div className="w-full flex flex-col justify-center items-start">
      <h3 className="font-playfair text-3xl font-bold mb-6">Upcoming Events</h3>
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-3 lg:gap-5">
        {events?.length > 0 ? (
          events.map((event, index) => <EventCard key={index} event={event} />)
        ) : (
          <p>No upcoming events</p>
        )}
      </div>
    </div>
  </div>
  )
}

export default UpcomingEvents