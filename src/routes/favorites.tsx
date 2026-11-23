import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Heart, ArrowRight, ShoppingCart, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart, type Product } from "@/contexts/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "المنتجات المفضلة | ZaVendor" },
      { name: "description", content: "منتجاتك التي حفظتها في قائمة المفضلة بمتجر ZaVendor." },
      { property: "og:title", content: "المنتجات المفضلة | ZaVendor" },
      { property: "og:description", content: "منتجاتك التي حفظتها في قائمة المفضلة بمتجر ZaVendor." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "المنتجات المفضلة | ZaVendor" },
      { name: "twitter:description", content: "منتجاتك التي حفظتها في قائمة المفضلة بمتجر ZaVendor." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { ids, toggle } = useFavorites();
  const { add } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .then(({ data }) => {
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
  }, [ids]);

  const sorted = useMemo(
    () => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
    [ids, products],
  );

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> الرجوع
      </Link>

      <h1 className="mb-4 text-2xl font-bold flex items-center gap-2">
        <Heart className="h-6 w-6 fill-destructive text-destructive" /> المفضلة
        <span className="text-sm font-normal text-muted-foreground">({ids.length})</span>
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="p-10 text-center">
          <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">لا توجد منتجات في المفضلة بعد</p>
          <Link to="/"><Button>تصفح المنتجات</Button></Link>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sorted.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <Link to="/product/$id" params={{ id: p.id }}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><ShoppingCart className="h-10 w-10 text-muted-foreground" /></div>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <div className="line-clamp-1 text-sm font-semibold">{p.name}</div>
                <div className="mt-1 text-base font-extrabold text-primary">{Number(p.price).toFixed(2)} ج.م</div>
                <div className="mt-2 flex gap-1">
                  <Button size="sm" className="flex-1 h-8 gap-1" onClick={() => { add(p); toast.success("تمت الإضافة"); }}>
                    <Plus className="h-3 w-3" /> سلة
                  </Button>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => toggle(p.id)} aria-label="إزالة من المفضلة">
                    <Heart className="h-4 w-4 fill-destructive text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
