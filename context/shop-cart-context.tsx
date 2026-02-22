"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { product_id: string; quantity: number; name?: string; price_etb?: number };

const CART_STORAGE_KEY = "sweatbox_shop_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

type CartContextValue = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number, name?: string, priceEtb?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  checkout: () => Promise<void>;
  totalCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback(
    (productId: string, quantity = 1, name?: string, priceEtb?: number) => {
      setItems((prev) => {
        const i = prev.findIndex((x) => x.product_id === productId);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantity: next[i].quantity + quantity };
          return next;
        }
        return [...prev, { product_id: productId, quantity, name, price_etb: priceEtb }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.product_id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((x) => x.product_id !== productId));
      return;
    }
    setItems((prev) => {
      const i = prev.findIndex((x) => x.product_id === productId);
      if (i < 0) return prev;
      const next = [...prev];
      next[i] = { ...next[i], quantity };
      return next;
    });
  }, []);

  const checkout = useCallback(async () => {
    const current = loadCart();
    if (current.length === 0) return;
    const res = await fetch("/api/shop/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: current.map(({ product_id, quantity }) => ({ product_id, quantity })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Checkout failed.");
      return;
    }
    if (data.checkout_url) {
      saveCart([]);
      setItems([]);
      window.location.href = data.checkout_url;
    }
  }, []);

  const totalCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, setQuantity, checkout, totalCount }),
    [items, addItem, removeItem, setQuantity, checkout, totalCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useShopCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useShopCart must be used within ShopCartProvider");
  return ctx;
}
