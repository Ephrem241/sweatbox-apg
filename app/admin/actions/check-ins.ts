"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type CheckInActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<CheckInActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export async function deleteCheckInAction(id: string): Promise<CheckInActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Check-in ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("check_ins").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/check-ins");
  return { success: true };
}
