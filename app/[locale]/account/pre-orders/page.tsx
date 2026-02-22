import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

type SnackOrderRow = {
  id: string;
  status: string;
  pickup_at: string | null;
  notes: string | null;
  created_at: string;
  locations: { name: string } | null;
  snack_order_items: Array<{
    quantity: number;
    price_etb: number;
    snack_items: { name: string } | null;
  }>;
};

type Props = { params: Promise<{ locale: string }> };

export default async function PreOrdersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("snackBar");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/auth/signin", locale });
  }
  const currentUser = user as NonNullable<typeof user>;

  const { data: orders, error } = await supabase
    .from("snack_orders")
    .select("id, status, pickup_at, notes, created_at, locations(name), snack_order_items(quantity, price_etb, snack_items(name))")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) console.error("Pre-orders fetch error:", error);
  const orderList = (orders ?? []) as unknown as SnackOrderRow[];

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        {t("myPreOrders")}
      </h1>
      <p className="mb-8 text-muted-foreground">
        {t("myPreOrdersDescription")}
      </p>
      <Button asChild variant="outline" className="mb-6">
        <Link href="/snack-bar">{t("newOrder")}</Link>
      </Button>
      {orderList.length === 0 ? (
        <p className="text-muted-foreground">{t("noOrders")}</p>
      ) : (
        <div className="space-y-4">
          {orderList.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">
                  {new Date(order.created_at).toLocaleString()} — {order.status}
                </CardTitle>
                <CardDescription>
                  {order.locations?.name ?? "—"} · {order.pickup_at ? new Date(order.pickup_at).toLocaleString() : "—"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {order.snack_order_items?.map((item, i) => (
                    <li key={i}>
                      {item.snack_items?.name ?? "—"} × {item.quantity} — {Number(item.price_etb).toLocaleString()} ETB
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">Note: {order.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
