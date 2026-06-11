import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { openWhatsAppApp } from "@/lib/whatsapp";

export function ChatbotPlaceholder() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Placeholder for external chatbot script injection
    // window.chatbotConfig = { ... }
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="مساعدة"
        className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed bottom-24 end-5 z-50 w-72 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="mb-2 font-bold text-foreground">المساعد الذكي</div>
          <p className="text-sm text-muted-foreground">
            مساحة مخصصة لربط شات بوت خارجي. يمكن إضافة السكربت لاحقاً.
          </p>
          <a
            href="whatsapp://send?phone=201278110854"
            onClick={(e) => {
              e.preventDefault();
              openWhatsAppApp("201278110854", "السلام عليكم عاوز استفسر عن طلب");
            }}
            className="mt-3 block rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
          >
            تواصل عبر واتساب
          </a>
        </div>
      )}
    </>
  );
}
