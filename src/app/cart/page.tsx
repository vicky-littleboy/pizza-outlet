"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useOrderContext } from "@/components/OrderContext";
import { supabase } from "@/lib/supabaseClient";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, total, increment, decrement, clear } = useCart();
  const { serviceType, deliveryArea, openModal } = useOrderContext();
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [meta, setMeta] = useState<{ full_name?: string; phone?: string; address?: string }>({});
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  const isDelivery = serviceType === "delivery";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        setMeta((data.user.user_metadata as any) ?? {});
        setAddressInput((data.user.user_metadata as any)?.address ?? "");
      }
    });
  }, []);

  async function saveAddress() {
    if (!user) return;
    try {
      const { error } = await supabase.auth.updateUser({ data: { ...meta, address: addressInput } });
      if (error) throw error;
      setMeta({ ...meta, address: addressInput });
      setEditingAddress(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      setMessage(msg);
    }
  }

  async function placeOrder() {
    if (!user) {
      const returnTo = searchParams.get("returnTo") || "/cart";
      router.replace(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setPlacing(true);
    setMessage(null);
    try {
      if (isDelivery && !meta.address) {
        throw new Error("Please add a delivery address before proceeding.");
      }

      // First, ensure user exists in the users table
      console.log("Ensuring user exists in users table:", user.id);
      console.log("User data to insert:", {
        id: user.id,
        email: user.email,
        name: meta.full_name ?? "User",
        role: "customer"
      });
      
      // Since the trigger is working, let's skip manual user creation
      // and just proceed with order creation
      /*
      const { error: userCheckError } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email,
          name: meta.full_name ?? "User",
          role: "customer"
        }, { onConflict: "id" });
      
      if (userCheckError) {
        console.error("User creation error:", userCheckError);
        console.error("Error details:", userCheckError.details);
        console.error("Error hint:", userCheckError.hint);
        throw new Error("Failed to create user record");
      }
      
      console.log("User creation successful");
      */

      console.log("Creating order for user:", user.id);
      console.log("User metadata:", meta);
      console.log("Cart items:", items);
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          customer_name: meta.full_name ?? "Guest",
          customer_phone: meta.phone ?? null,
          customer_address: meta.address ?? null,
        })
        .select("id")
        .single();
      
      if (orderErr) {
        console.error("Order creation error:", orderErr);
        console.error("Error details:", orderErr.details);
        console.error("Error hint:", orderErr.hint);
        throw orderErr;
      }

      console.log("Order created:", order?.id);
      const orderItems = items.map((it) => ({
        order_id: order!.id,
        menu_id: it.menuId,
        variant_id: it.variantId,
        quantity: it.quantity,
        price: it.unitPrice,
      }));
      
      console.log("Creating order items:", orderItems);
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) {
        console.error("Order items creation error:", itemsErr);
        throw itemsErr;
      }

      clear();
      router.push("/orders");
    } catch (e: unknown) {
      console.error("Full error:", e);
      const msg = e instanceof Error ? e.message : "Failed to place order";
      setMessage(msg);
    } finally {
      setPlacing(false);
    }
  }

  const grouped = useMemo(() => items, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center text-center mt-10">
        <div className="text-6xl mb-3">🛒😶</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Your cart is feeling a bit lonely</h1>
        <p className="text-gray-600 mb-6">Add some cheesy goodness and make it smile!</p>
        <div className="flex gap-3">
          <Link href="/menu" className="rounded-lg bg-red-600 text-white px-4 py-2">Browse menu</Link>
          <a href="#categories" className="rounded-lg border border-yellow-400 text-black px-4 py-2 bg-yellow-300">See categories</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Your cart</h1>
        <Link href="/menu" className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 px-3 py-1.5 text-sm hover:bg-gray-200">
          <span>🍕</span>
          <span>Add more</span>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
        <div className="text-gray-900">
          <div className="font-medium">Order type</div>
          <div className="text-sm text-gray-700">
            {serviceType ? (
              serviceType === "delivery" ? `Delivery • ${deliveryArea ?? "Area"}` : serviceType === "pickup" ? "Pick-up" : "Dine-in"
            ) : (
              "Not selected"
            )}
          </div>
        </div>
        <button onClick={openModal} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">Change</button>
      </div>

      {isDelivery && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
          <div className="font-medium text-gray-900 mb-2">Delivery address</div>
          {editingAddress ? (
            <div className="space-y-3">
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter your delivery address"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button onClick={saveAddress} className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm">Save</button>
                <button onClick={() => setEditingAddress(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {meta.address ? meta.address : "No address saved"}
              </div>
              <button onClick={() => setEditingAddress(true)} className="text-sm text-red-600 hover:underline">
                {meta.address ? "Edit" : "Add"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        {grouped.map((it, index) => (
          <div key={`${it.menuId}-${it.variantId ?? "base"}`} className="flex items-center justify-between p-4 border-b last:border-b-0 relative">
            <div>
              <div className="text-gray-900 font-medium">{it.name}</div>
              <div className="text-sm text-gray-600">{it.variantLabel ?? "Base"}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-gray-300 overflow-hidden">
                <button onClick={() => decrement(it.menuId, it.variantId)} className="px-3 py-1 text-lg text-red-700 hover:bg-red-50">-</button>
                <span className="px-3 py-1 text-sm font-medium text-gray-900">{it.quantity}</span>
                <button onClick={() => increment({ menuId: it.menuId, name: it.name, unitPrice: it.unitPrice, variantId: it.variantId, variantLabel: it.variantLabel })} className="px-3 py-1 text-lg text-red-700 hover:bg-red-50">+</button>
              </div>
              <div className="w-16 text-right font-medium text-gray-900">₹{(it.unitPrice * it.quantity).toFixed(2)}</div>
            </div>

          </div>
        ))}
      </div>

      {message && <div className="rounded-lg p-3 bg-yellow-100 text-gray-900 border border-yellow-300">{message}</div>}

      <div className="flex items-center justify-between">
        <div className="text-gray-900 font-semibold">Total: ₹{total.toFixed(2)}</div>
        {user ? (
          <button disabled={placing} onClick={placeOrder} className="rounded-lg bg-red-600 text-white px-4 py-2 disabled:opacity-60">
            {placing ? "Placing order…" : "Place order"}
          </button>
        ) : (
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Sign in to place your order</div>
            <Link href="/auth" className="rounded-lg bg-red-600 text-white px-4 py-2">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
} 