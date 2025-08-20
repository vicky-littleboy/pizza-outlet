"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";

function NavItem({ href, label, icon, showCount = false, isCart = false }: { href: string; label: string; icon: string; showCount?: boolean; isCart?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href;
  const { items } = useCart();
  
  const cartItemCount = showCount ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  if (isCart) {
    return (
      <Link href={href} className="flex items-center justify-center h-full">
        <div className="bg-red-600 text-white font-bold px-6 py-4 rounded-md flex items-center justify-center h-full min-w-[60px]">
          Cart {cartItemCount > 0 && `(${cartItemCount})`}
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex flex-col items-center text-xs relative ${active ? "text-pink-600" : "text-gray-600"}`}>
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
      {showCount && cartItemCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartItemCount}
        </div>
      )}
    </Link>
  );
}

export default function FooterNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-6 py-2 sm:hidden">
      <div className="grid grid-cols-3 text-center">
        <NavItem href="/orders" label="Orders" icon="🧾" />
        <NavItem href="/profile" label="Profile" icon="👤" />
        <NavItem href="/cart" label="" icon="🛒" showCount={true} isCart={true} />
      </div>
    </nav>
  );
} 