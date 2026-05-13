"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { User } from "@/components/manage-users/ManageUsersContainer";

async function getUsers() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*");
  return users as User[];
}

async function deleteManager(userId: string) {
  const supabase = await createClient();
  await supabase.from("profiles").delete().eq("id", userId);
  revalidatePath("/(admin)/manage-users");
}

async function changeUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
  revalidatePath("/(admin)/manage-users");
}
export {getUsers, deleteManager, changeUserRole};

