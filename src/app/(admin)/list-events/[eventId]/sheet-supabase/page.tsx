import ColumnMapper from "@/components/sheet-supabase/ColumnMapper";
import { createClient } from "@/lib/supabase/server";
export default async function page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data, error: sheetLinkError } = await supabase
    .from("events")
    .select("sheetLink")
    .eq("id", eventId)
    .single();

  if (sheetLinkError || !data) {
    throw new Error("Event not found");
  }
  const sheetUrl = data.sheetLink;
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {eventId && sheetUrl ? (<ColumnMapper eventId={eventId} sheetUrl={sheetUrl} />) : (<div className="w-full h-full flex justify-center items-center">
        <p className="text-center">Please provide eventId and sheetUrl as query parameters.</p>
      </div>)}
    </div>
  )
}
