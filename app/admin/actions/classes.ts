"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";

export type ClassActionResult = { error?: string; success?: boolean };

async function ensureAdmin(): Promise<ClassActionResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Only admins can perform this action." };
  return null;
}

export async function createClassAction(
  _prev: ClassActionResult,
  formData: FormData
): Promise<ClassActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = String(formData.get("name") ?? "").trim();
  const dayOfWeekRaw = formData.get("day_of_week");
  const startTime = String(formData.get("start_time") ?? "").trim();
  const locationIdRaw = formData.get("location_id");
  const locationId =
    locationIdRaw && String(locationIdRaw).trim()
      ? String(locationIdRaw).trim()
      : null;
  if (!name) return { error: "Class name is required." };
  const dayOfWeek = dayOfWeekRaw ? Number(dayOfWeekRaw) : 0;
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    return { error: "Please select a valid day (1–7)." };
  }
  if (!startTime) return { error: "Start time is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("classes").insert({
    name,
    day_of_week: dayOfWeek,
    start_time: startTime,
    ...(locationId && { location_id: locationId }),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  const locale = (formData.get("locale") as string) ?? "en";
  redirect({ href: "/admin/classes", locale });
  return { success: true };
}

export type UpdateClassInput = {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  location_id?: string | null;
};

export async function updateClassAction(
  input: UpdateClassInput
): Promise<ClassActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  const name = input.name?.trim();
  if (!name) return { error: "Class name is required." };
  if (
    !Number.isInteger(input.day_of_week) ||
    input.day_of_week < 1 ||
    input.day_of_week > 7
  ) {
    return { error: "Please select a valid day (1–7)." };
  }
  if (!input.start_time?.trim()) return { error: "Start time is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("classes")
    .update({
      name,
      day_of_week: input.day_of_week,
      start_time: input.start_time.trim(),
      location_id: input.location_id || null,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  return { success: true };
}

export async function deleteClassAction(id: string): Promise<ClassActionResult> {
  const err = await ensureAdmin();
  if (err) return err;
  if (!id?.trim()) return { error: "Class ID is required." };
  const admin = createServiceRoleClient();
  const { error } = await admin.from("classes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  return { success: true };
}
