import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80";

export default async function ShopPage() {
  const t = await getTranslations("shop");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price_etb, category, image_url, stock")
    .order("category")
    .order("name");

  if (error) console.error("Shop fetch error:", error);
  const products = (data ?? []) as ProductRow[];

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        {t("title")}
      </h1>
      <p className="mb-10 text-muted-foreground">
        {t("subtitle")}
      </p>
      {products.length === 0 ? (
        <p className="text-muted-foreground">{t("noProducts")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <Link href={`/shop/${product.slug}`}>
                <div className="relative aspect-square w-full bg-muted">
                  <Image
                    src={product.image_url?.trim() || PLACEHOLDER_IMAGE}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <CardHeader className="pb-2">
                  <p className="text-xs uppercase text-muted-foreground">{product.category}</p>
                  <h3 className="font-semibold">{product.name}</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-lg font-medium">{Number(product.price_etb).toLocaleString()} ETB</p>
                  {product.stock < 1 && (
                    <p className="text-sm text-muted-foreground">{t("outOfStock")}</p>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
