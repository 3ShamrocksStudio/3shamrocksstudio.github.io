/* J8NIX 12.0.1 service worker: new j12.js only (Copy & open in Pit Wall).
   J8NIX 12.0.0 service worker: offline shell + web push. 12.0.0: Pit Wall files (j12.js, j12.css). Revert: sw-11.8.1.js.
   J8NIX 11.8.0 service worker: offline shell + web push. Never caches API data. 11.8.0: new app files only (clear Home). 11.7.0: new app files only (Money home). 11.6.0: Do it for me. Revert: sw-11.5.0.js.
   11.5.0: phone alerts follow Dave's rules (alerts.js): titles only, at most 3 a day bundled into one notification,
   quiet 22:00–08:00 and Shabbat, a seen alert never comes back. Revert: sw-11.4.0.js. */
importScripts('alerts.js?v=12.0.1');
var CACHE = 'j8nix-v12.0.1-1', ASTATE = 'j8alerts-v1';
var SHELL = ['./', 'index.html', 'app.css?v=12.0.1', 'v11.css?v=12.0.1', 'j11.css?v=12.0.1', 'app.js?v=12.0.1', 'j11.js?v=12.0.1', 'shell.js?v=12.0.1', 'j8-data.js?v=12.0.1', 'j12.js?v=12.0.1', 'j12.css?v=12.0.1', 'j12w.css?v=12.0.1', 'alerts.js?v=12.0.1', 'vendor/fonts/heebo-latin.woff2', 'vendor/fonts/heebo-hebrew.woff2', 'vendor/supabase.js?v=2.45.4', 'manifest.webmanifest',
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

function aGet() { return caches.open(ASTATE).then(function (c) { return c.match('/a').then(function (r) { return r ? r.json() : {}; }); }).catch(function () { return {}; }); }
function aPut(st) { return caches.open(ASTATE).then(function (c) { return c.put('/a', new Response(JSON.stringify(st), { headers: { 'content-type': 'application/json' } })); }).catch(function () {}); }
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'J8NIX' }; }
  e.waitUntil(aGet().then(function (st) {
    var r = self.J8A.decide(st, { key: d.tag || '', title: d.title || 'J8NIX' }, Date.now());
    /* one J8NIX notification on the phone at a time (tag j8-alerts); outside the rules it updates silently; body is always empty */
    return aPut(r.st).then(function () {
      return Promise.all([
        self.registration.showNotification(r.title, {
          body: '', icon: 'icons/j8-192-2026-11-17.png', badge: 'icons/badge-96.png', tag: 'j8-alerts', renotify: !r.silent, silent: r.silent,
          data: { url: d.url || './' }
        }),
        self.clients.matchAll({ type: 'window' }).then(function (cs) { cs.forEach(function (c) { c.postMessage({ type: 'j8-refresh' }); }); })
      ]);
    });
  }));
});
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'j8-opened') return;
  e.waitUntil(aGet().then(function (st) { return aPut(self.J8A.opened(st, Date.now())); }).then(function () {
    return self.registration.getNotifications({ tag: 'j8-alerts' }).then(function (L) { L.forEach(function (n) { n.close(); }); });
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if (cs[i].url.indexOf(self.registration.scope) === 0) { cs[i].focus(); return cs[i].navigate(target); } }
    return self.clients.openWindow(target);
  }));
});
