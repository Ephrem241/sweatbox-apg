import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminMembersSection } from "@/components/admin/AdminMembersSection";

type MemberRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

type AdminMembersPageProps = { params: Promise<{ locale: string }> };

export default async function AdminMembersPage({ params }: AdminMembersPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .order("full_name");
  const members = (data ?? []) as unknown as MemberRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Members
      </h1>
      <AdminMembersSection members={members} />
    </>
  );
}
