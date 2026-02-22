"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type SnackItemActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<SnackItemActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export type SnackItemInput = {
  name: string;
  description?: string | null;
  price_etb: number;
  image_url?: string | null;
  available: boolean;
  sort_order: number;
};

export async function createSnackItemAction(input: SnackItemInput): Promise<SnackItemActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  if (!name) return { error: "Name is required." };
  const price = Number(input.price_etb);
  if (Number.isNaN(price) || price < 0) return { error: "Price must be 0 or more." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("snack_items").insert({
    name,
    description: input.description?.trim() || null,
    price_etb: price,
    image_url: input.image_url?.trim() || null,
    available: !!input.available,
    sort_order: Number(input.sort_order) || 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/snack-items");
  return { success: true };
}

export type UpdateSnackItemInput = SnackItemInput & { id: string };

export async function updateSnackItemAction(input: UpdateSnackItemInput): Promise<SnackItemActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  if (!name) return { error: "Name is required." };
  const price = Number(input.price_etb);
  if (Number.isNaN(price) || price < 0) return { error: "Price must be 0 or more." };
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("snack_items")
    .update({
      name,
      description: input.description?.trim() || null,
      price_etb: price,
      image_url: input.image_url?.trim() || null,
      available: !!input.available,
      sort_order: Number(input.sort_order) || 0,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/snack-items");
  return { success: true };
}

export async function deleteSnackItemAction(id: string): Promise<SnackItemActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Snack item ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("snack_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/snack-items");
  return { success: true };
}
