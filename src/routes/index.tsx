import { createFileRoute, Link } from "@tanstack/react-router";
import { memo, useEffect, useMemo, useState } from "react";
import { ShoppingCart, Plus, Search, Truck, ShieldCheck, Clock, Star, Sparkles, Flame, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart, type Product } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { CATEGORIES } from "@/lib/categories";
import { useSoundFx } from "@/contexts/SoundContext";
import { StarRating } from "@/components/StarRating";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { toast } from "sonner";

interface RatingInfo { avg: number; count: number }

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZaVendor | التجميل والمنظفات والورقيات" },
      { name: "description", content: "تسوّق منتجات التجميل والمنظفات والورقيات من ZaVendor في فيصل، الجيزة." },
      { property: "og:title", content: "ZaVendor | التجميل والمنظفات والورقيات" },
      { property: "og:description", content: "تسوّق منتجات التجميل والمنظفات والورقيات من ZaVendor في فيصل، الجيزة." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "ZaVendor | التجميل والمنظفات والورقيات" },
      { name: "twitter:description", content: "تسوّق منتجات التجميل والمنظفات والورقيات من ZaVendor في فيصل، الجيزة." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const QUOTES = [
  "🛒 كل ما تحتاجه يصلك بسرعة وأمان",
  "❤️ ثقتك أمانة وخدمتك شرف",
  "✨ أسعار تنافسية ومنتجات طازة كل يوم",
  "🚚 توصيل سريع لباب البيت",
];

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [ratings, setRatings] = useState<Record<string, RatingInfo>>({});
  const [bestSellers, setBestSellers] = useState<string[]>([]); // top product ids
  const { count } = useCart();

  useEffect(() => {
    (async () => {
      const [{ data: prods, error: pErr }, { data: revs }, { data: orders }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("product_reviews").select("product_id,rating"),
        supabase.from("orders").select("items,status").in("status", ["pending", "confirmed"]),
      ]);
      if (pErr) toast.error("تعذر تحميل المنتجات");
      else setProducts((prods ?? []) as Product[]);

      // ratings aggregate
      const map: Record<string, { sum: number; count: number }> = {};
      (revs ?? []).forEach((r) => {
        const e = (map[r.product_id] ??= { sum: 0, count: 0 });
        e.sum += r.rating;
        e.count += 1;
      });
      const agg: Record<string, RatingInfo> = {};
      Object.entries(map).forEach(([k, v]) => (agg[k] = { avg: v.sum / v.count, count: v.count }));
      setRatings(agg);

      // best sellers from orders.items
      const counts: Record<string, number> = {};
      (orders ?? []).forEach((o) => {
        const items = (o.items as Array<{ id?: string; quantity?: number }> | null) ?? [];
        items.forEach((it) => {
          if (!it?.id) return;
          counts[it.id] = (counts[it.id] ?? 0) + (it.quantity ?? 1);
        });
      });
      const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id]) => id);
      setBestSellers(top);

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const bestSellerProducts = useMemo(
    () => bestSellers.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
    [bestSellers, products],
  );

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "all") {
      list = list.filter((p) => (p as Product & { category?: string | null }).category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, search, activeCategory]);

  const availableCategories = useMemo(() => {
    const present = new Set(
      products.map((p) => (p as Product & { category?: string | null }).category).filter(Boolean) as string[],
    );
    return CATEGORIES.filter((c) => present.has(c.value));
  }, [products]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-accent/10 to-background py-12">
        <div className="pointer-events-none absolute inset-0 -z-0 opacity-25">
          <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            أسعار اليوم • منتجات طازة
          </div>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-5xl animate-fade-in">
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">ZaVendor</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            إدارة: وليد أحمد وعمرو أحمد
          </p>
          <p className="mt-1 text-xs font-semibold text-foreground">
            التجميل والمنظفات والورقيات
          </p>

          {/* Rotating quote */}
          <div className="mt-4 h-7 overflow-hidden">
            <p
              key={quoteIdx}
              className="text-sm font-semibold text-primary sm:text-base animate-fade-in"
            >
              {QUOTES[quoteIdx]}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              href="#products"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:scale-105 hover:bg-primary/90"
            >
              تسوق الآن
            </a>
            {count > 0 && (
              <Link
                to="/cart"
                className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:scale-105 hover:border-primary"
              >
                السلة ({count})
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              { icon: Truck, label: "توصيل سريع", desc: "لباب البيت" },
              { icon: ShieldCheck, label: "ضمان الجودة", desc: "منتجات أصلية" },
              { icon: Clock, label: "خدمة 7 أيام", desc: "كل أيام الأسبوع" },
            ].map((f, i) => (
              <div
                key={f.label}
                className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <f.icon className="mx-auto h-5 w-5 text-primary" />
                <div className="mt-1 text-xs font-bold text-foreground">{f.label}</div>
                <div className="text-[10px] text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      {bestSellerProducts.length > 0 && (
        <section className="container mx-auto px-4 pt-8">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-bold text-foreground">الأكثر مبيعاً 🔥</h2>
          </div>
          <div className="-mx-4 px-4 overflow-x-auto">
            <div className="flex gap-3 pb-2 w-max">
              {bestSellerProducts.map((p) => (
                <div key={p.id} className="w-40 shrink-0">
                  <ProductCard product={p} rating={ratings[p.id]} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section id="products" data-tour="catalog" className="container mx-auto px-4 py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <h2 className="text-xl font-bold text-foreground">منتجاتنا</h2>
            <span className="text-xs text-muted-foreground">({filtered.length})</span>
          </div>
          <div data-tour="search-bar" className="relative w-full sm:max-w-xs flex items-center gap-1">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <VoiceSearchButton onResult={(t) => setSearch(t)} />
          </div>
        </div>

        {/* Categories filter */}
        {availableCategories.length > 0 && (
          <div className="mb-5 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 pb-1 w-max">
              <button
                onClick={() => setActiveCategory("all")}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "bg-card border border-border text-foreground hover:border-primary/40"
                }`}
              >
                🛍️ الكل ({products.length})
              </button>
              {availableCategories.map((c) => {
                const count = products.filter(
                  (p) => (p as Product & { category?: string | null }).category === c.value,
                ).length;
                const active = activeCategory === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setActiveCategory(c.value)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                        : "bg-card border border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    {c.emoji} {c.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground animate-fade-in">
            {search ? "لم يتم العثور على نتائج" : "لا توجد منتجات حالياً"}
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} firstAddTour={i === 0} rating={ratings[p.id]} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom banner */}
      <section className="container mx-auto px-4 pb-12">
        <div className="rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-accent p-6 text-center text-primary-foreground shadow-[var(--shadow-soft)]">
          <h3 className="text-lg font-bold sm:text-xl">🎉 طلبك يصلك في أسرع وقت</h3>
          <p className="mt-1 text-sm opacity-95">ادفع كاش عند الاستلام أو عبر فودافون كاش — اختار الأنسب ليك</p>
        </div>
      </section>
    </div>
  );
}

const ProductCard = memo(function ProductCard({
  product: p,
  firstAddTour,
  rating,
}: {
  product: Product;
  firstAddTour?: boolean;
  rating?: RatingInfo;
}) {
  const { add } = useCart();
  const { playPop } = useSoundFx();
  const { isFav, toggle: toggleFav } = useFavorites();
  const fav = isFav(p.id);
  const hasDiscount = !!p.original_price && Number(p.original_price) > Number(p.price);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(p);
    playPop();
    toast.success(`تمت إضافة ${p.name}`);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(p.id);
  };

  return (
    <Card className="group overflow-hidden border-border bg-card transition-shadow duration-200 hover:shadow-[var(--shadow-soft)] hover:border-primary/30">
      <Link to="/product/$id" params={{ id: p.id }} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <button
            onClick={handleFav}
            aria-label={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            className="absolute top-1.5 left-1.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm transition-transform active:scale-90 hover:scale-110"
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-10 w-10" />
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link to="/product/$id" params={{ id: p.id }} className="block hover:text-primary">
          <div className="line-clamp-1 text-sm font-semibold text-foreground">{p.name}</div>
        </Link>
        {rating && rating.count > 0 && (
          <div className="mt-1">
            <StarRating value={rating.avg} size={12} showValue count={rating.count} />
          </div>
        )}
        {p.description && (
          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{p.description}</div>
        )}
        {hasDiscount ? (
          <div className="mt-2 rounded-lg border border-success/30 bg-success/5 p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                قبل الخصم
              </span>
              <span className="text-xs text-muted-foreground line-through font-bold">
                {Number(p.original_price).toFixed(2)} ج.م
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-success-foreground bg-success px-1.5 py-0.5 rounded">
                بعد الخصم
              </span>
              <span className="text-lg font-extrabold text-primary leading-none">
                {Number(p.price).toFixed(2)} <span className="text-[10px]">ج.م</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-2 rounded-lg bg-muted/40 p-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground">السعر:</span>
              <span className="text-lg font-extrabold text-primary leading-none">
                {Number(p.price).toFixed(2)} <span className="text-[10px]">ج.م</span>
              </span>
            </div>
          </div>
        )}
        <div className="mt-2 flex items-center justify-end">
          <Button
            size="sm"
            data-tour={firstAddTour ? "add-to-cart" : undefined}
            onClick={handleAdd}
            className="h-8 gap-1 px-2.5 active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" />
            إضافة
          </Button>
        </div>
      </div>
    </Card>
  );
});
