"use client";

import { Suspense } from "react";
import OrdersContent from "./OrdersContent";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
} 