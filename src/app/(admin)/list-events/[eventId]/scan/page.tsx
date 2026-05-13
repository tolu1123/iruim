import { createClient } from "@/lib/supabase/server";
import QRScanner from "@/components/scan/QRScanner";

export default async function page({
  params
}: {
  params: Promise<{ eventId: string }>;
}) {
  const supabase = await createClient();
  const { eventId } = await params;
  //Use eventId to fetch all card_needs that applies to a particular event
  const { data, error } = await supabase.from("card_needs").select("card_type_id, name, is_active").eq("event_id", eventId);

  if(!data || error) throw new Error("Failed to fetch card_needs, check your internet connection")
  
  return (<div className="flex flex-1 flex-col gap-4">
    <QRScanner cardNeeds={data} eventId={eventId} />
    </div>
  )
}
