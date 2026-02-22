import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminLocationsSection } from "@/components/admin/AdminLocationsSection";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  maps_query: string | null;
};

type AdminLocationsPageProps = { params: Promise<{ locale: string }> };

export default async function AdminLocationsPage({ params }: AdminLocationsPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("locations")
    .select("id, name, slug, address, phone, maps_query")
    .order("name");
  const locations = (data ?? []) as unknown as LocationRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Locations
      </h1>
      <AdminLocationsSection locations={locations} />
    </>
  );
}
