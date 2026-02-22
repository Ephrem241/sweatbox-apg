"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type MembershipActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<MembershipActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export type MembershipInput = {
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
};

export async function createMembershipAction(input: MembershipInput): Promise<MembershipActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!input.user_id?.trim()) return { error: "Member is required." };
  if (!input.plan_id?.trim()) return { error: "Plan is required." };
  const start = input.start_date?.trim();
  const end = input.end_date?.trim();
  if (!start || !end) return { error: "Start and end dates are required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("memberships").insert({
    user_id: input.user_id,
    plan_id: input.plan_id,
    status: (input.status?.trim() || "active") as string,
    start_date: start,
    end_date: end,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/memberships");
  return { success: true };
}

export type UpdateMembershipInput = MembershipInput & { id: string };

export async function updateMembershipAction(input: UpdateMembershipInput): Promise<MembershipActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!input.user_id?.trim()) return { error: "Member is required." };
  if (!input.plan_id?.trim()) return { error: "Plan is required." };
  const start = input.start_date?.trim();
  const end = input.end_date?.trim();
  if (!start || !end) return { error: "Start and end dates are required." };
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("memberships")
    .update({
      user_id: input.user_id,
      plan_id: input.plan_id,
      status: (input.status?.trim() || "active") as string,
      start_date: start,
      end_date: end,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/memberships");
  return { success: true };
}

export async function deleteMembershipAction(id: string): Promise<MembershipActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Membership ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("memberships").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/memberships");
  return { success: true };
}
