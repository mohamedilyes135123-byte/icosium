const CACHE_NAME = 'enaya-patient-v2';
const STATIC_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip supabase API calls and external domains
  if (url.origin !== self.location.origin) return;

  // Stale-While-Revalidate for Next.js assets (images, JS, CSS)
  if (url.pathname.startsWith('/_next/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.woff2')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        }).catch(() => null);
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Network-First for HTML/Navigation pages (to ensure fresh data)
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
