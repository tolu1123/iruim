import type { EventWithId } from "./filterEventsByDate";

export function formatDate(events: EventWithId[]) {
  const data = events.map((event) => {
  
    const eventDate = new Date(event.date); // convert timestamp to Date
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "long", // "May"
      day: "numeric", // "15"
      year: "numeric", // "2025"
    }).format(eventDate);

    return {
      ...event,
      formattedDate,
    };
  });

  return data;
}


export function formatTime(t: string) {
  const [hour, minute] = t.split(":").map(Number);
  const period = hour! >= 12 ? "PM" : "AM";
  const hour12 = hour! % 12 || 12;

  return `${hour12}:${minute!.toString().padStart(2, "0")} ${period}`;
}