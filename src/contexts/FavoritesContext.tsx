import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";

const KEY = "favorite-product-ids";

interface FavoritesValue {
  ids: string[];
  isFav: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [ids]);

  const value = useMemo<FavoritesValue>(
    () => ({
      ids,
      count: ids.length,
      isFav: (id) => ids.includes(id),
      toggle: (id) =>
        setIds((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id])),
    }),
    [ids],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
