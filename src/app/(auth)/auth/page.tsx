"use client";

import { Suspense } from "react";
import AuthContent from "./AuthContent";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading auth...</div>}>
      <AuthContent />
    </Suspense>
  );
} 