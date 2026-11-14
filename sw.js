/* Service worker Rockstar.Store: halaman network-dulu, gambar Supabase Storage & /optimized/ cache-first
   - Gambar Supabase Storage (/storage/v1/object/public/foto/): menggunakan nama file timestamp unik (immutable),
     sehingga di-cache permanen (Cache-First) agar hemat kuota egress Supabase Free Tier & instan 0ms.
   - Gambar lokal (/optimized/): Cache-First instan.
   - Naikkan CACHE setiap rilis agar HP membuang file lama yang tersimpan. */
const CACHE = "rockstar-v1794625125232";
const SB_IMG_CACHE = "rockstar-sb-foto-v2";
const CORE = ["./", "faq/", "manifest.json", "ROCKSTARICON.png"];
const IMG_MAX = 500; // batasi jumlah gambar cache biar storage HP tidak bengkak

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()).catch(() => {})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== SB_IMG_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});

// Buang gambar paling tua kalau cache melebihi batas
function trimImageCache(cacheName){
  caches.open(cacheName || CACHE).then(c => c.keys().then(ks => {
    const imgs = ks.filter(r => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(new URL(r.url).pathname));
    if(imgs.length <= IMG_MAX) return;
    Promise.all(imgs.slice(0, imgs.length - IMG_MAX).map(r => c.delete(r))).catch(() => {});
  })).catch(() => {});
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET") return;

  // Foto publik Supabase Storage (/storage/v1/object/public/foto/) memiliki nama file timestamp unik (immutable).
  // Gunakan Cache-First murni agar hemat kuota egress Supabase Free Tier & instan 0ms di kunjungan berikutnya.
  if(url.hostname.indexOf("supabase.co") !== -1){
    if(url.pathname.indexOf("/storage/v1/object/public/foto/") === 0){
      e.respondWith(
        caches.open(SB_IMG_CACHE).then(c =>
          c.match(e.request).then(hit => {
            if(hit) return hit;
            // Mode CORS (Supabase mengizinkan *) agar status asli terbaca: hanya foto 200 OK yang disimpan,
            // foto gagal/404 tidak pernah tersangkut di cache dan tidak membengkakkan kuota storage HP.
            return fetch(new Request(e.request.url, { mode: "cors", credentials: "omit" })).then(r => {
              if(r && r.ok){
                c.put(e.request, r.clone()).then(() => trimImageCache(SB_IMG_CACHE)).catch(() => {});
              }
              return r;
            }).catch(() => fetch(e.request));
          })
        ).catch(() => fetch(e.request))
      );
    }
    // API REST Supabase (/rest/v1/) tetap langsung ke network
    return;
  }

  if(url.origin !== location.origin) return;

  // Navigasi HTML: selalu Network-First tanpa stale cache browser saat online
  if(e.request.mode === "navigate"){
    e.respondWith(
      fetch(e.request, { cache: "no-cache" }).then(r => {
        if(r && r.ok){
          const cp = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
        }
        return r;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./")))
    );
    return;
  }
  const isImg = /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url.pathname);
  if(isImg){
    // Untuk aset /optimized/ gunakan Cache-First murni agar tidak mengunduh ulang di belakang layar
    if(url.pathname.indexOf("/optimized/") === 0){
      e.respondWith(
        caches.open(CACHE).then(c =>
          c.match(e.request).then(hit => {
            if(hit) return hit;
            return fetch(e.request).then(r => {
              if(r && r.ok) c.put(e.request, r.clone()).catch(() => {});
              return r;
            });
          })
        ).catch(() => fetch(e.request))
      );
      return;
    }
    const net = fetch(e.request).then(r => {
      if(r && r.ok){
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp)).then(() => trimImageCache(CACHE)).catch(() => {});
      }
      return r;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(e.request).then(hit => hit || net).catch(() => net));
    return;
  }
  e.respondWith(
    fetch(e.request).then(r => {
      if(r && r.ok){
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
      }
      return r;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match("./")))
  );
});
