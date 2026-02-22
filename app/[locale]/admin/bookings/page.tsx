import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminBookingsSection } from "@/components/admin/AdminBookingsSection";

type BookingRow = {
  id: string;
  booked_date: string;
  status: string;
  profiles: { full_name: string | null; email: string | null } | null;
  classes: { name: string } | null;
};

type AdminBookingsPageProps = { params: Promise<{ locale: string }> };

export default async function AdminBookingsPage({ params }: AdminBookingsPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("bookings")
    .select("id, booked_date, status, profiles(full_name, email), classes(name)")
    .order("booked_date", { ascending: false })
    .limit(300);
  const bookings = (data ?? []) as unknown as BookingRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Bookings
      </h1>
      <AdminBookingsSection bookings={bookings} />
    </>
  );
}
