import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, type Product } from "@/contexts/CartContext";
import { StarRating } from "@/components/StarRating";
import { getCategoryEmoji, getCategoryLabel } from "@/lib/categories";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل المنتج | الإسلامية" },
      { name: "description", content: "اعرف تفاصيل المنتج وسعره وتقييمات العملاء في متجر الإسلامية." },
      { property: "og:title", content: "تفاصيل المنتج | الإسلامية" },
      { property: "og:description", content: "اعرف تفاصيل المنتج وسعره وتقييمات العملاء في متجر الإسلامية." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "تفاصيل المنتج | الإسلامية" },
      { name: "twitter:description", content: "اعرف تفاصيل المنتج وسعره وتقييمات العملاء في متجر الإسلامية." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductPage,
});

interface Review {
  id: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false }),
    ]);
    setProduct(p as Product | null);
    setReviews((r ?? []) as Review[]);
    setLoading(false);

    if (user) {
      const mine = (r ?? []).find((x) => x.user_id === user.id);
      if (mine) {
        setMyRating(mine.rating);
        setMyComment(mine.comment ?? "");
      }
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async () => {
    if (!user) {
      toast.error("سجل دخول الأول عشان تقيم");
      navigate({ to: "/auth" });
      return;
    }
    if (myRating < 1) {
      toast.error("اختار عدد النجوم");
      return;
    }
    setSubmitting(true);
    const userName =
      (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "زبون";
    const { error } = await supabase.from("product_reviews").upsert(
      {
        product_id: id,
        user_id: user.id,
        user_name: userName,
        rating: myRating,
        comment: myComment.trim() || null,
      },
      { onConflict: "product_id,user_id" },
    );
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("شكراً لتقييمك ❤️");
    loadAll();
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("حذف تقييمك؟")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      setMyRating(0);
      setMyComment("");
      loadAll();
    }
  };

  if (loading) return <div className="container mx-auto p-10 text-center">جاري التحميل...</div>;
  if (!product)
    return (
      <div className="container mx-auto p-10 text-center">
        <p className="mb-3">المنتج غير موجود</p>
        <Link to="/"><Button>الرجوع للرئيسية</Button></Link>
      </div>
    );

  const hasDiscount = !!product.original_price && Number(product.original_price) > Number(product.price);
  const myReview = reviews.find((r) => r.user_id === user?.id);

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> الرجوع
      </Link>

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-muted">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-4 space-y-3">
            {product.category && (
              <div className="text-xs text-muted-foreground">
                {getCategoryEmoji(product.category)} {getCategoryLabel(product.category)}
              </div>
            )}
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <StarRating value={avg} showValue count={reviews.length} size={18} />
            {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

            <div className="flex items-baseline gap-3">
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {Number(product.original_price).toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-extrabold text-primary">
                {Number(product.price).toFixed(2)} ج.م
              </span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                add(product);
                toast.success("تمت الإضافة للسلة");
              }}
            >
              <Plus className="ms-1 h-5 w-5" /> أضف للسلة
            </Button>
          </div>
        </div>
      </Card>

      {/* Review form */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-bold">قيّم المنتج</h2>
        <Card className="p-4 space-y-3">
          {!user ? (
            <div className="text-center text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary underline font-semibold">سجل دخول</Link> عشان تقيم المنتج
            </div>
          ) : (
            <>
              <StarRating value={myRating} onChange={setMyRating} readOnly={false} size={26} />
              <Textarea
                placeholder="اكتب رأيك في المنتج (اختياري)"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                  {submitting ? "..." : myReview ? "تحديث التقييم" : "إرسال التقييم"}
                </Button>
                {myReview && (
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(myReview.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Reviews list */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-bold">آراء الزبائن ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">لا توجد تقييمات بعد — كن أول من يقيم!</Card>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <Card key={r.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{r.user_name ?? "زبون"}</div>
                  <StarRating value={r.rating} size={14} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("ar-EG")}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
