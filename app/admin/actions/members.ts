"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type MemberActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<MemberActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export type UpdateMemberInput = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "member" | "admin";
};

export async function updateMemberAction(input: UpdateMemberInput): Promise<MemberActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!input.id?.trim()) return { error: "Profile ID is required." };
  const validRoles = ["member", "admin"];
  if (!validRoles.includes(input.role)) return { error: "Invalid role." };
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: input.full_name?.trim() || null,
      email: input.email?.trim() || null,
      role: input.role,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  return { success: true };
}
