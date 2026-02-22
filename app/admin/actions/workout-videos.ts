"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type WorkoutVideoActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<WorkoutVideoActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

function parseTags(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export type WorkoutVideoInput = {
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  video_url: string;
  duration_sec?: number | null;
  tags: string[];
  sort_order: number;
};

export async function createWorkoutVideoAction(
  input: WorkoutVideoInput
): Promise<WorkoutVideoActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const title = input.title?.trim();
  if (!title) return { error: "Title is required." };
  const videoUrl = input.video_url?.trim();
  if (!videoUrl) return { error: "Video URL is required." };
  const tags = Array.isArray(input.tags) ? input.tags : parseTags(String(input.tags));
  const admin = createServiceRoleClient();
  const { error } = await admin.from("workout_videos").insert({
    title,
    description: input.description?.trim() || null,
    thumbnail_url: input.thumbnail_url?.trim() || null,
    video_url: videoUrl,
    duration_sec: input.duration_sec != null ? Number(input.duration_sec) : null,
    tags,
    sort_order: Number(input.sort_order) || 0,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/workout-videos");
  return { success: true };
}

export type UpdateWorkoutVideoInput = WorkoutVideoInput & { id: string };

export async function updateWorkoutVideoAction(
  input: UpdateWorkoutVideoInput
): Promise<WorkoutVideoActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const title = input.title?.trim();
  if (!title) return { error: "Title is required." };
  const videoUrl = input.video_url?.trim();
  if (!videoUrl) return { error: "Video URL is required." };
  const tags = Array.isArray(input.tags) ? input.tags : parseTags(String(input.tags));
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("workout_videos")
    .update({
      title,
      description: input.description?.trim() || null,
      thumbnail_url: input.thumbnail_url?.trim() || null,
      video_url: videoUrl,
      duration_sec: input.duration_sec != null ? Number(input.duration_sec) : null,
      tags,
      sort_order: Number(input.sort_order) || 0,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/workout-videos");
  return { success: true };
}

export async function deleteWorkoutVideoAction(id: string): Promise<WorkoutVideoActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Video ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("workout_videos").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/workout-videos");
  return { success: true };
}
