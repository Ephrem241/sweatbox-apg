"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type TrainerActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<TrainerActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

function parseSpecialties(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export type TrainerInput = {
  profile_id: string;
  display_name: string;
  bio?: string | null;
  image_url?: string | null;
  specialties: string[]; // or comma-separated string
  sort_order: number;
  location_id?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  tiktok_url?: string | null;
};

export async function createTrainerAction(input: TrainerInput): Promise<TrainerActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!input.profile_id?.trim()) return { error: "Member is required." };
  const displayName = input.display_name?.trim();
  if (!displayName) return { error: "Display name is required." };
  const specialties = Array.isArray(input.specialties)
    ? input.specialties
    : parseSpecialties(String(input.specialties));
  const admin = createServiceRoleClient();
  const { error } = await admin.from("trainer_profiles").insert({
    profile_id: input.profile_id,
    display_name: displayName,
    bio: input.bio?.trim() || null,
    image_url: input.image_url?.trim() || null,
    specialties,
    sort_order: Number(input.sort_order) || 0,
    location_id: input.location_id?.trim() || null,
    instagram_url: input.instagram_url?.trim() || null,
    facebook_url: input.facebook_url?.trim() || null,
    twitter_url: input.twitter_url?.trim() || null,
    tiktok_url: input.tiktok_url?.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/trainers");
  revalidatePath("/admin");
  revalidatePath("/admin/trainers");
  return { success: true };
}

export type UpdateTrainerInput = TrainerInput & { id: string };

export async function updateTrainerAction(input: UpdateTrainerInput): Promise<TrainerActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!input.profile_id?.trim()) return { error: "Member is required." };
  const displayName = input.display_name?.trim();
  if (!displayName) return { error: "Display name is required." };
  const specialties = Array.isArray(input.specialties)
    ? input.specialties
    : parseSpecialties(String(input.specialties));
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("trainer_profiles")
    .update({
      profile_id: input.profile_id,
      display_name: displayName,
      bio: input.bio?.trim() || null,
      image_url: input.image_url?.trim() || null,
      specialties,
      sort_order: Number(input.sort_order) || 0,
      location_id: input.location_id?.trim() || null,
      instagram_url: input.instagram_url?.trim() || null,
      facebook_url: input.facebook_url?.trim() || null,
      twitter_url: input.twitter_url?.trim() || null,
      tiktok_url: input.tiktok_url?.trim() || null,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/trainers");
  revalidatePath("/admin");
  revalidatePath("/admin/trainers");
  return { success: true };
}

export async function deleteTrainerAction(id: string): Promise<TrainerActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Trainer profile ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("trainer_profiles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/trainers");
  revalidatePath("/admin");
  revalidatePath("/admin/trainers");
  return { success: true };
}
