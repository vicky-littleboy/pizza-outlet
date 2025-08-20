"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";

type Variant = { id: string; name: string; price: number };

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  base_price?: number | null;
  image_url?: string | null;
  variants?: Variant[];
};

function deriveVariants(item: MenuItem): { labels: string[]; prices: number[]; ids: (string | null)[] } {
  if (item.variants && item.variants.length > 0) {
    const labels = item.variants.map((v) => v.name.toLowerCase());
    const prices = item.variants.map((v) => Number(v.price));
    const ids = item.variants.map((v) => v.id);
    return { labels, prices, ids };
  }
  const base = Number(item.base_price ?? 0);
  return { labels: ["small"], prices: [base], ids: [null] };
}

export default function MenuList({ items }: { items: MenuItem[] }) {
  const { addItem } = useCart();

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <Card
          key={it.id}
          item={it}
          onAdd={(variantLabel, price, variantId) =>
            addItem({ menuId: it.id, name: it.name, unitPrice: price, variantId, variantLabel })
          }
        />
      ))}
    </div>
  );
}

function Card({ item, onAdd }: { item: MenuItem; onAdd: (variantLabel: string, price: number, variantId: string | null) => void }) {
  const { getQuantity, increment, decrement } = useCart();
  const { labels, prices, ids } = useMemo(() => deriveVariants(item), [item]);
  const [idx, setIdx] = useState(0);
  const price = prices[idx] ?? 0;
  const variantId = ids[idx] ?? null;
  const qty = getQuantity(item.id, variantId);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col">
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{item.name}</div>
        {item.description && <div className="text-sm text-gray-600 mt-1">{item.description}</div>}
      </div>
      {labels.length > 1 && (
        <div className="mt-3 flex gap-2">
          {labels.map((l, i) => (
            <button key={l} onClick={() => setIdx(i)} className={`text-xs rounded-full px-3 py-1 border ${i === idx ? "border-red-600 text-red-700 bg-red-50" : "border-gray-300 text-gray-700"}`}>
              {l}
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-gray-900 font-semibold">₹{price.toFixed(2)}</div>
        {qty > 0 ? (
          <div className="inline-flex items-center rounded-full border border-gray-300 overflow-hidden">
            <button
              onClick={() => decrement(item.id, variantId)}
              className="px-3 py-1 text-lg text-red-700 hover:bg-red-50"
            >
              -
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-900">{qty}</span>
            <button
              onClick={() => increment({ menuId: item.id, name: item.name, unitPrice: price, variantId, variantLabel: labels[idx] ?? "small" })}
              className="px-3 py-1 text-lg text-red-700 hover:bg-red-50"
            >
              +
            </button>
          </div>
        ) : (
          <button onClick={() => onAdd(labels[idx] ?? "small", price, variantId)} className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm hover:bg-red-700">Add to cart</button>
        )}
      </div>
    </div>
  );
} 