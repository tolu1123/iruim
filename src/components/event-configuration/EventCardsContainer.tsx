import EventCard from "@/components/event-configuration/EventCard";
import { TemplateLayout } from "@/actions/manageEventConfig";
export interface EventCardConfigType {
  id: string;
  event_id: string;
  name: string;
  applies_to_plus_one: boolean;
  // Add other relevant fields as needed
  needs: { id: string; name: string }[] | null;
  template_url: string | null;
  template_layout: TemplateLayout | null;
}
export default function EventCardsContainer({
  cardData,
}: {
  cardData: EventCardConfigType[];
}) {
  return (
    <div className='mt-5 font-lato'>
      <div className=''>
        <h3 className='font-playfair text-3xl font-bold '>Event Cards</h3>
        <p className=''>
          These are the cards associated with the event.(It will be sent to
          attendees).
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 mt-5'>
        {/* Render EventCard components here */}
        {cardData.map((card) => (
          <EventCard key={card.id} cardData={card} />
        ))}
      </div>
    </div>
  );
}
