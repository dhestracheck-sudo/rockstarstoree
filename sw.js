/* Service worker Rockstar.Store: halaman network-dulu, gambar cache-dulu */
const CACHE = "rockstar-v1";
const CORE = ["./", "index.html", "manifest.json", "ROCKSTARLOGO.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()).catch(() => {})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET" || url.origin !== location.origin) return;
  // API Supabase selalu live
  if(url.hostname.indexOf("supabase.co") !== -1) return;
  const isImg = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url.pathname);
  e.respondWith(
    isImg
      ? caches.match(e.request).then(hit => {
          const net = fetch(e.request).then(r => {
            if(r && r.ok){
              const cp = r.clone();
              caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
            }
            return r;
          }).catch(() => hit);
          return hit || net;
        })
      : fetch(e.request).then(r => {
          if(r && r.ok){
            const cp = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
          }
          return r;
        }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./")))
  );
});
