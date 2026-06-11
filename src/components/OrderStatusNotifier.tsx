import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundFx } from "@/contexts/SoundContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Listens for realtime updates on the current user's orders.
 * Shows a toast when admin confirms/cancels.
 */
export function OrderStatusNotifier() {
  const { user } = useAuth();
  const { playPop } = useSoundFx();
  const prevStatuses = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Request browser notification permission once
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => { /* noop */ });
    }

    const notify = (title: string, body: string) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try { new Notification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png" }); } catch { /* noop */ }
      }
    };

    // Seed current statuses so we don't fire toasts on initial load
    supabase
      .from("orders")
      .select("id,status")
      .eq("user_id", user.id)
      .then(({ data }) => {
        prevStatuses.current = new Map((data ?? []).map((o) => [o.id, o.status]));
      });

    const channel = supabase
      .channel(`status-notify-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as { id: string; status: string };
          const old = prevStatuses.current.get(row.id);
          prevStatuses.current.set(row.id, row.status);
          if (old === row.status) return;

          const short = `#${row.id.slice(0, 8)}`;
          if (row.status === "confirmed") {
            try { playPop(); } catch { /* noop */ }
            toast.success(`✅ تم تأكيد طلبك ${short}`, {
              description: "هنبدأ تحضيره ونوصلهولك في أسرع وقت",
              duration: 8000,
            });
            notify("✅ تم تأكيد طلبك", `طلبك ${short} تم تأكيده وجاري التحضير`);
          } else if (row.status === "cancelled") {
            toast.error(`❌ تم إلغاء طلبك ${short}`, {
              description: "للاستفسار تواصل معانا على واتساب",
              duration: 8000,
            });
            notify("❌ تم إلغاء طلبك", `طلبك ${short} تم إلغاؤه`);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, playPop]);

  return null;
}
