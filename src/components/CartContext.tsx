"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

type CartItem = {
	menuId: string | number;
	name: string;
	quantity: number;
	variantId: string | null;
	variantLabel: string | null;
	unitPrice: number;
};

type CartContextValue = {
	items: CartItem[];
	total: number;
	addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
	removeItem: (menuId: CartItem["menuId"], variantId: string | null) => void;
	updateQuantity: (menuId: CartItem["menuId"], variantId: string | null, qty: number) => void;
	clear: () => void;
	getQuantity: (menuId: CartItem["menuId"], variantId: string | null) => number;
	increment: (item: Omit<CartItem, "quantity">) => void;
	decrement: (menuId: CartItem["menuId"], variantId: string | null) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "pizza_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);

	useEffect(() => {
		try {
			const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
			if (raw) setItems(JSON.parse(raw));
		} catch {}
	}, []);

	useEffect(() => {
		try {
			if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch {}
	}, [items]);

	function addItem(item: Omit<CartItem, "quantity">, quantity: number = 1) {
		setItems((prev) => {
			const idx = prev.findIndex((p) => p.menuId === item.menuId && (p.variantId ?? null) === (item.variantId ?? null));
			if (idx >= 0) {
				const copy = [...prev];
				copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
				return copy;
			}
			return [...prev, { ...item, quantity }];
		});
	}

	function removeItem(menuId: CartItem["menuId"], variantId: string | null = null) {
		setItems((prev) => prev.filter((p) => !(p.menuId === menuId && (p.variantId ?? null) === (variantId ?? null))));
	}

	function updateQuantity(menuId: CartItem["menuId"], variantId: string | null, qty: number) {
		setItems((prev) => prev.map((p) => (p.menuId === menuId && (p.variantId ?? null) === (variantId ?? null) ? { ...p, quantity: qty } : p)));
	}

	function clear() {
		setItems([]);
	}

	const getQuantity = useCallback((menuId: CartItem["menuId"], variantId: string | null) => {
		const found = items.find((p) => p.menuId === menuId && (p.variantId ?? null) === (variantId ?? null));
		return found?.quantity ?? 0;
	}, [items]);

	const increment = useCallback((item: Omit<CartItem, "quantity">) => {
		addItem(item, 1);
	}, []);

	function decrement(menuId: CartItem["menuId"], variantId: string | null) {
		setItems((prev) => {
			const idx = prev.findIndex((p) => p.menuId === menuId && (p.variantId ?? null) === (variantId ?? null));
			if (idx === -1) return prev;
			const nextQty = prev[idx].quantity - 1;
			if (nextQty <= 0) return prev.filter((_, i) => i !== idx);
			const copy = [...prev];
			copy[idx] = { ...copy[idx], quantity: nextQty };
			return copy;
		});
	}

	const total = useMemo(() => items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0), [items]);

	const value = useMemo<CartContextValue>(
		() => ({ items, total, addItem, removeItem, updateQuantity, clear, getQuantity, increment, decrement }),
		[items, total, getQuantity, increment]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used within CartProvider");
	return ctx;
} 