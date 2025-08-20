"use client";

import { OrderProvider } from "@/components/OrderContext";
import { CartProvider } from "@/components/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <CartProvider>{children}</CartProvider>
    </OrderProvider>
  );
} 