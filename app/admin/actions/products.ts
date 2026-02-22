"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ProductActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<ProductActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export type ProductInput = {
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  price_etb: number;
  image_url?: string | null;
  stock: number;
};

export async function createProductAction(input: ProductInput): Promise<ProductActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  const slug = input.slug?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!name) return { error: "Product name is required." };
  if (!slug) return { error: "Slug is required." };
  const price = Number(input.price_etb);
  if (Number.isNaN(price) || price < 0) return { error: "Price must be 0 or more." };
  const stock = Math.max(0, Number(input.stock) || 0);
  const admin = createServiceRoleClient();
  const { error } = await admin.from("products").insert({
    name,
    slug,
    description: input.description?.trim() || null,
    category: (input.category?.trim() || "gear") as string,
    price_etb: price,
    image_url: input.image_url?.trim() || null,
    stock,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { success: true };
}

export type UpdateProductInput = ProductInput & { id: string };

export async function updateProductAction(input: UpdateProductInput): Promise<ProductActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  const slug = input.slug?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!name) return { error: "Product name is required." };
  if (!slug) return { error: "Slug is required." };
  const price = Number(input.price_etb);
  if (Number.isNaN(price) || price < 0) return { error: "Price must be 0 or more." };
  const stock = Math.max(0, Number(input.stock) || 0);
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("products")
    .update({
      name,
      slug,
      description: input.description?.trim() || null,
      category: (input.category?.trim() || "gear") as string,
      price_etb: price,
      image_url: input.image_url?.trim() || null,
      stock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Product ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { success: true };
}
