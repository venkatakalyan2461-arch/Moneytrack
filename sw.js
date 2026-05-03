const CACHE_NAME = 'spendsmart-v2';

const ASSETS = [
  '/Moneytrack/',
  '/Moneytrack/index.html',
  '/Moneytrack/manifest.json',
  '/Moneytrack/icon-72.png',
  '/Moneytrack/icon-96.png',
  '/Moneytrack/icon-128.png',
  '/Moneytrack/icon-144.png',
  '/Moneytrack/icon-152.png',
  '/Moneytrack/icon-192.png',
  '/Moneytrack/icon-384.png',
  '/Moneytrack/icon-512.png',
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, fallback to network, fallback to cached index
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/Moneytrack/index.html'));
    })
  );
});
