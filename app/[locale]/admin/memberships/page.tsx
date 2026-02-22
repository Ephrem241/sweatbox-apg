import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminMembershipsSection } from "@/components/admin/AdminMembershipsSection";

type MembershipRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  profiles: { full_name: string | null; email: string | null } | null;
  plans: { name: string } | null;
};

type AdminMembershipsPageProps = { params: Promise<{ locale: string }> };

export default async function AdminMembershipsPage({ params }: AdminMembershipsPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const [
    { data: membershipsData },
    { data: profilesData },
    { data: plansData },
  ] = await Promise.all([
    admin
      .from("memberships")
      .select("id, user_id, plan_id, status, start_date, end_date, profiles(full_name, email), plans(name)")
      .order("end_date", { ascending: false })
      .limit(500),
    admin.from("profiles").select("id, full_name, email").order("full_name"),
    admin.from("plans").select("id, name").order("name"),
  ]);
  const memberships = (membershipsData ?? []) as unknown as MembershipRow[];
  const profiles = (profilesData ?? []).map((p: { id: string; full_name: string | null; email: string | null }) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
  }));
  const plans = (plansData ?? []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }));
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Memberships
      </h1>
      <AdminMembershipsSection
        memberships={memberships}
        profiles={profiles}
        plans={plans}
      />
    </>
  );
}
