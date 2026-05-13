"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();
  if(error) {
    redirect("/error");
  }
  redirect("/sign-in");
}
