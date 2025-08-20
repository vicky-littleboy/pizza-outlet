import MenuList from "@/components/MenuList";
import CategoryToggles from "@/components/CategoryToggles";
import { supabase } from "@/lib/supabaseClient";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category_id: string;
};

type MenuVariant = {
  id: string;
  menu_id: string;
  name: string;
  price: number;
};

type MenuItemWithVariants = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  variants: { id: string; name: string; price: number }[];
};

function toString(q: string | string[] | undefined | null): string | null {
  if (!q) return null;
  return Array.isArray(q) ? q[0] : q;
}

async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("id,name");
  if (error) throw error;
  return data ?? [];
}

async function fetchMenu(categoryId: string | null) {
  // Fetch menu items, optionally by category_id
  let query = supabase.from("menu").select("id,name,description,base_price,category_id").order("name", { ascending: true });
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  const { data: items, error } = await query;
  if (error) throw error;

  const ids = (items ?? []).map((i: MenuItem) => i.id);
  let variants: MenuVariant[] = [];
  if (ids.length > 0) {
    const { data: v } = await supabase.from("menu_variants").select("id,menu_id,name,price").in("menu_id", ids);
    variants = v ?? [];
  }

  const merged = (items ?? []).map((it: MenuItem): MenuItemWithVariants => ({
    id: it.id,
    name: it.name,
    description: it.description,
    base_price: it.base_price,
    variants: variants.filter((v: MenuVariant) => v.menu_id === it.id).map((v: MenuVariant) => ({ id: v.id, name: v.name, price: Number(v.price) })),
  }));

  return merged;
}

export default async function MenuPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const categoryId = toString(searchParams["categoryId"]);
  const [categories, items] = await Promise.all([fetchCategories(), fetchMenu(categoryId)]);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Menu</h1>
      </div>
      
      <CategoryToggles categories={categories} selectedId={categoryId} />
      
      <MenuList items={items} />
    </div>
  );
} 