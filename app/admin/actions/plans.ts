"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type PlanActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<PlanActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export type PlanInput = {
  name: string;
  peak: boolean;
  duration_months: number;
  price_etb: number;
};

export async function createPlanAction(input: PlanInput): Promise<PlanActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  if (!name) return { error: "Plan name is required." };
  if (!Number.isInteger(input.duration_months) || input.duration_months < 1) {
    return { error: "Duration must be at least 1 month." };
  }
  const price = Number(input.price_etb);
  if (Number.isNaN(price) || price < 0) return { error: "Price must be 0 or more." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("plans").insert({
    name,
    peak: !!input.peak,
    duration_months: input.duration_months,
    price_etb: price,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/plans");
  return { success: true };
}

export type UpdatePlanInput = PlanInput & { id: string };

export async function updatePlanAction(input: UpdatePlanInput): Promise<PlanActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  if (!name) return { error: "Plan name is required." };
  if (!Number.isInteger(input.duration_months) || input.duration_months < 1) {
    return { error: "Duration must be at least 1 month." };
  }
  const price = Number(input.price_etb);
  if (Number.isNaN(price) || price < 0) return { error: "Price must be 0 or more." };
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("plans")
    .update({
      name,
      peak: !!input.peak,
      duration_months: input.duration_months,
      price_etb: price,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/plans");
  return { success: true };
}

export async function deletePlanAction(id: string): Promise<PlanActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Plan ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("plans").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/plans");
  return { success: true };
}
