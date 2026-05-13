import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditEventButton({ eventId }: { eventId: string }) {
  return (
    <Button asChild className="">
      <Link href={`/list-events/${eventId}/edit-event`}>
        Edit Event
      </Link>
    </Button>
  )
}
