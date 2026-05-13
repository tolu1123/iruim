import { Button } from "@/components/ui/button";
import Link from "next/link";

function EventsHeader({ role }: { role: string }) {
  return (
    <div className='w-full flex flex-row justify-between items-center mb-6'>
      <h2 className='font-playfair text-4xl font-bold '>Events</h2>
      {role === "Admin" && (
        <Button asChild className=''>
          <Link href='/create-event'>Create Event</Link>
        </Button>
      )}
    </div>
  );
}

export default EventsHeader;
