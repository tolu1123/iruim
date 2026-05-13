import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { EventWithId } from "@/lib/filterEventsByDate";

function EventCard({ event}: { event: EventWithId }) {

  return (
    <div className="w-full">
    <div className="w-full">
      <div className="relative aspect-video">
        <Image src={event.imageUrl}  alt={event.title} fill className="object-center object-cover"/>
      </div>
      <div className="flex flex-col justify-center items-center font-lato">
        <h6 className="text-xl  sm:text-2xl font-bold mt-5">{event.title}</h6>
        <p className="text-lg mt-2">{new Date(event.date).toLocaleDateString()}</p>
        <p className="text-lg mt-1.5 mb-2.5 text-center">{event.location}</p>
        <Button as-child variant="outline" className="font-lato border border-black px-4 py-3 hover:bg-black hover:text-white">
          <Link href={`/list-events/${event.id}`}>
            View Details 
          </Link>
        </Button>
      </div>
    </div>
  </div>
  )
}

export default EventCard