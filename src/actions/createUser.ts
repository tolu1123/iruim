"use server";
import { z } from "zod";
import { CreateAdminSchema } from "@/lib/users/definitions";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import adminClient from "@/lib/supabase/adminClient";
import { CreateAdminState } from "@/components/manage-users/CreateUserForm";

export default async function createUser(state: CreateAdminState, formData: FormData): Promise<CreateAdminState> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/sign-in");
  }

  const { data: userProfile, error: selectRoleError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id);

  if (!selectRoleError && userProfile && userProfile[0].role !== "Admin") {
    return {
      error: true,
      success: null,
      message: "You do not have permission to create a user.",
    };
  }
  const raw = ({
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
  });
  const validatedFields = CreateAdminSchema.safeParse(raw);


  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { username, email, password, role } = validatedFields.data;

  const adSupabase = adminClient();
  const { data: createUserData, error: createUserError } =
    await adSupabase.auth.admin.createUser({ email, password, email_confirm: true });

  if (createUserError) {
    return {
      error: true,
      success: null,
      message: `Error creating user: ${createUserError.code}`
    };
  }

  const uuid = createUserData.user.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{ id: uuid, name: username, role, email }]);

  if (profileError) {
    return {
      error: true,
      success: null,
      message: profileError.code
    };
  }
  revalidatePath("/manage-users")

  return {
    success: true,
    message: `${role} sucessfully created`,
  };
}
