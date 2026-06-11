import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ArrowRight, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/my-orders")({
  component: MyOrdersPage,
});

interface OrderRow {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_amount: number;
  status: string;
  receipt_url: string;
  items: Array<{ id?: string; name: string; quantity: number; price: number; image_url?: string | null }>;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; className: string; emoji: string }> = {
  pending: { label: "قيد المراجعة", className: "bg-accent/20 text-accent-foreground", emoji: "⏳" },
  confirmed: { label: "مؤكد ✅", className: "bg-success/20 text-success-foreground", emoji: "✅" },
  cancelled: { label: "ملغي", className: "bg-destructive/15 text-destructive", emoji: "❌" },
};

function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { add } = useCart();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("تعذر تحميل الطلبات");
    else setOrders((data ?? []) as unknown as OrderRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    // realtime updates for this user
    const channel = supabase
      .channel(`my-orders-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as OrderRow;
          setOrders((curr) => curr.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleReorder = (items: OrderRow["items"]) => {
    items.forEach((it) =>
      add({
        id: it.id ?? it.name,
        name: it.name,
        price: it.price,
        image_url: it.image_url ?? null,
        description: null,
      }),
    );
    toast.success("تمت الإضافة للسلة");
  };

  if (authLoading) return <div className="container mx-auto p-10 text-center">جاري التحميل...</div>;

  if (!user) {
    return (
      <div className="container mx-auto p-10 text-center">
        <p className="mb-4">سجل دخول عشان تشوف طلباتك</p>
        <Link to="/auth"><Button>تسجيل الدخول</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> الرجوع
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> طلباتي
        </h1>
        <Button size="sm" variant="ghost" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">لم تقم بأي طلبات بعد</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>تصفح المنتجات</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const s = STATUS_MAP[o.status] ?? { label: o.status, className: "bg-muted", emoji: "•" };
            return (
              <Card key={o.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    رقم الطلب: <span className="font-mono">#{o.id.slice(0, 8)}</span>
                    <div>{new Date(o.created_at).toLocaleString("ar-EG")}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.className}`}>
                    {s.emoji} {s.label}
                  </span>
                </div>

                <div className="mt-3 rounded-lg bg-muted p-2 text-sm">
                  {o.items?.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.name} × {i.quantity}</span>
                      <span>{(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {Number(o.total_amount).toFixed(2)} ج.م
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleReorder(o.items)}>
                    🔁 اطلب تاني
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
