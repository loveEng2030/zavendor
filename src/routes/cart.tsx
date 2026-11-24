import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة المشتريات | الإسلامية" },
      { name: "description", content: "راجع المنتجات والكميات قبل إتمام طلبك من الإسلامية." },
      { property: "og:title", content: "سلة المشتريات | الإسلامية" },
      { property: "og:description", content: "راجع المنتجات والكميات قبل إتمام طلبك من الإسلامية." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "سلة المشتريات | الإسلامية" },
      { name: "twitter:description", content: "راجع المنتجات والكميات قبل إتمام طلبك من الإسلامية." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, remove, total } = useCart();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-foreground">سلة المشتريات</h1>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center p-10 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">السلة فارغة</p>
          <Link to="/" className="mt-4">
            <Button>تصفح المنتجات</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="flex items-center gap-3 p-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-1 font-semibold text-foreground">{item.name}</div>
                  <div className="text-sm text-primary">{Number(item.price).toFixed(2)} ج.م</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(item.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>

          <Card className="h-fit p-5">
            <h3 className="mb-3 font-bold text-foreground">ملخص الطلب</h3>
            <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-primary">{total.toFixed(2)} ج.م</span>
            </div>
            <Link to="/checkout">
              <Button className="mt-4 w-full" size="lg">
                إتمام الطلب
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
