import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url: string | null;
  description: string | null;
  category?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (p: Product) =>
    setItems((curr) => {
      const existing = curr.find((i) => i.id === p.id);
      if (existing) return curr.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...curr, { ...p, quantity: 1 }];
    });

  const remove = (id: string) => setItems((curr) => curr.filter((i) => i.id !== id));
  const setQuantity = (id: string, qty: number) =>
    setItems((curr) => (qty <= 0 ? curr.filter((i) => i.id !== id) : curr.map((i) => (i.id === id ? { ...i, quantity: qty } : i))));
  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
