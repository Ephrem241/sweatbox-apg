"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type TrainerRatingResult = { error?: string; success?: boolean };

export async function submitTrainerRatingAction(
  trainerProfileId: string,
  rating: number
): Promise<TrainerRatingResult> {
  if (!trainerProfileId?.trim()) return { error: "Trainer is required." };
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) return { error: "Rating must be 1–5." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to rate." };

  const { error: upsertError } = await supabase.from("trainer_ratings").upsert(
    {
      trainer_profile_id: trainerProfileId,
      user_id: user.id,
      rating: r,
    },
    { onConflict: "trainer_profile_id,user_id" }
  );
  if (upsertError) return { error: upsertError.message };

  const admin = createServiceRoleClient();
  const { data: rows } = await admin
    .from("trainer_ratings")
    .select("rating")
    .eq("trainer_profile_id", trainerProfileId);
  const ratings = (rows ?? []) as { rating: number }[];
  const count = ratings.length;
  const average = count > 0 ? ratings.reduce((s, x) => s + x.rating, 0) / count : null;

  const { error: updateError } = await admin
    .from("trainer_profiles")
    .update({
      average_rating: average != null ? Math.round(average * 100) / 100 : null,
      rating_count: count,
    })
    .eq("id", trainerProfileId);
  if (updateError) return { error: updateError.message };

  revalidatePath("/");
  revalidatePath("/trainers");
  return { success: true };
}
