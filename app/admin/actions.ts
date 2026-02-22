"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";

export type CreateClassResult = { error?: string };

export async function createClassAction(
  _prev: CreateClassResult,
  formData: FormData
): Promise<CreateClassResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can create classes." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const dayOfWeekRaw = formData.get("day_of_week");
  const startTime = String(formData.get("start_time") ?? "").trim();

  if (!name) {
    return { error: "Class name is required." };
  }

  const dayOfWeek = dayOfWeekRaw ? Number(dayOfWeekRaw) : 0;
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    return { error: "Please select a valid day (1–7)." };
  }

  if (!startTime) {
    return { error: "Start time is required." };
  }

  const adminClient = createServiceRoleClient();
  const { error } = await adminClient.from("classes").insert({
    name,
    day_of_week: dayOfWeek,
    start_time: startTime,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  const locale = (formData.get("locale") as string) ?? "en";
  redirect({ href: "/admin", locale });
  return { error: undefined };
}
