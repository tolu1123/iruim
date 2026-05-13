import EventsCard from "@/components/events-public/EventsCard";

import { EventWithId } from "@/lib/filterEventsByDate";
type EventType = EventWithId & { formattedDate: string }

export default function EventsUpcoming({ events }: { events: EventType[] }) {
  return (
    <div className="w-full xl:max-w-[1440px] mx-auto flex flex-col justify-center text-center md:text-left px-5 my-16">
      <div className="w-full flex flex-col justify-center items-center">
        <h3 className="font-playfair text-4xl font-bold mb-6">
          Upcoming Events
        </h3>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-5">
          {events.map((event) => (
            <EventsCard
              key={event.id}
              eventId={event.id}
              title={event.title}
              date={event.formattedDate}
              location={event.location}
              image={event.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
