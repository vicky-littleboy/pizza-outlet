"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useOrderContext } from "@/components/OrderContext";
import { supabase } from "@/lib/supabaseClient";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    address?: string;
  };
} | null;

type UserMetadata = {
  full_name?: string;
  phone?: string;
  address?: string;
};

// Smart Recommendations Component
function SmartRecommendations({ items, menuItems, increment, isDelivery }: { 
  items: Array<{ name: string; menuId: string | number; variantId?: string | null }>, 
  menuItems: Array<{ 
    id: string; 
    name: string; 
    base_price: number; 
    imageUrl?: string; 
    categories?: { id: string; name: string } | null; 
    variants?: Array<{ id: string; name: string; price: number }> 
  }>, 
  increment: (item: { menuId: string | number; name: string; unitPrice: number; variantId: string | null; variantLabel: string }) => void, 
  isDelivery: boolean 
}) {
  // Get cart item names for exclusion
  const cartItemNames = items.map(item => item.name.toLowerCase());
  
  // Helper function to check if item is in cart
  const isItemInCart = useCallback((itemName: string) => {
    return cartItemNames.some(cartName => 
      cartName.includes(itemName.toLowerCase()) || 
      itemName.toLowerCase().includes(cartName)
    );
  }, [cartItemNames]);

  // Helper function to get best items with variants (prioritize by price or popularity)
  const getBestItems = useCallback((items: Array<{ 
    id: string; 
    name: string; 
    base_price: number; 
    imageUrl?: string; 
    categories?: { id: string; name: string } | null; 
    variants?: Array<{ id: string; name: string; price: number }> 
  }>, count: number) => {
    const availableItems = items.filter(item => !isItemInCart(item.name));
    if (availableItems.length <= count) return availableItems;
    
    // Sort by base price (lower price first) and take top items
    const sorted = availableItems.sort((a, b) => a.base_price - b.base_price);
    return sorted.slice(0, count);
  }, [isItemInCart]);

  // Helper function to get the best variant for display
  const getBestVariant = (item: { 
    base_price: number; 
    variants?: Array<{ id: string; name: string; price: number }> 
  }) => {
    if (!item.variants || item.variants.length === 0) {
      // No variants, use base price
      return {
        name: "Regular",
        price: item.base_price,
        id: null
      };
    }
    
    // Get the most popular variant (usually the middle-priced one)
    const sortedVariants = [...item.variants].sort((a, b) => a.price - b.price);
    
    // For items with variants, prefer the middle-priced option
    // This is usually the most popular choice (e.g., Medium for pizzas)
    const middleIndex = Math.floor(sortedVariants.length / 2);
    const bestVariant = sortedVariants[middleIndex];
    
    return {
      name: bestVariant.name,
      price: bestVariant.price,
      id: bestVariant.id
    };
  };

  // Real-time cart analysis using useMemo
  const cartAnalysis = useMemo(() => {
    const hasDrinksInCart = items.some(item => {
      const name = item.name.toLowerCase();
      return name.includes('drink') || 
             name.includes('cola') || 
             name.includes('juice') || 
             name.includes('water') ||
             name.includes('soda') ||
             name.includes('beverage') ||
             name.includes('pepsi') ||
             name.includes('coke') ||
             name.includes('sprite') ||
             name.includes('fanta') ||
             name.includes('milk') ||
             name.includes('tea') ||
             name.includes('coffee') ||
             name.includes('shake') ||
             name.includes('smoothie') ||
             name.includes('lemonade') ||
             name.includes('mint') ||
             name.includes('lime');
    });

    const hasPizzaInCart = items.some(item => {
      const name = item.name.toLowerCase();
      return name.includes('pizza') || 
             name.includes('margherita') || 
             name.includes('pepperoni') ||
             name.includes('cheese') ||
             name.includes('veg') ||
             name.includes('non-veg');
    });

    const hasSidesInCart = items.some(item => {
      const name = item.name.toLowerCase();
      return name.includes('fries') || 
             name.includes('nuggets') || 
             name.includes('wings') ||
             name.includes('garlic bread') ||
             name.includes('dip') ||
             name.includes('burger') ||
             name.includes('sandwich') ||
             name.includes('wrap') ||
             name.includes('pasta') ||
             name.includes('noodles');
    });

    return { hasDrinksInCart, hasPizzaInCart, hasSidesInCart };
  }, [items]);

  // Dynamic filtering with exclusion and variety
  const filteredItems = useMemo(() => {
    const pizzaItems = menuItems.filter(item => {
      const categoryName = item.categories?.name?.toLowerCase() || '';
      return categoryName.includes('pizza') || 
             categoryName.includes('margherita') || 
             categoryName.includes('pepperoni');
    });

    const sidesItems = menuItems.filter(item => {
      const categoryName = item.categories?.name?.toLowerCase() || '';
      return categoryName.includes('sides') ||
             categoryName.includes('roll') ||
             categoryName.includes('fries') ||
             categoryName.includes('nuggets') ||
             categoryName.includes('burger') ||
             categoryName.includes('sandwich') ||
             categoryName.includes('pasta') ||
             categoryName.includes('noodles') ||
             categoryName.includes('chowmein');
    });

    const drinkItems = menuItems.filter(item => {
      const categoryName = item.categories?.name?.toLowerCase() || '';
      return categoryName.includes('drink') ||
             categoryName.includes('beverage') ||
             categoryName.includes('cola') ||
             categoryName.includes('juice') ||
             categoryName.includes('water') ||
             categoryName.includes('soda') ||
             categoryName.includes('tea') ||
             categoryName.includes('coffee') ||
             categoryName.includes('shake') ||
             categoryName.includes('smoothie');
    });

    const dessertItems = menuItems.filter(item => {
      const categoryName = item.categories?.name?.toLowerCase() || '';
      return categoryName.includes('dessert') ||
             categoryName.includes('sweet') ||
             categoryName.includes('ice cream') ||
             categoryName.includes('cake') ||
             categoryName.includes('pastry');
    });

    return {
      pizzaItems: getBestItems(pizzaItems, 2),
      sidesItems: getBestItems(sidesItems, 2),
      drinkItems: getBestItems(drinkItems, 2),
      dessertItems: getBestItems(dessertItems, 2)
    };
  }, [menuItems, getBestItems]);

  console.log('SmartRecommendations - items:', items.length, 'menuItems:', menuItems.length);
  console.log('Cart items:', items.map(item => item.name));
  console.log('Cart analysis:', cartAnalysis);
  console.log('Filtered items counts:', {
    pizza: filteredItems.pizzaItems.length,
    sides: filteredItems.sidesItems.length,
    drinks: filteredItems.drinkItems.length,
    dessert: filteredItems.dessertItems.length
  });

  // Show loading state if menu items are not loaded yet
  if (menuItems.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        Loading recommendations...
      </div>
    );
  }

    // Smart recommendation logic with unified display
  const getRecommendations = () => {
    const recommendations = [];
    let message = "";

    // Always recommend beverages if not in cart
    if (!cartAnalysis.hasDrinksInCart && filteredItems.drinkItems.length > 0) {
      recommendations.push(...filteredItems.drinkItems.slice(0, 2));
      message += "🥤 Thirsty? Add a refreshing drink! ";
    }

    // Recommend pizza if not in cart
    if (!cartAnalysis.hasPizzaInCart && filteredItems.pizzaItems.length > 0) {
      recommendations.push(...filteredItems.pizzaItems.slice(0, 2));
      message += "🍕 Hungry? Add a delicious pizza! ";
    }

    // Recommend sides if pizza is in cart but no sides
    if (cartAnalysis.hasPizzaInCart && !cartAnalysis.hasSidesInCart && filteredItems.sidesItems.length > 0) {
      recommendations.push(...filteredItems.sidesItems.slice(0, 2));
      message += "🍟 Perfect pairing! Add some crispy sides! ";
    }

    // If no specific recommendations, suggest any available items
    if (recommendations.length === 0) {
      // Get all available items that are not in cart
      const allAvailableItems = menuItems.filter(item => !isItemInCart(item.name));
      if (allAvailableItems.length > 0) {
        recommendations.push(...allAvailableItems.slice(0, 2));
        message = isDelivery 
          ? "🍕 Complete your meal! Add more items to reach the minimum order."
          : "🍕 Complete your meal! Add more delicious items!";
      }
    }

    return { recommendations: recommendations.slice(0, 4), message: message.trim() };
  };

  const { recommendations, message } = getRecommendations();

     return (
     <div className="space-y-3">
       <div className="text-sm text-orange-700 mb-2">
         {message}
       </div>
               {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:flex sm:gap-2 sm:overflow-x-auto sm:pb-2 gap-2 w-full">
            {recommendations.map((item: { 
              id: string; 
              name: string; 
              base_price: number; 
              imageUrl?: string; 
              categories?: { id: string; name: string } | null; 
              variants?: Array<{ id: string; name: string; price: number }> 
            }) => {
             const bestVariant = getBestVariant(item);
             return (
               <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:flex-shrink-0 sm:w-36 min-w-0 shadow-sm hover:shadow-md transition-shadow">
                                   {/* Image */}
                  <div className="w-full h-20 mb-2 rounded-md overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        width={80}
                        height={80}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-lg">
                        {item.categories?.name?.toLowerCase().includes('drinks') ? '🥤' : '🍕'}
                      </div>
                    )}
                  </div>
                 
                 {/* Item Name */}
                 <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">
                   {item.name}
                 </div>
                 
                 {/* Variant */}
                 <div className="text-xs text-gray-500 mb-2">
                   {bestVariant.name}
                 </div>
                 
                 {/* Price and Add Button */}
                 <div className="flex items-center justify-between">
                   <div className="text-sm font-semibold text-gray-900">
                     ₹{Math.round(bestVariant.price)}
                   </div>
                   <button 
                     onClick={() => increment({ menuId: item.id, name: item.name, unitPrice: bestVariant.price, variantId: bestVariant.id, variantLabel: bestVariant.name })}
                     className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-orange-700 font-medium"
                   >
                     Add
                   </button>
                 </div>
               </div>
             );
           })}
         </div>
      ) : (
        <div className="text-sm text-gray-600">
          No recommendations available at the moment.
          <div className="text-xs text-gray-500 mt-1">
            Debug: {menuItems.length} menu items loaded, {items.length} items in cart
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, total, increment, decrement, clear } = useCart();
  const { serviceType, deliveryArea, openModal } = useOrderContext();
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [meta, setMeta] = useState<UserMetadata>({});
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [menuItems, setMenuItems] = useState<Array<{ 
    id: string; 
    name: string; 
    base_price: number; 
    imageUrl?: string; 
    category_id: string; 
    is_available: boolean; 
    categories?: { id: string; name: string } | null; 
    variants?: Array<{ id: string; name: string; price: number }> 
  }>>([]);

  const isDelivery = serviceType === "delivery";
  const isMadhuban = deliveryArea === "Madhuban";
  const deliveryCharge = isDelivery && !isMadhuban ? 30 : 0;
  const subtotal = total;
  const finalTotal = subtotal + deliveryCharge;
  const minimumOrderAmount = 200;
  const isOrderTypeSelected = Boolean(serviceType);
  const isAboveMinimum = subtotal >= minimumOrderAmount; // Use subtotal (item total) instead of finalTotal
  const isMinimumRequired = isDelivery && !isAboveMinimum; // Only apply minimum order for delivery

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        setMeta((data.user.user_metadata as UserMetadata) ?? {});
        setAddressInput((data.user.user_metadata as UserMetadata)?.address ?? "");
      }
    });
  }, []);

    // Fetch menu items for recommendations
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu')
          .select(`
            id,
            name,
            base_price,
            imageUrl,
            category_id,
            is_available,
            categories(id, name)
          `)
          .eq('is_available', true)
          .order('name');
        
        if (menuError) {
          console.error('Error fetching menu items:', menuError);
          console.error('Supabase connection issue - check environment variables');
          return;
        }

        if (menuData) {
          // Fetch variants for all menu items
          const menuIds = menuData.map(item => item.id);
          const { data: variantData, error: variantError } = await supabase
            .from('menu_variants')
            .select('id, menu_id, name, price')
            .in('menu_id', menuIds)
            .order('price');

          if (variantError) {
            console.error('Error fetching variants:', variantError);
          }

          // Merge menu items with their variants
          const menuItemsWithVariants = menuData.map(item => ({
            ...item,
            categories: item.categories?.[0] || null,
            variants: variantData?.filter(v => v.menu_id === item.id) || []
          }));

          console.log('Fetched menu items with variants:', menuItemsWithVariants.length);
          console.log('Available categories:', [...new Set(menuItemsWithVariants.map(item => item.categories?.name))]);
          setMenuItems(menuItemsWithVariants);
        }
      } catch (err) {
        console.error('Error in fetchMenuItems:', err);
      }
    }
    
    fetchMenuItems();
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
      if (!isOrderTypeSelected) {
        throw new Error("Please select an order type before proceeding.");
      }

             if (isMinimumRequired) {
         throw new Error(`Minimum order amount is ₹${minimumOrderAmount} for delivery. Please add more items to proceed.`);
       }

      if (isDelivery && !meta.address) {
        throw new Error("Please add a delivery address before proceeding.");
      }

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
           customer_address: isDelivery ? (meta.address ?? null) : null,
           type: serviceType,
           delivery_charge: deliveryCharge,
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

             <div className={`rounded-xl border p-4 flex items-center justify-between ${!isOrderTypeSelected ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
         <div className="text-gray-900">
           <div className="font-medium">Order type</div>
           <div className="text-sm text-gray-700">
             {serviceType ? (
               serviceType === "delivery" ? `Delivery • ${deliveryArea ?? "Area"}` : serviceType === "pickup" ? "Pick-up" : "Dine-in"
             ) : (
               <span className="text-red-600">Please select order type</span>
             )}
           </div>
         </div>
         <button onClick={openModal} className={`rounded-lg px-3 py-1.5 text-sm ${!isOrderTypeSelected ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-gray-300'}`}>
           {!isOrderTypeSelected ? 'Select' : 'Change'}
         </button>
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
         {grouped.map((it) => (
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
               <div className="w-16 text-right font-medium text-gray-900">₹{Math.round(it.unitPrice * it.quantity)}</div>
             </div>
           </div>
         ))}
       </div>

                                                               {/* Smart Recommendations - Always show */}
          <div className="rounded-xl border border-green-300 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-600 text-lg">💡</div>
              <div className="flex-1">
                                 <SmartRecommendations items={items} menuItems={menuItems} increment={increment} isDelivery={isDelivery} />
              </div>
            </div>
          </div>

         {/* Minimum Order Warning - Only for delivery */}
         {isMinimumRequired && (
           <div className="rounded-xl border border-orange-300 bg-orange-50 p-4">
             <div className="flex items-start gap-3">
               <div className="text-orange-600 text-lg">⚠️</div>
               <div className="flex-1">
                 <div className="font-medium text-orange-800 mb-1">Minimum Order Required for Delivery</div>
                 <div className="text-sm text-orange-700 mb-3">
                   You need to add items worth ₹{minimumOrderAmount - subtotal} more to reach the minimum order amount of ₹{minimumOrderAmount}.
                 </div>
               </div>
             </div>
           </div>
         )}

      {message && <div className="rounded-lg p-3 bg-yellow-100 text-gray-900 border border-yellow-300">{message}</div>}

             <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
         <div className="flex items-center justify-between text-sm">
           <span className="text-gray-600">Subtotal:</span>
           <span className="font-medium">₹{Math.round(subtotal)}</span>
         </div>
         
         {deliveryCharge > 0 && (
           <div className="flex items-center justify-between text-sm">
             <span className="text-gray-600">Delivery Charge:</span>
             <span className="font-medium text-blue-600">₹{deliveryCharge}</span>
           </div>
         )}
         
         <div className="border-t border-gray-200 pt-3">
           <div className="flex items-center justify-between">
             <span className="text-gray-900 font-semibold">Total:</span>
             <span className="text-gray-900 font-semibold">₹{Math.round(finalTotal)}</span>
           </div>
         </div>
       </div>

                                 <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {!isOrderTypeSelected && "Select order type to continue"}
              {isOrderTypeSelected && isMinimumRequired && `Add ₹${minimumOrderAmount - subtotal} more for delivery minimum`}
              {isOrderTypeSelected && !isMinimumRequired && "Ready to place order"}
            </div>
          {user ? (
            <button 
              disabled={placing || !isOrderTypeSelected || isMinimumRequired} 
              onClick={placeOrder} 
              className="rounded-lg bg-red-600 text-white px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
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