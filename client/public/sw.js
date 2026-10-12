// Nepal Navigator Offline Service Worker
const CACHE_NAME = 'nepnav-v3.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/logo.svg',
  '/icon-192.png',
  '/manifest.webmanifest',
  '/photos/attribution.json',
  '/data/locations.json',
  '/data/guides.json',
  '/data/transport-routes.json',
  '/data/packs.json',
  '/data/categories.json',
  '/data/emergency.json',
  '/data/manifest.json',
  '/fonts/inter-400-latin.woff2',
  '/fonts/inter-600-latin.woff2',
  '/fonts/inter-700-latin.woff2',
  '/fonts/inter-800-latin.woff2',
  '/fonts/notosansdevanagari-400-devanagari.woff2',
  '/fonts/notosansdevanagari-600-devanagari.woff2',
  '/fonts/notosansdevanagari-700-devanagari.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Nepal Navigator SW] Precaching app shell & offline fallback');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Nepal Navigator SW] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  // Navigation requests: try network, then fallback to cache, then offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match('/offline.html');
        });
      })
    );
    return;
  }

  // API calls: Network-first, return offline response if failed
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, message: 'Served from offline context' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Static assets & Leaflet map tiles: Cache-first / Stale-While-Revalidate
  const isMapTile = url.hostname.includes('tile.openstreetmap.org') ||
                    url.hostname.includes('tile.openstreetmap.fr') ||
                    url.hostname.includes('arcgisonline.com') ||
                    url.hostname.includes('opentopomap.org');

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background if online (polite debounce)
        if (navigator.onLine && !isMapTile) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Cache basic assets and CORS map tiles
          const canCache = networkResponse.type === 'basic' || (isMapTile && networkResponse.type === 'cors');
          if (canCache) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If image fails offline
          if (request.destination === 'image') {
            return caches.match('/logo.svg');
          }
        });
    })
  );
});
