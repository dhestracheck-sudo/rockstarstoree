/* ===== PWA: install ke HP + auto update ===== */

if("serviceWorker" in navigator){
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", function(){
    if(hadController){
      window.location.reload();
    }
    hadController = true;
  });

  const registerSiteServiceWorker = function(){
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
      .then(function(reg){
        setInterval(function(){ if(document.visibilityState === 'visible') reg.update().catch(function(){}); }, 30 * 1000);
        return reg.update();
      })
      .catch(function(){});
  };
  if(document.readyState === "complete") registerSiteServiceWorker();
  else window.addEventListener("load", registerSiteServiceWorker, { once: true });
}

/* ===== ZERO-STALE-CACHE AUTO-UPDATER ENGINE ===== */
(function setupAutoUpdater(){
  if (typeof window === "undefined") return;

  var currentVersion = null;
  var isChecking = false;

  function checkForAppUpdate() {
    if (isChecking) return;
    isChecking = true;

    fetch("/version.json?_t=" + Date.now(), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
    })
      .then(function(res){
        if (!res.ok) throw new Error("version fetch failed");
        return res.json();
      })
      .then(function(data){
        isChecking = false;
        if (!data || !data.version) return;

        var serverVersion = String(data.version);
        if (!currentVersion) {
          currentVersion = serverVersion;
          try { sessionStorage.setItem("rs_app_ver", serverVersion); } catch(e){}
          return;
        }

        // Jika versi di server berbeda / lebih baru
        if (serverVersion !== currentVersion) {
          // Jangan reload jika user sedang aktif mengetik di input / form
          var activeEl = document.activeElement;
          var isTyping = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");
          if (isTyping) {
            setTimeout(checkForAppUpdate, 6000);
            return;
          }

          // Hapus cache storage lama
          if ("caches" in window) {
            caches.keys().then(function(names){
              return Promise.all(names.map(function(n){ return caches.delete(n); }));
            }).catch(function(){});
          }

          // Simpan state keranjang belanja
          try {
            if (window.cart && window.syncCart) window.syncCart();
          } catch(e){}

          // Reload instan ke versi terbaru tanpa perlu refresh manual
          sessionStorage.setItem("rs_app_ver", serverVersion);
          window.location.reload();
        }
      })
      .catch(function(){
        isChecking = false;
      });
  }

  try {
    currentVersion = sessionStorage.getItem("rs_app_ver") || null;
  } catch(e){}
  checkForAppUpdate();

  // Cek saat pembeli kembali membuka tab website
  document.addEventListener("visibilitychange", function(){
    if (document.visibilityState === "visible") {
      checkForAppUpdate();
    }
  });

  // Cek otomatis setiap 25 detik
  setInterval(checkForAppUpdate, 25000);
})();

let pwaEvt = null;

function showPwaBar(txt, withBtn){
  try {
    document.getElementById("pwaTxt").textContent = txt;
    document.getElementById("pwaBtn").style.display = withBtn ? "" : "none";
    document.getElementById("pwaBar").classList.add("show");
  } catch(e) {}
}

function hidePwaBar(){
  try {
    document.getElementById("pwaBar").classList.remove("show");
    localStorage.setItem("rs_pwa_hide", String(Date.now()));
  } catch(e) {}
}

function pwaInstall(){
  if(pwaEvt){
    pwaEvt.prompt();
    pwaEvt.userChoice.then(function(){ pwaEvt = null; hidePwaBar(); }).catch(function(){});
  }
}

function brandLetters(){
  try {
    const el = document.querySelector(".brandshine");
    if(!el) return;
    const txt = el.textContent;
    el.innerHTML = "";
    [...txt].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "brl";
      s.style.animationDelay = (i * 0.09) + "s";
      s.textContent = (ch === " ") ? " " : ch;
      el.appendChild(s);
    });
  } catch(e) {}
}

try { brandLetters(); setInterval(function(){ if(document.visibilityState === 'visible') brandLetters(); }, 7000); } catch(e) {}

(function pwaInit(){
  try {
    const h = localStorage.getItem("rs_pwa_hide");
    if(h && h !== "1" && (Date.now() - Number(h)) < 7 * 24 * 3600 * 1000) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if(standalone) return;
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if(isiOS){
      setTimeout(function(){ showPwaBar("iPhone: ketuk Bagikan ⎘ lalu Tambah ke Layar Utama 📱", false); }, 4000);
      return;
    }
    window.addEventListener("beforeinstallprompt", function(e){
      e.preventDefault();
      pwaEvt = e;
      showPwaBar("Pasang Rockstar.Store ke HP? Buka kilat tanpa browser.", true);
    });
  } catch(e) {}
})();
