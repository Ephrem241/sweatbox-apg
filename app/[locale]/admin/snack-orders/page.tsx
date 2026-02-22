import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminSnackOrdersSection } from "@/components/admin/AdminSnackOrdersSection";

type SnackOrderRow = {
  id: string;
  user_id: string;
  status: string;
  pickup_at: string | null;
  created_at: string;
  locations: { name: string } | null;
};

type AdminSnackOrdersPageProps = { params: Promise<{ locale: string }> };

export default async function AdminSnackOrdersPage({ params }: AdminSnackOrdersPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const [
    { data: ordersData },
    { data: profilesData },
  ] = await Promise.all([
    admin
      .from("snack_orders")
      .select("id, user_id, status, pickup_at, created_at, locations(name)")
      .order("created_at", { ascending: false })
      .limit(300),
    admin.from("profiles").select("id, full_name, email"),
  ]);
  const orders = (ordersData ?? []) as unknown as SnackOrderRow[];
  const profileByUserId = new Map(
    (profilesData ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => [
      p.id,
      { full_name: p.full_name, email: p.email },
    ])
  );
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Snack bar orders
      </h1>
      <AdminSnackOrdersSection orders={orders} profileByUserId={profileByUserId} />
    </>
  );
}
