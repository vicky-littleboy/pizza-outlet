"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Category = { id: string; name: string };

export default function CategoryToggles({ categories, selectedId }: { categories: Category[]; selectedId: string | null }) {
  const searchParams = useSearchParams();

  function createCategoryUrl(categoryId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    return `?${params.toString()}`;
  }

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 -mx-4 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <Link
          href={createCategoryUrl(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
            !selectedId
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-red-300"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={createCategoryUrl(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
              selectedId === cat.id
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-red-300"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
} 