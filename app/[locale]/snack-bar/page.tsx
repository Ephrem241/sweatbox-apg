import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { SnackOrderForm } from "@/components/snack-bar/SnackOrderForm";

type Props = { params: Promise<{ locale: string }> };

export default async function SnackBarPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("snackBar");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/auth/signin", locale });
  }

  const [itemsRes, locationsRes] = await Promise.all([
    supabase
      .from("snack_items")
      .select("id, name, description, price_etb, available")
      .eq("available", true)
      .order("sort_order")
      .order("name"),
    supabase.from("locations").select("id, name").order("name"),
  ]);

  const snackItems = (itemsRes.data ?? []) as Array<{
    id: string;
    name: string;
    description: string | null;
    price_etb: number;
    available: boolean;
  }>;
  const locations = (locationsRes.data ?? []) as Array<{ id: string; name: string }>;

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        {t("title")}
      </h1>
      <p className="mb-10 text-muted-foreground">
        {t("subtitle")}
      </p>
      <SnackOrderForm snackItems={snackItems} locations={locations} />
    </div>
  );
}
