import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminOrdersSection } from "@/components/admin/AdminOrdersSection";

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_etb: number;
  created_at: string;
};

type AdminOrdersPageProps = { params: Promise<{ locale: string }> };

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const [{ data: ordersData }, { data: profilesData }] = await Promise.all([
    admin
      .from("orders")
      .select("id, user_id, status, total_etb, created_at")
      .order("created_at", { ascending: false })
      .limit(300),
    admin.from("profiles").select("id, full_name, email"),
  ]);
  const orders = (ordersData ?? []) as unknown as OrderRow[];
  const profileByUserId = new Map(
    (profilesData ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => [
      p.id,
      { full_name: p.full_name, email: p.email },
    ])
  );
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Shop orders
      </h1>
      <AdminOrdersSection orders={orders} profileByUserId={profileByUserId} />
    </>
  );
}
