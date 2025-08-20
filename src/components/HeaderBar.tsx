"use client";

import Link from "next/link";
import { useOrderContext } from "@/components/OrderContext";
import { useCart } from "@/components/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HeaderBar() {
  const { serviceType, deliveryArea, openModal } = useOrderContext();
  const { items } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl hover:scale-110 transition-transform">🍕</Link>
          <button onClick={openModal} className="text-sm rounded-full px-3 py-1.5 bg-yellow-300 text-black hover:bg-yellow-400">
            {serviceType ? (
              <span>
                {serviceType === "delivery" ? `Delivery • ${deliveryArea ?? "Area"}` : serviceType === "pickup" ? "Pick-up" : "Dine-in"}
              </span>
            ) : (
              <span>Choose service</span>
            )}
          </button>
          {/* Mobile Sign In Button */}
          {!loading && !user && (
            <Link href="/auth" className="sm:hidden text-sm rounded-lg px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors">
              Sign In
            </Link>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/orders" className="text-gray-800 hover:text-red-700">Order history</Link>
          <Link href="/cart" className="relative">
            <div className="bg-red-600 text-white font-bold px-3 py-2 rounded-md hover:bg-red-700 transition-colors">
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </div>
          </Link>
          {!loading && user ? (
            <Link href="/profile" className="text-gray-800 hover:text-red-700">Profile</Link>
          ) : (
            <Link href="/auth" className="text-sm rounded-lg px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 