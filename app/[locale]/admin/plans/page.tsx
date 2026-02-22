import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminPlansSection } from "@/components/admin/AdminPlansSection";

type PlanRow = {
  id: string;
  name: string;
  peak: boolean;
  duration_months: number;
  price_etb: number;
};

type AdminPlansPageProps = { params: Promise<{ locale: string }> };

export default async function AdminPlansPage({ params }: AdminPlansPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("plans")
    .select("id, name, peak, duration_months, price_etb")
    .order("name");
  const plans = (data ?? []) as unknown as PlanRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Plans
      </h1>
      <AdminPlansSection plans={plans} />
    </>
  );
}
