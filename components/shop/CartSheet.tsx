"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useShopCart } from "@/context/shop-cart-context";
import { ShoppingCart } from "lucide-react";

export function CartSheet() {
  const t = useTranslations("shop");
  const { items, removeItem, setQuantity, checkout, totalCount } = useShopCart();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      await checkout();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="size-4" />
          {totalCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
          <span className="sr-only">{t("cart")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t("cart")} ({totalCount})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto py-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("cartEmpty")}</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.product_id} className="flex items-center justify-between gap-2 border-b pb-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name ?? item.product_id}</p>
                    <p className="text-muted-foreground">
                      {item.price_etb != null ? `${Number(item.price_etb).toLocaleString()} ETB` : ""} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded border px-2 py-0.5 hover:bg-muted"
                      onClick={() => setQuantity(item.product_id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      className="rounded border px-2 py-0.5 hover:bg-muted"
                      onClick={() => setQuantity(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => removeItem(item.product_id)}>
                      ×
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <SheetFooter>
          <Button className="w-full" disabled={items.length === 0 || loading} onClick={handleCheckout}>
            {loading ? t("checkoutLoading") : t("checkout")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
