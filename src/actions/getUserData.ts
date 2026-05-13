"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function getUserData() {
  const supabase = await createClient();

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    redirect("/sign-in");
  }

  const { data, error: selectRoleError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id);
    
  if (selectRoleError) {
    redirect("/error");
  }

  return data;
}
