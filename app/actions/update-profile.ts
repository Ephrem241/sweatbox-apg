"use server";

import { createClient } from "@/lib/supabase/server";

export type UpdateProfileResult = { error?: string; success?: boolean };

export async function updateProfileAction(formData: FormData): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." };
  }

  const full_name = formData.get("full_name")?.toString().trim();
  if (full_name === undefined || full_name === "") {
    return { error: "Name is required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
