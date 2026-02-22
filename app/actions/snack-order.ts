"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SnackOrderResult = { error?: string; orderId?: string };

export async function createSnackOrderAction(
  _prev: SnackOrderResult,
  formData: FormData
): Promise<SnackOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to place an order." };
  }

  const locationId = (formData.get("location_id") as string)?.trim() || null;
  const pickupAtRaw = (formData.get("pickup_at") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const itemsJson = formData.get("items") as string;
  let items: Array<{ snack_item_id: string; quantity: number }> = [];
  try {
    items = JSON.parse(itemsJson || "[]");
  } catch {
    return { error: "Invalid items." };
  }
  items = items.filter((i) => i.quantity > 0 && i.snack_item_id);
  if (items.length === 0) {
    return { error: "Add at least one item." };
  }

  const productIds = items.map((i) => i.snack_item_id);
  const { data: products, error: prodError } = await supabase
    .from("snack_items")
    .select("id, price_etb, available")
    .in("id", productIds);

  if (prodError || !products?.length) {
    return { error: "Invalid or unavailable items." };
  }

  const availableIds = new Set(products.filter((p) => p.available).map((p) => p.id));
  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalEtb = 0;
  const orderItems: { snack_item_id: string; quantity: number; price_etb: number }[] = [];

  for (const item of items) {
    if (!availableIds.has(item.snack_item_id)) continue;
    const product = productMap.get(item.snack_item_id);
    if (!product || item.quantity < 1) continue;
    const price = Number(product.price_etb);
    orderItems.push({ snack_item_id: item.snack_item_id, quantity: item.quantity, price_etb: price });
    totalEtb += price * item.quantity;
  }

  if (orderItems.length === 0) {
    return { error: "No valid items. Check availability." };
  }

  let pickupAt: string | null = null;
  if (pickupAtRaw) {
    const d = new Date(pickupAtRaw);
    if (!Number.isNaN(d.getTime())) pickupAt = d.toISOString();
  }

  const { data: order, error: orderError } = await supabase
    .from("snack_orders")
    .insert({
      user_id: user.id,
      location_id: locationId || null,
      status: "pending",
      pickup_at: pickupAt,
      notes: notes,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Failed to create order." };
  }

  for (const oi of orderItems) {
    await supabase.from("snack_order_items").insert({
      snack_order_id: order.id,
      snack_item_id: oi.snack_item_id,
      quantity: oi.quantity,
      price_etb: oi.price_etb,
    });
  }

  revalidatePath("/snack-bar");
  revalidatePath("/account/pre-orders");
  return { orderId: order.id };
}
