import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminProductsSection } from "@/components/admin/AdminProductsSection";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price_etb: number;
  stock: number;
  description?: string | null;
  image_url?: string | null;
};

type AdminProductsPageProps = { params: Promise<{ locale: string }> };

export default async function AdminProductsPage({ params }: AdminProductsPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("products")
    .select("id, name, slug, category, price_etb, stock, description, image_url")
    .order("name");
  const products = (data ?? []) as unknown as ProductRow[];
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Products
      </h1>
      <AdminProductsSection products={products} />
    </>
  );
}
