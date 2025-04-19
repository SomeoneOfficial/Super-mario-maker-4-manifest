const CACHE_NAME = 'Super-Mario-Maker-4-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  // './script.js' removed because it's not used
];

// Install: Pre-cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate worker immediately
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim(); // Take control of all clients
});

// Fetch: Cache-first strategy with fallback and safe caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              // ✅ Only cache your own site's assets
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, cloned);
              }
            });
          }
          return networkResponse;
        }).catch(() => {
          // Offline fallback for pages
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        })
      );
    })
  );
});
