const CACHE_NAME = 'neo-flw-landing-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname.startsWith('/api/') ||
    requestUrl.pathname.startsWith('/_astro/') ||
    requestUrl.pathname.startsWith('/_image') ||
    requestUrl.pathname.startsWith('/src/')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache)));
          }
          return networkResponse;
        }).catch(() => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') return caches.match('/');
          return Response.error();
        });
        
        return cachedResponse || fetchPromise;
      })
  );
});
