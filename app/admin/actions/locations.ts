"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type LocationActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<LocationActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export type LocationInput = {
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  maps_query?: string | null;
};

export async function createLocationAction(input: LocationInput): Promise<LocationActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  const slug = input.slug?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!name) return { error: "Location name is required." };
  if (!slug) return { error: "Slug is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("locations").insert({
    name,
    slug,
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
    maps_query: input.maps_query?.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/locations");
  return { success: true };
}

export type UpdateLocationInput = LocationInput & { id: string };

export async function updateLocationAction(input: UpdateLocationInput): Promise<LocationActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  const slug = input.slug?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!name) return { error: "Location name is required." };
  if (!slug) return { error: "Slug is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("locations")
    .update({
      name,
      slug,
      address: input.address?.trim() || null,
      phone: input.phone?.trim() || null,
      maps_query: input.maps_query?.trim() || null,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/locations");
  return { success: true };
}

export async function deleteLocationAction(id: string): Promise<LocationActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Location ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("locations").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/locations");
  return { success: true };
}
