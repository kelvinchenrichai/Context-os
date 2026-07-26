/**
 * Context OS Service Worker
 * Network-first with a cache fallback, purely for offline resilience.
 * Never serves stale app code when the network is available — a previous
 * cache-first version could pin a browser to the JS bundle from its first
 * visit indefinitely, even across new deployments.
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `context-os-${CACHE_VERSION}`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
