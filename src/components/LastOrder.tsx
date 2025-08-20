import { supabase } from "@/lib/supabaseClient";

export default async function LastOrder() {
  const { data: sessionData } = await supabase.auth.getUser();
  const userId = sessionData.user?.id;

  if (!userId) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("id,status,created_at,customer_name")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!orders || orders.length === 0) return null;
  const last = orders[0] as { id: string | number; status: string; created_at: string; customer_name: string };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Your last order</h3>
      <div className="rounded-xl border border-gray-200 p-4 bg-white flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Order #{String(last.id).slice(0, 8)}</div>
          <div className="text-gray-800 font-medium">Status: {last.status}</div>
          <div className="text-gray-800">For: {last.customer_name}</div>
        </div>
        <a href="/orders" className="text-sm text-red-600 hover:underline">View</a>
      </div>
    </div>
  );
} 