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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderRow = {
  id: string;
  status: string;
  total_etb: number;
  created_at: string;
  order_items: Array<{ quantity: number; price_etb: number; products: { name: string } | null }>;
};

type Props = { params: Promise<{ locale: string }> };

export default async function AccountOrdersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("shop");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/auth/signin", locale });
  }
  const currentUser = user as NonNullable<typeof user>;

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, total_etb, created_at, order_items(quantity, price_etb, products(name))")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) console.error("Orders fetch error:", error);
  const orderList = (orders ?? []) as unknown as OrderRow[];

  return (
    <div className="container px-4 py-10 md:py-16">
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
        {t("myOrders")}
      </h1>
      <p className="mb-8 text-muted-foreground">
        {t("myOrdersDescription")}
      </p>
      {orderList.length === 0 ? (
        <p className="text-muted-foreground">{t("noOrders")}</p>
      ) : (
        <div className="space-y-6">
          {orderList.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">
                  {new Date(order.created_at).toLocaleDateString()} — {order.status}
                </CardTitle>
                <CardDescription>
                  {Number(order.total_etb).toLocaleString()} ETB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.order_items?.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.products?.name ?? "—"}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{Number(item.price_etb).toLocaleString()} ETB</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
