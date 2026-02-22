import { createServiceRoleClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminGallerySection } from "@/components/admin/AdminGallerySection";

type GalleryImageRow = {
  id: string;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  sort_order: number;
};

type AdminGalleryPageProps = { params: Promise<{ locale: string }> };

export default async function AdminGalleryPage({ params }: AdminGalleryPageProps) {
  await params;
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("gallery_images")
    .select("id, src, alt, width, height, sort_order")
    .order("sort_order")
    .order("created_at");
  const images = (data ?? []) as unknown as GalleryImageRow[];
  return (
    <>
      <AdminNav />
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
        Gallery
      </h1>
      <AdminGallerySection images={images} />
    </>
  );
}
