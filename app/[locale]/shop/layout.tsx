import { ShopCartProvider } from "@/context/shop-cart-context";
import { CartSheet } from "@/components/shop/CartSheet";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopCartProvider>
      <div className="flex items-center justify-between gap-4 border-b px-4 py-2">
        <h2 className="text-lg font-semibold">Shop</h2>
        <CartSheet />
      </div>
      {children}
    </ShopCartProvider>
  );
}
