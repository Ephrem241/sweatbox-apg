import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_etb: number;
  category: string;
  image_url: string | null;
  stock: number;
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("shop");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price_etb, category, image_url, stock")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();
  const product = data as ProductRow;

  return (
    <div className="container px-4 py-10 md:py-16">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.image_url?.trim() || PLACEHOLDER_IMAGE}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <p className="text-sm uppercase text-muted-foreground">{product.category}</p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{product.name}</h1>
          <p className="mt-4 text-xl font-medium">{Number(product.price_etb).toLocaleString()} ETB</p>
          {product.description && (
            <p className="mt-4 text-muted-foreground">{product.description}</p>
          )}
          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              priceEtb={product.price_etb}
              disabled={product.stock < 1}
            />
            {product.stock < 1 && (
              <p className="mt-2 text-sm text-muted-foreground">{t("outOfStock")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
