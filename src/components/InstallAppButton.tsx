import { useEffect, useState } from "react";
import { Download, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect already installed (standalone)
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      // iOS
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(!!standalone);

    const ua = window.navigator.userAgent || "";
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      toast.success("تم تثبيت التطبيق بنجاح ✅");
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const requestNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") {
      toast.error("الإشعارات متوقفة. فعّلها من إعدادات المتصفح/الموبايل");
      return;
    }
    const res = await Notification.requestPermission();
    if (res === "granted") {
      toast.success("🔔 تم تفعيل الإشعارات");
      try {
        new Notification("ZaVendor", {
          body: "هتوصلك إشعارات بكل جديد وحالة طلباتك",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        });
      } catch { /* noop */ }
    } else {
      toast.message("يمكنك تفعيل الإشعارات لاحقاً من الإعدادات");
    }
  };

  const handleClick = async () => {
    // Always try to enable notifications too
    requestNotifications();

    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          toast.success("جاري التثبيت...");
        }
      } catch { /* noop */ }
      setDeferred(null);
      return;
    }
    // Fallback: show manual instructions
    setShowHelp(true);
  };

  if (installed) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label="تحميل التطبيق"
        className="relative text-primary hover:text-primary"
      >
        <Download className="h-5 w-5" />
        <span className="absolute -top-0.5 -end-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
      </Button>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> تثبيت التطبيق على الموبايل
            </DialogTitle>
            <DialogDescription>
              ثبّت تطبيق ZaVendor على شاشتك الرئيسية وتوصلك الإشعارات بكل جديد وحالة طلباتك.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            {isIOS ? (
              <div className="rounded-lg border border-border bg-muted/40 p-3 leading-relaxed">
                <div className="font-bold mb-1">📱 على iPhone (Safari):</div>
                <ol className="list-decimal pr-5 space-y-1">
                  <li>اضغط زر المشاركة <span className="inline-block">⬆️</span> في الأسفل</li>
                  <li>اختر «إضافة إلى الشاشة الرئيسية»</li>
                  <li>اضغط «إضافة»</li>
                </ol>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/40 p-3 leading-relaxed">
                <div className="font-bold mb-1">🤖 على Android (Chrome):</div>
                <ol className="list-decimal pr-5 space-y-1">
                  <li>اضغط على زر القائمة <b>⋮</b> أعلى اليمين</li>
                  <li>اختر «تثبيت التطبيق» أو «إضافة للشاشة الرئيسية»</li>
                  <li>اضغط «تثبيت»</li>
                </ol>
              </div>
            )}

            <Button
              onClick={requestNotifications}
              variant="outline"
              className="w-full"
            >
              <BellRing className="ms-1 h-4 w-4" /> تفعيل الإشعارات
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              خلي الإشعارات مفعّلة عشان توصلك حالة طلباتك والعروض الجديدة فوراً.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
