import { EventFormValues } from "@/components/events/EventDialogForm";
import { formatDate } from "./formatEventDate";

/**
 * Filters events into upcoming and past based on date and time.
 */

export type EventWithId = EventFormValues & { id: string };
export function filterEventsByDate(events: EventWithId[]) {
  const now = new Date();

  const upcoming = formatDate(events.filter((event) => {
    const eventDateTime = combineDateAndTime(event.date, event.time);
    return eventDateTime >= now;
  }));

  const past = formatDate(events.filter((event) => {
    const eventDateTime = combineDateAndTime(event.date, event.time);
    return eventDateTime < now;
  }));

  return { upcoming, past };
}

/**
 * Combines a Date and a time string ("HH:mm") into a single Date object.
 */
function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const eventDateTime = new Date(date);
  eventDateTime.setHours(hours, minutes, 0, 0);
  return eventDateTime;
}
