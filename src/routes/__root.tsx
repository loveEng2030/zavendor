import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatbotPlaceholder } from "@/components/ChatbotPlaceholder";
import { OnboardingTour } from "@/components/OnboardingTour";
import { WelcomeVoice } from "@/components/WelcomeVoice";
import { OrderStatusNotifier } from "@/components/OrderStatusNotifier";
import { OfflineProvider } from "@/components/OfflineProvider";
import { IslamicReminders } from "@/components/IslamicReminders";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-muted-foreground">الصفحة غير موجودة</p>
        <a href="/" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "البسمة لمستحضرات التجميل - إدارة وليد أحمد وعمرو أحمد" },
      { name: "description", content: "البسمة لمستحضرات التجميل - تسوق أونلاين بأفضل الأسعار. إدارة: وليد أحمد وعمرو أحمد." },
      { property: "og:title", content: "البسمة لمستحضرات التجميل - إدارة وليد أحمد وعمرو أحمد" },
      { property: "og:description", content: "البسمة لمستحضرات التجميل - تسوق أونلاين بأفضل الأسعار. إدارة: وليد أحمد وعمرو أحمد." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "البسمة لمستحضرات التجميل - إدارة وليد أحمد وعمرو أحمد" },
      { name: "twitter:description", content: "البسمة لمستحضرات التجميل - تسوق أونلاين بأفضل الأسعار. إدارة: وليد أحمد وعمرو أحمد." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#5c1a2b" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "البسمة لمستحضرات التجميل" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <CartProvider>
            <FavoritesProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
              <ChatbotPlaceholder />
              <OnboardingTour />
              <WelcomeVoice />
              <OrderStatusNotifier />
              <OfflineProvider />
              <IslamicReminders />
            </div>
            </FavoritesProvider>
            <Toaster position="top-center" richColors />
          </CartProvider>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
