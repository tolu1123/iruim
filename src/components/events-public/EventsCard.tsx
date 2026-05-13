import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
export interface CardProp {
  eventId: string;
  title: string;
  date: string;
  location: string;
  image: string;
}
export default function EventsCard({
  eventId,
  title,
  date,
  location,
  image,
}: CardProp) {
  return (
    <div className='w-full'>
      <div className='w-full'>
        <div className='aspect-video w-full relative'>
          <Image
            src={image}
            alt={title}
            fill
            className='w-full h-full object-cover object-center'
          />
        </div>
        <div className='flex flex-col justify-center items-center font-lato text-center'>
          <h6 className='text-xl sm:text-2xl font-bold mt-5'>{title}</h6>
          <p className='text-lg mt-2'>{date}</p>
          <p className='text-lg my-1.5'>{location}</p>
          <Button
            asChild
            className='border border-black hover:bg-black hover:text-white'
          >
            <Link href={`/events/${eventId}`} className='block px-4 py-3'>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
