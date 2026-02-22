import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminCheckInsSection } from "@/components/admin/AdminCheckInsSection";

type CheckInRow = {
  id: string;
  user_id: string;
  class_id: string;
  checked_in_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
  classes: { name: string } | null;
};

type AdminCheckInsPageProps = { params: Promise<{ locale: string }> };

export default async function AdminCheckInsPage({ params }: AdminCheckInsPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("check_ins")
    .select("id, user_id, class_id, checked_in_at, profiles(full_name, email), classes(name)")
    .order("checked_in_at", { ascending: false })
    .limit(500);
  const checkIns = (data ?? []) as unknown as CheckInRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Check-ins
      </h1>
      <AdminCheckInsSection checkIns={checkIns} />
    </>
  );
}
