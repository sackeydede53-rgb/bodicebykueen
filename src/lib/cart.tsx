"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  slug: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  isPreorder: boolean;
  preorderEta?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bodice-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      addItem: (item, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((p) => p.variantId === item.variantId);
          if (existing) {
            return prev.map((p) =>
              p.variantId === item.variantId
                ? { ...p, quantity: p.quantity + quantity }
                : p,
            );
          }
          return [...prev, { ...item, quantity }];
        });
      },
      removeItem: (variantId) => {
        setItems((prev) => prev.filter((p) => p.variantId !== variantId));
      },
      updateQuantity: (variantId, quantity) => {
        setItems((prev) =>
          prev
            .map((p) =>
              p.variantId === variantId ? { ...p, quantity } : p,
            )
            .filter((p) => p.quantity > 0),
        );
      },
      clearCart: () => setItems([]),
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
