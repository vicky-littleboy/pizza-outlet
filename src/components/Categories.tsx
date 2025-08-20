import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Category = { id: string | number; name: string; image_url?: string | null };

function mapToDisplayCategories(categories: Category[]): Category[] {
  const merged: Record<string, Category> = {};
  for (const cat of categories) {
    const raw = (cat.name || "").trim();
    const lower = raw.toLowerCase();
    const isSidesOrRoll = ["side", "sides", "roll", "rolls"].includes(lower);
    const displayName = isSidesOrRoll ? "Sides & Roll" : raw;
    const key = displayName.toLowerCase();
    if (!merged[key]) {
      merged[key] = { id: cat.id, name: displayName, image_url: cat.image_url ?? null };
    }
  }
  return Object.values(merged);
}

function categoryImagePath(name: string): string {
  const n = name.toLowerCase();
  // Unsplash category-themed images
  const map: Record<string, string> = {
    pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGl6emF8ZW58MHx8MHx8fDA%3D",
    drink: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmV2ZXJhZ2VzfGVufDB8fDB8fHww",
    pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    burger: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    sandwich: "https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=1254&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    sides: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    dessert: "https://images.unsplash.com/photo-1511911063855-2bf39afa5b2e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fGRlc3NlcnR8ZW58MHx8MHx8fDA%3D",
    biryani: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmlyeWFuaXxlbnwwfHwwfHx8MA%3D%3D",
    samosa: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Ftb3NhfGVufDB8fDB8fHww",
    chowmein: "https://plus.unsplash.com/premium_photo-1694670234085-4f38b261ce5b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bm9vZGxlc3xlbnwwfHwwfHx8MA%3D%3D",
  };
  
  // Check for specific categories
  if (n.includes("pizza")) return map.pizza;
  if (n.includes("drink") || n.includes("beverage")) return map.drink;
  if (n.includes("pasta")) return map.pasta;
  if (n.includes("burger")) return map.burger;
  if (n.includes("sandwich")) return map.sandwich;
  if (n.includes("dessert") || n.includes("sweet")) return map.dessert;
  if (n.includes("sides") || n.includes("roll")) return map.sides;
  if (n.includes("biryani")) return map.biryani;
  if (n.includes("samosa")) return map.samosa;
  if (n.includes("chowmein") || n.includes("noodle")) return map.chowmein;
  
  // fallback pizza image
  return map.pizza;
}

export default async function Categories() {
  const { data, error } = await supabase.from("categories").select("id,name");
  if (error) return null;
  if (!data || data.length === 0) return null;

  const display = mapToDisplayCategories(data as Category[]).slice(0, 10);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Categories</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {display.map((cat, idx) => (
          <Link key={cat.id} href={{ pathname: "/menu", query: { categoryId: cat.id } }} className="flex flex-col items-center text-center gap-2">
            <div className="size-28 sm:size-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              <Image
                src={cat.image_url || categoryImagePath(cat.name)}
                alt={cat.name}
                width={150}
                height={150}
                className="object-cover"
              />
            </div>
            <div className="text-xs text-gray-700 leading-tight line-clamp-2">{cat.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
} 