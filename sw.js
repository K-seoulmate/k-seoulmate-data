/* K-Seoulmate : service worker. Rend l'appli installable et utilisable hors connexion.
   - Pages et fichiers de l'appli : réseau d'abord (les nouveautés arrivent vite), cache en secours.
   - Polices Google : cache avec mise à jour en arrière-plan.
   - Tout le reste (YouTube, images externes…) : on ne s'en mêle pas. */
const V = "ks-v5";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png", "/confidentialite.html"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== V + "-fonts").map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("/index.html") : Response.error()))));
    return;
  }
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(V + "-fonts").then(c => c.match(r).then(m => { const f = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => m); return m || f; })));
  }
});
