import { createClient } from "@/lib/supabase/server";
import { startOfDay, parseISO, differenceInDays } from "date-fns";
import {
  ScheduleClassList,
  type ScheduleClass,
} from "@/components/schedule/schedule-class-list";

function today() {
  return startOfDay(new Date());
}

export default async function SchedulePage() {
  const supabase = await createClient();

  const { data: classesData, error: classesError } = await supabase
    .from("classes")
    .select("id, name, day_of_week, start_time")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (classesError) {
    console.error("Schedule fetch error:", classesError);
  }

  const classes = (classesData ?? []) as ScheduleClass[];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  let isOffPeak = false;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, plan_id, status, end_date")
      .eq("user_id", user.id)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const endDate = sub?.end_date
      ? startOfDay(parseISO(String(sub.end_date)))
      : null;
    const isActive =
      !!sub &&
      sub.status === "active" &&
      endDate !== null &&
      (endDate > today() || differenceInDays(endDate, today()) === 0);

    if (isActive && sub.plan_id) {
      const { data: plan } = await supabase
        .from("plans")
        .select("peak")
        .eq("id", sub.plan_id)
        .single();
      isOffPeak = plan?.peak === false;
    }
  }

  const classesByDay = classes.reduce<Record<number, ScheduleClass[]>>(
    (acc, cls) => {
      const d = cls.day_of_week;
      if (!acc[d]) acc[d] = [];
      acc[d].push(cls);
      return acc;
    },
    {}
  );

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        Schedule
      </h1>
      <p className="mb-8 text-muted-foreground">
        View classes by day. Off-Peak members cannot book during 4 PM–8 PM.
      </p>
      <ScheduleClassList
        classesByDay={classesByDay}
        isOffPeak={isOffPeak}
        isSignedIn={isSignedIn}
      />
    </div>
  );
}
