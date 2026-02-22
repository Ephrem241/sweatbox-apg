import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminSnackItemsSection } from "@/components/admin/AdminSnackItemsSection";

type SnackItemRow = {
  id: string;
  name: string;
  price_etb: number;
  available: boolean;
  sort_order: number;
  description?: string | null;
  image_url?: string | null;
};

type AdminSnackItemsPageProps = { params: Promise<{ locale: string }> };

export default async function AdminSnackItemsPage({ params }: AdminSnackItemsPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("snack_items")
    .select("id, name, price_etb, available, sort_order, description, image_url")
    .order("sort_order")
    .order("name");
  const items = (data ?? []) as unknown as SnackItemRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Snack items
      </h1>
      <AdminSnackItemsSection items={items} />
    </>
  );
}
