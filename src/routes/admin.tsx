import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Package, ClipboardList, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, getCategoryLabel, getCategoryEmoji } from "@/lib/categories";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  description: string | null;
  image_url: string | null;
  category: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_amount: number;
  status: string;
  receipt_url: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  created_at: string;
}

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="container mx-auto p-10 text-center">جاري التحميل...</div>;

  if (!user) {
    return (
      <div className="container mx-auto p-10 text-center">
        <p className="mb-4">يجب تسجيل الدخول</p>
        <Link to="/auth"><Button>تسجيل الدخول</Button></Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-10 text-center">
        <h2 className="text-xl font-bold text-destructive">غير مصرح</h2>
        <p className="mt-2 text-muted-foreground">هذه الصفحة مخصصة للأدمن فقط</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">أهلاً بك، عمرو الليثي 👋</p>
      </div>
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products"><Package className="ms-1 h-4 w-4" /> المنتجات</TabsTrigger>
          <TabsTrigger value="orders"><ClipboardList className="ms-1 h-4 w-4" /> الطلبات</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsAdmin /></TabsContent>
        <TabsContent value="orders"><OrdersAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data ?? []) as Product[]);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("حذف المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("تم الحذف"); load(); }
  };

  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-bold">المنتجات ({products.length})</h2>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="ms-1 h-4 w-4" /> إضافة منتج</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "تعديل المنتج" : "منتج جديد"}</DialogTitle></DialogHeader>
            <ProductForm product={editing} onDone={() => { setOpen(false); setEditing(null); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-video bg-muted">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
            </div>
            <div className="p-3">
              <div className="font-semibold">{p.name}</div>
              {p.category && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {getCategoryEmoji(p.category)} {getCategoryLabel(p.category)}
                </div>
              )}
              <div className="flex items-baseline gap-2 mt-1">
                {p.original_price && Number(p.original_price) > Number(p.price) && (
                  <span className="text-xs text-muted-foreground line-through">{Number(p.original_price).toFixed(2)}</span>
                )}
                <div className="text-primary font-bold">{Number(p.price).toFixed(2)} ج.م</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(p); setOpen(true); }} className="flex-1">
                  <Edit className="ms-1 h-3 w-3" /> تعديل
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ product, onDone }: { product: Product | null; onDone: () => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price.toString() ?? "");
  const [originalPrice, setOriginalPrice] = useState(product?.original_price?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<string>(product?.category ?? "other");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image_url = product?.image_url ?? null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const filename = `${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(filename, imageFile);
        if (upErr) throw upErr;
        image_url = supabase.storage.from("product-images").getPublicUrl(filename).data.publicUrl;
      }
      const payload = {
        name,
        price: parseFloat(price),
        original_price: originalPrice.trim() ? parseFloat(originalPrice) : null,
        description,
        image_url,
        category,
      };
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast.success("تم التحديث");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("تمت الإضافة");
      }
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div><Label>اسم المنتج</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div>
        <Label>التصنيف *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="اختر تصنيف" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>السعر قبل الخصم (اختياري)</Label>
          <Input type="number" step="0.01" placeholder="مثال: 30" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
        </div>
        <div>
          <Label>السعر بعد الخصم *</Label>
          <Input required type="number" step="0.01" placeholder="مثال: 25" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        💡 لو سيبت «قبل الخصم» فاضي، هيظهر السعر العادي بدون خصم.
      </p>
      <div><Label>الوصف</Label><Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
      <div>
        <Label>صورة المنتج {product?.image_url && "(اتركها فارغة للإبقاء على الحالية)"}</Label>
        <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? "..." : "حفظ"}</Button>
    </form>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as Order[]));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم التحديث");
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("حذف الطلب نهائياً؟ لا يمكن التراجع")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      setOrders((o) => o.filter((x) => x.id !== id));
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <h2 className="text-lg font-bold">الطلبات ({orders.length})</h2>
      {orders.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 text-sm">
              <div className="font-bold text-base">{o.customer_name}</div>
              <div className="text-muted-foreground" dir="ltr">📞 {o.phone}</div>
              <div className="text-muted-foreground">📍 {o.address}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ar-EG")}</div>
            </div>
            <div className="text-end">
              <div className="text-xl font-bold text-primary">{Number(o.total_amount).toFixed(2)} ج.م</div>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${o.status === "pending" ? "bg-accent/20 text-accent-foreground" : o.status === "confirmed" ? "bg-success/20" : "bg-muted"}`}>
                {o.status === "pending" ? "قيد المراجعة" : o.status === "confirmed" ? "مؤكد" : o.status}
              </span>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-muted p-2 text-sm">
            {o.items?.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{i.name} × {i.quantity}</span>
                <span>{(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {o.receipt_url === "CASH_ON_DELIVERY" ? (
              <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs text-accent-foreground">
                💵 دفع عند الاستلام
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    // Extract object path from stored URL (supports legacy public URLs and new path-only values)
                    const marker = "/receipts/";
                    const idx = o.receipt_url.indexOf(marker);
                    const path = idx >= 0 ? o.receipt_url.slice(idx + marker.length) : o.receipt_url;
                    const { data, error } = await supabase.storage
                      .from("receipts")
                      .createSignedUrl(path, 60 * 5);
                    if (error || !data?.signedUrl) {
                      toast.error(error?.message || "تعذر فتح الإيصال");
                      return;
                    }
                    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "تعذر فتح الإيصال");
                  }
                }}
              >
                <ExternalLink className="ms-1 h-3 w-3" /> عرض الإيصال
              </Button>
            )}
            {o.status === "pending" && (
              <Button size="sm" onClick={() => updateStatus(o.id, "confirmed")}>تأكيد الطلب</Button>
            )}
            {o.status !== "cancelled" && (
              <Button size="sm" variant="destructive" onClick={() => updateStatus(o.id, "cancelled")}>إلغاء</Button>
            )}
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => deleteOrder(o.id)}>
              <Trash2 className="ms-1 h-3 w-3" /> حذف
            </Button>
          </div>
        </Card>
      ))}
      {orders.length === 0 && <Card className="p-10 text-center text-muted-foreground">لا توجد طلبات</Card>}
    </div>
  );
}
