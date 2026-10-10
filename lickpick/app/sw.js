// LickPick service worker: works offline, and receives videos shared from the gallery.
const CACHE = "lp-2026-10-10d";
const SHELL = ["./", "./index.html", "./mediabunny.min.mjs", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function inbox() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("lickpick", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("inbox", { autoIncrement: true });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function receiveShare(request) {
  try {
    const form = await request.formData();
    const files = form.getAll("videos").filter(f => f && f.size);
    const db = await inbox();
    await new Promise((res, rej) => { const tx = db.transaction("inbox", "readwrite"); for (const f of files) tx.objectStore("inbox").add(f); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  } catch (e) { }
  return Response.redirect("./?shared=1", 303);
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method === "POST" && url.pathname.endsWith("/share-target")) { e.respondWith(receiveShare(e.request)); return; }
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // the page: fresh when online, cached when not. Everything else: cache first.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
