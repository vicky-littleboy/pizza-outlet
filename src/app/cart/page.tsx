"use client";

import { Suspense } from "react";
import CartContent from "./CartContent";

export default function CartPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading cart...</div>}>
      <CartContent />
    </Suspense>
  );
} 