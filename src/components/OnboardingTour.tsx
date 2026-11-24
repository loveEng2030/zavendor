import { useEffect, useState, useCallback } from "react";
import { Joyride, STATUS, type EventData, type Step } from "react-joyride";
import { HelpCircle } from "lucide-react";

const HOME_KEY = "khayr-zaman-tour-done-v2";
const CHECKOUT_KEY = "khayr-zaman-checkout-tour-done-v2";

const HOME_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    content:
      "👋 أهلاً بيك في البسمة لمستحضرات التجميل! دعني آخذك في جولة سريعة (أقل من دقيقة) عشان تعرف تستخدم الموقع بسهولة.",
  },
  {
    target: '[data-tour="search-bar"]',
    content:
      "🔍 ابحث عن أي منتج بسرعة من هنا — اكتب اسم المنتج وهنفلتر القائمة فوراً.",
    placement: "bottom",
  },
  {
    target: '[data-tour="catalog"]',
    content:
      "🛍️ دي قائمة منتجاتنا الكاملة. كل منتج بيظهر فيه السعر «قبل الخصم» و«بعد الخصم» عشان تعرف توفيرك.",
    placement: "top",
  },
  {
    target: '[data-tour="add-to-cart"]',
    content:
      "➕ اضغط «إضافة» لإضافة المنتج لسلة المشتريات. تقدر تكرر الضغط لزيادة الكمية.",
    placement: "top",
  },
  {
    target: '[data-tour="cart-icon"]',
    content:
      "🛒 سلة المشتريات بتاعتك هنا — اضغط عليها أي وقت لمراجعة طلبك أو تعديله.",
    placement: "bottom",
  },
  {
    target: "body",
    placement: "center",
    content:
      "✨ خلاص! دلوقتي تقدر تتسوق براحتك. لو احتجت الجولة تاني اضغط زر المساعدة (؟) في الأسفل. اتفضل تشتري!",
  },
];

const CHECKOUT_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    content:
      "📦 وصلت لصفحة إتمام الطلب! خلينا نمشي مع بعض خطوة بخطوة.",
  },
  {
    target: '[data-tour="delivery-info"]',
    content:
      "📝 الخطوة 1: املأ بياناتك — الاسم، رقم الهاتف، والعنوان بالتفصيل عشان الموزع يلاقيك بسهولة.",
    placement: "bottom",
  },
  {
    target: '[data-tour="payment-method"]',
    content:
      "💳 الخطوة 2: اختار طريقة الدفع — فودافون كاش (دفع فوري) أو كاش عند الاستلام.",
    placement: "top",
  },
  {
    target: '[data-tour="order-summary"]',
    content:
      "✅ الخطوة 3: راجع ملخص الطلب والسعر النهائي ثم اضغط «تأكيد الطلب». هنحدد موقعك تلقائياً ونرسل الطلب على واتساب.",
    placement: "left",
  },
];

function getStepsForPath(path: string) {
  const isCheckout = path.startsWith("/checkout");
  return {
    steps: isCheckout ? CHECKOUT_STEPS : HOME_STEPS,
    key: isCheckout ? CHECKOUT_KEY : HOME_KEY,
  };
}

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>(HOME_STEPS);
  const [storageKey, setStorageKey] = useState(HOME_KEY);

  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;
    const { steps: s, key } = getStepsForPath(window.location.pathname);
    setSteps(s);
    setStorageKey(key);
    setRun(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { steps: s, key } = getStepsForPath(window.location.pathname);
    setSteps(s);
    setStorageKey(key);
    if (localStorage.getItem(key)) return;
    const t = setTimeout(() => setRun(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem(storageKey, "1");
      setRun(false);
    }
  };

  return (
    <>
      {/* Help button — always visible to re-launch tour */}
      <button
        type="button"
        onClick={startTour}
        aria-label="دليل استخدام الموقع"
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:scale-110 hover:bg-primary/90 active:scale-95"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {run && (
        <Joyride
          steps={steps}
          run={run}
          continuous
          scrollToFirstStep
          onEvent={handleEvent}
          locale={{
            back: "السابق",
            close: "إغلاق",
            last: "خلصنا 🎉",
            next: "التالي ←",
            skip: "تخطي",
          }}
          options={{
            primaryColor: "hsl(142 70% 35%)",
            textColor: "hsl(220 15% 15%)",
            backgroundColor: "#ffffff",
            arrowColor: "#ffffff",
            overlayColor: "rgba(0,0,0,0.6)",
            zIndex: 10000,
          }}
          styles={{
            tooltip: {
              borderRadius: 18,
              padding: 18,
              fontFamily: "Cairo, sans-serif",
              textAlign: "right",
              direction: "rtl",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.4)",
              maxWidth: 360,
            },
            tooltipContent: {
              fontSize: 15,
              lineHeight: 1.8,
              padding: "8px 0",
            },
            buttonPrimary: {
              borderRadius: 999,
              padding: "10px 22px",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "Cairo, sans-serif",
            },
            buttonBack: {
              color: "hsl(220 8% 50%)",
              marginInlineEnd: 8,
              fontWeight: 600,
              fontFamily: "Cairo, sans-serif",
            },
            buttonSkip: {
              color: "hsl(220 8% 50%)",
              fontWeight: 600,
              fontFamily: "Cairo, sans-serif",
            },
          }}
        />
      )}
    </>
  );
}
