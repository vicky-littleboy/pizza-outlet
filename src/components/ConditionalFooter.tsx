"use client";

import { usePathname } from "next/navigation";
import FooterNav from "./FooterNav";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }
  
  return <FooterNav />;
} 