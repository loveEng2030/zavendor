import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

export function OfflineProvider() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Guard: never register SW inside Lovable preview iframe
    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    const host = window.location.hostname;
    const isPreviewHost =
      host.includes("id-preview--") ||
      host.includes("lovableproject.com") ||
      host.includes("lovable.dev");

    if (isPreviewHost || isInIframe) {
      // Cleanup any leftover SW in preview
      navigator.serviceWorker?.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      return;
    }

    // Register SW on production
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {});
    }

    // Online/offline indicator
    const update = () => {
      const isOff = !navigator.onLine;
      setOffline(isOff);
      if (isOff) {
        toast.warning("📴 أنت في وضع عدم الاتصال", {
          description: "تقدر تتصفح المنتجات اللي شُفتها قبل كده",
          duration: 4000,
        });
      } else {
        toast.success("📶 رجع الاتصال بالإنترنت", { duration: 2500 });
      }
    };

    setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-background/95 px-4 py-2 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <WifiOff className="h-4 w-4 text-destructive" />
        <span>وضع عدم الاتصال</span>
      </div>
    </div>
  );
}
