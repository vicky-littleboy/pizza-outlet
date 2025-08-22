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
  type: string;
  delivery_charge: number | null;
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
        .select("id,status,created_at,customer_name,customer_phone,customer_address,type,delivery_charge")
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

  function getOrderTypeText(type: string): string {
    switch (type) {
      case "delivery": return "Delivery";
      case "pickup": return "Pickup";
      case "dinein": return "Dine-in";
      default: return type;
    }
  }

  function getOrderTypeColor(type: string): string {
    switch (type) {
      case "delivery": return "bg-blue-100 text-blue-800";
      case "pickup": return "bg-green-100 text-green-800";
      case "dinein": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Order #{String(order.id).slice(0, 8)}</div>
                    <div className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOrderTypeColor(order.type)}`}>
                    {getOrderTypeText(order.type)}
                  </span>
                </div>

                {/* Time */}
                <div className="text-xs text-gray-600">
                  {formatIndianTime(order.created_at)}
                </div>

                {/* Action */}
                <div className="pt-2 border-t border-gray-100">
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
                    className="w-full text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    {selectedOrder?.id === order.id && showDetails ? "Hide details" : "View details"}
                  </button>
                </div>

                {/* Details Modal */}
                {selectedOrder?.id === order.id && showDetails && selectedOrder.items && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Order Details</h3>
                          <button
                            onClick={() => {
                              setShowDetails(false);
                              setSelectedOrder(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {/* Order Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium">#{String(order.id).slice(0, 8)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Type:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(order.type)}`}>
                              {getOrderTypeText(order.type)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{formatIndianTime(order.created_at)}</span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                          <div className="space-y-2">
                            {selectedOrder.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div>
                                  <span className="font-medium">{item.menu_name || "Item"}</span>
                                  {item.variant_name && <span className="text-gray-600"> • {item.variant_name}</span>}
                                  <span className="text-gray-600"> × {item.quantity}</span>
                                </div>
                                <div className="font-medium">₹{Math.round(item.price * item.quantity)}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">₹{Math.round(calculateTotal(selectedOrder.items))}</span>
                            </div>
                            {order.delivery_charge && order.delivery_charge > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Charge:</span>
                                <span className="font-medium text-blue-600">₹{order.delivery_charge}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
                              <span>Total:</span>
                              <span>₹{Math.round(calculateTotal(selectedOrder.items) + (order.delivery_charge || 0))}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address - Only show for delivery orders */}
                        {order.type === "delivery" && selectedOrder.customer_address && (
                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {selectedOrder.customer_address}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 