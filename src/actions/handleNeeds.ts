"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


const setNeed = async (eventId: string, needId: string, isActive: boolean) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("card_needs")
    .update({ is_active: isActive })
    .eq("id", needId);

  if (error) {
    return {
      error: true,
      message: error.message || "Error updating need status. Please try again.",
    };
  }

  revalidatePath(`/list-events/${eventId}/configure-event`);
  revalidatePath(`/list-events/${eventId}/scan`);
  revalidatePath(`/list-events/${eventId}`);
};


export { setNeed };
