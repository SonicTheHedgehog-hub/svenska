// Offline-Speicher der App. Bei jeder Änderung VERSION erhöhen.
const VERSION = "svenska-v5";
const CORE = ["./", "./index.html", "./lessons.json", "./manifest.webmanifest", "./img/badge-30.webp","./img/badge-7.webp","./img/badge-start.webp","./img/celebrating.webp","./img/ch-ankomst.webp","./img/ch-samhallet.webp","./img/ch-vanner.webp","./img/ch-vardag.webp","./img/fika.webp","./img/flagga.webp","./img/happy.webp","./img/icon-180.png","./img/icon-192.png","./img/icon-512.png","./img/jump.webp","./img/kanelbulle.webp","./img/listening.webp","./img/ljus.webp","./img/mascot.webp","./img/midsommar.webp","./img/reading.webp","./img/sleeping.webp","./img/thinking.webp"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fresh = url.origin === location.origin && (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith(".json") || url.pathname.endsWith("/"));
  if (fresh) {
    // Seite und Lektionen: erst Netz (für Updates), sonst Offline-Kopie
    e.respondWith(fetch(req, {cache: "no-cache"}).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  // Bilder und Schriften: erst Offline-Kopie, sonst Netz und merken
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(VERSION).then(x => x.put(req, c)); }
    return res;
  })));
});
