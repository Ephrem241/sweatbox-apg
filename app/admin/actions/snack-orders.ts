"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type SnackOrderActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<SnackOrderActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

const SNACK_ORDER_STATUSES = ["pending", "preparing", "ready", "picked_up", "cancelled"] as const;

export async function updateSnackOrderAction(
  id: string,
  payload: { status?: string; pickup_at?: string | null }
): Promise<SnackOrderActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Order ID is required." };
  if (payload.status && !SNACK_ORDER_STATUSES.includes(payload.status as (typeof SNACK_ORDER_STATUSES)[number])) {
    return { error: "Invalid status." };
  }
  const admin = createServiceRoleClient();
  const update: Record<string, unknown> = {};
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.pickup_at !== undefined) update.pickup_at = payload.pickup_at || null;
  if (Object.keys(update).length === 0) return { success: true };
  const { error } = await admin.from("snack_orders").update(update).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/snack-orders");
  return { success: true };
}
