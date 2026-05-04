const CACHE_NAME = 'spendsmart-v3';

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
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets (must succeed)
      const localAssets = ASSETS.filter(a => a.startsWith('/'));
      // Cache external assets (optional, ignore failures)
      const externalAssets = ASSETS.filter(a => !a.startsWith('/'));
      return cache.addAll(localAssets).then(() => {
        return Promise.allSettled(externalAssets.map(url => cache.add(url)));
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, {ignoreSearch: true}).then(cached => {
      // Return cached version immediately
      if (cached) {
        // Update cache in background
        fetch(event.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
          }
        }).catch(() => {});
        return cached;
      }
      // Not in cache — fetch from network
      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/Moneytrack/index.html');
        });
    })
  );
});
