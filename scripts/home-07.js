

/* ===== PWA: install ke HP ===== */

if("serviceWorker" in navigator){
  const registerSiteServiceWorker = function(){
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
      .then(function(reg){ return reg.update(); })
      .catch(function(){});
  };
  if(document.readyState === "complete") registerSiteServiceWorker();
  else window.addEventListener("load", registerSiteServiceWorker, { once: true });
}
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

try { brandLetters(); setInterval(brandLetters, 7000); } catch(e) {}

(function pwaInit(){

  try {

    const h = localStorage.getItem("rs_pwa_hide");

    if(h && h !== "1" && (Date.now() - Number(h)) < 7 * 24 * 3600 * 1000) return;

    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

    if(standalone) return;

    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if(isiOS){

      setTimeout(function(){ showPwaBar("iPhone: ketuk Bagikan ⎙ lalu Tambah ke Layar Utama 📲", false); }, 4000);

      return;

    }

    window.addEventListener("beforeinstallprompt", function(e){

      e.preventDefault();

      pwaEvt = e;

      showPwaBar("Pasang Rockstar.Store ke HP? Buka kilat tanpa browser.", true);

    });

  } catch(e) {}

})();

