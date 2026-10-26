

var megaIdx = 0, megaTimer = null;

(function megaInit(){

  const slides = document.querySelectorAll("#megaTrack .mega-slide");

  slides.forEach(function(s){

    if(!s.querySelector(".mega-logo")){

      const l = document.createElement("div");

      l.className = "mega-logo";

      l.innerHTML = '<img src="ROCKSTARLOGO.webp" srcset="/optimized/ROCKSTARLOGO-72.webp 72w, /optimized/ROCKSTARLOGO-220.webp 220w, /ROCKSTARLOGO.webp 500w" sizes="26px" alt="Rockstar.Store" width="500" height="500" loading="lazy">rockstar.store';

      s.insertBefore(l, s.firstChild);

    }

  });

  const n = slides.length;

  const box = document.getElementById("megaDots");

  for(let i = 0; i < n; i++){

    const d = document.createElement("i");

    d.onclick = function(){ megaGo(i, true); };

    box.appendChild(d);

  }

  megaPaint(); megaAuto();

  const track = document.getElementById("megaTrack");

  track.addEventListener("pointerdown", function(){ if(megaTimer) clearInterval(megaTimer); megaAuto(); }, { passive: true });

  let tx0 = null;

  track.addEventListener("touchstart", function(e){ tx0 = e.touches[0].clientX; }, { passive: true });

  track.addEventListener("touchend", function(e){

    if(tx0 === null) return;

    const dx = e.changedTouches[0].clientX - tx0;

    tx0 = null;

    if(Math.abs(dx) > 40) megaGo(megaIdx + (dx < 0 ? 1 : -1), true);

  }, { passive: true });

})();

/* isi bintang kelap-kelip untuk semua container .joki-stars (banner slide s5 + hero katalog joki) */

function jokiStarsFill(){

  document.querySelectorAll(".joki-stars").forEach(function(host){

    if (host.dataset.filled) return;

    host.dataset.filled = "1";

    let h = "";

    for (let i = 0; i < 46; i++) {

      const g = Math.random() < 0.18 ? (Math.random() < 0.6 ? " g1" : " g2") : "";

      const s = g ? (2.5 + Math.random() * 3.5) : (1 + Math.random() * 1.8);

      h += '<i' + g + ' style="width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) + 'px;left:' + (Math.random() * 100).toFixed(2) + '%;top:' + (Math.random() * 100).toFixed(2) + '%;animation-delay:' + (Math.random() * 3).toFixed(2) + 's;animation-duration:' + (2.2 + Math.random() * 2.6).toFixed(2) + 's;"></i>';

    }

    host.innerHTML = h;

  });

}

jokiStarsFill();

/* potongan HTML hero JASA JOKI untuk halaman katalog joki */

function jokiHeroHTML(){

  return `<div class="joki-hero">

    <div class="joki-stars"></div>

    <div class="joki-head">

      <div class="mega-brand">${tr("sl6_br")}</div>

      <p class="joki-title"><span class="jasa">${tr("hj_t1")}</span><span class="jokiw">${tr("hj_t2")}</span></p>

      <p class="joki-sub">${tr("hj_sub")}</p>

    </div>

  </div>`;

}

/* potongan HTML hero AKUN SEPUH ROBLOX untuk halaman katalog akun (gaya sama seperti joki) */

function akunHeroHTML(){

  return `<div class="joki-hero">

    <div class="joki-stars"></div>

    <div class="joki-head">

      <div class="mega-brand">${tr("ha_br")}</div>

      <p class="joki-title"><span class="jasa">${tr("ha_t1")}</span><span class="jokiw">${tr("ha_t2")}</span></p>

      <p class="joki-sub">${tr("ha_sub")}</p>

    </div>

  </div>`;

}

/* potongan HTML hero BRAINROT SEPUH PREMIUM untuk halaman katalog brainrot (gaya sama) */

function brainrotHeroHTML(){

  return `<div class="joki-hero">

    <div class="joki-stars"></div>

    <div class="joki-head">

      <div class="mega-brand">${tr("hb_br")}</div>

      <p class="joki-title"><span class="jasa">${tr("hb_t1")}</span><span class="jokiw">${tr("hb_t2")}</span></p>

      <p class="joki-sub">${tr("hb_sub")}</p>

    </div>

  </div>`;

}

function megaPaint(){

  const slides = document.querySelectorAll("#megaTrack .mega-slide");

  slides.forEach((s, i) => s.classList.toggle("on", i === megaIdx));

  const nextIdx = (megaIdx + 1) % slides.length;

  slides.forEach((slide, i) => {

    const shouldPreload = i === megaIdx || i === nextIdx;

    slide.querySelectorAll("img").forEach(function(image){

      image.loading = shouldPreload ? "eager" : "lazy";

      image.fetchPriority = i === megaIdx ? "high" : "low";

    });

  });

  document.querySelectorAll("#megaDots i").forEach((d, i) => d.classList.toggle("on", i === megaIdx));

}

function megaGo(i, manual){

  const n = document.querySelectorAll("#megaTrack .mega-slide").length;

  megaIdx = ((i % n) + n) % n;

  megaPaint();

  if(manual){ if(megaTimer) clearInterval(megaTimer); megaAuto(); }

}

function megaAuto(){ megaTimer = setInterval(function(){ megaGo(megaIdx + 1); }, 5000); }

/* Semua slide dikasih tinggi SAMA PERSIS supaya banner auto-slide tidak loncat ukurannya tiap ganti (HP & PC) */

function fitMega(){

  try{

    const track = document.getElementById("megaTrack");

    if(!track) return;

    const slides = Array.prototype.slice.call(track.querySelectorAll(".mega-slide"));

    if(!slides.length) return;

    let max = 0;

    const originalStyles = slides.map(function(slide){

      return { display: slide.style.display, height: slide.style.height, minHeight: slide.style.minHeight };

    });

    slides.forEach(function(slide){

      slide.style.display = "flex";

      slide.style.height = "auto";

      slide.style.minHeight = "0";

    });

    slides.forEach(function(slide){

      max = Math.max(max, Math.ceil(slide.getBoundingClientRect().height));

    });

    slides.forEach(function(slide, index){

      slide.style.display = originalStyles[index].display;

      slide.style.height = originalStyles[index].height;

      slide.style.minHeight = originalStyles[index].minHeight;

    });

    if(!max) return;

    const H = Math.max(max, window.innerWidth <= 760 ? 340 : 380);

    slides.forEach(function(s){ s.style.height = H + "px"; });

  }catch(e){}

}

fitMega();

let megaFitT;

window.addEventListener("resize", function(){ clearTimeout(megaFitT); megaFitT = setTimeout(fitMega, 150); });

fitMega(); setTimeout(fitMega, 1200);

if(document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(function(){ fitMega(); });

const megaTrackEl = document.getElementById("megaTrack");

if(megaTrackEl) megaTrackEl.addEventListener("load", function(){ fitMega(); }, true);

