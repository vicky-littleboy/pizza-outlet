"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
} | null;

type OrderItem = {
  id: string;
  menu_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  menu_name?: string;
  variant_name?: string;
};

type Order = {
  id: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  items?: OrderItem[];
};

type MenuData = {
  name: string;
};

type VariantData = {
  name: string;
};

export default function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        const returnTo = searchParams.get("returnTo") || "/orders";
        router.replace(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      setUser(data.user);
      fetchOrders(data.user.id);
    });
  }, [router, searchParams]);

  async function fetchOrders(userId: string) {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,created_at,customer_name,customer_phone,customer_address")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchOrderDetails(orderId: string) {
    try {
      const { data: items, error } = await supabase
        .from("order_items")
        .select(`
          id,
          menu_id,
          variant_id,
          quantity,
          price,
          menu:menu_id(name),
          variant:variant_id(name)
        `)
        .eq("order_id", orderId);
      
      if (error) throw error;
      
      const orderWithItems = orders.find(o => o.id === orderId);
      if (orderWithItems) {
        orderWithItems.items = items?.map(item => ({
          id: item.id,
          menu_id: item.menu_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
          menu_name: (item.menu as unknown as MenuData)?.name,
          variant_name: (item.variant as unknown as VariantData)?.name
        })) || [];
        setSelectedOrder(orderWithItems);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    }
  }

  function formatIndianTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function getStatusText(status: string): string {
    switch (status) {
      case "pending": return "Pending";
      case "accepted": return "Order Confirmed";
      case "preparing": return "Preparing";
      case "ready": return "Ready for Pickup/Delivery";
      case "dispatched": return "On the Way";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "pending": return "text-yellow-600";
      case "accepted": return "text-blue-600";
      case "preparing": return "text-orange-600";
      case "ready": return "text-green-600";
      case "dispatched": return "text-purple-600";
      case "delivered": return "text-green-700";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  }

  function calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center mt-10">
        <div className="text-4xl mb-3">📋</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Sign in to see your order history</h1>
        <p className="text-gray-600 mb-4">View all your past orders and track current ones.</p>
        <Link href="/auth" className="rounded-lg bg-red-600 text-white px-4 py-2">Sign in</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Your orders</h1>
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Your orders</h1>
        <button 
          onClick={() => fetchOrders(user.id)}
          disabled={refreshing}
          className="rounded-lg bg-gray-100 text-gray-700 px-3 py-1.5 text-sm hover:bg-gray-200 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <div className="text-4xl mb-3">📦</div>
          <div className="text-gray-900 font-medium mb-2">No orders yet</div>
          <div className="text-gray-600 mb-4">Start by adding items to your cart!</div>
          <Link href="/menu" className="rounded-lg bg-red-600 text-white px-4 py-2">Browse menu</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Order #{String(order.id).slice(0, 8)}</div>
                  <div className={`text-gray-900 font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                  <div className="text-gray-800">For: {order.customer_name}</div>
                  <div className="text-sm text-gray-600">{formatIndianTime(order.created_at)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedOrder?.id === order.id && showDetails) {
                        setShowDetails(false);
                        setSelectedOrder(null);
                      } else {
                        fetchOrderDetails(order.id);
                        setShowDetails(true);
                      }
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    {selectedOrder?.id === order.id && showDetails ? "Hide details" : "View details"}
                  </button>
                </div>
              </div>

              {selectedOrder?.id === order.id && showDetails && selectedOrder.items && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.menu_name || "Item"}</span>
                          {item.variant_name && <span className="text-gray-600"> • {item.variant_name}</span>}
                          <span className="text-gray-600"> × {item.quantity}</span>
                        </div>
                        <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{calculateTotal(selectedOrder.items).toFixed(2)}</span>
                  </div>
                  {selectedOrder.customer_address && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-600">Delivery Address:</div>
                      <div className="text-sm">{selectedOrder.customer_address}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 