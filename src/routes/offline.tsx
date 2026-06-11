import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WifiOff, ShoppingCart, Home, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "غير متصل بالإنترنت — خير زمان" },
      { name: "description", content: "تصفح المنتجات المحفوظة بدون اتصال بالإنترنت" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OfflinePage,
});

interface CachedProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
}

function OfflinePage() {
  const [products, setProducts] = useState<CachedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const onChange = () => setOnline(navigator.onLine);
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    return () => {
      window.removeEventListener("online", onChange);
      window.removeEventListener("offline", onChange);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!("caches" in window)) {
          setLoading(false);
          return;
        }
        const keys = await caches.keys();
        const apiCacheName = keys.find((k) => k.startsWith("api-"));
        if (!apiCacheName) {
          setLoading(false);
          return;
        }
        const cache = await caches.open(apiCacheName);
        const requests = await cache.keys();
        const productReq = requests.find((r) => {
          const u = new URL(r.url);
          return u.pathname.includes("/rest/v1/products");
        });
        if (!productReq) {
          setLoading(false);
          return;
        }
        const res = await cache.match(productReq);
        if (!res) {
          setLoading(false);
          return;
        }
        const data = (await res.json()) as CachedProduct[];
        setProducts(Array.isArray(data) ? data.slice(0, 12) : []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="mx-auto max-w-2xl p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <WifiOff className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground">
          أنت غير متصل بالإنترنت
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {online
            ? "رجع الاتصال — يمكنك إعادة تحميل الصفحة الآن"
            : "لا يوجد اتصال حالياً، لكن تقدر تتصفح المنتجات اللي شُفتها قبل كده"}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link to="/">
              <Home className="ml-1 h-4 w-4" />
              الرئيسية
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/cart">
              <ShoppingCart className="ml-1 h-4 w-4" />
              السلة
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="ml-1 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      </Card>

      <div className="mx-auto mt-8 max-w-5xl">
        <div className="mb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">منتجات محفوظة</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            لا توجد منتجات محفوظة بعد. افتح الموقع مرة وأنت متصل بالإنترنت
            عشان نحفظلك المنتجات للتصفح بدون نت.
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/product/$id"
                params={{ id: p.id }}
                className="group"
              >
                <Card className="overflow-hidden border-border transition-shadow hover:shadow-[var(--shadow-soft)]">
                  <div className="aspect-square bg-muted">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ShoppingCart className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="line-clamp-1 text-xs font-semibold text-foreground">
                      {p.name}
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-primary">
                      {Number(p.price).toFixed(2)}{" "}
                      <span className="text-[10px]">ج.م</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
