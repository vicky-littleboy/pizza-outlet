"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";

type Variant = { id: string; name: string; price: number };

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  base_price?: number | null;
  imageUrl?: string | null;
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

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-600">Try selecting a different category or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full menu-card">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
                 {item.imageUrl ? (
           <img 
             src={item.imageUrl} 
             alt={item.name}
             className="w-full h-full object-cover"
             onError={(e) => {
               e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgODkuNTQ0NyA2OC4wMDAxIDgxIDc4IDgxQzg3Ljk5OTkgODEgOTYgODkuNTQ0NyA5NiAxMDBDOTYgMTEwLjQ1NSA4Ny45OTk5IDExOSA3OCAxMTlDNjguMDAwMSAxMTkgNjAgMTEwLjQ1NSA2MCAxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDQgMTAwQzEwNCA4OS41NDQ3IDExMi4wMDAxIDgxIDEyMiA4MUMxMzEuOTk5OSA4MSAxNDAgODkuNTQ0NyAxNDAgMTAwQzE0MCAxMTAuNDU1IDEzMS45OTk5IDExOSAxMjIgMTE5QzExMi4wMDAxIDExOSAxMDQgMTEwLjQ1NSAxMDQgMTAwWiIgZmlsbD0iIzlCOUJBQyIvPgo8cGF0aCBkPSJNMTQ4IDEwMEMxNDggODkuNTQ0NyAxNTYuMDAwMSA4MSAxNjYgODFDMTc1Ljk5OTkgODEgMTg0IDg5LjU0NDcgMTg0IDEwMEMxODQgMTEwLjQ1NSAxNzUuOTk5OSAxMTkgMTY2IDExOUMxNTYuMDAwMSAxMTkgMTQ4IDExMC40NTUgMTQ4IDEwMFoiIGZpbGw9IiM5QjlCQUMiLz4KPC9zdmc+';
             }}
           />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-lg mb-2">{item.name}</div>
          {item.description && <div className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</div>}
        </div>
        
        {labels.length > 1 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {labels.map((l, i) => (
              <button 
                key={l} 
                onClick={() => setIdx(i)} 
                className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                  i === idx 
                    ? "border-red-600 text-red-700 bg-red-50" 
                    : "border-gray-300 text-gray-700 hover:border-red-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        
        {/* Action Section */}
        <div className="mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-left">
              <div className="text-lg font-bold text-gray-900">₹{Math.round(price)}</div>
            </div>
            {qty > 0 ? (
              <div className="inline-flex items-center rounded-full border border-gray-300 overflow-hidden shadow-sm">
                <button
                  onClick={() => decrement(item.id, variantId)}
                  className="px-3 py-2 text-lg text-red-700 hover:bg-red-50 transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-900 min-w-[2rem] text-center">{qty}</span>
                <button
                  onClick={() => increment({ menuId: item.id, name: item.name, unitPrice: price, variantId, variantLabel: labels[idx] ?? "small" })}
                  className="px-3 py-2 text-lg text-red-700 hover:bg-red-50 transition-colors"
                >
                  +
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onAdd(labels[idx] ?? "small", price, variantId)} 
                className="w-1/2 rounded-lg bg-red-600 text-white px-3 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 