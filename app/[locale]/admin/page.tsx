import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { redirect, Link } from "@/i18n/navigation";
import { LayoutDashboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { CreateClassForm } from "@/components/admin/create-class-form";
import { RealtimeNotifications } from "@/components/admin/RealtimeNotifications";

/** Today's weekday (local): 1 = Monday, 7 = Sunday */
function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  return jsDay === 0 ? 7 : jsDay;
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

type ClassRow = {
  id: string;
  name: string;
  start_time: string;
  day_of_week?: number;
};

type BookingRow = {
  id: string;
  booked_date: string;
  status: string;
  profiles: { full_name: string | null; email: string | null } | null;
  classes: { name: string } | null;
};

type MembershipRow = {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  plans: { name: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price_etb: number;
  stock: number;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_etb: number;
  created_at: string;
};

type SnackItemRow = {
  id: string;
  name: string;
  price_etb: number;
  available: boolean;
};

type SnackOrderRow = {
  id: string;
  user_id: string;
  status: string;
  pickup_at: string | null;
  created_at: string;
  locations: { name: string } | null;
};

type AdminPageProps = { params: Promise<{ locale: string }> };

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export default async function AdminPage({ params }: AdminPageProps) {
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

  if (profile?.role !== "admin") {
    redirect({ href: "/dashboard", locale });
  }

  const adminClient = createServiceRoleClient();
  const dayOfWeek = getTodayDayOfWeek();

  const [
    { data: membersData },
    { data: todayClassesData },
    { data: allClassesData },
    { data: bookingsData },
    { data: membershipsData },
    { data: productsData },
    { data: ordersData },
    { data: snackItemsData },
    { data: snackOrdersData },
  ] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, email, role")
      .order("full_name"),
    adminClient
      .from("classes")
      .select("id, name, start_time")
      .eq("day_of_week", dayOfWeek)
      .order("start_time"),
    adminClient
      .from("classes")
      .select("id, name, day_of_week, start_time")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true }),
    adminClient
      .from("bookings")
      .select("id, booked_date, status, profiles(full_name, email), classes(name)")
      .order("booked_date", { ascending: false })
      .limit(200),
    adminClient
      .from("memberships")
      .select("id, status, start_date, end_date, plans(name), profiles(full_name, email)")
      .order("end_date", { ascending: false })
      .limit(200),
    Promise.resolve(adminClient.from("products").select("id, name, slug, category, price_etb, stock").order("name")).catch(() => ({ data: [] })),
    Promise.resolve(
      adminClient
        .from("orders")
        .select("id, user_id, status, total_etb, created_at")
        .order("created_at", { ascending: false })
        .limit(200)
    ).catch(() => ({ data: [] })),
    Promise.resolve(adminClient.from("snack_items").select("id, name, price_etb, available").order("name")).catch(() => ({ data: [] })),
    Promise.resolve(
      adminClient
        .from("snack_orders")
        .select("id, user_id, status, pickup_at, created_at, locations(name)")
        .order("created_at", { ascending: false })
        .limit(200)
    ).catch(() => ({ data: [] })),
  ]);

  const members = (membersData ?? []) as unknown as ProfileRow[];
  const todayClasses = (todayClassesData ?? []) as unknown as ClassRow[];
  const allClasses = (allClassesData ?? []) as unknown as ClassRow[];
  const bookings = (bookingsData ?? []) as unknown as BookingRow[];
  const memberships = (membershipsData ?? []) as unknown as MembershipRow[];
  const products = (productsData ?? []) as unknown as ProductRow[];
  const shopOrders = (ordersData ?? []) as unknown as OrderRow[];
  const snackItems = (snackItemsData ?? []) as unknown as SnackItemRow[];
  const snackOrders = (snackOrdersData ?? []) as unknown as SnackOrderRow[];

  const orderUserIds = [...new Set(shopOrders.map((o) => o.user_id))];
  const snackOrderUserIds = [...new Set(snackOrders.map((o) => o.user_id))];
  const { data: orderProfiles } =
    orderUserIds.length > 0
      ? await adminClient
          .from("profiles")
          .select("id, full_name, email")
          .in("id", orderUserIds)
      : { data: [] };
  const profileByUserId = new Map(
    (orderProfiles ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => [p.id, p])
  );
  const { data: snackOrderProfiles } =
    snackOrderUserIds.length > 0
      ? await adminClient.from("profiles").select("id, full_name, email").in("id", snackOrderUserIds)
      : { data: [] };
  const snackProfileByUserId = new Map(
    (snackOrderProfiles ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => [p.id, p])
  );

  const checkInCounts: Record<string, number> = {};
  await Promise.all(
    todayClasses.map(async (cls) => {
      const { count, error } = await adminClient
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("class_id", cls.id);
      if (error) {
        checkInCounts[cls.id] = -1;
        return;
      }
      checkInCounts[cls.id] = count ?? 0;
    })
  );

  const classesByDay = [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    day: d,
    label: DAY_LABELS[d],
    classes: allClasses.filter((c) => c.day_of_week === d),
  }));

  return (
    <>
      <RealtimeNotifications />
      <section className="mb-8 rounded-xl bg-muted/50 px-5 py-6 md:px-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-8 shrink-0 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Admin
            </h1>
            <p className="mt-1 text-muted-foreground">
              Overview and quick links to manage classes, members, and more.
            </p>
          </div>
        </div>
      </section>
      <p className="mb-6 text-sm font-medium text-foreground">
        Use the links above to manage classes, plans, locations, and more.
      </p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>All registered profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No members
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.full_name ?? "—"}</TableCell>
                      <TableCell>{m.email ?? "—"}</TableCell>
                      <TableCell>{m.role ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s classes</CardTitle>
            <CardDescription>Check-in counts for today</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class name</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Check-in status</TableHead>
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
                      <TableCell>{cls.start_time}</TableCell>
                      <TableCell>
                        {checkInCounts[cls.id] === undefined ||
                        checkInCounts[cls.id] < 0
                          ? "—"
                          : `Checked in: ${checkInCounts[cls.id]}`}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>Recent class bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No bookings
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.profiles?.full_name ?? b.profiles?.email ?? "—"}</TableCell>
                      <TableCell>{b.classes?.name ?? "—"}</TableCell>
                      <TableCell>{b.booked_date}</TableCell>
                      <TableCell>{b.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memberships</CardTitle>
            <CardDescription>Active and past memberships</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No memberships
                    </TableCell>
                  </TableRow>
                ) : (
                  memberships.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.profiles?.full_name ?? m.profiles?.email ?? "—"}</TableCell>
                      <TableCell>{m.plans?.name ?? "—"}</TableCell>
                      <TableCell>{m.status}</TableCell>
                      <TableCell>{m.end_date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Full schedule</CardTitle>
            <CardDescription>All classes by day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {classesByDay.map(({ day, label, classes: dayClasses }) =>
              dayClasses.length === 0 ? null : (
                <div key={day}>
                  <h3 className="mb-2 font-medium">{label}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dayClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>{cls.name}</TableCell>
                          <TableCell>{cls.start_time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}
            {allClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">No classes in schedule.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shop orders</CardTitle>
            <CardDescription>Pro-shop orders and status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No orders
                    </TableCell>
                  </TableRow>
                ) : (
                  shopOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{profileByUserId.get(o.user_id)?.full_name ?? profileByUserId.get(o.user_id)?.email ?? o.user_id.slice(0, 8) + "…"}</TableCell>
                      <TableCell>{Number(o.total_etb).toLocaleString()} ETB</TableCell>
                      <TableCell>{o.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Pro-shop products</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (ETB)</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No products. Add via Supabase or create an Add Product form.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{Number(p.price_etb).toLocaleString()}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snack bar orders</CardTitle>
            <CardDescription>Pre-orders for pickup</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snackOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No snack orders
                    </TableCell>
                  </TableRow>
                ) : (
                  snackOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                      <TableCell>{snackProfileByUserId.get(o.user_id)?.full_name ?? snackProfileByUserId.get(o.user_id)?.email ?? o.user_id.slice(0, 8) + "…"}</TableCell>
                      <TableCell>{o.locations?.name ?? "—"}</TableCell>
                      <TableCell>{o.pickup_at ? new Date(o.pickup_at).toLocaleString() : "—"}</TableCell>
                      <TableCell>{o.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snack items</CardTitle>
            <CardDescription>Menu items for pre-order</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price (ETB)</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snackItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No snack items
                    </TableCell>
                  </TableRow>
                ) : (
                  snackItems.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{Number(s.price_etb).toLocaleString()}</TableCell>
                      <TableCell>{s.available ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create New Class</CardTitle>
            <CardDescription>
              Add a class to the weekly schedule. For full CRUD, go to{" "}
              <Link href="/admin/classes" className="font-medium underline">
                Classes
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateClassForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
