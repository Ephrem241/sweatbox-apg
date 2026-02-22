import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import type { GalleryImage } from "@/lib/gallery-images";
import { GALLERY_IMAGES } from "@/lib/gallery-images";

export default async function GalleryPage() {
  const t = await getTranslations("gallery");
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_images")
    .select("src, alt, width, height")
    .order("sort_order")
    .order("created_at");
  const images: GalleryImage[] =
    data && data.length > 0
      ? data.map((row) => ({
          src: row.src,
          alt: row.alt ?? "",
          width: row.width ?? undefined,
          height: row.height ?? undefined,
        }))
      : GALLERY_IMAGES;

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-center text-2xl font-bold tracking-tight md:text-3xl">
        {t("title")}
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        {t("description")}
      </p>
      <PhotoGallery images={images} />
    </div>
  );
}
