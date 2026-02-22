"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type OrderActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<OrderActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

const SHOP_ORDER_STATUSES = ["pending_payment", "paid", "shipped", "cancelled"] as const;

export async function updateOrderAction(
  id: string,
  status: string
): Promise<OrderActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Order ID is required." };
  if (!SHOP_ORDER_STATUSES.includes(status as (typeof SHOP_ORDER_STATUSES)[number])) {
    return { error: "Invalid status." };
  }
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { success: true };
}
