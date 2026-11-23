import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ShoppingCart, LogOut, User as UserIcon, LayoutDashboard, Volume2, VolumeX, MessageCircle, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useSoundFx } from "@/contexts/SoundContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { openWhatsAppApp } from "@/lib/whatsapp";
import { InstallAppButton } from "@/components/InstallAppButton";
import logoAsset from "@/assets/albasma-logo-cropped.jpg.asset.json";
const logo = logoAsset.url;

const whatsappMessage = "السلام عليكم عاوز استفسر عن طلب";

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const { enabled: soundOn, toggle: toggleSound } = useSoundFx();
  const { count: favCount } = useFavorites();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-14 w-14 overflow-hidden rounded-md ring-2 ring-primary/40 shadow-[var(--shadow-soft)]">
            <img
              src={logo}
              alt="شعار البسمة لمستحضرات التجميل"
              width={56}
              height={56}
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="text-right leading-tight">
            <div className="text-base font-bold text-foreground">ZaVendor</div>
            <div className="text-[10px] text-muted-foreground">إدارة: وليد أحمد وعمرو أحمد</div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          <InstallAppButton />

          <Button variant="ghost" size="icon" onClick={toggleSound} aria-label={soundOn ? "كتم الصوت" : "تشغيل الصوت"}>
            {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => openWhatsAppApp("01026189334", whatsappMessage)}
            aria-label="تواصل واتساب"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="تبديل الوضع">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Link to="/favorites" aria-label="المفضلة">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className={`h-5 w-5 ${favCount > 0 ? "fill-destructive text-destructive" : ""}`} />
              {favCount > 0 && (
                <Badge className="absolute -top-1 -end-1 h-5 min-w-5 rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                  {favCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link to="/cart" data-tour="cart-icon">
            <Button variant="ghost" size="icon" className="relative" aria-label="السلة">
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, y: -4, opacity: 0 }}
                    animate={{ scale: [1.4, 1], y: 0, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute -top-1 -end-1"
                  >
                    <Badge className="h-5 min-w-5 rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
                      {count}
                    </Badge>
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          {user && !isAdmin && (
            <Link to="/my-orders">
              <Button variant="ghost" size="icon" aria-label="طلباتي">
                <Package className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="icon" aria-label="لوحة التحكم">
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {user ? (
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="تسجيل خروج">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon" aria-label="تسجيل دخول">
                <UserIcon className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
