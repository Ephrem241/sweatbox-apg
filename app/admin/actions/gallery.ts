"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type GalleryActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<GalleryActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export type GalleryImageInput = {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  sort_order: number;
};

export async function createGalleryImageAction(
  input: GalleryImageInput
): Promise<GalleryActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const src = input.src?.trim();
  if (!src) return { error: "Image URL is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("gallery_images").insert({
    src,
    alt: input.alt?.trim() ?? "",
    width: input.width != null ? Number(input.width) : null,
    height: input.height != null ? Number(input.height) : null,
    sort_order: Number(input.sort_order) ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

export type UpdateGalleryImageInput = GalleryImageInput & { id: string };

export async function updateGalleryImageAction(
  input: UpdateGalleryImageInput
): Promise<GalleryActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const src = input.src?.trim();
  if (!src) return { error: "Image URL is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("gallery_images")
    .update({
      src,
      alt: input.alt?.trim() ?? "",
      width: input.width != null ? Number(input.width) : null,
      height: input.height != null ? Number(input.height) : null,
      sort_order: Number(input.sort_order) ?? 0,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

export async function deleteGalleryImageAction(id: string): Promise<GalleryActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Image ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("gallery_images").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}
