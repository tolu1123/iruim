"use client"
import { toast } from "sonner";
import { Button } from "../ui/button";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
export default function EventHeader({eventTitle, sheetUrl, eventId}: {eventTitle: string, sheetUrl: string, eventId: string }) {
  return (
    <div className='w-full flex flex-col justify-between items-start mb-6'>
      <h2 className='font-playfair text-4xl font-bold '>{eventTitle}</h2>
      <p className="font-lato">
        This is your event dashboard where you can view all the statistics of this event.
      </p>

      <Button className="bg-green-800 w-full md:w-[16rem] h-10 mt-8 hover:bg-green-800/90" onClick={async() => {
        const res = await fetch(`${baseUrl}/api/sheets/sync-tables`, {
          method: "POST",
          body: JSON.stringify({
            sheetUrl: sheetUrl,
            eventId: eventId
          })
        })

        if(!res.ok){
          toast.error("Failed to sync sheets");
          return;
        }

        toast.success("Successfully synced sheets");
        window.location.reload()
      }}>
        Sync Google Sheets
      </Button>
    </div>
  )
}