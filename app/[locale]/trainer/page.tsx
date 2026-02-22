import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { Calendar, Dumbbell } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function formatTime(s: string): string {
  const part = s.trim().slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(part)) {
    const [h, m] = part.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }
  return part || s;
}

type ClassRow = { id: string; name: string; start_time: string };

type TrainerPageProps = { params: Promise<{ locale: string }> };

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/auth/signin", locale });
  }
  const currentUser = user as NonNullable<typeof user>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", currentUser.id)
    .single();

  if (profile?.role !== "trainer") {
    redirect({ href: "/dashboard", locale });
  }

  const dayOfWeek = getTodayDayOfWeek();
  const { data: todayClassesData } = await supabase
    .from("classes")
    .select("id, name, start_time")
    .eq("day_of_week", dayOfWeek)
    .order("start_time");

  const todayClasses = (todayClassesData ?? []) as ClassRow[];
  const checkInCounts: Record<string, number> = {};

  await Promise.all(
    todayClasses.map(async (cls) => {
      const { count, error } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("class_id", cls.id);
      checkInCounts[cls.id] = error ? -1 : (count ?? 0);
    })
  );

  return (
    <div className="container px-4 py-10 md:py-16">
      <section className="mb-8 rounded-xl bg-muted/50 px-5 py-6 md:px-6">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-8 shrink-0 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Trainer
            </h1>
            <p className="mt-1 text-muted-foreground">
              Today&apos;s classes and check-in counts.
            </p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-muted-foreground" aria-hidden />
            <CardTitle>Today&apos;s classes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class name</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Check-ins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No classes scheduled for today
                  </TableCell>
                </TableRow>
              ) : (
                todayClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{formatTime(cls.start_time)}</TableCell>
                    <TableCell>
                      {checkInCounts[cls.id] === undefined ||
                      checkInCounts[cls.id] < 0
                        ? "—"
                        : checkInCounts[cls.id]}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
