
let cart = [];
let currentPage = 'home';
let carouselState = {};

const IMG = "";
const FALLBACK_IMG = IMG + "Screenshot 2026-04-14 004434.webp";
function fixImg(f){ return f ? (IMG + f) : FALLBACK_IMG; }
/* Thumbnail hemat: sisipkan thumb_ untuk file Storage (fallback ke full bila belum ada) */
function thumbOf(u){
  u = String(u || "");
  if(!u || u.indexOf("/thumb_") !== -1) return u;
  if(u.indexOf("/storage/v1/object/") === -1) return u;
  const i = u.lastIndexOf("/");
  return u.slice(0, i + 1) + "thumb_" + u.slice(i + 1);
}
function tinyOf(u){
  u = String(u || "");
  const match = u.match(/^(.*\/storage\/v1\/object\/public\/foto\/)(?:thumb_|tiny_)?([^/?#]+)([?#].*)?$/i);
  if(!match) return thumbOf(u);
  return match[1] + "tiny_" + match[2] + (match[3] || "");
}
function thumbTag(full, attrs){
  full = fixImg(full);
  const t = thumbOf(full);
  const dimensions = 'width="480" height="480"';
  if(t === full) return `<img ${dimensions} src="${full}" decoding="async" ${attrs} onerror="imgErr(this)">`;
  return `<img ${dimensions} src="${t}" data-full="${full}" decoding="async" ${attrs} onerror="thumbErr(this)">`;
}
function thumbErr(el){
  try {
    const full = el.getAttribute("data-full");
    if(full && el.src !== full){ el.setAttribute("data-full", ""); el.src = full; return; }
  } catch(e) {}
  imgErr(el);
}
/* Emoji cadangan tiap kategori (tampil di atas background biru bila foto kosong/gagal) */
function catEmoji(nm){
  const n = String(nm || "").toLowerCase();
  if(n.includes("robux")) return "💰";
  if(n.includes("bundle")) return "🎁";
  if(n.includes("gamepass") || n.includes("game pass")) return "🎫";
  if(n.includes("akun")) return "👤";
  if(n.includes("joki")) return "🎮";
  if(n.includes("telur") || n.includes("egg")) return "🥚";
  if(n.includes("garden") || n.includes("tanam") || n.includes("seed")) return "🌱";
  if(n.includes("fish") || n.includes("pancing") || n.includes("dadu")) return "🎣";
  if(n.includes("ayam") || n.includes("curi")) return "🐔";
  if(n.includes("koin") || n.includes("coin")) return "🪙";
  if(n.includes("kupon") || n.includes("roll") || n.includes("gulung")) return "🎰";
  return "🧠";
}
// Gambar gagal load (umumnya thumbnail Drive kena throttle sesaat): coba sekali lagi
// dengan cache-bust, baru fallback. Mencegah gambar hilang-timbul tiap refresh.
function imgErr(el){
  if(!el.dataset.retry){
    el.dataset.retry = "1";
    const s = el.src;
    el.src = s + (s.indexOf("?") === -1 ? "?" : "&") + "r=" + Date.now();
  } else {
    el.onerror = null;
    el.src = FALLBACK_IMG;
  }
}
// Pecah daftar file dipisah "|", buang spasi & koma nyasar (misal "foto.png,").
function splitFiles(v){
  return String(v || "").split("|").map(s => s.trim().replace(/,+$/, "").trim()).filter(Boolean);
}

const brainrotCategories = []; // data dari Google Sheet (lihat loadLiveStock);
const topupCategories = []; // data dari Google Sheet (lihat loadLiveStock);

const akunCategories = []; // data dari Google Sheet (lihat loadLiveStock)

const jokiCategories = [];

const PAGES = { brainrot: () => brainrotCategories, topup: () => topupCategories, akun: () => akunCategories, joki: () => jokiCategories };

function catsOf(page){ return (PAGES[page] || (() => []))(); }

function getCurrentCategories(){
  return catsOf(currentPage);
}

/* ===== rating & bar stok (dari angka Terjual/Sisa) ===== */
function starsOf(item){
  return "★★★★★";
}

function stockBarHTML(item){
  const sold = Number(item.sold) || 0, st = Number(item.stock);
  if(sold > 0 && st > 0){
    const pct = Math.min(100, Math.round(sold / (sold + st) * 100));
    const low = st < 5 ? `<div class="stocklow">⚠️ ${tr("low_a")} ${st} ${tr("low_b")}</div>` : ``;
    return `<div class="stockbar"><i style="width:${pct}%"></i></div><div class="stocktxt">✅ ${tr("sold_done")}: ${sold} • 📦 ${tr("rest_stock")}: ${st}</div>${low}`;
  }
  if(sold > 0) return `<div class="stocktxt">✅ ${tr("sold_done")}: ${sold}</div>`;
  if(st > 0) return `<div class="stocktxt">📦 ${tr("avail_stock")}: ${st}</div>`;
  return "";
}

/* ===== flash sale (diskon dari kolom coret) ===== */
function flashItems(){
  const out = [];
  ['brainrot', 'topup', 'akun', 'joki'].forEach(page => {
    catsOf(page).forEach((c, i) => {
      c.items.forEach((item, j) => {
        if(item.originalPrice && item.originalPrice > item.price && item.stock !== 0){
          out.push({ page, i, j, item, off: Math.round((1 - item.price / item.originalPrice) * 100) });
        }
      });
    });
  });
  out.sort((a, b) => b.off - a.off);
  return out;
}

function flashAdd(page, i, j){
  const item = catsOf(page)[i].items[j];
  if(item.stock === 0){ alert(tr("habis_alert")); return; }
  cart.push({...item, page});
  logAksi("keranjang", item.name, catsOf(page)[i].name, item.price, page);
  trackClick("tambah_keranjang", item.name, catsOf(page)[i].name);
  if(typeof gtag === "function"){
    trackGaEcommerce("add_to_cart", item, catsOf(page)[i].name, catsOf(page)[i].name, j); if (window.RS_Pixels) RS_Pixels.mapEvent("tambah_keranjang", { nama_produk: item.name, price: item.price, currency: "IDR", kategori: catsOf(page)[i].name });
  }
  syncCart();
}

function flashTick(){
  const el = document.getElementById("flashtime");
  if(!el) return;
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let s = Math.floor((end - now) / 1000);
  if (s <= 0) s = 24 * 3600 - 1; // tidak pernah mati: langsung mulai lagi 23:59:59
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  el.textContent = h + ":" + m + ":" + ss;
}

function flashHTML(){
  const items = flashItems();
  if(!items.length) return "";
  const cards = items.map(r => {
    const it = r.item;
    const simpleF = (r.page !== "brainrot");
    return `
    <div class="item" data-viewname="${it.name}" data-page="${r.page}" onclick="openDetail('${r.page}',${r.i},${r.j})">
      <div class="thumb">
        <span class="badge-off">-${r.off}%</span>
        <span class="catemoji">${catEmoji(it.name)}</span>
        <span class="viewpill">👁 ${Number(it.dilihat || 0).toLocaleString("id-ID")}</span>
        ${thumbTag(it.img || (it.images && it.images[0]), `alt="${it.name}" loading="lazy"`)}
      </div>
      <div class="ibody">
        <h3>${it.name}</h3>
        <div class="stars">${starsOf(it)}</div>
        ${simpleF ? `<div class="statrow">STATUS&nbsp;<b class="${it.stock === 0 ? "st-no" : "st-ok"}">${it.stock === 0 ? tr("habis") : tr("avail")}</b></div>` : `
        ${stockBarHTML(it)}`}
        <div class="price"><span class="now">${formatCurrency(it.price)}</span><span class="was">Rp ${it.originalPrice.toLocaleString()}</span>${rmFmt(it.price) ? `<div class="rm">${rmFmt(it.price)}</div>` : ``}</div>
        <div class="kilat"><span>${tr("kilat")}</span><span>${tr("safe")}</span><span class="vbadge"><i>✓</i>${tr("verified")}</span></div>
        <button class="btn" onclick="event.stopPropagation();flashAdd('${r.page}',${r.i},${r.j})">${tr("add_cart")}</button>
      </div>
    </div>`;
  }).join("");
  return `
  <div class="flashsec">
    <div class="flashhead" onclick="toggleFlash()"><h3>${tr("flash_t")}</h3><span class="arrow" id="flasharrow">▼</span><span>${tr("flash_click")}</span><span class="fomo">${tr("flash_fomo")}</span><span class="timer" id="flashtime">--:--:--</span></div>
    <div class="flashbody" id="flashbody" style="display:none;"><button class="fnav fl" aria-label="Geser kiri" onclick="this.parentElement.querySelector('.flashrow').scrollBy({left:-350,behavior:'smooth'})">&#10094;</button><div class="itemgrid flashrow">${cards}</div><button class="fnav fr" aria-label="Geser kanan" onclick="this.parentElement.querySelector('.flashrow').scrollBy({left:350,behavior:'smooth'})">&#10095;</button></div>
  </div>`;
}

function toggleFlash(){
  const b = document.getElementById("flashbody");
  const a = document.getElementById("flasharrow");
  const open = b.style.display === "none";
  b.style.display = open ? "" : "none";
  if(a) a.textContent = open ? "▲" : "▼";
}

/* Shortcut Flash Sale dari tombol header: buka dulu bagiannya, lalu scroll ke sana */
function goFlash(){
  const jump = function(){
    const sec = document.querySelector(".flashsec");
    if(!sec) return;
    const body = document.getElementById("flashbody");
    if(body && body.style.display === "none") toggleFlash();
    const y = sec.getBoundingClientRect().top + window.pageYOffset - 84;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  if(document.querySelector(".flashsec")){ jump(); return; }
  if(typeof goHome === "function"){ try { goHome(); } catch(e){} setTimeout(jump, 500); }
}

function startFlashTick(){
  if(window.__flashT) clearInterval(window.__flashT);
  flashTick();
  window.__flashT = setInterval(flashTick, 1000);
}

function discountOf(item){
  if(!item.originalPrice || !item.price || item.originalPrice <= item.price) return 0;
  return Math.round((1 - item.price / item.originalPrice) * 100);
}

function syncCta(){
  const cta = document.getElementById("serverCta");
  if(cta) cta.style.display = (currentPage === 'home') ? "" : "none";
}

/* ===== bottom nav (menu bawah) ===== */
function bnGo(page){
  if(page === 'home') goHome();
  else if(page === 'brainrot') goToBrainrot();
  else if(page === 'akun') goToAkun();
  else if(page === 'topup') goToTopUp();
  else if(page === 'joki') goToJoki();
  else if(page === 'faq') window.location.assign('/faq');
}
function bnSync(){
  document.querySelectorAll('#botnav .bnitem').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-page') === currentPage);
  });
}

/* ===== panel menu atas (gaya exstore: ☰ buka/tutup, pindah pencarian ke menu di HP) ===== */
let mnavSavedScrollY = 0;
let mnavSavedBodyStyles = null;
let mnavSavedTopWrapStyles = null;
function lockPageScrollForMnav(){
  const body = document.body;
  if(body.classList.contains("mnav-scroll-locked")) return;
  mnavSavedScrollY = window.scrollY || window.pageYOffset || 0;
  const topWrap = document.querySelector(".topwrap");
  mnavSavedBodyStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow
  };
  if(topWrap){
    mnavSavedTopWrapStyles = {
      position: topWrap.style.position,
      top: topWrap.style.top,
      left: topWrap.style.left,
      right: topWrap.style.right,
      width: topWrap.style.width,
      zIndex: topWrap.style.zIndex
    };
    topWrap.style.position = "fixed";
    topWrap.style.top = "0";
    topWrap.style.left = "0";
    topWrap.style.right = "0";
    topWrap.style.width = "100%";
    topWrap.style.zIndex = "101";
  }
  document.documentElement.classList.add("mnav-scroll-locked");
  body.classList.add("mnav-scroll-locked");
  body.style.position = "fixed";
  body.style.top = "-" + mnavSavedScrollY + "px";
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
}
function unlockPageScrollForMnav(){
  const body = document.body;
  if(!body.classList.contains("mnav-scroll-locked")) return;
  document.documentElement.classList.remove("mnav-scroll-locked");
  body.classList.remove("mnav-scroll-locked");
  const saved = mnavSavedBodyStyles || {};
  body.style.position = saved.position || "";
  body.style.top = saved.top || "";
  body.style.left = saved.left || "";
  body.style.right = saved.right || "";
  body.style.width = saved.width || "";
  body.style.overflow = saved.overflow || "";
  const topWrap = document.querySelector(".topwrap");
  const savedTopWrap = mnavSavedTopWrapStyles || {};
  if(topWrap){
    topWrap.style.position = savedTopWrap.position || "";
    topWrap.style.top = savedTopWrap.top || "";
    topWrap.style.left = savedTopWrap.left || "";
    topWrap.style.right = savedTopWrap.right || "";
    topWrap.style.width = savedTopWrap.width || "";
    topWrap.style.zIndex = savedTopWrap.zIndex || "";
  }
  window.scrollTo(0, mnavSavedScrollY);
  mnavSavedBodyStyles = null;
  mnavSavedTopWrapStyles = null;
}
function positionMnavPanel(){
  const menu = document.getElementById("mnav");
  const topWrap = document.querySelector(".topwrap");
  if(!menu || !topWrap) return;
  const top = Math.max(0, Math.round(topWrap.getBoundingClientRect().bottom));
  menu.style.setProperty("--mnav-top", top + "px");
}
function toggleMnav(){
  const m = document.getElementById("mnav");
  if(!m) return;
  const open = !m.classList.contains("open");
  m.classList.toggle("open", open);
  if(open){
    positionMnavPanel();
    lockPageScrollForMnav();
  }
  else unlockPageScrollForMnav();
  const b = document.getElementById("burgerBtn");
  if(b) b.textContent = open ? "✕" : "☰";
  placeSearch();
  if(!open){ try { document.getElementById("searchSug").style.display = "none"; } catch(e) {} }
}
function closeMnav(){
  const m = document.getElementById("mnav");
  if(m && m.classList.contains("open")) toggleMnav();
}
function mnavGo(fn){
  closeMnav();
  setTimeout(function(){ try { fn(); } catch(e) {} }, 60);
}
/* Pencarian selalu tampil di baris kedua header (HP) — tidak dipindah ke menu lagi */
function placeSearch(){}
try { placeSearch(); } catch(e) {}
window.addEventListener("resize", function(){
  clearTimeout(window.__psT);
  window.__psT = setTimeout(placeSearch, 150);
  const menu = document.getElementById("mnav");
  if(menu && menu.classList.contains("open")) positionMnavPanel();
});
window.addEventListener("orientationchange", function(){ setTimeout(positionMnavPanel, 200); });
/* bubble "Chat Min Rock" — dihapus */

/* Bahasa + mata uang pindah ke home-08-lang.js (dimuat sebelum file ini). */
function render(){
  try { syncHeroCta(); } catch(e) {}
  const el = document.getElementById("products");
  const title = document.getElementById("pageTitle");
  syncCta();
  try { bnSync(); } catch(e) {}
  if(currentPage === 'home'){
    title.innerHTML = `<h2>${tr("mulai")}</h2><p>${tr("pilih_sub")}</p>`;
    el.innerHTML = `
      <div class="banners">
        <div class="banner" onclick="goToBrainrot()">
          <small>BRAINROT • PET • TOKEN • TANAMAN</small>
          <h3>${tr("b_brain_t")}</h3>
          <p>${tr("b_brain_d")}</p>
        </div>
        <div class="banner" onclick="goToTopUp()">
          <small>ROBUX • GAMEPASS</small>
          <h3>${tr("b_top_t")}</h3>
          <p>${tr("b_top_d")}</p>
        </div>
        <div class="banner" onclick="goToAkun()">
          <small>AKUN SEPUH ROBLOX BERBAGAI MAP</small>
          <h3>${tr("b_akun_t")}</h3>
          <p>${tr("b_akun_d")}</p>
        </div>
        <div class="banner" onclick="goToJoki()">
          <small>JOKI SEPUH BERBAGAI MAP</small>
          <h3>${tr("b_joki_t")}</h3>
          <p>${tr("b_joki_d")}</p>
        </div>
      </div>
      <div id="flashwrap"></div>`;
    document.getElementById("flashwrap").outerHTML = flashHTML();
    if(document.getElementById("flashtime")) startFlashTick();
    watchViews();
    return;
  }
  const categories = getCurrentCategories();
  if(!categories.length){
    title.innerHTML = `<button class="backbtn" onclick="goHome()">${tr("back_home")}</button>
      <h2>${tr("cat_empty")}</h2><p>${tr("cat_empty_x")}</p>`;
    el.innerHTML = `<div style="text-align:center;padding:30px 10px;">
      <p style="color:var(--mut);">${tr("cat_empty_msg")}</p>
      <button class="btn-primary" onclick="location.reload()">${tr("reload")}</button>
    </div>`;
    return;
  }
  const isJoki = currentPage === 'joki';
  const isAkun = currentPage === 'akun';
  const isBrainrot = currentPage === 'brainrot';
  const heroFn = isJoki ? jokiHeroHTML : (isAkun ? akunHeroHTML : (isBrainrot ? brainrotHeroHTML : null));
  const catHeroHTML = (typeof heroFn === "function") ? heroFn() : ``;
  title.innerHTML = `<button class="backbtn" onclick="goHome()">${tr("back_home")}</button>` + catHeroHTML + `
    <div class="cattitle"><i class="cattitle-spark s1"></i><i class="cattitle-spark s2"></i><i class="cattitle-spark s3"></i><h2>${currentPage === 'brainrot' ? tr("cat_brainrot") : (currentPage === 'akun' ? tr("cat_akun") : (currentPage === 'joki' ? tr("cat_joki") : tr("cat_topup")))}</h2>
    <p>${categories.length} ${tr("cat_sub")}</p></div>`;
  el.innerHTML = `<div class="catgrid">` + categories.map((c,i)=>`
    <div class="catcard" onclick="showItems(${i})">
      <div class="catimgwrap"><span class="catemoji">${catEmoji(c.name)}</span>${thumbTag(c.img, `alt="${c.name}" loading="lazy"`)}</div>
      <div class="catbody"><h3>${c.name}</h3><span class="go">→</span></div>
    </div>`).join("") + `</div>`;
  if (typeof heroFn === "function" && typeof jokiStarsFill === "function") jokiStarsFill();
  watchViews();
}

function searchCatalog(){
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const el = document.getElementById("products");
  const title = document.getElementById("pageTitle");
  if(q === ""){ render(); sugHide(); return; }
  trackSearch(q);
  const out = [];
  ['brainrot', 'topup', 'akun', 'joki'].forEach(page => {
    const cats = catsOf(page);
    cats.forEach((c, i) => {
      c.items.forEach((item, j) => {
        if((c.name + " " + item.name).toLowerCase().includes(q)) out.push({page, i, j, cname: c.name, item});
      });
    });
  });
  sugShow(q, out.slice(0, 6));
  if(out.length === 0){
    title.innerHTML = `<h2>${tr("hasil")}</h2><p>${tr("none_a")} "${q}"</p>`;
    el.innerHTML = "";
    return;
  }
  currentPage = out[0].page;
  syncCta();
  title.innerHTML = `<button class="backbtn" onclick="render()">${tr("back")}</button>
    <h2>${tr("hasil")}</h2><p>${out.length} ${tr("cocok_a")} "${q}"</p>`;
  searchOut = out;
  searchN = 10;
  paintSearch();
}

let searchOut = [], searchN = 10000;
function paintSearch(){
  const y = window.scrollY;
  const el = document.getElementById("products");
  el.innerHTML = `<div class="itemgrid">` + searchOut.slice(0, searchN).map(r => itemCard(catsOf(r.page), r.i, r.j)).join("") + `</div>` +
    (searchOut.length > searchN ? `<div style="text-align:center;margin:22px 0;"><button class="btn-ghost" onclick="searchN+=10;paintSearch();">${tr("more_a")} (${searchOut.length - searchN} ${tr("more_b")})</button></div>` : ``);
  scrollToPositionInstant(y);
  watchViews();
}

/* ===== saran cari: muncul saat mengetik, klik = buka detail ===== */
function sugHide(){ const s = document.getElementById("searchSug"); if(s) s.style.display = "none"; }
function sugShow(q, rows){
  const box = document.getElementById("searchSug");
  if(!box || !rows.length){ sugHide(); return; }
  box.innerHTML = rows.map(r => {
    const cats = catsOf(r.page);
    const im = r.item.img || (r.item.images && r.item.images[0]) || (cats[r.i] && cats[r.i].img) || "";
    const pr = (r.item.stock === 0) ? tr("habis") : ("Rp " + Number(r.item.price || 0).toLocaleString("id-ID"));
    const nm = String(r.item.name || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const imgAlt = nm.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    return `<div class="sug" onclick="sugPick('${r.page}',${r.i},${r.j})">` +
      thumbTag(im, `alt="${imgAlt}" loading="lazy" style="width:44px;height:44px;object-fit:cover;border-radius:8px;flex-shrink:0;background:#05080f;"`) +
      `<div><b>${nm}</b><span>${String(r.cname || "").replace(/</g, "&lt;")}</span></div>` +
      `<div class="pr">${pr}</div></div>`;
  }).join("");
  box.style.display = "block";
}
function sugPick(page, i, j){
  sugHide();
  try { closeMnav(); } catch(e) {}
  try { document.getElementById("searchInput").blur(); } catch(e) {}
  openDetail(page, i, j);
}
document.addEventListener("click", e => {
  const w = document.querySelector(".searchwrap");
  if(w && !w.contains(e.target)) sugHide();
});
document.addEventListener("keydown", e => { if(e.key === "Escape") sugHide(); });

function itemCard(categories, i, j){
  const item = categories[i].items[j];
  const category = categories[i];
  const page = (categories === brainrotCategories) ? 'brainrot' : ((categories === akunCategories) ? 'akun' : ((categories === jokiCategories) ? 'joki' : 'topup'));
  const uid = `${page}-${i}-${j}`;
  const hidePrice = item.name.toLowerCase().includes("admin brainrot") && !item.name.toLowerCase().includes("be a lucky block") && !item.name.toLowerCase().includes("be flash");
  const hasCarousel = item.images && item.images.length > 1;
  const itemImg = item.img || (item.images && item.images[0]) || category.img;
  const off = discountOf(item);
  const simpleCard = (page !== "brainrot");
  const thumb = hasCarousel ? `
    <div class="thumb mthumb">
      ${off ? `<span class="badge-off">-${off}%</span>` : ``}
      ${item.stock === 0 ? `<div class="soldstamp"><b>SOLD</b></div>` : ``}
      <span class="catemoji">${catEmoji(category.name)}</span>
      <span class="viewpill">👁 ${Number(item.dilihat || 0).toLocaleString("id-ID")}</span>
      <button class="wishbtn${isWished(item.name) ? " on" : ""}" data-wish="${encodeURIComponent(item.name)}" onclick="event.stopPropagation();toggleWish('${page}',${i},${j})">${isWished(item.name) ? "❤️" : "🤍"}</button>
      ${thumbTag(item.images[0], `id="carousel-${i}-${j}" alt="${item.name}" loading="lazy"`)}
      <button class="mnav l" onclick="event.stopPropagation();carouselPrev(${i},${j})">❮</button>
      <button class="mnav r" onclick="event.stopPropagation();carouselNext(${i},${j})">❯</button>
      <div class="mdots" id="dots-${i}-${j}">
        ${item.images.map((_, idx) => `<i class="${idx === 0 ? 'on' : ''}" onclick="event.stopPropagation();carouselGoto(${i},${j},${idx})"></i>`).join('')}
      </div>
    </div>` : `
      <div class="thumb">
      ${off ? `<span class="badge-off">-${off}%</span>` : ``}
      ${item.stock === 0 ? `<div class="soldstamp"><b>SOLD</b></div>` : ``}
      <span class="catemoji">${catEmoji(category.name)}</span>
      <span class="viewpill">👁 ${Number(item.dilihat || 0).toLocaleString("id-ID")}</span>
      <button class="wishbtn${isWished(item.name) ? " on" : ""}" data-wish="${encodeURIComponent(item.name)}" onclick="event.stopPropagation();toggleWish('${page}',${i},${j})">${isWished(item.name) ? "❤️" : "🤍"}</button>
      ${thumbTag(itemImg, `alt="${item.name}" loading="lazy"`)}
    </div>`;
  return `
  <div class="item" data-viewname="${item.name}" data-page="${page}" onclick="openDetail('${page}',${i},${j})">
    ${thumb}
    <div class="ibody">
      <h3>${item.name}</h3>
      <div class="stars">${starsOf(item)}</div>
      ${simpleCard ? `<div class="statrow">STATUS&nbsp;<b class="${item.stock === 0 ? "st-no" : "st-ok"}">${item.stock === 0 ? tr("habis") : tr("avail")}</b></div>${(page === 'joki' && item.sold) ? `<div class="statrow">TERJUAL&nbsp;<b>🔥 ${item.sold} ${tr("sold_w")}</b></div>` : ``}` : `
      <div class="meta">
        ${item.sold ? `<span class="sold">🔥 ${item.sold} ${tr("sold_w")}</span>` : ``}
        ${item.stock === 0 ? `<span id="stock-${uid}" style="color:var(--red);font-weight:600;">${tr("habis_txt")}</span>` : (item.stock ? `<span class="stock" id="stock-${uid}">${tr("stock")} ${item.stock}</span>` : `<span class="stock" id="stock-${uid}">${tr("stock_na")}</span>`)}
      </div>
      ${stockBarHTML(item)}`}
      <div class="price">
        ${hidePrice
          ? `<span style="color:var(--red);font-weight:600;font-size:14px;">${tr("hubungi")}</span>`
          : `<span class="now">${formatCurrency(item.price)}</span>${item.originalPrice ? `<span class="was">${formatCurrency(item.originalPrice)}</span>` : ``}${rmFmt(item.price) ? `<div class="rm">${rmFmt(item.price)}</div>` : ``}`}
      </div>
      <div class="kilat"><span>${tr("kilat")}</span><span>${tr("safe")}</span><span class="vbadge"><i>✓</i>${tr("verified")}</span></div>
      <button class="btn" ${item.stock === 0 ? 'style="background:#232c44;color:var(--mut);cursor:not-allowed;"' : ''} onclick="event.stopPropagation();${item.stock === 0 ? `alert(tr('habis_alert'))` : `addItem(${i},${j})`}">${item.stock === 0 ? tr("sold_out_btn") : tr("add_cart")}</button>
    </div>
  </div>`;
}

const PAGE_N = 10000;
let shownCat = -1, shownN = PAGE_N;
function showItems(i){
  const categories = getCurrentCategories();
  const category = categories[i];
  trackClick("buka_kategori", category.name, "");
  if(typeof gtag === "function"){
    trackGaItemList(category, currentPage);
    if (window.RS_Pixels) RS_Pixels.mapEvent("buka_kategori", { nama_kategori: category.name, content_category: category.name });
  }
  shownCat = i;
  shownN = 10;
  paintItems();
  updateUrl();
}
function paintItems(preserveScrollPosition){
  const categories = getCurrentCategories();
  const category = categories[shownCat];
  if(!category) return;
  const y = window.scrollY;
  const akunCls = (categories === akunCategories) ? " akun" : "";
  syncCta();
  const isJokiCat = (categories === jokiCategories);
  const isAkunCat = (categories === akunCategories);
  const isBrainrotCat = (categories === brainrotCategories);
  const catHero = isJokiCat ? (typeof jokiHeroHTML === "function" ? jokiHeroHTML() : ``) : (isAkunCat ? (typeof akunHeroHTML === "function" ? akunHeroHTML() : ``) : (isBrainrotCat && typeof brainrotHeroHTML === "function" ? brainrotHeroHTML() : ``));
  document.getElementById("pageTitle").innerHTML = `<button class="backbtn" onclick="render()">${tr("back")}</button>` + catHero + `
    <h2>${category.name}</h2><p>${category.items.length} item</p>`;
  document.getElementById("products").innerHTML =
    `<div class="itemgrid${akunCls}">` + category.items.map((_, j) => j < shownN ? itemCard(categories, shownCat, j) : "").join("") + `</div>` +
    (category.items.length > shownN ? `<div style="text-align:center;margin:22px 0;"><button class="btn-ghost" onclick="moreItems()">${tr("more_a")} (${category.items.length - shownN} ${tr("more_b")})</button></div>` : ``);
  if ((isJokiCat || isAkunCat || isBrainrotCat) && typeof jokiStarsFill === "function") jokiStarsFill();
  if(preserveScrollPosition) scrollToPositionInstant(y);
  else scrollToCatalog("instant");
  watchViews();
}
function moreItems(){
  shownN += 10;
  paintItems(true);
}

function chatAdmin(){
  window.open("https://wa.me/6289664299571?text=Halo%20admin%2C%20mau%20tanya%20harga%20FISH%20IT!");
}

/* ===== popup detail produk (klik gambar jadi besar) ===== */
let detailCur = null;
function openDetail(page, i, j){
  detailCur = { page: page, i: i, j: j, k: 0 };
  try {
    var _c = catsOf(page), _it = _c[i].items[j];
    logAksi("klik", _it.name, _c[i].name, _it.price, page);
    if (typeof gtag === "function"){
      trackGaEcommerce("select_item", _it, _c[i].name, _c[i].name, j);
      trackGaEcommerce("view_item", _it, _c[i].name, _c[i].name, j);
      if (window.RS_Pixels) RS_Pixels.mapEvent("lihat_produk", { nama_produk: _it.name, price: _it.price, currency: "IDR", kategori: _c[i].name });
    }
  } catch(e) {}
  try {
    let rc = JSON.parse(localStorage.getItem("rs_recent") || "[]");
    if(!Array.isArray(rc)) rc = [];
    rc = [_it.name].concat(rc.filter(x => x !== _it.name)).slice(0, 12);
    localStorage.setItem("rs_recent", JSON.stringify(rc));
  } catch(e) {}
  try { renderDetail(); } catch(e) {
    document.getElementById("detailBox").innerHTML = `<h2>😢 Gagal buka produk</h2><p style="color:var(--mut);">Coba tutup lalu buka lagi, atau muat ulang halaman.</p><div class="mactions"><button class="ghost" onclick="closeDetail()">${tr("tutup")}</button></div>`;
  }
  document.getElementById("detailModal").style.display = "block";
}
function closeDetail(){
  document.getElementById("detailModal").style.display = "none";
  detailCur = null;
}
/* ===== Per-item Product Schema Injection (Rich Snippets) ===== */
function injectProductSchema(item, category, page, mainImage){
  try {
    const url = `https://rockstarstore.id/?tab=${page}&cat=${encodeURIComponent(category.name)}&item=${encodeURIComponent(item.name)}`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `https://rockstarstore.id/#product-${page}-${item.name.replace(/[^a-z0-9]/gi,'-').toLowerCase()}`,
      "name": item.name,
      "image": mainImage ? fixImg(mainImage) : `https://rockstarstore.id/ROCKSTARLOGO.png`,
      "description": item.deskripsi || `${category.name} • ${item.stock === 0 ? "Habis" : "Stok " + (item.stock || "-")} • Proses kilat, SAFE 100%`,
      "brand": { "@type": "Brand", "name": "Rockstar.Store" },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": String(item.dilihat || "1000"),
        "bestRating": "5"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "IDR",
        "price": String(item.price || 0),
        "availability": item.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        "url": url,
        "seller": { "@type": "Organization", "name": "Rockstar.Store" }
      }
    };
    // Remove any existing per-item schema
    document.querySelectorAll('script[type="application/ld+json"][data-product-schema]').forEach(el => el.remove());
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-product-schema', 'true');
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  } catch(e) {}
}

function renderDetail(){
  if(!detailCur) return;
  const cats = catsOf(detailCur.page);
  const item = cats[detailCur.i].items[detailCur.j];
  const category = cats[detailCur.i];
  const files = (item.images && item.images.length) ? item.images : [(item.img || category.img)];
  const k = Math.min(detailCur.k, files.length - 1);
  detailCur.k = k;
  const off = discountOf(item);

  // Inject per-item Product schema for rich snippets
  injectProductSchema(item, category, detailCur.page, files[k]);

  document.getElementById("detailBox").innerHTML = `
    <div style="position:relative;">
      <img class="detailimg" src="${fixImg(files[k])}" alt="${item.name}" loading="lazy" decoding="async" onerror="imgErr(this)">
      <span class="viewpill">👁 ${Number(item.dilihat || 0).toLocaleString("id-ID")}</span>
      ${item.stock === 0 ? `<div class="soldstamp"><b>SOLD</b></div>` : ``}
      ${files.length > 1 ? `
      <button class="mnav l" onclick="detailGoto(${(k - 1 + files.length) % files.length})">❮</button>
      <button class="mnav r" onclick="detailGoto(${(k + 1) % files.length})">❯</button>` : ``}
    </div>
    ${files.length > 1 ? `<div class="dthumbs">` + files.map((f, idx) =>
      thumbTag(f, `class="${idx === k ? 'on' : ''}" onclick="detailGoto(${idx})" loading="lazy"`)
    ).join("") + `</div>` : ``}
    <h2 style="margin:14px 0 0;">${item.name}</h2>
    <div class="stars" style="margin-top:6px;">${starsOf(item)}</div>
    ${item.deskripsi ? `<p class="detaildesc">${item.deskripsi}</p>` : `<p class="detaildesc">${category.name} • ${item.stock === 0 ? tr("habis_txt") : tr("stock") + " " + (item.stock || "-")}${item.sold ? " • 🔥 " + item.sold + " " + tr("sold_w") : ""} • ${tr("kilat")}</p>`}
    <div class="detailmeta">
      ${item.sold ? `<span class="sold">🔥 ${item.sold} ${tr("sold_w")}</span>` : ``}
      ${item.stock === 0 ? `<span style="color:var(--red);font-weight:600;">${tr("habis_txt")}</span>` : (item.stock ? `<span class="stock">${tr("stock")} ${item.stock}</span>` : ``)}
    </div>
    ${stockBarHTML(item)}
    <div class="detailprice">
      <span class="now">${formatCurrency(item.price)}</span>${item.originalPrice ? `<span class="was">${formatCurrency(item.originalPrice)}</span>` : ``}
      ${rmFmt(item.price) ? `<div class="rm" style="font-size:14px;">${rmFmt(item.price)}</div>` : ``}
    </div>
    <div class="kilat"><span>${tr("kilat")}</span><span>${tr("safe")}</span><span class="vbadge"><i>✓</i>${tr("verified")}</span></div>
    ${off ? `<div style="margin-top:6px;"><span class="badge-off" style="position:static;">${tr("hemat")} -${off}%</span></div>` : ``}
    <div class="mactions">
      <button class="ghost" onclick="closeDetail()">${tr("tutup")}</button>
      <button class="ghost" style="flex:0 0 54px;font-size:20px;" onclick="toggleWish(detailCur.page,detailCur.i,detailCur.j,this)">${isWished(item.name) ? "❤️" : "🤍"}</button>
      <button class="go" ${item.stock === 0 ? 'style="opacity:.5;"' : ''} onclick="detailAdd()">${item.stock === 0 ? tr("sold_out_btn") : tr("add_cart")}</button>
    </div>
    <div id="togetherBox" style="margin-top:12px;"></div>`;
  paintTogether();
}
function detailGoto(k){
  if(!detailCur) return;
  detailCur.k = k;
  renderDetail();
}
function detailAdd(){
  if(!detailCur) return;
  const cats = catsOf(detailCur.page);
  const item = cats[detailCur.i].items[detailCur.j];
    if(item.stock === 0){ alert(tr("habis_alert")); return; }
    cart.push({...item, categoryImg: cats[detailCur.i].img, category: cats[detailCur.i].name, page: detailCur.page});
  logAksi("keranjang", item.name, cats[detailCur.i].name, item.price, detailCur.page);
  if(typeof gtag === "function"){
    trackGaEcommerce("add_to_cart", item, cats[detailCur.i].name, cats[detailCur.i].name, detailCur.j); if (window.RS_Pixels) RS_Pixels.mapEvent("tambah_keranjang", { nama_produk: item.name, price: item.price, currency: "IDR", kategori: cats[detailCur.i].name });
  }
  trackClick("tambah_keranjang", item.name, cats[detailCur.i].name);
  syncCart();
  closeDetail();
  openCartModal();
}

function carouselNext(i, j){
  const categories = getCurrentCategories();
  const item = categories[i].items[j];
  const key = `${i}-${j}`;
  carouselState[key] = ((carouselState[key] || 0) + 1) % item.images.length;
  updateCarousel(i, j, carouselState[key]);
}
function carouselPrev(i, j){
  const categories = getCurrentCategories();
  const item = categories[i].items[j];
  const key = `${i}-${j}`;
  carouselState[key] = ((carouselState[key] || 0) - 1 + item.images.length) % item.images.length;
  updateCarousel(i, j, carouselState[key]);
}
function carouselGoto(i, j, index){
  carouselState[`${i}-${j}`] = index;
  updateCarousel(i, j, index);
}
function updateCarousel(i, j, index){
  const categories = getCurrentCategories();
  const item = categories[i].items[j];
  const imgEl = document.getElementById(`carousel-${i}-${j}`);
  const dotsContainer = document.getElementById(`dots-${i}-${j}`);
  if(imgEl){
    delete imgEl.dataset.retry;
    const full0 = fixImg(item.images[index]);
    const t0 = thumbOf(full0);
    if(t0 === full0){ imgEl.onerror = function(){ imgErr(imgEl); }; imgEl.src = full0; }
    else { imgEl.setAttribute("data-full", full0); imgEl.onerror = function(){ thumbErr(imgEl); }; imgEl.src = t0; }
    // preload slide tetangga biar pindah slide instan
    [index + 1, index - 1].forEach(k => {
      const n = (k + item.images.length) % item.images.length;
      const pre = new Image();
      pre.src = fixImg(item.images[n]);
    });
  }
  if(dotsContainer){
    dotsContainer.querySelectorAll('i').forEach((d, idx) => d.classList.toggle('on', idx === index));
  }
}

function goHome(){ currentPage = 'home'; shownCat = -1; render(); updateUrl(); }

function toggleWaPop(){
  const p = document.getElementById("waPop");
  const open = (p.style.display === "none" || !p.style.display);
  p.style.display = open ? "flex" : "none";
  const rb = document.getElementById("rcBubble");  if(rb && rb.style.display !== "none") rb.style.visibility = open ? "hidden" : "";
  if(open && !document.getElementById("waBody").children.length) waBot();
  if(open){
    const inp = document.getElementById("waChatInput");
    if(inp && !inp.value) inp.value = "Halo admin rockstar";
  }
}
function waBot(){
  appendWaMsg(tr("wa_greet"), false);
}
function appendWaMsg(t, me){
  const box = document.getElementById("waBody");
  const d = document.createElement("div");
  d.className = "bm " + (me ? "me" : "bot");
  d.textContent = t;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}
function waQuick(t){
  document.getElementById("waChatInput").value = t;
  waSend();
}
function waSend(){
  const inp = document.getElementById("waChatInput");
  const v = (inp.value || "").trim() || "Halo admin Rockstar.Store!";
  appendWaMsg(v, true);
  inp.value = "";
  setTimeout(function(){ window.open("https://wa.me/6289664299571?text=" + encodeURIComponent(v), "_blank"); }, 450);
}

/* Chat WA Min Rock — tombol foto MIN ROCK & bubble & menu langsung ke WhatsApp */
function openWaChat(msg){
  const t = msg || "Halo Min Rock, saya butuh bantuan 🙏";
  try { window.open("https://wa.me/6289664299571?text=" + encodeURIComponent(t), "_blank"); } catch(e) {}
}
function toggleTestiPop(){
  const p = document.getElementById("testiPop");
  p.style.display = (p.style.display === "none" || !p.style.display) ? "flex" : "none";
  const rc = document.getElementById("rockchat");
  if(rc) rc.style.visibility = (p.style.display === "flex") ? "hidden" : "";
}
/* Biru mengikuti katalog yang dibuka */
function syncHeroCta(){
  var m = { brainrot: "ctaBrainrot", topup: "ctaTopup", akun: "ctaAkun", joki: "ctaJoki" };
  Object.keys(m).forEach(function(k){
    var b = document.getElementById(m[k]);
    if(b) b.className = (currentPage === k) ? "btn-primary" : "btn-ghost";
  });
}
/* Pengumuman selalu tampil (lipat otomatis dimatikan) */
function scrollToPositionInstant(top){
  try { window.scrollTo(window.scrollX || 0, Math.max(0, Number(top) || 0)); } catch(e) {}
}
function scrollToCatalog(behavior){
  try {
    requestAnimationFrame(function(){
      const section = document.querySelector("main.section");
      if(!section) return;
      const sticky = document.querySelector(".topwrap");
      const offset = sticky ? Math.ceil(sticky.getBoundingClientRect().height) : 0;
      const top = section.getBoundingClientRect().top + window.pageYOffset - offset - 10;
      if(behavior === "instant") scrollToPositionInstant(top);
      else window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  } catch(e) {}
}
function goToCatalogPage(page){
  currentPage = page;
  shownCat = -1;
  render();
  updateUrl();
  scrollToCatalog("instant");
}
function goToBrainrot(){ goToCatalogPage('brainrot'); }
function goToTopUp(){ goToCatalogPage('topup'); }
function goToAkun(){ goToCatalogPage('akun'); }
function goToJoki(){ goToCatalogPage('joki'); }

/* ===== deep links + page-specific SEO metadata =====
   URL shareable: /?tab=brainrot&cat=Grow%20A%20Garden%202  |  /?q=kata+kunci */
const SEO_PAGES = {
  home: { title: "Rockstar.Store | Top Up Robux, Akun & Brainrot Roblox", description: "Top up Robux, akun Roblox, item Brainrot, dan jasa joki tersedia di Rockstar.Store. Lihat pilihan produk, harga, dan cara pemesanan." },
  brainrot: { title: "Item Brainrot Roblox | Rockstar.Store", description: "Jelajahi item Brainrot Roblox dari berbagai map. Lihat kategori, detail produk, dan harga di katalog Rockstar.Store." },
  topup: { title: "Top Up Robux Roblox | Rockstar.Store", description: "Pilih paket top up Robux Roblox di Rockstar.Store. Cek pilihan nominal, metode pembayaran, dan cara pemesanan." },
  akun: { title: "Akun Roblox Sepuh | Rockstar.Store", description: "Cari akun Roblox sepuh untuk berbagai map di Rockstar.Store. Lihat detail akun, harga, dan ketersediaannya sebelum memesan." },
  joki: { title: "Jasa Joki Roblox Aman & Cepat | Rockstar.Store", description: "Cari jasa joki Roblox untuk map favoritmu. Lihat pilihan layanan, harga, dan cara pemesanan di Rockstar.Store." }
};
function setMetaName(name, content){
  let tag = document.head.querySelector('meta[name="' + name + '"]');
  if(!tag){ tag = document.createElement("meta"); tag.setAttribute("name", name); document.head.appendChild(tag); }
  tag.setAttribute("content", content);
}
function setMetaProperty(property, content){
  let tag = document.head.querySelector('meta[property="' + property + '"]');
  if(!tag){ tag = document.createElement("meta"); tag.setAttribute("property", property); document.head.appendChild(tag); }
  tag.setAttribute("content", content);
}
function syncSeoMetadata(){
  try {
    const page = SEO_PAGES[currentPage] || SEO_PAGES.home;
    const cat = (currentPage !== "home" && shownCat >= 0) ? getCurrentCategories()[shownCat] : null;
    const params = new URLSearchParams(location.search);
    const isSearchPage = !!(params.get("q") || "").trim();
    const title = cat ? (cat.name + " | Rockstar.Store") : page.title;
    const description = cat
      ? ("Jelajahi " + cat.name + " di Rockstar.Store. Periksa detail produk, harga, dan ketersediaan sebelum memesan.")
      : page.description;
    const canonicalParams = new URLSearchParams();
    if(!isSearchPage && currentPage !== "home"){
      canonicalParams.set("tab", currentPage);
      if(cat) canonicalParams.set("cat", cat.name);
    }
    const canonicalUrl = new URL(location.pathname, location.origin);
    canonicalUrl.search = canonicalParams.toString();
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if(!canonical){ canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", canonicalUrl.href);
    document.title = title;
    setMetaName("description", description);
    setMetaName("robots", isSearchPage ? "noindex,follow" : "index,follow");
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:url", canonicalUrl.href);
    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);
    if (window.gtag){
      if (window.__rockGaStarted){ window.gtag("event", "page_view", { page_title: title, page_location: canonicalUrl.href }); if (window.RS_Pixels) RS_Pixels.mapEvent("page_view", { page_title: title, page_location: canonicalUrl.href }); }
      window.__rockGaStarted = true;
    }
  } catch(e){}
}
function updateUrl(){
  try {
    const p = new URLSearchParams();
    if(currentPage !== "home") p.set("tab", currentPage);
    if(currentPage !== "home" && shownCat >= 0){
      const c = getCurrentCategories()[shownCat];
      if(c) p.set("cat", c.name);
    }
    const qs = p.toString();
    history.replaceState({ rs: 1 }, "", location.pathname + (qs ? "?" + qs : ""));
  } catch(e){}
  syncSeoMetadata();
}
function applyDeepLink(preserveScrollPosition){
  try {
    const p = new URLSearchParams(location.search);
    const q = (p.get("q") || "").trim();
    if(q){
      syncSeoMetadata();
      const inp = document.getElementById("searchInput");
      if(inp){ inp.value = q; searchCatalog(); }
      return true;
    }
    const tab = (p.get("tab") || "").toLowerCase();
    const cat = (p.get("cat") || "").trim();
    if(tab && catsOf(tab).length){
      currentPage = tab;
      render();
      if(cat){
        const cats = getCurrentCategories();
        const idx = cats.findIndex(c => c.name.toLowerCase() === cat.toLowerCase());
        if(idx >= 0){ shownCat = idx; shownN = 10; paintItems(!!preserveScrollPosition); }
      }
      updateUrl();
      return true;
    }
  } catch(e){}
  return false;
}

function syncCart(){
  document.getElementById("cartCount").innerText = cart.length;
  document.getElementById("total").innerText = cart.length;
  const mc = document.getElementById("mnavCartCount");
  if(mc) mc.innerText = cart.length;
}

function addItem(i,j){
  const categories = getCurrentCategories();
  const item = categories[i].items[j];
  if(item.stock === 0){ alert(tr("habis_alert")); return; }
  cart.push({...item, categoryImg: categories[i].img, category: categories[i].name, page: currentPage});
  logAksi("keranjang", item.name, categories[i].name, item.price, currentPage);
  trackClick("tambah_keranjang", item.name, categories[i].name);
  if(typeof gtag === "function"){
    trackGaEcommerce("add_to_cart", item, categories[i].name, categories[i].name, j); if (window.RS_Pixels) RS_Pixels.mapEvent("tambah_keranjang", { nama_produk: item.name, price: item.price, currency: "IDR", kategori: categories[i].name });
  }
  syncCart();
}

function trackSearch(q){
  if(typeof gtag === "function"){
    gtag("event", "cari_barang", { kata_cari: q }); if (window.RS_Pixels) RS_Pixels.mapEvent("cari_barang", { kata_cari: q, search_string: q });
  }
  trackClick("cari_barang", q, "");
}

// Hitung dilihat per produk: tiap card yang tampil di layar +1 (sekali per render).
let viewObs = null;
function watchViews(){
  try {
    if(viewObs) viewObs.disconnect();
    viewObs = new IntersectionObserver(es => {
      es.forEach(en => {
        if(!en.isIntersecting) return;
        const el = en.target;
        viewObs.unobserve(el);
        const nm = el.dataset.viewname, pg = el.dataset.page;
        if(!nm || pg === "topup") return;
        (function(nm, pg, el){
          const tbl = sbTableOf(pg);
          const H = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };
          fetch(SB_URL + "/rest/v1/" + tbl + "?select=dilihat&name=eq." + encodeURIComponent(nm), { headers: H })
            .then(r => r.json()).then(a => {
              const cur = (a && a[0] && Number(a[0].dilihat)) || 0;
              return fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(nm), {
                method: "PATCH", headers: H, body: JSON.stringify({ dilihat: cur + 1 })
              }).then(r => r.json()).then(u => {
                const v = (u && u[0] && u[0].dilihat !== undefined) ? u[0].dilihat : cur + 1;
                const c = el.querySelector(".viewcount");
                if(c) c.textContent = "👁 " + Number(v).toLocaleString("id-ID");
                const vp = el.querySelector(".viewpill");
                if(vp) vp.textContent = "👁 " + Number(v).toLocaleString("id-ID");
              });
            }).catch(() => {});
        })(nm, pg, el);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.item[data-viewname]').forEach(el => {
      viewObs.observe(el);
    });
  } catch(e) {}
}

// Statistik sendiri ke Sheet tab "Statistik" (ringan, tidak menunggu respon).
// trackClick dinonaktifkan (hemat kuota) — tinggal gtag Analytics saja.
function trackClick(ev, nama, kat){ return; }

function gaPrice(value){
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value == null ? "" : value).trim().replace(/[^\d.,-]/g, "");
  if (!raw) return null;
  let normalized = raw;
  if (raw.includes(".") && raw.includes(",")) {
    normalized = raw.lastIndexOf(",") > raw.lastIndexOf(".")
      ? raw.replace(/\./g, "").replace(",", ".")
      : raw.replace(/,/g, "");
  } else if (raw.includes(",")) {
    normalized = /,\d{3}$/.test(raw) ? raw.replace(/,/g, "") : raw.replace(",", ".");
  } else if (raw.includes(".")) {
    normalized = /\.\d{3}$/.test(raw) ? raw.replace(/\./g, "") : raw;
  }
  const price = Number(normalized);
  return Number.isFinite(price) ? price : null;
}

function gaItem(item, categoryName, index){
  const name = String(item && item.name || "").trim().slice(0, 100);
  if (!name) return null;
  const source = item || {};
  const category = String(categoryName || "").trim().slice(0, 100);
  const product = {
    item_id: String(source.id || source.sku || `${category || "lainnya"}|${name}`).slice(0, 100),
    item_name: name,
    item_brand: "Rockstar.Store",
    quantity: 1,
  };
  if (category) product.item_category = category;
  const price = gaPrice(item.price);
  if (price !== null) product.price = price;
  if (Number.isInteger(index) && index >= 0) product.index = index;
  return product;
}

function trackGaEcommerce(eventName, item, categoryName, listName, index){
  if (typeof window.gtag !== "function") return;
  const product = gaItem(item, categoryName, index);
  if (!product) return;
  const params = { currency: "IDR", items: [product] };
  if (listName) {
    params.item_list_id = `${currentPage || "katalog"}:${String(listName)}`.slice(0, 100);
    params.item_list_name = String(listName).slice(0, 100);
  }
  if ((eventName === "view_item" || eventName === "add_to_cart") && product.price !== undefined) {
    params.value = product.price * product.quantity;
  }
  window.gtag("event", eventName, params);
}

function trackGaItemList(category, pageName){
  if (typeof window.gtag !== "function" || !category || !Array.isArray(category.items)) return;
  const items = category.items.slice(0, 10)
    .map((item, index) => gaItem(item, category.name, index))
    .filter(Boolean);
  if (!items.length) return;
  const listName = String(category.name || "Kategori").slice(0, 100);
  window.gtag("event", "view_item_list", {
    currency: "IDR",
    item_list_id: `${pageName || "katalog"}:${listName}`.slice(0, 100),
    item_list_name: listName,
    items,
  });
}

const SHEET_URL = "https://script.google.com/macros/s/AKfycbxFQEIeLqMYXC6tN7SG8i5Un7FDM_QgEJ7-Y78uihxjHBfC01TvyEk082nKzG5y5aip/exec";

function openServerModal(){ document.getElementById("serverModal").style.display = "block"; }
function closeServerModal(){ document.getElementById("serverModal").style.display = "none"; }
document.getElementById("serverModal").addEventListener('click', e => {
  if(e.target.id === "serverModal") closeServerModal();
});

function checkout(){
  if(cart.length==0){ alert(tr("kosong")); return; }
  let previewHTML = `<h2>${tr("preview")}</h2>`;
  let totalPrice = 0;
  cart.forEach((item, index) => {
    totalPrice += item.price;
    let itemImage = fixImg(item.img || item.categoryImg);
    previewHTML += `
      <div class="mrow">
        <img src="${itemImage}" alt="${item.name}" width="56" height="56" loading="lazy" decoding="async" onerror="imgErr(this)">
        <div class="grow"><strong>${index+1}. ${item.name}</strong><br>${formatCurrency(item.price)}${rmFmt(item.price) ? `<br><small class="rm">${rmFmt(item.price)}</small>` : ``}</div>
      </div>`;
  });
  previewHTML += `<div class="mtotal">💰 TOTAL: Rp ${totalPrice.toLocaleString()}<br><span>📦 ${cart.length} item</span></div>`;
  const m = document.createElement('div');
  m.id = 'checkoutModal';
  m.className = 'overlay';
  m.style.display = 'block';
  m.innerHTML = `<div class="modal">${previewHTML}
    <div class="mactions">
      <button class="danger" onclick="closeCheckoutPreview()">${tr("batal")}</button>
      <button class="wa" onclick="sendToAdmin()">${tr("kirim")}</button>
    </div></div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target === m) closeCheckoutPreview(); });
}
function closeCheckoutPreview(){ const m = document.getElementById('checkoutModal'); if(m) m.remove(); }

function sendToAdmin(){
  if(cart.length==0){ alert(tr("kosong")); return; }
  if(typeof gtag === "function"){
    const totalValue = cart.reduce((s, p) => s + (p.price || 0), 0);
    gtag("event", "kirim_ke_admin", { jumlah_item: cart.length, value: totalValue, currency: "IDR" }); if (window.RS_Pixels) RS_Pixels.mapEvent("kirim_ke_admin", { jumlah_item: cart.length, value: totalValue, currency: "IDR" });
  }
  logAksi("checkout", cart.length + " item", "", cart.reduce((s, p) => s + (p.price || 0), 0), "");
  let text = "Halo saya mau beli:%0A";
  cart.forEach(p=>{ text += "- "+p.name+" (Rp "+p.price+")%0A"; });
  if(cart.length > 3){ closeCheckoutPreview(); window.open("https://wa.me/6289664299571?text="+text); return; }
  // Aturan nomor khusus hanya untuk item non-akun (nama akun mengandung "steal" tapi tetap ke admin utama).
  // Keranjang lama tanpa info halaman tetap pakai aturan lama.
  const tagged = cart.some(p => p.page);
  const scope = tagged ? cart.filter(p => String(p.page || "") !== "akun") : cart;
  const hasFishIt = scope.some(item => item.name.toLowerCase().includes("fish it"));
  const hasSab = scope.some(item => item.name.toLowerCase().includes("sab"));
  const hasTopUp = scope.some(item => item.name.toLowerCase().includes("robux") || item.name.toLowerCase().includes("premium") || item.name.toLowerCase().includes("bundle"));
  const hasGamepass = scope.some(item => item.name.toLowerCase().includes("gamepass"));
  const hasSteal = scope.some(item => item.name.toLowerCase().includes("steal"));
  const hasGrowAGarden = scope.some(item => item.name.toLowerCase().includes("grow a garden"));
  const hasIceGolem = scope.some(item => item.name.toLowerCase().includes("ice golem titan(prismatic)"));
  const hasToken = scope.some(item => item.name.toLowerCase().includes("token"));
  let adminNumber = "6289664299571";
  if(scope.length && (hasFishIt || hasSab || hasTopUp || hasGamepass || hasSteal)) adminNumber = "6283114900053";
  if(hasGrowAGarden) adminNumber = "6289664299571";
  if(hasIceGolem) adminNumber = "6289664299571";
  if(hasToken) adminNumber = "6283114900053";
  catatOrder();
  closeCheckoutPreview();
  window.open("https://wa.me/"+adminNumber+"?text="+text);
}

/* Catat order saat checkout. Stok & terjual berubah saat admin tekan Lunas. */
function catatOrder(){
  try {
    if(!cart.length) return;
    const cnt = {};
    cart.forEach(p => {
      const k = String(p.name || "");
      if(!k) return;
      if(!cnt[k]) cnt[k] = { q: 0, page: p.page || "" };
      cnt[k].q++;
    });
    const det = Object.keys(cnt).map(nm => ({ n: nm, q: cnt[nm].q, p: cnt[nm].page }));
    const total = cart.reduce((s, p) => s + (p.price || 0), 0);
    const H = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };
    fetch(SB_URL + "/rest/v1/orders", { method: "POST", headers: H,
      body: JSON.stringify({ items: JSON.stringify(det), total: total, status: "baru" }), keepalive: true })
    .catch(function(){});
  } catch(e) {}
}

function openCartModal(){
  if(cart.length==0){ alert(tr("kosong")); return; }
  let html = '';
  let totalPrice = 0;
  cart.forEach((item, index) => {
    totalPrice += item.price;
    html += `
      <div class="mrow">
        <div class="grow"><strong>${index+1}. ${item.name}</strong><br><span style="color:var(--blue2);font-weight:600;">${formatCurrency(item.price)}</span>${rmFmt(item.price) ? `<br><small class="rm">${rmFmt(item.price)}</small>` : ``}</div>
        <button class="del" onclick="removeFromCart(${index})">${tr("hapus")}</button>
      </div>`;
  });
  html += `<div class="mtotal">💰 TOTAL: Rp ${totalPrice.toLocaleString()}<br><span>📦 ${cart.length} item</span></div>`;
  document.getElementById("cartList").innerHTML = html;
  document.getElementById("cartModal").style.display = "block";
}
function removeFromCart(index){
  cart.splice(index, 1);
  syncCart();
  if(cart.length === 0){ closeCartModal(); return; }
  openCartModal();
}
function closeCartModal(){ document.getElementById("cartModal").style.display = "none"; }
document.getElementById("cartModal").addEventListener('click', e => {
  if(e.target.id === "cartModal") closeCartModal();
});
document.getElementById("wishModal").addEventListener('click', e => {
  if(e.target.id === "wishModal") closeWishModal();
});
function cancelCheckout(){
  if(cart.length==0){ alert("Keranjang sudah kosong!"); return; }
  if(confirm(tr("cancel_q"))){
    cart = [];
    syncCart();
  }
}

const SB_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SB_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";
function sbTableOf(sheet){
  sheet = String(sheet || "").toLowerCase();
  if(sheet === "akun") return "akun";
  if(sheet === "info") return "info";
  if(sheet === "topup") return "topup";
  if(sheet === "joki") return "joki";
  return "brainrot";
}
function sbGet(path){
  return fetch(SB_URL + "/rest/v1/" + path, {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }
  }).then(r => r.json()).then(a => Array.isArray(a) ? a : []).catch(() => []);
}
function fetchSheet(sheet, cbName){
  return sbGet(sbTableOf(sheet) + "?select=*&order=urutan");
}
/* ===== catat aktivitas pengunjung (klik / keranjang / checkout) — tanpa data pribadi ===== */
function logAksi(aksi, name, kat, price, page){
  try {
    fetch(SB_URL + "/rest/v1/klik", {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ aksi: aksi, name: String(name || "").slice(0, 200),
        kategori: String(kat || "").slice(0, 100), tab: String(page || ""), price: Number(price) || 0 }),
      keepalive: true
    }).catch(function(){});
  } catch(e) {}
}

/* ===== wishlist (tersimpan di HP, tanpa login) ===== */
function wishList(){ try { const a = JSON.parse(localStorage.getItem("rs_wish") || "[]"); return Array.isArray(a) ? a : []; } catch(e){ return []; } }
function saveWish(a){ try { localStorage.setItem("rs_wish", JSON.stringify(a)); } catch(e){} }
function isWished(nm){ return wishList().indexOf(nm) !== -1; }
function resolveWish(nm){
  const pages = ["brainrot", "topup", "akun", "joki"];
  for(let p = 0; p < pages.length; p++){
    const cats = catsOf(pages[p]);
    for(let i = 0; i < cats.length; i++)
      for(let j = 0; j < cats[i].items.length; j++)
        if(cats[i].items[j].name === nm) return { page: pages[p], i: i, j: j, item: cats[i].items[j], cat: cats[i] };
  }
  return null;
}
function syncWishCount(){
  const n = wishList().length;
  const a = document.getElementById("wishCount");
  if(a) a.textContent = n;
  const a2 = document.getElementById("mnavWishCount");
  if(a2) a2.textContent = n;
}
function paintHot(){
  const track = document.getElementById("hotProductTrack");
  if(!track) return;
  if(paintHot.controller) paintHot.controller.abort();
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  paintHot.controller = controller;
  const requestId = (paintHot.requestId || 0) + 1;
  paintHot.requestId = requestId;
  const hasExistingCards = Boolean(track.querySelector(".hot-product-group"));
  if(!hasExistingCards) track.innerHTML = '<div class="hot-product-message">Memuat produk pilihan…</div>';
  let hasRendered = hasExistingCards;
  const fallbackTimer = window.setTimeout(function(){
    if(!hasRendered) renderProducts(catalogFallback());
  }, 2500);

  function isAvailable(item){
    if(!item || !item.name) return false;
    const markedSoldOut = /^(ya|y|yes|habis|sold)/i.test(String(item.soldout || "").trim());
    const stock = Number(item.stock);
    return Number.isFinite(stock) && stock > 0 && !markedSoldOut;
  }

  function renderProducts(products, finished){
    if(requestId !== paintHot.requestId || !track.isConnected) return;
    products = Array.isArray(products) ? products.filter(function(entry){
      return entry && entry.r && isAvailable(entry.r.item);
    }) : [];
    if(!products.length){
      if(finished){
        track.innerHTML = '<div class="hot-product-message">Belum ada produk tersedia saat ini.</div>';
        hasRendered = true;
      }
      return;
    }
    hasRendered = true;
    window.clearTimeout(fallbackTimer);
    track.replaceChildren();
    function makeGroup(isClone){
      const group = document.createElement("div");
      group.className = "hot-product-group";
      if(isClone) group.setAttribute("aria-hidden", "true");
      products.forEach(function(entry){
        const r = entry.r;
        const item = r.item;
        const card = document.createElement("button");
        card.type = "button";
        card.className = "hot-product-card";
        card.tabIndex = isClone ? -1 : 0;
        card.setAttribute("aria-label", String(item.name || "Produk") + ", Rp " + Number(item.price || 0).toLocaleString("id-ID"));
        card.addEventListener("click", function(){ openDetail(r.page, r.i, r.j); });
        const image = document.createElement("img");
        const fullImage = fixImg(item.img || (item.images && item.images[0]) || r.cat.img);
        image.src = tinyOf(fullImage);
        image.dataset.thumb = thumbOf(fullImage);
        image.dataset.full = fullImage;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.onerror = function(){
          const sameUrl = function(url){
            try { return image.src === new URL(url, location.href).href; }
            catch(e){ return image.src === url; }
          };
          let fallback = image.dataset.thumb;
          image.dataset.thumb = "";
          if(fallback && !sameUrl(fallback)){ image.src = fallback; return; }
          fallback = image.dataset.full;
          image.dataset.full = "";
          if(fallback && !sameUrl(fallback)){ image.src = fallback; return; }
          image.onerror = null;
          image.src = FALLBACK_IMG;
        };
        const info = document.createElement("span");
        info.className = "hot-product-info";
        const name = document.createElement("span");
        name.className = "hot-product-name";
        name.textContent = String(item.name || "Produk Rockstar.Store");
        const meta = document.createElement("span");
        meta.className = "hot-product-meta";
        const clickText = Number(entry.clicks) > 0 ? "🔥 " + Number(entry.clicks) + "x · " : "🔥 Hot product · ";
        meta.textContent = clickText + "Rp " + Number(item.price || 0).toLocaleString("id-ID");
        info.append(name, meta);
        card.append(image, info);
        group.appendChild(card);
      });
      return group;
    }
    track.append(makeGroup(false), makeGroup(true));
  }

  function catalogFallback(){
    const candidates = [];
    ["brainrot", "akun", "topup", "joki"].forEach(function(page){
      catsOf(page).forEach(function(cat, i){
        (cat.items || []).forEach(function(item, j){
          if(!isAvailable(item)) return;
          candidates.push({
            r: { page: page, i: i, j: j, item: item, cat: cat },
            clicks: 0,
            views: Number(item.dilihat) || 0,
            stock: Number(item.stock) || 0
          });
        });
      });
    });
    candidates.sort(function(a, b){ return b.views - a.views || b.stock - a.stock; });
    return candidates.slice(0, 8);
  }

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const requestTimeout = window.setTimeout(function(){
    if(controller) controller.abort();
  }, 5000);
  fetch(SB_URL + "/rest/v1/klik?select=name&aksi=eq.klik&order=waktu.desc&limit=2000&waktu=gte." + encodeURIComponent(since), {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
    ...(controller ? { signal: controller.signal } : {})
  }).then(function(response){
    if(!response.ok) throw new Error("Gagal mengambil data produk populer");
    return response.json();
  }).then(function(rows){
    const frequency = {};
    (Array.isArray(rows) ? rows : []).forEach(function(row){
      const name = String(row.name || "").slice(0, 80);
      if(name) frequency[name] = (frequency[name] || 0) + 1;
    });
    const popular = Object.keys(frequency).map(function(name){
      const r = resolveWish(name);
      return r ? { r: r, clicks: frequency[name] } : null;
    }).filter(function(entry){
      return entry && isAvailable(entry.r.item);
    }).sort(function(a, b){ return b.clicks - a.clicks; }).slice(0, 8);
    renderProducts(popular.length ? popular : catalogFallback(), true);
  }).catch(function(){
    renderProducts(catalogFallback(), true);
  }).finally(function(){
    window.clearTimeout(requestTimeout);
    window.clearTimeout(fallbackTimer);
  });
}

let TESTIMONI_GALLERY_ITEMS = [];
let TESTIMONI_GALLERY_SHOWN = 0;
let TESTIMONI_GALLERY_LOADING = false;
let TESTIMONI_GALLERY_LOADED_AT = 0;
let TESTIMONI_GALLERY_REQUEST = 0;

function renderTestimoniGallery(){
  const status = document.getElementById("testimoniGalleryStatus");
  const grid = document.getElementById("testimoniGalleryGrid");
  const more = document.getElementById("testimoniGalleryMore");
  if(!status || !grid || !more) return;
  grid.replaceChildren();
  const visible = TESTIMONI_GALLERY_ITEMS.slice(0, TESTIMONI_GALLERY_SHOWN);
  visible.forEach(function(row, index){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "testimoni-photo-link";
    button.setAttribute("aria-label", "Lihat foto testimoni " + (index + 1));
    const image = document.createElement("img");
    image.className = "testimoni-photo";
    image.src = thumbOf(row.image);
    image.dataset.full = row.image;
    image.alt = "Foto testimoni " + (index + 1);
    image.loading = "lazy";
    image.decoding = "async";
    image.onerror = function(){
      if(image.dataset.full && image.src !== image.dataset.full){
        const full = image.dataset.full;
        image.dataset.full = "";
        image.src = full;
      }
    };
    button.appendChild(image);
    button.addEventListener("click", function(){ openTestimoniPhoto(row.image); });
    grid.appendChild(button);
  });
  status.textContent = visible.length
    ? "Menampilkan " + visible.length + " dari " + TESTIMONI_GALLERY_ITEMS.length + " foto testimoni."
    : "Belum ada foto testimoni yang tersimpan.";
  more.style.display = visible.length < TESTIMONI_GALLERY_ITEMS.length ? "block" : "none";
}

function openTestimoniGallery(){
  const modal = document.getElementById("testimoniModal");
  if(!modal) return;
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  const content = document.getElementById("testimoniGalleryContent");
  const viewer = document.getElementById("testimoniPhotoViewer");
  if(content) content.style.display = "block";
  if(viewer) viewer.style.display = "none";
  if(TESTIMONI_GALLERY_ITEMS.length && Date.now() - TESTIMONI_GALLERY_LOADED_AT < 60000){
    TESTIMONI_GALLERY_SHOWN = Math.min(12, TESTIMONI_GALLERY_ITEMS.length);
    renderTestimoniGallery();
    return;
  }
  if(TESTIMONI_GALLERY_LOADING) return;
  const status = document.getElementById("testimoniGalleryStatus");
  const grid = document.getElementById("testimoniGalleryGrid");
  const more = document.getElementById("testimoniGalleryMore");
  if(status) status.textContent = "Memuat foto testimoni…";
  if(grid) grid.replaceChildren();
  if(more) more.style.display = "none";
  TESTIMONI_GALLERY_LOADING = true;
  const requestId = ++TESTIMONI_GALLERY_REQUEST;
  fetch(SB_URL + "/rest/v1/info?select=name,image,urutan&name=like.INFO_TESTIMONI_*&order=urutan.asc,name.asc&limit=500", {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }
  }).then(function(response){
    if(!response.ok) throw new Error("Gagal mengambil galeri testimoni");
    return response.json();
  }).then(function(rows){
    if(requestId !== TESTIMONI_GALLERY_REQUEST) return;
    const allowedPrefix = SB_URL + "/storage/v1/object/public/foto/";
    TESTIMONI_GALLERY_ITEMS = (Array.isArray(rows) ? rows : []).filter(function(row){
      const name = String(row.name || "").trim();
      const image = String(row.image || "").trim();
      return name.indexOf("INFO_TESTIMONI_") === 0 && image.indexOf(allowedPrefix) === 0;
    }).sort(function(a, b){
      return (Number(a.urutan) || 0) - (Number(b.urutan) || 0) || String(a.name).localeCompare(String(b.name));
    });
    TESTIMONI_GALLERY_LOADED_AT = Date.now();
    TESTIMONI_GALLERY_SHOWN = Math.min(12, TESTIMONI_GALLERY_ITEMS.length);
    renderTestimoniGallery();
  }).catch(function(){
    if(requestId === TESTIMONI_GALLERY_REQUEST && status){
      status.textContent = TESTIMONI_GALLERY_ITEMS.length
        ? "Koneksi galeri terganggu. Foto yang tersimpan sebelumnya tetap bisa dilihat."
        : "Foto testimoni belum dapat dimuat. Coba muat ulang halaman.";
    }
    if(TESTIMONI_GALLERY_ITEMS.length) renderTestimoniGallery();
  }).then(function(){
    if(requestId === TESTIMONI_GALLERY_REQUEST) TESTIMONI_GALLERY_LOADING = false;
  });
}

function loadMoreTestimoni(){
  TESTIMONI_GALLERY_SHOWN = Math.min(TESTIMONI_GALLERY_ITEMS.length, TESTIMONI_GALLERY_SHOWN + 12);
  renderTestimoniGallery();
}

function openTestimoniPhoto(url){
  const content = document.getElementById("testimoniGalleryContent");
  const viewer = document.getElementById("testimoniPhotoViewer");
  const image = document.getElementById("testimoniPhotoViewerImage");
  if(!content || !viewer || !image) return;
  image.src = url;
  content.style.display = "none";
  viewer.style.display = "block";
}

function returnToTestimoniGallery(){
  const content = document.getElementById("testimoniGalleryContent");
  const viewer = document.getElementById("testimoniPhotoViewer");
  if(content) content.style.display = "block";
  if(viewer) viewer.style.display = "none";
}

function closeTestimoniGallery(){
  const modal = document.getElementById("testimoniModal");
  if(modal) modal.style.display = "none";
  document.body.style.overflow = "";
}

window.openTestimoniGallery = openTestimoniGallery;
window.closeTestimoniGallery = closeTestimoniGallery;
window.loadMoreTestimoni = loadMoreTestimoni;
window.returnToTestimoniGallery = returnToTestimoniGallery;
document.addEventListener("keydown", function(event){
  const modal = document.getElementById("testimoniModal");
  if(event.key === "Escape" && modal && modal.style.display === "block") closeTestimoniGallery();
});

function syncWishBtns(nm){
  const on = isWished(nm);
  document.querySelectorAll('[data-wish="' + encodeURIComponent(nm) + '"]').forEach(el => {
    el.textContent = on ? "❤️" : "🤍";
    el.classList.toggle("on", on);
  });
}
function toggleWish(page, i, j, el){
  try {
    const it = catsOf(page)[i].items[j];
    let w = wishList();
    const k = w.indexOf(it.name);
    if(k === -1){ w.push(it.name); logAksi("wishlist+", it.name, catsOf(page)[i].name, it.price, page); }
    else { w.splice(k, 1); logAksi("wishlist-", it.name, catsOf(page)[i].name, it.price, page); }
    saveWish(w);
    syncWishCount();
    if(el && el.classList && el.classList.contains("wishbtn")){
      el.textContent = k === -1 ? "❤️" : "🤍";
      el.classList.toggle("on", k === -1);
    } else {
      syncWishBtns(it.name);
      if(el){ el.textContent = k === -1 ? "❤️" : "🤍"; }
    }
    if(document.getElementById("wishModal").style.display === "block") openWishModal();
  } catch(e) {}
}
function openWishModal(){
  const w = wishList();
  let html = "";
  let shown = 0;
  w.forEach((nm, idx) => {
    const r = resolveWish(nm);
    if(!r) return;
    shown++;
    const pr = (r.item.stock === 0) ? "HABIS" : ("Rp " + Number(r.item.price || 0).toLocaleString("id-ID"));
    html += `<div class="mrow">
      <div class="grow"><strong>${escWish(nm)}</strong><br><span style="color:var(--blue2);font-weight:600;">${pr}</span></div>
      <button class="del" style="background:var(--blue);" onclick="wishAdd('${r.page}',${r.i},${r.j})">🛒</button>
      <button class="del" onclick="wishRemoveAt(${idx})">${tr("hapus")}</button>
    </div>`;
  });
  document.getElementById("wishList").innerHTML = shown ? html : `<p style="color:var(--mut);text-align:center;padding:16px 0;">${tr("wish_empty")}</p>`;
  document.getElementById("wishModal").style.display = "block";
}
function escWish(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function closeWishModal(){ document.getElementById("wishModal").style.display = "none"; }
let orderCache = null;
function getOrdersOnce(){
  if(orderCache) return Promise.resolve(orderCache);
  return fetch(SB_URL + "/rest/v1/orders?select=items&order=waktu.desc&limit=500", {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }
  }).then(r => r.json()).then(a => {
    orderCache = Array.isArray(a) ? a : [];
    return orderCache;
  }).catch(() => []);
}
function paintTogether(){
  const box = document.getElementById("togetherBox");
  if(!box || !detailCur) return;
  const cats = catsOf(detailCur.page);
  const cur = cats[detailCur.i].items[detailCur.j];
  getOrdersOnce().then(orders => {
    if(!detailCur || !document.getElementById("togetherBox")) return;
    try {
      const freq = {};
      orders.forEach(o => {
        let det = [];
        try { det = JSON.parse(o.items) || []; } catch(e) {}
        if(!Array.isArray(det)) return;
        const names = det.map(d => String(d.n || ""));
        if(names.indexOf(cur.name) === -1) return;
        names.forEach(nm => { if(nm && nm !== cur.name) freq[nm] = (freq[nm] || 0) + 1; });
      });
      const top = Object.keys(freq).map(k => ({ k: k, v: freq[k] }))
        .sort((a, b) => b.v - a.v).slice(0, 3)
        .map(o => ({ k: o.k, v: o.v, r: resolveWish(o.k) }))
        .filter(o => o.r);
      if(!top.length){ box.style.display = "none"; return; }
      box.style.display = "";
      box.innerHTML = `<b>${tr("together")}</b>` + top.map(o =>
        `<div class="mrow"><div class="grow"><strong>${escWish(o.k).slice(0, 50)}</strong><br>` +
        `<span style="color:var(--blue2);font-weight:600;">Rp ${Number(o.r.item.price || 0).toLocaleString("id-ID")}</span> ` +
        `<span style="color:var(--mut);font-size:12px;">• ${o.v}x ${tr("bought_with")}</span></div>` +
        `<button class="del" style="background:var(--blue);" onclick="togetherAdd('${o.r.page}',${o.r.i},${o.r.j})">🛒</button></div>`
      ).join("");
    } catch(e) {}
  });
}
function togetherAdd(page, i, j){
  try {
    const cats = catsOf(page);
    const item = cats[i].items[j];
    if(item.stock === 0){ alert(tr("habis_alert")); return; }
    cart.push({...item, categoryImg: cats[i].img, category: cats[i].name, page: page});
    logAksi("keranjang", item.name, cats[i].name, item.price, page);
    trackClick("tambah_keranjang", item.name, cats[i].name);
    if(typeof gtag === "function"){
      trackGaEcommerce("add_to_cart", item, cats[i].name, cats[i].name, j);
      if (window.RS_Pixels) RS_Pixels.mapEvent("tambah_keranjang", { nama_produk: item.name, price: item.price, currency: "IDR", kategori: cats[i].name });
    }
    syncCart();
    closeDetail();
    openCartModal();
  } catch(e) {}
}
function wishRemove(nm){
  saveWish(wishList().filter(x => x !== nm));
  syncWishCount();
  syncWishBtns(nm);
  openWishModal();
}
function wishRemoveAt(idx){
  const w = wishList();
  const nm = w[idx];
  w.splice(idx, 1);
  saveWish(w);
  syncWishCount();
  if(nm) syncWishBtns(nm);
  openWishModal();
}
function wishAdd(page, i, j){
  try {
    const cats = catsOf(page);
    const item = cats[i].items[j];
    if(item.stock === 0){ alert(tr("habis_alert")); return; }
    cart.push({...item, categoryImg: cats[i].img, category: cats[i].name, page: page});
    logAksi("keranjang", item.name, cats[i].name, item.price, page);
    trackClick("tambah_keranjang", item.name, cats[i].name);
    if(typeof gtag === "function"){
      trackGaEcommerce("add_to_cart", item, cats[i].name, cats[i].name, j);
      if (window.RS_Pixels) RS_Pixels.mapEvent("tambah_keranjang", { nama_produk: item.name, price: item.price, currency: "IDR", kategori: cats[i].name });
    }
    syncCart();
    closeWishModal();
    openCartModal();
  } catch(e) {}
}

// Cache data Sheet terakhir di browser: kalau fetch lambat/gagal, tampilkan cache
// (bukan data kode lama) supaya kategori baru tidak hilang-timbul.
function loadCached(sheet){
  try {
    const raw = localStorage.getItem("rs_" + sheet);
    if(!raw) return [];
    const o = JSON.parse(raw);
    if(!o || !o.t || (Date.now() - o.t) > 7 * 24 * 3600 * 1000) return [];
    return Array.isArray(o.data) ? o.data : [];
  } catch(e){ return []; }
}

function saveCached(sheet, data){
  try { localStorage.setItem("rs_" + sheet, JSON.stringify({ t: Date.now(), data: data })); } catch(e){}
}

function hasKatArr(arr){
  return arr.length > 0 && arr.some(o => String(o.kategori || "").trim() !== "");
}

let infoTeksValue = "";
let kursRM = 3600;
function rmFmt(rp){
  rp = Number(rp) || 0;
  if(rp <= 0) return "";
  const selected = currency();
  const code = selected === "IDR" || !RS_CURRENCY_INFO[selected] ? "MYR" : selected;
  const info = RS_CURRENCY_INFO[code];
  const rate = code === "MYR" ? (kursRM > 0 ? 1 / kursRM : 0) : (RS_CURRENCIES[code] || 0);
  if(!(rate > 0)) return "";
  const value = rp * rate;
  return "≈ " + info.sym + " " + value.toLocaleString(info.loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function applyInfoTeks(){
  const el = document.getElementById("customrun");
  const hd = document.querySelector("header");
  if(!el) return;
  if(infoTeksValue){
    el.innerHTML = "<span>" + infoTeksValue + " • " + infoTeksValue + "</span>";
    el.style.display = "";
    if(hd) hd.style.top = "74px";
  } else {
    el.style.display = "none";
    if(hd) hd.style.top = "37px";
  }
}

function applySnap(b, t, a, j, info){
  infoTeksValue = "";
  if (hasKatArr(b)) rebuildFromSheet(b, brainrotCategories);
  else if (b.length) mergeFromSheet(b);
  if (Array.isArray(t) && t.length) rebuildFromSheet(t, topupCategories);
  if (hasKatArr(a)) rebuildFromSheet(a, akunCategories);
  else if (a.length) mergeFromSheet(a);
  if (Array.isArray(j) && j.length) rebuildFromSheet(j, jokiCategories);
  // Prioritas: sheet Info baru (tab "Info", baris INFO_TEKS). Kalau ada, timpa fallback Brainrot.
  if (Array.isArray(info)) {
    for (var i = 0; i < info.length; i++) {
      var io = info[i];
      if (String(io.name || "").trim() === "INFO_TEKS") { infoTeksValue = String(io.deskripsi || "").trim(); }
      if (String(io.name || "").trim() === "INFO_KURS") { const k = Number(String(io.deskripsi || "").replace(/[^0-9.]/g, "")); if(k > 0) kursRM = k; }
    }
    // Kalau tab Info belum punya baris INFO_TEKS, biarkan fallback dari Brainrot (masa migrasi).
  }
  applyInfoTeks();
}

function buildCodeImg(){
  const codeImg = {};
  [brainrotCategories, topupCategories, akunCategories, jokiCategories].forEach(cats =>
    cats.forEach(c => {
      const ck = "CAT:" + String(c.name).trim();
      if (c.img && !codeImg[ck]) codeImg[ck] = c.img;
      c.items.forEach(it => {
        const k = String(it.name).trim();
        if (!(k in codeImg)) {
          codeImg[k] = (it.images && it.images[0]) || it.img || "";
          if (it.images && it.images.length > 1) codeImg[k + "||IMAGES"] = it.images;
        }
      });
    }));
  return codeImg;
}

// Bangun ulang 1 halaman katalog dari 1 tab Sheet (sistem sama untuk Brainrot & Akun).
// Tab Sheet: name | kategori | price | stock | soldout | image | sold
// Baris name = "CAT:<nama kategori>" = foto display kategori (tidak tampil sebagai produk).
function rebuildFromSheet(arr, targetCats){
  const codeImg = buildCodeImg();
  const groups = {};
  const order = [];
  const catImgSheet = {};
  arr.forEach(o => {
    const nm = String(o.name || "").trim();
    if (!nm || nm.indexOf("CAT:") !== 0) return;
    const targetKat = String(o.kategori || nm.slice(4)).trim() || nm.slice(4).trim();
    const f = splitFiles(o.image)[0] || "";
    if (targetKat && f) catImgSheet[targetKat] = f;
  });
          arr.forEach(o => {
            const name = String(o.name || "").trim();
            if (!name) return;
            if (name === "INFO_TEKS") { infoTeksValue = String(o.deskripsi || "").trim(); return; }
            if (name.indexOf("CAT:") === 0) {
              const categoryName = String(o.kategori || name.slice(4)).trim() || name.slice(4).trim();
              if (categoryName && !groups[categoryName]) {
                groups[categoryName] = { name: categoryName, img: catImgSheet[categoryName] || codeImg["CAT:" + categoryName] || "", items: [] };
                order.push(categoryName);
              }
              return;
            }
    const kat = String(o.kategori || "Lainnya").trim() || "Lainnya";
    if (!groups[kat]) { groups[kat] = { name: kat, img: catImgSheet[kat] || codeImg["CAT:" + kat] || "", items: [] }; order.push(kat); }
    let files = splitFiles(o.image);
    if (!files.length && codeImg[name + "||IMAGES"]) files = codeImg[name + "||IMAGES"];
    if (!files.length && codeImg[name]) files = [codeImg[name]];
    const flagged = /^(ya|y|yes|habis|sold)/i.test(String(o.soldout || "").trim());
            const it = { name: name, price: Number(o.price) || 0, stock: flagged ? 0 : (Number(o.stock) || 0), img: files[0] || "" };
            if (Number(o.sold) > 0) it.sold = Number(o.sold);
            it.dilihat = Number(o.dilihat) || 0;
            if (String(o.deskripsi || "").trim()) it.deskripsi = String(o.deskripsi).trim();
            if (Number(o.coret) > it.price) it.originalPrice = Number(o.coret);
    if (files.length > 1) it.images = files;
    const g = groups[kat];
    it._ord = g.items.length;
    g.items.push(it);
    if (!g.img && files[0]) g.img = files[0];
  });
  Object.keys(catImgSheet).forEach(k => { if (groups[k]) groups[k].img = catImgSheet[k]; });
  // Stok tersedia selalu di atas, habis tenggelam (urutan asli terjaga di dalamnya)
  Object.keys(groups).forEach(k => {
    groups[k].items.sort((a, b) => (((b.stock || 0) > 0) - ((a.stock || 0) > 0)) || (a._ord - b._ord));
    groups[k].items.forEach(it => { delete it._ord; });
  });
  targetCats.length = 0;
  order.forEach(k => targetCats.push(groups[k]));
}

function mergeFromSheet(arr){
  const map = {};
        arr.forEach(o => { map[String(o.name).trim()] = { stock: Number(o.stock), price: Number(o.price), coret: Number(o.coret) || 0, deskripsi: String(o.deskripsi || ""), dilihat: Number(o.dilihat) || 0, soldout: String(o.soldout || "").trim().toUpperCase(), image: String(o.image || "").trim(), sold: Number(o.sold) }; });
  [brainrotCategories, topupCategories, akunCategories, jokiCategories].forEach(cats =>
    cats.forEach(c => {
      const catKey = "CAT:" + String(c.name).trim();
      if (catKey in map && map[catKey].image) {
        const cf = splitFiles(map[catKey].image);
        if (cf.length) c.img = cf[0];
      }
      c.items.forEach(it => {
      const k = String(it.name).trim();
      if (k in map) {
        const v = map[k];
        const flagged = /^(ya|y|yes|habis|sold)/i.test(v.soldout);
              it.stock = flagged ? 0 : v.stock;
              if (v.price > 0) it.price = v.price;
              if (v.sold > 0) it.sold = v.sold;
              it.dilihat = v.dilihat;
              it.deskripsi = String(v.deskripsi || "").trim() || null;
              if (v.coret > it.price) it.originalPrice = v.coret;
              else if (!(v.coret > 0)) it.originalPrice = null;
        if (v.image) {
          const files = splitFiles(v.image);
          if (files.length > 1) { it.img = files[0]; it.images = files; }
          else if (files.length === 1) { it.img = files[0]; it.images = null; }
        }
      }
      });
    })
  );
}

function hideLoader(){ const l = document.getElementById("loader"); if(l) l.classList.add("hide"); }

function loadLiveStock(){
  try {
    applySnap(loadCached("Brainrot"), loadCached("Topup"), loadCached("Akun"), loadCached("Joki"), loadCached("Info"));
    applyLang();
    render();
    try { paintHot(); } catch(e) {}
    try { if(!applyDeepLink(false)) updateUrl(); } catch(e) {}
    hideLoader();
  } catch(e) {}
  const once = () => Promise.all([fetchSheet("Brainrot", "__stockCb"), fetchSheet("Topup", "__topupCb"), fetchSheet("Akun", "__akunCb"), fetchSheet("Joki", "__jokiCb"), fetchSheet("Info", "__infoCb")]);
  return once().then(res => {
    if (res[0] === null || res[1] === null) return once(); // timeout/gagal: coba sekali lagi
    return res;
  }).then(res => {
    const b = res[0] || [], t = res[1] || [], a = res[2] || [], jk = res[3] || [], info = res[4] || [];
    try {
      const catalogAlreadyLoaded = [brainrotCategories, topupCategories, akunCategories, jokiCategories]
        .some(function(categories){ return categories.length > 0; });
      // On a first visit there may be no cached catalog yet. Keep the fresh data in
      // memory even if the visitor has started scrolling so Hot Product can resolve
      // its cards without forcing a page-wide rerender or moving their scroll position.
      if(!userMoved || !catalogAlreadyLoaded) applySnap(b, t, a, jk, info);
      if (b.length) saveCached("Brainrot", b);
      if (t.length) saveCached("Topup", t);
      if (a.length) saveCached("Akun", a);
      if (jk.length) saveCached("Joki", jk);
      if (info.length) saveCached("Info", info);
    } catch(e) {}
  });
}

// Pengaman: loader tidak boleh nyangkut apapun yang terjadi.
window.addEventListener("error", function(){ hideLoader(); });
setTimeout(function(){ hideLoader(); }, 6000);

/* Hindari memaksa pemulihan posisi setelah katalog selesai dirender ulang. */
var userMoved = false;
try {
  ["touchmove", "wheel", "pointerdown", "keydown"].forEach(function(ev){
    window.addEventListener(ev, function(){ userMoved = true; }, { passive: true });
  });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
} catch(e) {}

/* Tulisan berjalan TETAP ikut saat scroll (permintaan owner): seluruh bar atas
   (marquee + header) selalu menempel (sticky) dan tidak pernah disembunyikan. */

loadLiveStock().then(() => {
  /* Deep link sudah diterapkan bersama cache sebelum permintaan jaringan berjalan.
     Setelah ada interaksi, jangan render ulang seluruh halaman: perubahan tinggi konten
     dapat membuat browser mengunci posisi scroll ke footer. */
  if(!userMoved){
    try { applyLang(); } catch(e) {}
    try { render(); } catch(e) {}
    try { if(!applyDeepLink(false)) updateUrl(); } catch(e) {}
  }
  try { paintHot(); } catch(e) {}
  try { syncWishCount(); } catch(e) {}
  try { let searchTimer = null;
/* Saran instan (ringan, maks 6) — render penuh ditunda biar ketikan tidak nyendat */
function searchSuggestNow(){
  const inp = document.getElementById("searchInput");
  const q = inp.value.toLowerCase().trim();
  if(q === ""){ sugHide(); return; }
  const out = [];
  const pages = ["brainrot", "topup", "akun"];
  for(let p = 0; p < pages.length && out.length < 6; p++){
    const cats = catsOf(pages[p]);
    for(let i = 0; i < cats.length && out.length < 6; i++)
      for(let j = 0; j < cats[i].items.length && out.length < 6; j++){
        const it = cats[i].items[j];
        if((cats[i].name + " " + it.name).toLowerCase().includes(q))
          out.push({ page: pages[p], i: i, j: j, cname: cats[i].name, item: it });
      }
  }
  sugShow(q, out);
}
function searchType(){
  searchSuggestNow();
  if(searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(searchCatalog, 200);
}
document.getElementById("searchInput").addEventListener("input", searchType); } catch(e) {}
  hideLoader();
});
