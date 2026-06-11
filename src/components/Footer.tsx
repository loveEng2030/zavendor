import { Phone, MessageCircle, MapPin, Facebook, Smartphone } from "lucide-react";
import developerImg from "@/assets/developer.webp";
import { openWhatsAppApp } from "@/lib/whatsapp";

const whatsappMessage = "السلام عليكم عاوز استفسر عن طلب";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-gradient-to-b from-card to-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-bold text-foreground">🛒 ZaVendor</h3>
            <p className="text-sm text-muted-foreground">إدارة: وليد أحمد وعمرو أحمد</p>
            <p className="mt-2 text-sm font-medium text-primary">"من قلب القرية إلى بيتك — جودة بسعر زمان"</p>
            <p className="mt-2 text-xs text-muted-foreground">كل ما تحتاجه يصلك بسرعة وأمان</p>
          </div>

          <div className="space-y-2.5 text-sm">
            <a
              href="tel:+201068528886"
              className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">01068528886</span>
              <span className="text-muted-foreground">- اتصال</span>
            </a>
            <a
              href="whatsapp://send?phone=201068528886"
              onClick={(e) => {
                e.preventDefault();
                openWhatsAppApp("201068528886", whatsappMessage);
              }}
              className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              <span dir="ltr">01068528886</span>
              <span className="text-muted-foreground">- واتساب</span>
            </a>
            <a
              href="https://www.facebook.com/zavendor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <Facebook className="h-4 w-4" />
              صفحة الفيسبوك
            </a>
            <a
              href="https://maps.google.com/?q=Cairo,Egypt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <MapPin className="h-4 w-4" />
              الموقع على الخريطة
            </a>
            <div className="flex items-center gap-2 text-foreground">
              <Smartphone className="h-4 w-4" />
              <span>فودافون كاش:</span>
              <span dir="ltr" className="font-semibold">01070873294</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4 flex flex-col items-center gap-2">
          <img
            src={developerImg}
            alt="بشمهندس عمرو بن فتحي الليثي"
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/40 shadow-[var(--shadow-soft)]"
          />
          <p className="text-xs text-muted-foreground">
            تم التصميم by <span className="font-semibold text-foreground">بشمهندس عمرو بن فتحي الليثي</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
