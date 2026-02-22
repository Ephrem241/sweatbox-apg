import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import {
  differenceInDays,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  Calendar,
  CalendarCheck,
  LayoutDashboard,
  QrCode,
  Ticket,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckInQR } from "@/components/dashboard/check-in-qr";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Link as LocaleLink } from "@/i18n/navigation";

/** Start of today for date comparison. For Addis Ababa timezone, consider using @date-fns/tz in production. */
function today(): Date {
  return startOfDay(new Date());
}

type DashboardPageProps = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/auth/signin", locale });
  }
  const currentUser = user as NonNullable<typeof user>;

  const [profileResult, subscriptionResult, bookingsResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").eq("id", currentUser.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("id, status, end_date")
      .eq("user_id", currentUser.id)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bookings")
      .select("id, booked_date, status, classes(name)")
      .eq("user_id", currentUser.id)
      .order("booked_date", { ascending: false })
      .limit(20),
  ]);

  const profile = profileResult.data ?? null;
  const subscription = subscriptionResult.data ?? null;
  const bookings = (bookingsResult.data ?? []) as unknown as { id: string; booked_date: string; status: string; classes: { name: string } | null }[];
  const todayDate = today();
  const endDate = subscription?.end_date
    ? startOfDay(parseISO(String(subscription.end_date)))
    : null;
  const isActive =
    !!subscription &&
    subscription.status === "active" &&
    endDate !== null &&
    (endDate > todayDate || differenceInDays(endDate, todayDate) === 0);
  const daysRemaining =
    endDate && endDate >= todayDate ? differenceInDays(endDate, todayDate) : 0;

  return (
    <div className="container px-4 py-10 md:py-16">
      <section className="mb-8 rounded-xl bg-muted/50 px-5 py-6 md:px-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-8 shrink-0 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              {profile?.full_name
                ? `Welcome, ${profile.full_name}.`
                : "Welcome to Sweatbox APG."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ticket className="size-5 text-muted-foreground" aria-hidden />
              <CardTitle>Membership Status</CardTitle>
            </div>
            <CardDescription>Your current plan and validity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span
                className={
                  isActive
                    ? "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
                }
              >
                {isActive ? "Active" : "Expired"}
              </span>
            </div>
            {isActive && (
              <p className="text-sm text-muted-foreground">
                Days remaining: {daysRemaining}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="size-5 text-muted-foreground" aria-hidden />
              <CardTitle>Check-in</CardTitle>
            </div>
            <CardDescription>Show this QR at the gym</CardDescription>
          </CardHeader>
          <CardContent>
            {isActive ? (
              <CheckInQR value={currentUser.id} size={200} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Renew your membership to get a check-in QR code.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-muted-foreground" aria-hidden />
              <CardTitle>Schedule</CardTitle>
            </div>
            <CardDescription>View classes and book your session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full sm:w-auto" size="default">
              <LocaleLink href="/schedule" className="inline-flex items-center gap-2">
                <Calendar className="size-4" />
                View schedule & book a class
              </LocaleLink>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-muted-foreground" aria-hidden />
              <CardTitle>My bookings</CardTitle>
            </div>
            <CardDescription>Your upcoming and recent class bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bookings yet. Book your first class from the schedule.
              </p>
            ) : (
              <ul className="min-w-0 space-y-2 text-sm">
                {bookings.map((b) => (
                  <li key={b.id} className="flex min-w-0 justify-between gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="min-w-0 truncate">{b.classes?.name ?? "—"}</span>
                    <span className="shrink-0 text-muted-foreground">{b.booked_date}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" className="mt-2 px-0" size="sm">
              <LocaleLink href="/schedule">Book a class</LocaleLink>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-5 text-muted-foreground" aria-hidden />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Update your display name</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm initialName={profile?.full_name ?? ""} />
          </CardContent>
        </Card>
      </div>

      {!isActive && (
        <section className="mt-8 rounded-xl bg-muted/50 px-5 py-6 md:px-6">
          <p className="mb-4 text-sm font-medium text-foreground">Renew your membership to access classes and check-in.</p>
          <Button asChild size="lg">
            <LocaleLink href="/pricing">Renew Membership</LocaleLink>
          </Button>
        </section>
      )}
    </div>
  );
}
