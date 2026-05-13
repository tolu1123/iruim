import { Button } from "@/components/ui/button"
import Link from "next/link"
export default function ConfigureEventTableHeader({eventId}: {eventId: string}) {
  return (
    <div className="border border-black rounded-lg p-5 bg-black/50 flex flex-col gap-4">
      <p className=""><span className="inline text-destructive">*</span>Configure Supabase Event Attendee table</p>
      <Button asChild className="w-fit px-6 py-1.5">
        <Link href={`/list-events/${eventId}/sheet-supabase`}>
        Configure Table
        </Link>
      </Button>
    </div>
  )
}