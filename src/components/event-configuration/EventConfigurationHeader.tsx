import Link from 'next/link';
import { GoChevronLeft } from '@/components/icons';
export default function EventConfigurationHeader({eventId, eventTitle}: {eventId: string; eventTitle: string  }) {
  
  return (
    <div className='w-full flex flex-col justify-between items-start mb-6'>
      <Link href={`/list-events/${eventId}`} className='flex items-center font-semibold mb-5'>
        <GoChevronLeft className='h-5 w-5 inline-block mr-1' />
        Go to Event Dashboard
      </Link>
      <h2 className='font-playfair text-4xl font-bold '>Configure Event: {eventTitle}</h2>
      <p className="font-lato">
        Manage card, details and settings for your events here
      </p>
    </div>
  );
}
