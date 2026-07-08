// Chapterly Suite Service Worker
// Handles per-tool caching with a network-first strategy for API calls
// and cache-first for static assets.

const CACHE_VERSION = "v1";

// Each tool scopes its cache key so clears don't bleed across tools
function getCacheKey(toolId) {
  return `creator-suite-${toolId}-${CACHE_VERSION}`;
}

// Static assets to pre-cache (populated at build time in a real setup)
const PRECACHE_URLS = ["/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(`creator-suite-shared-${CACHE_VERSION}`)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("creator-suite-") && !key.includes(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isSupabaseStorage = url.hostname.includes("supabase.co") && url.pathname.includes("/storage/");

  // Only handle same-origin requests + Supabase Storage objects
  if (url.origin !== self.location.origin && !isSupabaseStorage) return;

  // API calls: network-first, no cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request).catch(() => new Response("", { status: 503 })));
    return;
  }

  // Next.js internal routes: always network
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation requests: network-first, fall back to cached page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // Clone and cache successful page loads
          const clone = res.clone();
          const toolMatch = url.pathname.match(/^\/tools\/([^/]+)/);
          if (toolMatch && res.ok) {
            const cacheKey = getCacheKey(toolMatch[1]);
            caches.open(cacheKey).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(async () => {
          const toolMatch = url.pathname.match(/^\/tools\/([^/]+)/);
          if (toolMatch) {
            const cached = await caches.match(event.request, { cacheName: getCacheKey(toolMatch[1]) });
            if (cached) return cached;
          }
          const offline = await caches.match("/offline.html");
          return offline ?? new Response("Offline", { status: 503 });
        })
    );
    return;
  }

  // Static assets & Ebooks (fonts, images, PDFs, EPUBs, etc.): stale-while-revalidate
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|pdf|epub|docx|txt|md)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches
              .open(`creator-suite-assets-${CACHE_VERSION}`)
              .then((cache) => cache.put(event.request, clone));
          }
          return res;
        });
        return cached ?? network;
      })
    );
  }
});
