import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Upload, Check, Truck, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { openWhatsAppApp } from "@/lib/whatsapp";
import { createOrder } from "@/server/orders.functions";

const VODAFONE_CASH = "01070873294";
const WHATSAPP_NUMBER = "01278110854";

type PaymentMethod = "vodafone" | "cod";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vodafone");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10 text-center animate-fade-in">
        <p className="text-muted-foreground">السلة فارغة</p>
        <Button onClick={() => navigate({ to: "/" })} className="mt-4">العودة للتسوق</Button>
      </div>
    );
  }

  // Vodafone Cash USSD expects the amount in whole pounds (no decimals).
  const vodafoneTel = `tel:*9*7*${VODAFONE_CASH}*${Math.round(total)}#`;

  const getLocation = (): Promise<{ lat: number; lng: number } | null> =>
    new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
      const timer = setTimeout(() => resolve(null), 8000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clearTimeout(timer);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 },
      );
    });

  const buildWhatsAppMessage = (location: { lat: number; lng: number } | null) => {
    const itemsList = items
      .map((i) => `- المنتج: ${i.name}\n  الكمية: ${i.quantity}\n  السعر: ${(i.price * i.quantity).toFixed(2)} ج.م`)
      .join("\n");

    const paymentLine =
      paymentMethod === "vodafone"
        ? "💳 طريقة الدفع: فودافون كاش (تم الدفع ورفع الإيصال)"
        : "💵 طريقة الدفع: الدفع عند الاستلام (كاش)";

    const locationLine = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : `${address}\n(تعذّر تحديد الموقع تلقائياً)`;

    return `أهلاً وسهلاً 👋
معاك عميل جديد من الموقع

👤 الاسم: ${name}
📞 رقم الهاتف: ${phone}

🛒 الطلب:
${itemsList}

💰 الإجمالي: ${total.toFixed(2)} ج.م
${paymentLine}

📍 الموقع:
${locationLine}

🏠 العنوان: ${address}

شكراً ليكم ❤️`;
  };

  const handlePaid = () => {
    window.location.href = vodafoneTel;
    setPaid(true);
    toast.info("بعد إتمام الدفع، ارفع صورة الإيصال");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return toast.error("املأ جميع البيانات");
    if (paymentMethod === "vodafone") {
      if (!paid) return toast.error("يجب الدفع أولاً عبر فودافون كاش");
      if (!receiptFile) return toast.error("يجب رفع صورة إيصال الدفع لإتمام الطلب");
    }

    setSubmitting(true);
    try {
      let receipt_url = "";
      let access_token: string | null = null;

      if (user) {
        const { data: sessionData } = await supabase.auth.getSession();
        access_token = sessionData.session?.access_token ?? null;
      }

      if (paymentMethod === "vodafone" && receiptFile) {
        if (user) {
          const ext = receiptFile.name.split(".").pop() || "jpg";
          const filename = `${user.id}/${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage.from("receipts").upload(filename, receiptFile);
          if (upErr) throw upErr;
          receipt_url = filename;
        } else {
          // Guest: receipt sent via WhatsApp instead of upload
          receipt_url = "GUEST_RECEIPT_VIA_WHATSAPP";
        }
      } else {
        receipt_url = "CASH_ON_DELIVERY";
      }

      await createOrder({
        data: {
          access_token,
          customer_name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          receipt_url,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        },
      });

      toast.info("جاري تحديد موقعك...");
      const location = await getLocation();
      const msg = buildWhatsAppMessage(location);
      const waUrl = `https://wa.me/201278110854?text=${encodeURIComponent(msg)}`;

      clear();
      toast.success("تم تسجيل الطلب! جاري فتح واتساب...");

      // Direct navigation — most reliable across mobile browsers (no popup blockers)
      window.location.href = waUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <h1 className="mb-2 text-2xl font-bold text-foreground">إتمام الطلب</h1>
      <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-foreground">
        <p className="font-semibold mb-1">📋 خطوات بسيطة لإتمام طلبك:</p>
        <ol className="space-y-0.5 text-xs text-muted-foreground list-decimal list-inside">
          <li>املأ بياناتك (الاسم، الهاتف، العنوان)</li>
          <li>اختار طريقة الدفع المناسبة ليك</li>
          <li>لو فودافون كاش: ادفع وارفع صورة الإيصال</li>
          <li>اضغط «تأكيد الطلب» وهنبعتك على واتساب تلقائياً 🚀</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card data-tour="delivery-info" className="p-5 transition-all hover:shadow-[var(--shadow-soft)]">
            <h3 className="mb-3 font-bold">بيانات التوصيل</h3>
            <div className="space-y-3">
              <div>
                <Label>الاسم بالكامل *</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>رقم الهاتف *</Label>
                <Input required value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
              </div>
              <div>
                <Label>العنوان بالتفصيل *</Label>
                <Textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
              </div>
            </div>
          </Card>

          <Card data-tour="payment-method" className="p-5 transition-all hover:shadow-[var(--shadow-soft)]">
            <h3 className="mb-3 font-bold">طريقة الدفع</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("vodafone");
                  setReceiptFile(null);
                  setPaid(false);
                }}
                className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  paymentMethod === "vodafone"
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Wallet className={`h-8 w-8 transition-transform group-hover:scale-110 ${paymentMethod === "vodafone" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-bold">فودافون كاش</span>
                <span className="text-xs text-muted-foreground">دفع فوري + رفع إيصال</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cod");
                  setReceiptFile(null);
                  setPaid(false);
                }}
                className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  paymentMethod === "cod"
                    ? "border-accent bg-accent/10 shadow-[var(--shadow-soft)]"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <Truck className={`h-8 w-8 transition-transform group-hover:scale-110 ${paymentMethod === "cod" ? "text-accent" : "text-muted-foreground"}`} />
                <span className="font-bold">الدفع عند الاستلام</span>
                <span className="text-xs text-muted-foreground">ادفع كاش للموزع</span>
              </button>
            </div>
          </Card>

          {paymentMethod === "vodafone" && (
            <>
              <Card className="p-5 animate-fade-in">
                <h3 className="mb-1 font-bold">الدفع عبر فودافون كاش</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  رقم فودافون كاش: <span dir="ltr" className="font-bold">{VODAFONE_CASH}</span>
                </p>
                <Button type="button" onClick={handlePaid} variant={paid ? "outline" : "default"} className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  {paid ? "✓ تم فتح الدفع - ادفع المبلغ" : `ادفع ${total.toFixed(2)} ج.م الآن`}
                </Button>
              </Card>

              <Card className={`p-5 animate-fade-in ${!paid ? "opacity-60" : ""}`}>
                <h3 className="mb-1 font-bold">رفع إيصال الدفع *</h3>
                <p className="mb-3 text-xs text-destructive font-semibold">
                  ⚠️ إجباري: يجب الدفع أولاً ثم رفع صورة الإيصال لإتمام الطلب
                </p>
                <label
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 p-6 transition-all ${paid ? "cursor-pointer hover:bg-muted hover:border-primary" : "cursor-not-allowed"}`}
                >
                  {receiptFile ? (
                    <>
                      <Check className="h-8 w-8 text-success animate-scale-in" />
                      <span className="mt-2 text-sm font-medium text-foreground">{receiptFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">اضغط لاختيار صورة الإيصال</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!paid}
                    className="hidden"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </Card>
            </>
          )}

          {paymentMethod === "cod" && (
            <Card className="p-5 animate-fade-in border-accent/30 bg-accent/5">
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">الدفع عند الاستلام</h3>
                  <p className="text-sm text-muted-foreground">
                    سيتم تحضير طلبك وتوصيله إليك. ادفع المبلغ <span className="font-bold text-foreground">{total.toFixed(2)} ج.م</span> كاش للموزع عند الاستلام.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card data-tour="order-summary" className="h-fit p-5 sticky top-20 transition-all hover:shadow-[var(--shadow-soft)]">
          <h3 className="mb-3 font-bold">ملخص الطلب</h3>
          <div className="space-y-1.5 text-sm max-h-60 overflow-y-auto">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-muted-foreground">
                <span className="line-clamp-1">{i.name} × {i.quantity}</span>
                <span>{(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
            <span>الإجمالي</span>
            <span className="text-primary">{total.toFixed(2)} ج.م</span>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-4 w-full transition-transform hover:scale-[1.02]"
            disabled={
              submitting ||
              (paymentMethod === "vodafone" && (!paid || !receiptFile))
            }
          >
            {submitting ? "جاري الإرسال..." : "تأكيد الطلب وإرسال على واتساب"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
