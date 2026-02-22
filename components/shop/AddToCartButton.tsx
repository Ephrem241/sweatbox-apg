"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useShopCart } from "@/context/shop-cart-context";

type Props = {
  productId: string;
  name: string;
  priceEtb: number;
  disabled?: boolean;
};

export function AddToCartButton({ productId, name, priceEtb, disabled }: Props) {
  const t = useTranslations("shop");
  const { addItem } = useShopCart();

  return (
    <Button
      disabled={disabled}
      onClick={() => addItem(productId, 1, name, priceEtb)}
    >
      {t("addToCart")}
    </Button>
  );
}
