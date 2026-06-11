// Khair Zaman Offline Service Worker
const VERSION = "v2";
const STATIC_CACHE = `static-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const IMAGES_CACHE = `images-${VERSION}`;
const API_CACHE = `api-${VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, PAGES_CACHE, IMAGES_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Helpers
const isImageRequest = (req) =>
  req.destination === "image" || /\.(png|jpg|jpeg|webp|gif|svg|avif)$/i.test(new URL(req.url).pathname);

const isSupabaseProductRead = (url) =>
  url.hostname.endsWith("supabase.co") &&
  (url.pathname.includes("/rest/v1/products") ||
    url.pathname.includes("/rest/v1/categories") ||
    url.pathname.includes("/storage/v1/object/public/product-images"));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never intercept auth/realtime/non-GET supabase calls
  if (url.hostname.endsWith("supabase.co") && !isSupabaseProductRead(url)) return;

  // Images: cache-first
  if (isImageRequest(req) || url.pathname.includes("/storage/v1/object/public/product-images")) {
    event.respondWith(
      caches.open(IMAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) {
          fetch(req).then((res) => res.ok && cache.put(req, res.clone())).catch(() => {});
          return cached;
        }
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Supabase product/category reads: stale-while-revalidate
  if (isSupabaseProductRead(url)) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // HTML navigations: network-first with offline fallback
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(PAGES_CACHE);
          cache.put(req, res.clone());
          return res;
        } catch {
          const cache = await caches.open(PAGES_CACHE);
          const cached = await cache.match(req);
          if (cached) return cached;
          const offline = await caches.match("/offline");
          if (offline) return offline;
          const fallback = await caches.match("/");
          return (
            fallback ||
            new Response(
              "<!doctype html><meta charset=utf-8><title>Offline</title><body style=\"font-family:sans-serif;text-align:center;padding:2rem\"><h1>أنت غير متصل</h1><p><a href=\"/offline\">صفحة عدم الاتصال</a></p></body>",
              { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
            )
          );
        }
      })()
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
