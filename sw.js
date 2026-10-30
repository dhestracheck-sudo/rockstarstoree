/* Service worker Rockstar.Store: halaman network-dulu, gambar stale-while-revalidate
   - Gambar: tampilkan cache instan + refresh di belakang -> foto baru dari admin
     tampil pada kunjungan berikutnya (tidak pernah jadi basi selamanya).
   - Naikkan CACHE setiap rilis agar HP membuang file lama yang tersimpan. */
const CACHE = "rockstar-v14";
const CORE = ["./", "faq/", "manifest.json", "ROCKSTARICON.png"];
const IMG_MAX = 400; // batasi jumlah gambar cache biar storage HP tidak bengkak

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

// Buang gambar paling tua kalau cache melebihi batas
function trimImageCache(){
  caches.open(CACHE).then(c => c.keys().then(ks => {
    const imgs = ks.filter(r => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(new URL(r.url).pathname));
    if(imgs.length <= IMG_MAX) return;
    Promise.all(imgs.slice(0, imgs.length - IMG_MAX).map(r => c.delete(r))).catch(() => {});
  })).catch(() => {});
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET" || url.origin !== location.origin) return;
  // API Supabase selalu live
  if(url.hostname.indexOf("supabase.co") !== -1) return;
  const isImg = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url.pathname);
  if(isImg){
    const net = fetch(e.request).then(r => {
      if(r && r.ok){
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp)).then(() => trimImageCache()).catch(() => {});
      }
      return r;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(e.request).then(hit => hit || net).catch(() => net));
    return;
  }
  e.respondWith(
    fetch(e.request, { cache: "reload" }).then(r => {
      if(r && r.ok){
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
      }
      return r;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./")))
  );
});
