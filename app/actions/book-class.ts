"use server";

import { createClient } from "@/lib/supabase/server";

export type BookClassResult = { error?: string; success?: boolean };

/** JS getDay(): 0=Sun, 1=Mon, ... 6=Sat. DB day_of_week: 1=Mon, ..., 7=Sun. */
function getDayOfWeek(date: Date): number {
  const js = date.getDay();
  return js === 0 ? 7 : js;
}

export async function bookClassAction(
  classId: string,
  bookedDate: string
): Promise<BookClassResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to book a class." };
  }

  if (!classId || !bookedDate) {
    return { error: "Class and date are required." };
  }

  const date = new Date(bookedDate);
  if (Number.isNaN(date.getTime())) {
    return { error: "Invalid date." };
  }

  const dateStr = date.toISOString().slice(0, 10);
  const requestedDayOfWeek = getDayOfWeek(date);

  const { data: cls, error: classError } = await supabase
    .from("classes")
    .select("id, name, day_of_week")
    .eq("id", classId)
    .single();

  if (classError || !cls) {
    return { error: "Class not found." };
  }

  if (cls.day_of_week !== requestedDayOfWeek) {
    const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return {
      error: `${cls.name} runs on ${dayNames[cls.day_of_week]}. Please pick a ${dayNames[cls.day_of_week]} date.`,
    };
  }

  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("user_id", user.id)
    .eq("class_id", classId)
    .eq("booked_date", dateStr)
    .maybeSingle();

  if (existing) {
    return { error: "You already have a booking for this class on this date." };
  }

  const { error } = await supabase.from("bookings").insert({
    user_id: user.id,
    class_id: classId,
    booked_date: dateStr,
    status: "confirmed",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a booking for this class on this date." };
    }
    return { error: error.message };
  }

  return { success: true };
}
