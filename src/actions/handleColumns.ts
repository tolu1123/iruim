"use server";
import { createClient } from "@/lib/supabase/server";
// import { revalidatePath } from "next/cache";


const setColumn = async (eventId: string, colId: string, isActive: boolean) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_column_mappings")
    .update({ is_active: isActive })
    .eq("id", colId);

  if (error) {
    return {
      error: true,
      message: error.message || "Error updating column status. Please try again.",
    };
  }

  // revalidatePath(`/list-events/${eventId}/configure-event`);
  // revalidatePath(`/list-events/${eventId}`);
};


export { setColumn };
