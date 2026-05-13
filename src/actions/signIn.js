"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function signIn(state, formData) {
  const supabase = await createClient();

  const { error: signInError } =
    await supabase.auth.signInWithPassword(formData);


  if (signInError) {
    return {
      error: true,
      success: null,
      message: `${signInError.code}, Incorrect email or password`,
    };
  }

  // Handle error if sign-in fails

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
