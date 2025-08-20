"use client";

import { usePathname } from "next/navigation";
import HeaderBar from "./HeaderBar";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }
  
  return <HeaderBar />;
} 