import MenuList from "@/components/MenuList";
import CategoryToggles from "@/components/CategoryToggles";
import { supabase } from "@/lib/supabaseClient";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category_id: string;
  imageUrl: string;
  category?: {
    id: string;
    name: string;
  };
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
  imageUrl: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
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
  // Fetch menu items, optionally by category_id, only available items
  let query = supabase.from("menu").select("id,name,description,base_price,category_id,imageUrl,categories(id,name)").eq("is_available", true).order("name", { ascending: true });
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
    imageUrl: it.imageUrl,
    category_id: it.category_id,
    category: it.category,
    variants: variants.filter((v: MenuVariant) => v.menu_id === it.id).map((v: MenuVariant) => ({ id: v.id, name: v.name, price: Number(v.price) })),
  }));

  return merged;
}

export default async function MenuPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>> 
}) {
  const params = await searchParams;
  const categoryId = toString(params["categoryId"]);
  const [categories, items] = await Promise.all([fetchCategories(), fetchMenu(categoryId)]);

  // Sort items by category when "All" is selected (no categoryId)
  const sortedItems = categoryId ? items : items.sort((a, b) => {
    // Define category priority: Pizza first, then Sides, then Desserts, then Drinks
    const categoryPriority: { [key: string]: number } = {
      'pizza': 1,
      'sides': 2,
      'desserts': 3,
      'drinks': 4
    };
    
    const aCategory = a.category?.name?.toLowerCase() || '';
    const bCategory = b.category?.name?.toLowerCase() || '';
    
    const aPriority = categoryPriority[aCategory] || 999;
    const bPriority = categoryPriority[bCategory] || 999;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same category, sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our delicious selection of pizzas, sides, and beverages. 
          Fresh ingredients, authentic flavors, delivered hot to your door.
        </p>
      </div>
      
      <CategoryToggles categories={categories} selectedId={categoryId} />
      
      <div className="min-h-[400px]">
        <MenuList items={sortedItems} />
      </div>
    </div>
  );
} 