// Milo™ Service Worker — by 3Shamrocks Studio
// © 2026 3Shamrocks Studio. All rights reserved.
//
// NOTE: github.io serves every project of an org from ONE shared origin
// (https://<org>.github.io). A service worker or CacheStorage left behind by
// a sibling project on that origin can hijack navigations. This SW therefore
// (a) uses network-first for navigations so a stale shell can never trap the
// child mid-session, and (b) on activate deletes only its OWN older caches
// (same scope), never a sibling project's.

const CACHE_PREFIX = 'milo-cache:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + 'v9';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg',
  '3shamrocks.png',
  'art/milo-1.webp',
  'art/milo-2.webp', 'art/milo-2-happy.webp', 'art/milo-2-sad.webp',
  'art/milo-3.webp', 'art/milo-3-happy.webp', 'art/milo-3-sad.webp',
  'art/milo-4.webp', 'art/milo-4-happy.webp', 'art/milo-4-sad.webp',
  'art/milo-5.webp', 'art/milo-5-happy.webp', 'art/milo-5-sad.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME && (k.indexOf(CACHE_PREFIX) === 0 || /^milo-v\d+-cache$/.test(k) && self.registration.scope.endsWith('/milo-app/'))).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navigation requests: network-first, fall back to cached app shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }

  // Other assets: cache-first, then network (offline-friendly).
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
