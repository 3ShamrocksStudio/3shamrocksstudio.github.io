/* J8NIX 11.3.0 service worker: offline shell + web push. Never caches API data. */
var CACHE = 'j8nix-v11.3.0-1';
var SHELL = ['./', 'index.html', 'app.css?v=11.3.0', 'v11.css?v=11.3.0', 'j11.css?v=11.3.0', 'app.js?v=11.3.0', 'j11.js?v=11.3.0', 'shell.js?v=11.3.0', 'j8-data.js?v=11.3.0', 'vendor/fonts/heebo-latin.woff2', 'vendor/fonts/heebo-hebrew.woff2', 'vendor/supabase.js?v=2.45.4', 'manifest.webmanifest',
  'brand/shomer.png', 'brand/nature.png', 'brand/lickpick.png', 'brand/th.png', 'brand/chore.png', 'brand/milo.png', 'brand/media.png', 'brand/studio.png',
  'brand/j8nix-wordmark-2026-11-17.svg', 'brand/j8nix-mark-8-2026-11-17.svg', 'brand/j8nix-2026-11-17.png', 'icons/j8-icon-2026-11-17.svg', 'icons/j8-192-2026-11-17.png', 'icons/badge-96.png', 'icons/j8-touch-180-2026-11-17.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('j8nix-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin && u.pathname.indexOf('/j8/') === 0) {
    // network first for the page itself, cache first for versioned assets
    if (e.request.mode === 'navigate') {
      var home = u.pathname === '/j8/' || u.pathname === '/j8/index.html';
      e.respondWith(fetch(home ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : e.request).then(function (r) { if (home && r.ok) { var c = r.clone(); caches.open(CACHE).then(function (ca) { ca.put('index.html', c); }); } return r; })
        .catch(function () { return caches.match('index.html'); }));
      return;
    }
    e.respondWith(caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (r) { if (r.ok) { var c = r.clone(); caches.open(CACHE).then(function (ca) { ca.put(e.request, c); }); } return r; });
    }));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (r) { var c = r.clone(); caches.open(CACHE).then(function (ca) { ca.put(e.request, c); }); return r; });
    }));
  }
});

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'J8NIX', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'J8NIX', {
      body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', tag: d.tag || 'j8', renotify: true,
      data: { url: d.url || './' }
    }),
    self.clients.matchAll({ type: 'window' }).then(function (cs) { cs.forEach(function (c) { c.postMessage({ type: 'j8-refresh' }); }); })
  ]));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if (cs[i].url.indexOf(self.registration.scope) === 0) { cs[i].focus(); return cs[i].navigate(target); } }
    return self.clients.openWindow(target);
  }));
});
