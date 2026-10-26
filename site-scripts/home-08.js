
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
  return out.slice(0, 4);
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
    <div class="flashbody" id="flashbody" style="display:none;"><div class="itemgrid">${cards}</div></div>
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

/* ===== bahasa ID/EN ===== */
const I18N = {
id: {
search_ph: "Cari item, misal: moon bloom, robux...", cart: "🛒 Keranjang",
kicker: "#1 STORE BRAINROT TERLENGKAP DI INDONESIA DAN MALAYSIA",
channel: "📢 Join Saluran WhatsApp", cta_brainrot: "Katalog Brainrot 🧠", cta_topup: "Top Up Robux 💰", cta_akun: "Katalog Akun 👤", cta_joki: "Joki 🎮",
st1: "Testimoni amanah", st2: "Proses hitungan menit", st3: "Semua payment", st4: "Ribuan item & pet",
cb_title: "Cara Beli 🎮", cb_sub: "5 langkah gampang, ikuti gambarnya ya!",
s1t: "Pilih mainanmu", s2t: "Cek keranjang", s3t: "Chat admin", s4t: "Bayar", s5t: "Item datang!",
foot_wa: "No WA Admin:", back: "← Kembali", back_home: "← Beranda",
nav_home: "Beranda", nav_akun: "Akun Sepuh Roblox Berbagai Map", nav_topup: "Top Up Robux", nav_joki: "Joki Sepuh Berbagai Map",
  nav_akun_bn: "Akun Sepuh", nav_brainrot_bn: "Brainrot", nav_joki_bn: "Joki Sepuh", nav_flash_bn: "Flash Sale",
cat_brainrot: "Katalog Brainrot", cat_akun: "Katalog Akun", cat_topup: "Top Up", cat_joki: "Joki",
cat_sub: "kategori — klik untuk lihat item", cat_empty: "Katalog kosong", cat_empty_x: "Data belum termuat (koneksi lambat).",
cat_empty_msg: "😢 Katalog belum tampil. Biasanya karena sinyal.", reload: "🔄 Muat Ulang",
mulai: "Mulai Belanja", pilih_sub: "Pilih kategori di bawah ini",
hasil: "Hasil pencarian", cocok_a: "item cocok dengan", none_a: "Tidak ada item cocok dengan",
add_cart: "Tambah ke Keranjang", sold_out_btn: "Stok Habis", habis: "HABIS", habis_txt: "Stok habis",
stock: "Stok:", stock_na: "Stok: -", sold_w: "terjual", kilat: "⚡ Proses kilat", safe: "🛡️ SAFE 100%", verified: "VERIFIED",
hubungi: "Hubungi admin untuk harga", more_a: "Lihat Selengkapnya", more_b: "lagi", hemat: "HEMAT",
tutup: "Tutup", lihat: "Lihat", checkout: "Checkout", batal: "Batal", cart_title: "📋 Keranjang Saya",
lanjut: "Lanjut Belanja", preview: "📸 Preview Pesanan", kirim: "✓ Kirim ke Admin",
kosong: "Keranjang kosong!", habis_alert: "Maaf, item ini sudah habis!",
cancel_q: "Yakin ingin membatalkan checkout? Semua item akan dihapus.",
dilihat_w: "dilihat", wish_title: "❤️ Wishlist Saya", hapus: "Hapus",
recent_t: "🕘 Terakhir dilihat", together: "🎞️ Sering dibeli bersama", bought_with: "dibeli bersama",
hot_t: "🔥 Paling Banyak Diklik", clicked: "diklik",
sold_done: "Sudah laku", rest_stock: "Sisa stok", avail_stock: "Stok tersedia",
low_a: "Sisa", low_b: "lagi, buruan sebelum habis!", avail: "TERSEDIA",
server_t: "🔗 Link Server Rock Star", server_sub: "Klik server untuk join langsung dari Roblox",
wa_t: "Butuh bantuan?", wa_btn: "Chat WhatsApp", testi_t: "⭐ Testimoni Customer", testi_btn: "Lihat Testimoni",
b_brain_t: "🧠 Katalog Brainrot", b_top_t: "💰 Top Up", b_akun_t: "👤 Akun Roblox",
b_brain_d: "Solusi sepuh roblox kamu — puluhan kategori item.", b_top_d: "Top up Robux & gamepass harga terbaik.", b_akun_d: "Akun sepuh Roblox berbagai map, data polos — siap pakai.",
b_joki_t: "🎮 Joki Roblox", b_joki_d: "Jasa joki sepuh berbagai map, cepat & aman, harga bersaing.",
lihat: "Lihat", server_t: "🔗 Link Server Rock Star", server_sub: "Klik server untuk join langsung dari Roblox",
cart_title: "📋 Keranjang Saya", lanjut: "Lanjut Belanja", wish_title: "❤️ Wishlist Saya",
testi_t: "⭐ Testimoni Customer", testi_btn: "Lihat Testimoni", wa_t: "Butuh bantuan?", wa_btn: "Chat WhatsApp",
wa_online: "Online", wa_ph: "Ketik pesan...",
wa_greet: "Halo! 👋 Ada yang bisa dibantu? Ketik di bawah, langsung tersambung ke WA admin.",
flash_t: "⚡ FLASH SALE", flash_click: "👆 Klik Flash Sale untuk melihat barang diskon", flash_fomo: "🔥 Buruan! Keburu habis:", flash_btn: "⚡ Flash Sale",
nav_testi: "Testimoni", rc_bub: "Butuh bantuan? Chat <b>Min Rock</b> aja 💬",
},
en: {
search_ph: "Search items, e.g.: moon bloom, robux...", cart: "🛒 Cart",
kicker: "#1 MOST COMPLETE BRAINROT STORE IN INDONESIA AND MALAYSIA",
channel: "📢 Join WhatsApp Channel", cta_brainrot: "Brainrot Catalog 🧠", cta_topup: "Top Up Robux 💰", cta_akun: "Account Catalog 👤", cta_joki: "Joki 🎮",
st1: "Trusted reviews", st2: "Minutes-fast process", st3: "All payments", st4: "Thousands of items & pets",
cb_title: "How to Buy 🎮", cb_sub: "5 easy steps, follow the pictures!",
s1t: "Pick your item", s2t: "Check cart", s3t: "Chat admin", s4t: "Pay", s5t: "Item arrives!",
foot_wa: "Admin WA:", back: "← Back", back_home: "← Home",
nav_home: "Home", nav_akun: "Pro Account", nav_topup: "Robux Top Up", nav_joki: "Boosting",
  nav_akun_bn: "Sepuh Account", nav_brainrot_bn: "Brainrot", nav_joki_bn: "Sepuh Boost", nav_flash_bn: "Flash Sale",
cat_brainrot: "Brainrot Catalog", cat_akun: "Account Catalog", cat_topup: "Top Up", cat_joki: "Joki",
cat_sub: "categories — click to view items", cat_empty: "Empty catalog", cat_empty_x: "Data not loaded (slow connection).",
cat_empty_msg: "😢 Catalog not showing. Usually the signal.", reload: "🔄 Reload",
mulai: "Start Shopping", pilih_sub: "Choose a category below",
hasil: "Search results", cocok_a: "items matching", none_a: "No items match",
add_cart: "Add to Cart", sold_out_btn: "Sold Out", habis: "SOLD OUT", habis_txt: "Out of stock",
stock: "Stock:", stock_na: "Stock: -", sold_w: "sold", kilat: "⚡ Fast process", safe: "🛡️ 100% SAFE", verified: "VERIFIED",
hubungi: "Contact admin for price", more_a: "See More", more_b: "more", hemat: "SAVE",
tutup: "Close", lihat: "View", checkout: "Checkout", batal: "Cancel", cart_title: "📋 My Cart",
lanjut: "Continue Shopping", preview: "📸 Order Preview", kirim: "✓ Send to Admin",
kosong: "Cart is empty!", habis_alert: "Sorry, this item is sold out!",
cancel_q: "Cancel checkout? All items will be removed.",
dilihat_w: "views", wish_title: "❤️ My Wishlist", hapus: "Remove",
recent_t: "🕘 Recently viewed", together: "🎞️ Frequently bought together", bought_with: "bought together",
hot_t: "🔥 Most Clicked", clicked: "clicks",
sold_done: "Sold", rest_stock: "Stock left", avail_stock: "Available stock",
low_a: "Only", low_b: "left, hurry before it's gone!", avail: "AVAILABLE",
server_t: "🔗 Rock Star Server Links", server_sub: "Click a server to join straight from Roblox",
wa_t: "Need help?", wa_btn: "Chat WhatsApp", wa_online: "Online", wa_ph: "Type a message...",
wa_greet: "Hi! 👋 Need anything? Type below, straight to admin WA.", testi_t: "⭐ Customer Reviews", testi_btn: "See Reviews",
b_brain_t: "🧠 Brainrot Catalog", b_top_t: "💰 Top Up", b_akun_t: "👤 Roblox Accounts",
b_brain_d: "Your roblox upgrade solution — dozens of item categories.", b_top_d: "Top up Robux & gamepasses at the best price.", b_akun_d: "Pro-level accounts, fresh data, many maps — ready to use.",
b_joki_t: "🎮 Joki Roblox", b_joki_d: "Jasa joki sepuh berbagai map, cepat & aman, harga bersaing.",
lihat: "View", cart_title: "📋 My Cart", lanjut: "Continue Shopping", wish_title: "❤️ My Wishlist",
flash_t: "⚡ FLASH SALE", flash_click: "👆 Click Flash Sale to see discounted items", flash_fomo: "🔥 Hurry! Selling out:", flash_btn: "⚡ Flash Sale",
nav_testi: "Reviews", rc_bub: "Need help? Just chat <b>Min Rock</b> 💬",
}};
/* ====== I18N: ja・ko・zh・fr・th・vi (terjemahan penuh) ====== */
I18N.ja = { search_ph:"アイテムを検索  例: moon bloom, robux...", cart:"🛒 カート", kicker:"#1 ブレインロットストア — インドネシア＆マレーシア最大級", channel:"📢 WhatsAppチャンネルに参加", cta_brainrot:"ブレインロット一覧 🧠", cta_topup:"Robux チャージ 💰", cta_akun:"アカウント一覧 👤", cta_joki:"ブースト 🎮", st1:"信頼できるレビュー", st2:"数分で処理完了", st3:"全決済対応", st4:"数千のアイテム＆ペット", cb_title:"買い方 🎮", cb_sub:"5つの簡単ステップ、画像に従ってね!", s1t:"商品を選ぶ", s2t:"カートを確認", s3t:"管理人に連絡", s4t:"支払う", s5t:"アイテム到着!", foot_wa:"管理人のWA番号:", back:"← 戻る", back_home:"← ホーム", nav_home:"ホーム", nav_akun:"各マップの上級アカウント", nav_topup:"Robuxチャージ", nav_joki:"ブースト", nav_akun_bn:"上級アカウント", nav_brainrot_bn:"Brainrot", nav_joki_bn:"ブースト", nav_flash_bn:"Flash Sale", cat_brainrot:"ブレインロット一覧", cat_akun:"アカウント一覧", cat_topup:"チャージ", cat_joki:"ブースト", cat_sub:"カテゴリー — クリックしてアイテムを表示", cat_empty:"カタログが空です", cat_empty_x:"データ未読み込み（接続が遅い）", cat_empty_msg:"😢 カタログが表示されません。たぶん電波が弱いです。", reload:"🔄 再読み込み", mulai:"ショッピング開始", pilih_sub:"下のカテゴリを選択してください", hasil:"検索結果", cocok_a:"件が一致:", none_a:"一致する商品はありません", add_cart:"カートに追加", sold_out_btn:"売り切れ", habis:"売り切れ", habis_txt:"在庫切れです", stock:"在庫:", stock_na:"在庫: -", sold_w:"販売済み", kilat:"⚡ 高速処理", safe:"🛡️ 100%安全", verified:"認証済み", hubungi:"価格は管理人まで", more_a:"もっと見る", more_b:"もっと", hemat:"お得", tutup:"閉じる", lihat:"表示", checkout:"チェックアウト", batal:"キャンセル", cart_title:"📋 カートの中身", lanjut:"買い物を続ける", preview:"📸 注文プレビュー", kirim:"✓ 管理人へ送信", kosong:"カートは空です!", habis_alert:"すみません、このアイテムは売り切れです!", cancel_q:"チェックアウトをキャンセルしますか？すべてのアイテムが削除されます。", dilihat_w:"回閲覧", wish_title:"❤️ お気に入り", hapus:"削除", recent_t:"🕘 閲覧履歴", together:"🎞️ よく一緒に買われる物", bought_with:"と一緒に購入", hot_t:"🔥 最多クリック", clicked:"クリック", sold_done:"販売済み", rest_stock:"残り在庫", avail_stock:"販売中の在庫", low_a:"残り", low_b:"個！お早めに!", avail:"販売中", server_t:"🔗 Rock Star サーバー一覧", server_sub:"サーバーをクリックするとRobloxに直接参加", wa_t:"お困りですか？", wa_btn:"WhatsAppで相談", testi_t:"⭐ カスタマーレビュー", testi_btn:"レビューを見る", b_brain_t:"🧠 ブレインロット一覧", b_top_t:"💰 チャージ", b_akun_t:"👤 Robloxアカウント", b_brain_d:"Robloxをレベルアップする解決策 — 何十カテゴリーのアイテム。", b_top_d:"最安値でRobux＆ゲームパスをチャージ。", b_akun_d:"各マップの上級アカウント、データ新品 — すぐ使える。", b_joki_t:"🎮 Robloxブースト", b_joki_d:"各マップのブーストサービス — 迅速・安全・お得。", wa_online:"オンライン", wa_ph:"メッセージを入力...", wa_greet:"こんにちは! 👋 何かお手伝いできますか？下に入力すると、すぐ管理人のWAに繋がります。", flash_t:"⚡ FLASH SALE", flash_click:"👆 「Flash Sale」をクリックして値引き品を見る", flash_fomo:"🔥 急いで! すぐなくなるよ:", flash_btn:"⚡ Flash Sale", nav_testi:"レビュー", rc_bub:"助けが必要？ <b>Min Rock</b> に話しかけてね 💬", lang_btn:"言語", cur_btn:"通貨" };
I18N.ja.hero_h1 = '<span>ROBLOX</span> を極める解決策 🇮🇩🇲🇾';
I18N.ja.hero_p = 'アイテムは安く、処理は早く、決済も全対応。100,000人以上のカスタマーが信頼、レビューも誠実。Rockstar Storeはプレミアム品質のブレインロットとプレミアムアカウントを提供し、あなたのRobloxを他より<b style="color:var(--blue2);">セレブ</b>にします。友だちはきっと嫉妬して焦ります。<b style="color:var(--blue2);">いま格上げして、すべてのゲームを支配しよう! 🚀</b>';
I18N.ja.run_html = '⚡ 高速処理 • 💰 最安値 • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">WAチャンネルに参加</a> • ⚡ 高速処理 • 💰 最安値 • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">WAチャンネルに参加</a>';
I18N.ja.s1x = '見てまわって <b>カートに追加</b> を押す 🛒';
I18N.ja.s2x = '🛒 を開いて注文を確認し、<b>チェックアウト</b> を押す。';
I18N.ja.s3x = '<b>✓ 管理人へ送信</b> を押すと、WAが勝手に開く。';
I18N.ja.s4x = 'QRISで支払い、領収書を管理人へ送る。';
I18N.ja.s5x = '管理人がゲーム内でアイテムを送る。良いゲームを! 🚀';
I18N.ja.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — Robloxを極める解決策';
I18N.ja.testi_x = '10万+の信頼できるレビュー。下のボタンをクリックしてWAチャンネルで見る';
I18N.ja.wa_x = '下のボタンを押すとすぐ ROCKSTAR 管理人のWAへ';
I18N.ja.wish_empty = '🤍 まだお気に入りはありません。<br>商品写真のハートをタップして保存。';
I18N.ko = { search_ph:"아이템 검색, 예: moon bloom, robux...", cart:"🛒 장바구니", kicker:"#1 브레인로트 매장 — 인도네시아 & 말레이시아 최다 컬렉션", channel:"📢 WhatsApp 채널 참여", cta_brainrot:"브레인로트 목록 🧠", cta_topup:"Robux 충전 💰", cta_akun:"계정 목록 👤", cta_joki:"부스팅 🎮", st1:"믿을 수 있는 리뷰", st2:"몇 분 만에 처리", st3:"모든 결제 방식", st4:"수천 아이템 & 펫", cb_title:"구매 방법 🎮", cb_sub:"쉬운 5단계, 그림을 따라 하세요!", s1t:"아이템 선택", s2t:"장바구니 확인", s3t:"관리자에게 연락", s4t:"결제", s5t:"아이템 도착!", foot_wa:"관리자 WA 번호:", back:"← 뒤로", back_home:"← 홈", nav_home:"홈", nav_akun:"여러 맵의 상급 계정", nav_topup:"Robux 충전", nav_joki:"부스팅", nav_akun_bn:"상급 계정", nav_brainrot_bn:"Brainrot", nav_joki_bn:"부스팅", nav_flash_bn:"Flash Sale", cat_brainrot:"브레인로트 목록", cat_akun:"계정 목록", cat_topup:"충전", cat_joki:"부스팅", cat_sub:"카테고리 — 클릭해서 아이템 보기", cat_empty:"목록이 비었습니다", cat_empty_x:"데이터 미로딩 (연결이 느림)", cat_empty_msg:"😢 목록이 안 보여요. 보통 신호 문제예요.", reload:"🔄 다시 불러오기", mulai:"쇼핑 시작", pilih_sub:"아래 카테고리를 고르세요", hasil:"검색 결과", cocok_a:"개 일치:", none_a:"일치하는 아이템이 없어요", add_cart:"장바구니에 추가", sold_out_btn:"품절", habis:"품절", habis_txt:"재고 없음", stock:"재고:", stock_na:"재고: -", sold_w:"판매됨", kilat:"⚡ 빠른 처리", safe:"🛡️ 100% 안전", verified:"인증됨", hubungi:"가격은 관리자에게 문의", more_a:"더 보기", more_b:"더 많이", hemat:"할인", tutup:"닫기", lihat:"보기", checkout:"체크아웃", batal:"취소", cart_title:"📋 내 장바구니", lanjut:"쇼핑 계속", preview:"📸 주문 미리보기", kirim:"✓ 관리자에게 전송", kosong:"장바구니가 비었습니다!", habis_alert:"죄송합니다, 이 아이템은 품절입니다!", cancel_q:"체크아웃을 취소할까요? 모든 아이템이 삭제됩니다.", dilihat_w:"회 조회", wish_title:"❤️ 내 위시리스트", hapus:"삭제", recent_t:"🕘 최근 본 상품", together:"🎞️ 자주 함께 구매", bought_with:"함께 구매", hot_t:"🔥 클릭 수 TOP", clicked:"클릭", sold_done:"판매 완료", rest_stock:"남은 재고", avail_stock:"주문 가능 재고", low_a:"남은", low_b:"개 남았어요, 서둘러!", avail:"구매 가능", server_t:"🔗 Rock Star 서버 링크", server_sub:"서버를 클릭하면 Roblox에서 바로 참가", wa_t:"도움이 필요하신가요?", wa_btn:"WhatsApp 채팅", testi_t:"⭐ 고객 후기", testi_btn:"후기 보기", b_brain_t:"🧠 브레인로트 목록", b_top_t:"💰 충전", b_akun_t:"👤 Roblox 계정", b_brain_d:"Roblox 상급 해결책 — 수십 개 카테고리의 아이템.", b_top_d:"최저가로 Robux & 게임패스 충전.", b_akun_d:"여러 맵의 상급 계정, 깨끗한 데이터 — 바로 사용 가능.", b_joki_t:"🎮 Roblox 부스팅", b_joki_d:"여러 맵 부스팅 서비스 — 빠르고 안전, 가격도 합리적.", wa_online:"온라인", wa_ph:"메시지 입력...", wa_greet:"안녕하세요! 👋 무엇을 도와드릴까요? 아래에 입력하면 곧바로 관리자의 WA로 연결됩니다.", flash_t:"⚡ FLASH SALE", flash_click:"👆 Flash Sale 클릭해서 세일 상품 보기", flash_fomo:"🔥 서둘러! 곧 품절되는:", flash_btn:"⚡ Flash Sale", nav_testi:"후기", rc_bub:"도움 필요? 그냥 <b>Min Rock</b>에게 채팅 💬", lang_btn:"언어", cur_btn:"통화" };
I18N.ko.hero_h1 = '<span>ROBLOX</span> 상급의 해결책 🇮🇩🇲🇾';
I18N.ko.hero_p = '아이템은 저렴하고, 처리는 빠르고, 모든 결제 가능. 100,000명 이상 고객이 신뢰하고 후기도 성실함. Rockstar Store는 프리미엄 브레인로트와 프리미엄 계정을 제공해 Roblox를 다른 것보다 <b style="color:var(--blue2);">상류층</b>으로 만듭니다. 친구들이 분명 질투하고 땀 흘릴 거예요. <b style="color:var(--blue2);">지금 레벨업해 모든 게임을 지배하세요! 🚀</b>';
I18N.ko.run_html = '⚡ 빠른 처리 • 💰 최저가 • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">WA 채널 참여</a> • ⚡ 빠른 처리 • 💰 최저가 • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">WA 채널 참여</a>';
I18N.ko.s1x = '여기저기 둘러보다 <b>장바구니에 추가</b> 누르기 🛒';
I18N.ko.s2x = '🛒 열어 주문을 확인하고 <b>체크아웃</b> 누르기.';
I18N.ko.s3x = '<b>✓ 관리자에게 전송</b> 누르면 WA가 저절로 열립니다.';
I18N.ko.s4x = 'QRIS로 결제하고 영수증을 관리자에게 보내세요.';
I18N.ko.s5x = '관리자가 게임 안에서 아이템을 줍니다. 재밌게 놀아요! 🚀';
I18N.ko.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — 당신의 Roblox 상급 해결책';
I18N.ko.testi_x = '10만+ 믿을 수 있는 후기, 아래 버튼을 눌러 WA 채널에서 보기';
I18N.ko.wa_x = '아래 버튼만 누르면 ROCKSTAR 관리자의 WA로 바로 연결';
I18N.ko.wish_empty = '🤍 아직 즐겨찾기가 없어요.<br>상품 사진의 하트를 눌러 저장하세요.';
I18N.zh = { search_ph:"搜索商品，例如 moon bloom、robux...", cart:"🛒 购物车", kicker:"#1 Brainrot 商店 — 印度尼西亚与马来西亚最全", channel:"📢 加入 WhatsApp 频道", cta_brainrot:"Brainrot 目录 🧠", cta_topup:"Robux 充值 💰", cta_akun:"账号目录 👤", cta_joki:"代肝 🎮", st1:"可靠评价", st2:"几分钟完成", st3:"支持全部支付方式", st4:"数千商品与宠物", cb_title:"购买方法 🎮", cb_sub:"5 步搞定，照图操作!", s1t:"选择商品", s2t:"查看购物车", s3t:"联系管理员", s4t:"付款", s5t:"商品到货!", foot_wa:"管理员 WA 号:", back:"← 返回", back_home:"← 首页", nav_home:"首页", nav_akun:"各大地图高级账号", nav_topup:"Robux 充值", nav_joki:"代肝", nav_akun_bn:"高级账号", nav_brainrot_bn:"Brainrot", nav_joki_bn:"代肝", nav_flash_bn:"Flash Sale", cat_brainrot:"Brainrot 目录", cat_akun:"账号目录", cat_topup:"充值", cat_joki:"代肝", cat_sub:"分类 — 点击查看商品", cat_empty:"目录为空", cat_empty_x:"数据未加载（网络较慢）", cat_empty_msg:"😢 目录还没出现，通常是信号问题。", reload:"🔄 重新加载", mulai:"开始购物", pilih_sub:"请在下方选择分类", hasil:"搜索结果", cocok_a:"件匹配:", none_a:"没有匹配的商品", add_cart:"加入购物车", sold_out_btn:"已售罄", habis:"售罄", habis_txt:"没有库存", stock:"库存:", stock_na:"库存: -", sold_w:"已售出", kilat:"⚡ 处理超快", safe:"🛡️ 100% 安全", verified:"已认证", hubungi:"联系管理员询价", more_a:"查看更多", more_b:"更多", hemat:"省钱", tutup:"关闭", lihat:"查看", checkout:"结账", batal:"取消", cart_title:"📋 我的购物车", lanjut:"继续购物", preview:"📸 预览订单", kirim:"✓ 发送给管理员", kosong:"购物车是空的!", habis_alert:"抱歉，该商品已售罄!", cancel_q:"要取消结账吗？所有商品都会被删除。", dilihat_w:"次浏览", wish_title:"❤️ 我的收藏", hapus:"删除", recent_t:"🕘 最近浏览", together:"🎞️ 常一起购买", bought_with:"一起购买", hot_t:"🔥 点击最多", clicked:"次点击", sold_done:"已售出", rest_stock:"剩余库存", avail_stock:"可购库存", low_a:"仅剩", low_b:"件，快抢!", avail:"有货", server_t:"🔗 Rock Star 服务器链接", server_sub:"点击服务器即可直接进入 Roblox", wa_t:"需要帮忙？", wa_btn:"WhatsApp 聊天", testi_t:"⭐ 顾客评价", testi_btn:"查看评价", b_brain_t:"🧠 Brainrot 目录", b_top_t:"💰 充值", b_akun_t:"👤 Roblox 账号", b_brain_d:"Roblox 升级一站式 — 数十个分类的商品。", b_top_d:"超值充值 Robux 和游戏卡。", b_akun_d:"各大地图高级账号，数据干净 — 上手即用。", b_joki_t:"🎮 Roblox 代肝", b_joki_d:"各大地图代肝服务 — 快捷、安全、价格好谈。", wa_online:"在线", wa_ph:"输入消息...", wa_greet:"你好! 👋 需要帮忙吗？在下面输入，直接连接管理员 WhatsApp。", flash_t:"⚡ FLASH SALE", flash_click:"👆 点击 Flash Sale 看打折商品", flash_fomo:"🔥 快抢! 马上就要没了:", flash_btn:"⚡ Flash Sale", nav_testi:"评价", rc_bub:"需要帮忙？直接聊 <b>Min Rock</b> 💬", lang_btn:"语言", cur_btn:"货币" };
I18N.zh.hero_h1 = '你的 <span>ROBLOX</span> 升级专家 🇮🇩🇲🇾';
I18N.zh.hero_p = '商品便宜、处理快速、支付全支持。100,000+ 客户信赖、评价有口皆碑。Rockstar Store 提供高品质 brainrot 与高级账号，让你的 Roblox 比别人更 <b style="color:var(--blue2);">土豪</b>。朋友必定羡慕到冒汗。<b style="color:var(--blue2);">是时候升级并称霸每一场游戏! 🚀</b>';
I18N.zh.run_html = '⚡ 处理飞快 • 💰 最低价 • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">加入 WA 频道</a> • ⚡ 处理飞快 • 💰 最低价 • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">加入 WA 频道</a>';
I18N.zh.s1x = '随便逛逛，按 <b>加入购物车</b> 🛒';
I18N.zh.s2x = '打开 🛒，核对订单，然后按 <b>结账</b>。';
I18N.zh.s3x = '点 <b>✓ 发送给管理员</b>，WhatsApp 自动打开。';
I18N.zh.s4x = '用 QRIS 支付，再把收据发给管理员。';
I18N.zh.s5x = '管理员在游戏里发货。玩得开心! 🚀';
I18N.zh.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — 你的 Roblox 升级专家';
I18N.zh.testi_x = '10 万+ 条可靠评价，点下方按钮到 WhatsApp 频道查看';
I18N.zh.wa_x = '点下方按钮直接跳到 ROCKSTAR 管理员的 WhatsApp';
I18N.zh.wish_empty = '🤍 还没有收藏。<br>点商品照片上的爱心即可收藏。';
I18N.fr = { search_ph:"Rechercher un article, ex. : moon bloom, robux...", cart:"🛒 Panier", kicker:"N°1 DES BOUTIQUES BRAINROT EN INDONÉSIE ET MALAISIE", channel:"📢 Rejoindre le canal WhatsApp", cta_brainrot:"Catalogue Brainrot 🧠", cta_topup:"Recharge Robux 💰", cta_akun:"Catalogue de comptes 👤", cta_joki:"Boosting 🎮", st1:"Avis fiables", st2:"Traité en quelques minutes", st3:"Tous les paiements", st4:"Des milliers d'articles & pets", cb_title:"Comment acheter 🎮", cb_sub:"5 étapes faciles, suivez les images !", s1t:"Choisissez l'article", s2t:"Vérifiez le panier", s3t:"Écrivez à l'admin", s4t:"Payez", s5t:"L'article arrive !", foot_wa:"N° WA de l'admin :", back:"← Retour", back_home:"← Accueil", nav_home:"Accueil", nav_akun:"Comptes PRO pour tous les maps", nav_topup:"Recharge Robux", nav_joki:"Boosting", nav_akun_bn:"Compte PRO", nav_brainrot_bn:"Brainrot", nav_joki_bn:"Boost", nav_flash_bn:"Flash Sale", cat_brainrot:"Catalogue Brainrot", cat_akun:"Catalogue de comptes", cat_topup:"Recharge", cat_joki:"Boosting", cat_sub:"catégories — cliquez pour voir les articles", cat_empty:"Catalogue vide", cat_empty_x:"Données non chargées (connexion lente).", cat_empty_msg:"😢 Le catalogue n'apparaît pas. Souvent lié au réseau.", reload:"🔄 Recharger", mulai:"Commencer les achats", pilih_sub:"Choisissez une catégorie ci-dessous", hasil:"Résultats de recherche", cocok_a:"articles correspondent à", none_a:"Aucun article ne correspond", add_cart:"Ajouter au panier", sold_out_btn:"Épuisé", habis:"ÉPUISÉ", habis_txt:"Rupture de stock", stock:"Stock :", stock_na:"Stock : -", sold_w:"vendus", kilat:"⚡ Processus express", safe:"🛡️ 100% SÛR", verified:"VÉRIFIÉ", hubungi:"Contactez l'admin pour le prix", more_a:"Voir plus", more_b:"encore", hemat:"ÉCONOMIE", tutup:"Fermer", lihat:"Voir", checkout:"Paiement", batal:"Annuler", cart_title:"📋 Mon panier", lanjut:"Continuer les achats", preview:"📸 Aperçu de la commande", kirim:"✓ Envoyer à l'admin", kosong:"Le panier est vide !", habis_alert:"Désolé, cet article est épuisé !", cancel_q:"Annuler le paiement ? Tous les articles seront supprimés.", dilihat_w:"consultations", wish_title:"❤️ Ma liste de souhaits", hapus:"Supprimer", recent_t:"🕘 Vus récemment", together:"🎞️ Souvent achetés ensemble", bought_with:"achetés ensemble", hot_t:"🔥 Les plus cliqués", clicked:"clics", sold_done:"Déjà vendu", rest_stock:"Stock restant", avail_stock:"Stock disponible", low_a:"Plus que", low_b:"en stock, dépêchez-vous !", avail:"DISPONIBLE", server_t:"🔗 Liens des serveurs Rock Star", server_sub:"Cliquez sur un serveur pour rejoindre Roblox", wa_t:"Besoin d'aide ?", wa_btn:"Discuter par WhatsApp", testi_t:"⭐ Avis clients", testi_btn:"Voir les avis", b_brain_t:"🧠 Catalogue Brainrot", b_top_t:"💰 Recharge", b_akun_t:"👤 Comptes Roblox", b_brain_d:"Pour faire évoluer votre Roblox — des dizaines de catégories d'articles.", b_top_d:"Rechargez Robux & gamepasses au meilleur prix.", b_akun_d:"Comptes PRO pour tous les maps, données propres — prêts à l'emploi.", b_joki_t:"🎮 Boost Roblox", b_joki_d:"Boost tous les maps — rapide, sûr, prix serrés.", wa_online:"En ligne", wa_ph:"Tapez un message...", wa_greet:"Salut ! 👋 Besoin de quelque chose ? Écrivez ci-dessous, direct sur le WA de l'admin.", flash_t:"⚡ FLASH SALE", flash_click:"👆 Cliquez sur Flash Sale pour voir les articles en promo", flash_fomo:"🔥 Dépêchez-vous ! Bientôt épuisé :", flash_btn:"⚡ Flash Sale", nav_testi:"Avis", rc_bub:"Besoin d'aide ? Écrivez à <b>Min Rock</b> 💬", lang_btn:"Langue", cur_btn:"Devise" };
I18N.fr.hero_h1 = 'LA SOLUTION <span>ROBLOX</span> PRO POUR TOI 🇮🇩🇲🇾';
I18N.fr.hero_p = 'Articles pas chers, traitement rapide, tous les paiements acceptés. Plus de 100 000 clients nous font confiance avec des avis honnêtes. Rockstar Store propose du brainrot premium et des comptes premium qui rendent ton Roblox bien plus <b style="color:var(--blue2);">classe</b> que les autres. Tes amis ne pourront que jalouser. <b style="color:var(--blue2);">Passe au niveau supérieur et domine chaque jeu ! 🚀</b>';
I18N.fr.run_html = '⚡ Processus express • 💰 Prix les plus bas • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Rejoindre le canal WA</a> • ⚡ Processus express • 💰 Prix les plus bas • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Rejoindre le canal WA</a>';
I18N.fr.s1x = "Regardez autour, puis cliquez <b>Ajouter au panier</b> 🛒";
I18N.fr.s2x = "Ouvrez 🛒, vérifiez votre commande, puis appuyez sur <b>Paiement</b>.";
I18N.fr.s3x = "Cliquez <b>✓ Envoyer à l'admin</b>, la fenêtre WA s'ouvre toute seule.";
I18N.fr.s4x = "Payez via QRIS, puis envoyez le reçu à l'admin.";
I18N.fr.s5x = "L'admin envoie l'article en jeu. Bonne partie ! 🚀";
I18N.fr.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — la solution Roblox pro pour toi';
I18N.fr.testi_x = "100 K+ avis fiables, cliquez ci-dessous pour voir le canal WA";
I18N.fr.wa_x = "Cliquez ci-dessous pour discuter directement avec l'admin ROCKSTAR sur WA";
I18N.fr.wish_empty = "🤍 Aucun favori pour l'instant.<br>Tape le cœur sur les photos des produits pour enregistrer.";
I18N.th = { search_ph:"ค้นหาไอเทม เช่น moon bloom, robux...", cart:"🛒 ตะกร้า", kicker:"ร้าน Brainrot อันดับ 1 ที่ครบที่สุดในอินโดนีเซียและมาเลเซีย", channel:"📢 เข้าร่วมช่อง WhatsApp", cta_brainrot:"แคตตาล็อก Brainrot 🧠", cta_topup:"เติม Robux 💰", cta_akun:"แคตตาล็อกบัญชี 👤", cta_joki:"บูสต์ 🎮", st1:"รีวิวที่ไว้ใจได้", st2:"ทำเสร็จในไม่กี่นาที", st3:"รับทุกวิธีจ่าย", st4:"ไอเทมและสัตว์นับพัน", cb_title:"วิธีซื้อ 🎮", cb_sub:"5 ขั้นตอนง่าย ๆ ตามรูปเลย!", s1t:"เลือกไอเทม", s2t:"ดูตะกร้า", s3t:"คุยกับแอดมิน", s4t:"จ่ายเงิน", s5t:"ไอเทมมาถึง!", foot_wa:"เบอร์ WA แอดมิน:", back:"← กลับ", back_home:"← หน้าแรก", nav_home:"หน้าแรก", nav_akun:"บัญชีระดับสูงหลายแมป", nav_topup:"เติม Robux", nav_joki:"บูสติ้ง", nav_akun_bn:"บัญชีระดับสูง", nav_brainrot_bn:"Brainrot", nav_joki_bn:"บูสต์", nav_flash_bn:"Flash Sale", cat_brainrot:"แคตตาล็อก Brainrot", cat_akun:"แคตตาล็อกบัญชี", cat_topup:"เติมเงิน", cat_joki:"บูสต์", cat_sub:"หมวดหมู่ — คลิกเพื่อดูไอเทม", cat_empty:"แคตตาล็อกว่างเปล่า", cat_empty_x:"ยังไม่โหลดข้อมูล (เน็ตช้า)", cat_empty_msg:"😢 แคตตาล็อกยังไม่แสดง ปกติเพราะสัญญาณ", reload:"🔄 โหลดใหม่", mulai:"เริ่มช้อปปิ้ง", pilih_sub:"เลือกหมวดหมู่ด้านล่างนี้", hasil:"ผลการค้นหา", cocok_a:"รายการตรงกับ", none_a:"ไม่มีรายการที่ตรงนี้", add_cart:"เพิ่มลงตะกร้า", sold_out_btn:"หมดสต็อก", habis:"หมดแล้ว", habis_txt:"สต็อกหมด", stock:"สต็อก:", stock_na:"สต็อก: -", sold_w:"ขายแล้ว", kilat:"⚡ ทำเร็วมาก", safe:"🛡️ ปลอดภัย 100%", verified:"ยืนยันแล้ว", hubungi:"สอบถามราคาที่แอดมิน", more_a:"ดูเพิ่ม", more_b:"อีกมากมาย", hemat:"ประหยัด", tutup:"ปิด", lihat:"ดู", checkout:"ชำระเงิน", batal:"ยกเลิก", cart_title:"📋 ตะกร้าของฉัน", lanjut:"ช้อปปิ้งต่อ", preview:"📸 ตัวอย่างคำสั่งซื้อ", kirim:"✓ ส่งถึงแอดมิน", kosong:"ตะกร้าว่างเปล่า!", habis_alert:"เสียใจด้วย ไอเทมนี้หมดแล้ว!", cancel_q:"ยกเลิกการชำระเงินไหม? สินค้าทั้งหมดจะถูกลบ", dilihat_w:"การดู", wish_title:"❤️ รายการโปรดของฉัน", hapus:"ลบ", recent_t:"🕘 ดูล่าสุด", together:"🎞️ ซื้อพร้อมกันบ่อย", bought_with:"ซื้อพร้อมกัน", hot_t:"🔥 คลิกมากที่สุด", clicked:"คลิก", sold_done:"ขายแล้ว", rest_stock:"สต็อกคงเหลือ", avail_stock:"สต็อกพร้อมขาย", low_a:"เหลือ", low_b:"ชิ้น รีบๆ ก่อนหมด!", avail:"มีขาย", server_t:"🔗 ลิงก์เซิร์ฟเวอร์ Rock Star", server_sub:"คลิกเซิร์ฟเวอร์เพื่อเข้า Roblox ทันที", wa_t:"ต้องการความช่วยเหลือ?", wa_btn:"แชท WhatsApp", testi_t:"⭐ รีวิวลูกค้า", testi_btn:"ดูรีวิว", b_brain_t:"🧠 แคตตาล็อก Brainrot", b_top_t:"💰 เติมเงิน", b_akun_t:"👤 บัญชี Roblox", b_brain_d:"ทางอองอัปเลเวล Roblox — ไอเทมหลายสิบหมวดหมู่", b_top_d:"เติม Robux & เกมพาสราคาดีที่สุด", b_akun_d:"บัญชีระดับสูงหลายแมป ข้อมุลสะอาด — พร้อมใช้ทันที", b_joki_t:"🎮 บูสต์ Roblox", b_joki_d:"บริการบูสต์หลายแมป — เร็ว ปลอดภัย ราคาดี", wa_online:"ออนไลน์", wa_ph:"พิมพ์ข้อความ...", wa_greet:"สวัสดี! 👋 มีอะไรให้ช่วยไหม? พิมพ์ด้านล่างเลย จะต่อไปยัง WA แอดมินทันที", flash_t:"⚡ FLASH SALE", flash_click:"👆 คลิก Flash Sale เพื่อดูสินค้าลดราคา", flash_fomo:"🔥 รีบๆ! ใกล้หมดแล้ว:", flash_btn:"⚡ Flash Sale", nav_testi:"รีวิว", rc_bub:"ต้องการความช่วยเหลือ? แชท <b>Min Rock</b> ได้เลย 💬", lang_btn:"ภาษา", cur_btn:"สกุลเงิน" };
I18N.th.hero_h1 = 'ทางออกเลเวล <span>ROBLOX</span> ของคุณ 🇮🇩🇲🇾';
I18N.th.hero_p = 'ไอเทมถูก ทำเร็ว จ่ายได้ทุกช่องทาง ลูกค้ากว่า 100,000 คนไว้ใจ รีวิวซื่อตรง Rockstar Store มี brainrot คุณภาพพรีเมียมและบัญชีพรีเมียม ทำให้ Roblox ของคุณ <b style="color:var(--blue2);">หรู</b> กว่าใคร เพื่อน ๆ อิจฉาแน่ ๆ <b style="color:var(--blue2);">ถึงเวลาอัปเลเวลและครองทุกเกม! 🚀</b>';
I18N.th.run_html = '⚡ ทำไวมาก • 💰 ราคาถูกสุด • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">เข้าร่วมช่อง WA</a> • ⚡ ทำไวมาก • 💰 ราคาถูกสุด • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">เข้าร่วมช่อง WA</a>';
I18N.th.s1x = 'เลือกดูแล้วกด <b>เพิ่มลงตะกร้า</b> 🛒';
I18N.th.s2x = 'เปิด 🛒 ตรวจออเดอร์ แล้วกด <b>ชำระเงิน</b>.';
I18N.th.s3x = 'กด <b>✓ ส่งถึงแอดมิน</b> แล้ว WA จะเปิดเอง';
I18N.th.s4x = 'จ่ายผ่าน QRIS แล้วส่งสลิปให้แอดมิน';
I18N.th.s5x = 'แอดมินส่งไอเทมในเกม สนุกด้วยนะ! 🚀';
I18N.th.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — ทางออกอัปเลเวล Roblox ของคุณ';
I18N.th.testi_x = 'รีวิวน่าเชื่อถือกว่า 100K+ คลิกปุ่มด้านล่างเพื่อดูที่ช่อง WA';
I18N.th.wa_x = 'กดปุ่มด้านล่างเพื่อคุยกับแอดมิน ROCKSTAR ทาง WA ทันที';
I18N.th.wish_empty = '🤍 ยังไม่มีรายการโปรด<br>แตะหัวใจบนรูปสินค้าเพื่อบันทึก';
I18N.vi = { search_ph:"Tìm món, ví dụ: moon bloom, robux...", cart:"🛒 Giỏ hàng", kicker:"CỬA HÀNG BRAINROT #1 ĐẦY ĐỦ NHẤT Ở NAM DƯƠNG & MA-LAI", channel:"📢 Tham gia kênh WhatsApp", cta_brainrot:"Katalog Brainrot 🧠", cta_topup:"Nạp Robux 💰", cta_akun:"Danh mục tài khoản 👤", cta_joki:"Boost 🎮", st1:"Đánh giá đáng tin", st2:"Xử lý vài phút", st3:"Mọi phương thức thanh toán", st4:"Hàng nghìn món & thú", cb_title:"Cách mua 🎮", cb_sub:"5 bước dễ, bám theo ảnh!", s1t:"Chọn món", s2t:"Xem giỏ hàng", s3t:"Nhắn admin", s4t:"Thanh toán", s5t:"Món đến nơi!", foot_wa:"Số WA Admin:", back:"← Quay lại", back_home:"← Trang chủ", nav_home:"Trang chủ", nav_akun:"Tài khoản cao cấp nhiều map", nav_topup:"Nạp Robux", nav_joki:"Boost", nav_akun_bn:"Tài khoản cao", nav_brainrot_bn:"Brainrot", nav_joki_bn:"Boost", nav_flash_bn:"Flash Sale", cat_brainrot:"Katalog Brainrot", cat_akun:"Danh mục tài khoản", cat_topup:"Nạp", cat_joki:"Boost", cat_sub:"phân loại — bấm để xem món", cat_empty:"Katalog trống", cat_empty_x:"Chưa tải dữ liệu (mạng chậm)", cat_empty_msg:"😢 Katalog chưa hiện. Thường do sóng.", reload:"🔄 Tải lại", mulai:"Bắt đầu mua sắm", pilih_sub:"Hãy chọn phân loại bên dưới", hasil:"Kết quả tìm kiếm", cocok_a:"món khớp với", none_a:"Không có món nào khớp", add_cart:"Thêm vào giỏ", sold_out_btn:"Hết hàng", habis:"HẾT", habis_txt:"Kho hết", stock:"Kho:", stock_na:"Kho: -", sold_w:"đã bán", kilat:"⚡ Làm nhanh", safe:"🛡️ AN TOÀN 100%", verified:"ĐÃ XÁC MINH", hubungi:"Hỏi giá với admin", more_a:"Xem thêm", more_b:"nữa", hemat:"TIẾT KIỆM", tutup:"Đóng", lihat:"Xem", checkout:"Thanh toán", batal:"Hủy", cart_title:"📋 Giỏ hàng của tôi", lanjut:"Tiếp tục mua sắm", preview:"📸 Xem trước đơn", kirim:"✓ Gửi tới admin", kosong:"Giỏ hàng trống!", habis_alert:"Rất tiếc, món này đã hết!", cancel_q:"Hủy thanh toán? Tất cả món sẽ bị xóa.", dilihat_w:"lượt xem", wish_title:"❤️ Danh sách yêu thích của tôi", hapus:"Xóa", recent_t:"🕘 Xem gần đây", together:"🎞️ Thường mua cùng nhau", bought_with:"mua cùng nhau", hot_t:"🔥 Được bấm nhiều nhất", clicked:"lượt bấm", sold_done:"Đã bán", rest_stock:"Kho còn lại", avail_stock:"Kho có sẵn", low_a:"Chỉ còn", low_b:"món, mua nhanh kẻo hết!", avail:"CÓ SẲN", server_t:"🔗 Liên kết Server Rock Star", server_sub:"Bấm server để vào Roblox ngay", wa_t:"Cần giúp?", wa_btn:"Nhắn tin WhatsApp", testi_t:"⭐ Đánh giá khách hàng", testi_btn:"Xem đánh giá", b_brain_t:"🧠 Katalog Brainrot", b_top_t:"💰 Nạp", b_akun_t:"👤 Tài khoản Roblox", b_brain_d:"Giải pháp nâng cấp Roblox — hàng chục phân loại món.", b_top_d:"Nạp Robux & game pass giá tốt nhất.", b_akun_d:"Tài khoản cao cấp nhiều map, data sạch — dùng ngay.", b_joki_t:"🎮 Boost Roblox", b_joki_d:"Dịch vụ boost nhiều map — nhanh, an toàn, giá tốt.", wa_online:"Trực tuyến", wa_ph:"Nhập tin nhắn...", wa_greet:"Xin chào! 👋 Cần gì không? Gõ bên dưới, nối thẳng tới WA admin.", flash_t:"⚡ FLASH SALE", flash_click:"👆 Bấm Flash Sale để xem món giảm giá", flash_fomo:"🔥 Nhanh lên! Sắp hết đấy:", flash_btn:"⚡ Flash Sale", nav_testi:"Đánh giá", rc_bub:"Cần giúp? Nhắn <b>Min Rock</b> luôn 💬", lang_btn:"Ngôn ngữ", cur_btn:"Tiền tệ" };
I18N.vi.hero_h1 = 'GIẢI PHÁP LÊN CẤP <span>ROBLOX</span> CỦA BẠN 🇮🇩🇲🇾';
I18N.vi.hero_p = 'Món rẻ, xử lý nhanh, thanh toán đủ mọi cách. Hơn 100.000 khách tin dùng, đánh giá uy tín. Rockstar Store có brainrot cao cấp và tài khoản cao cấp đưa Roblox của bạn lên <b style="color:var(--blue2);">tầng cao</b> hơn hẳn tụi khác. Đám bạn nhìn mà thèm. <b style="color:var(--blue2);">Sang cấp và làm chủ mọi trò chơi thôi! 🚀</b>';
I18N.vi.run_html = '⚡ Làm nhanh • 💰 Giá rẻ nhất • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Tham gia kênh WA</a> • ⚡ Làm nhanh • 💰 Giá rẻ nhất • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Tham gia kênh WA</a>';
I18N.vi.s1x = 'Xem quanh rồi bấm <b>Thêm vào giỏ</b> 🛒';
I18N.vi.s2x = 'Mở 🛒, kiểm tra đơn rồi bấm <b>Thanh toán</b>.';
I18N.vi.s3x = 'Bấm <b>✓ Gửi tới admin</b>, WA tự mở.';
I18N.vi.s4x = 'Thanh toán qua QRIS rồi gửi ảnh chụp lại cho admin.';
I18N.vi.s5x = 'Admin gửi món trong game. Chơi vui nha! 🚀';
I18N.vi.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — giải pháp nâng cấp Roblox của bạn';
I18N.vi.testi_x = '100K+ đánh giá đáng tin, bấm nút bên dưới để xem ở kênh WA';
I18N.vi.wa_x = 'Bấm nút bên dưới để nhắn thẳng với admin ROCKSTAR trên WhatsApp';
I18N.vi.wish_empty = '🤍 Chưa có mục yêu thích.<br>Bấm trái tim trên ảnh sản phẩm để lưu.';
I18N.id.hero_h1 = 'SOLUSI SEPUH <span>ROBLOX</span> KAMU 🇮🇩🇲🇾';
I18N.en.hero_h1 = 'YOUR <span>ROBLOX</span> UPGRADE SOLUTION 🇮🇩🇲🇾';
I18N.id.hero_p = 'Rockstar Store menyediakan brainrot <b style="color:var(--blue2);">premium</b>, akun <b style="color:var(--blue2);">premium</b>, dan jasa joki <b style="color:var(--blue2);">profesional</b> yang bikin Roblox-mu makin <b style="color:var(--blue2);">sepuh</b> dan berkelas <b style="color:var(--blue2);">sultan</b>, serta membantumu <b style="color:var(--blue2);">menang</b> di setiap map yang kamu mainkan. Sudah pasti bikin temanmu iri dan kepanasan. <b style="color:var(--blue2);">Waktunya naik kelas dan mendominasi setiap permainan! 🚀</b>';
I18N.en.hero_p = 'Cheap items, fast process, all payments accepted. Trusted by 100,000+ customers with honest reviews. Rockstar Store provides premium brainrot and premium accounts that make your Roblox pro and truly <b style="color:var(--blue2);">sultan</b> compared to the rest. Guaranteed to make your friends jealous. <b style="color:var(--blue2);">Time to level up and dominate every game! 🚀</b>';
I18N.id.run_html = '⚡ Proses kilat • 💰 Harga termurah • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Join saluran WA</a> • ⚡ Proses kilat • 💰 Harga termurah • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Join saluran WA</a>';
I18N.en.run_html = '⚡ Fast process • 💰 Cheapest prices • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Join WA channel</a> • ⚡ Fast process • 💰 Cheapest prices • Tiktok @rockstarstoree • <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">Join WA channel</a>';
I18N.id.s1x = 'Lihat-lihat, klik <b>Tambah ke Keranjang</b> 🛒';
I18N.en.s1x = 'Look around, click <b>Add to Cart</b> 🛒';
I18N.id.s2x = 'Buka 🛒, cek pesananmu, lalu tekan <b>Checkout</b>.';
I18N.en.s2x = 'Open 🛒, check your order, then tap <b>Checkout</b>.';
I18N.id.s3x = 'Klik <b>✓ Kirim ke Admin</b>, WA terbuka sendiri.';
I18N.en.s3x = 'Click <b>✓ Send to Admin</b>, WA opens by itself.';
I18N.id.s4x = 'Bayar via QRIS, lalu kirim buktinya ke admin.';
I18N.en.s4x = 'Pay via QRIS, then send the receipt to admin.';
I18N.id.s5x = 'Admin kirim item di dalam game. Selamat main! 🚀';
I18N.en.s5x = 'Admin sends the item in-game. Happy playing! 🚀';
I18N.id.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — solusi sepuh roblox kamu';
I18N.en.foot_tag = 'TikTok @rockstarstoree • Rockstar.Store — your roblox upgrade solution';
I18N.id.testi_x = '100K+ testimoni amanah, klik tombol di bawah untuk lihat di saluran WA';
I18N.en.testi_x = '100K+ trusted reviews, click below to see the WA channel';
I18N.id.wa_x = 'Klik tombol di bawah langsung ke WA admin ROCKSTAR';
I18N.en.wa_x = 'Click below to chat ROCKSTAR admin on WA directly';
I18N.id.wish_empty = '🤍 Belum ada favorit.<br>Ketuk hati di foto produk untuk simpan.';
I18N.en.wish_empty = '🤍 No favorites yet.<br>Tap the heart on product photos to save.';
I18N.id.lang_btn = "Bahasa"; I18N.id.cur_btn = "Mata Uang";
I18N.en.lang_btn = "Language"; I18N.en.cur_btn = "Currency";
/* ===== I18N tambahan: mega-slider, hero katalog, marquee (8 bahasa) ===== */
I18N.id.sl1_t = "MALU SAMA TEMAN?"; I18N.id.sl1_g = "KACUNG DI ROBLOX?"; I18N.id.sl1_sub = 'TENANG, ROCKSTAR.STORE <span class="mega-blue">SOLUSINYA</span>'; I18N.id.sl1_tag = 'ITEM <b>PREMIUM</b> DIJAMIN LANGSUNG <b>SEPUH</b> DAN BIKIN <b>PERCAYA DIRI</b>'; I18N.id.sl2_t = "WELCOME TO"; I18N.id.sl2_sub = 'TOKO ROBLOX <span class="mega-blue">NO 1 DUNIA</span>'; I18N.id.sl2_b1 = "Harga Termurah"; I18N.id.sl2_b2 = "Proses Tercepat"; I18N.id.sl2_b3 = "Aman 100%"; I18N.id.sl2_tag = 'PROSES SEMUA <b>KILAT</b> DAN DIPASTIKAN <b>SEPUH</b>'; I18N.id.sl3_t = "ROBUX INSTAN"; I18N.id.sl3_g = "PALING MURAH"; I18N.id.sl3_sub = "VIA ID • GAMEPASS • GIFT CARD"; I18N.id.sl3_b1 = "Proses Kilat"; I18N.id.sl3_b2 = "Payment Lengkap"; I18N.id.sl3_b3 = "Garansi 100%"; I18N.id.sl3_cta = "Top Up Sekarang 💰"; I18N.id.sl4_br = "★ BRAINROT & AKUN ★"; I18N.id.sl4_t = "JADI SEPUH"; I18N.id.sl4_g = "NAIK KELAS"; I18N.id.sl4_sub = "STOK SECRET • OG • MUTASI LANGKA"; I18N.id.sl4_b1 = "Stok Terbanyak"; I18N.id.sl4_b2 = "Full Garansi"; I18N.id.sl4_b3 = "CS Fast Respon"; I18N.id.sl4_cta = "Lihat Katalog 🧠"; I18N.id.sl5_br = "★ JASA CARI AKUN ★"; I18N.id.sl5_t = "MAU BELI"; I18N.id.sl5_g = "AKUN GAME?"; I18N.id.sl5_rib = "TENANG, MIMIN ROCKSTAR BANTUIN"; I18N.id.sl5_cta = "Cari Akun 👤"; I18N.id.sl5_s1 = "KIRIM SPEK AKUN YANG KAMU INGINKAN"; I18N.id.sl5_s2 = "ADMIN BANTU CARI AKUN SESUAI KEINGINAN KAMU"; I18N.id.sl5_s3 = "AKUN SIAP LANGSUNG DIPAKAI & NIKMATI GAMENYA"; I18N.id.sl6_br = "★ JOKI SEPUH ★"; I18N.id.sl6_t = "JASA JOKI"; I18N.id.sl6_g = "JOKI SEPUH BERBAGAI MAP"; I18N.id.sl6_sub = 'Layanan joki <span class="mega-blue">profesional</span>, <span class="mega-blue">cepat</span>, dan <span class="mega-blue">aman 100%</span> untuk membantumu menjadi <span class="mega-blue">sepuh</span> dengan <span class="mega-blue">cepat</span> serta <span class="mega-blue">mendominasi</span> game favoritmu.'; I18N.id.sl6_b1 = "⚡ PROSES CEPAT"; I18N.id.sl6_b2 = "🔒 AMAN & TERPERCAYA"; I18N.id.sl6_cta = "KLIK DISINI 👆"; I18N.id.sl7_br = "★ SALURAN RESMI ★"; I18N.id.sl7_t = 'JOIN <span class="mega-gold">SALURAN</span>'; I18N.id.sl7_g = "RESMI ROCKSTAR"; I18N.id.sl7_sub = 'ORDER LEBIH CEPAT, ADMIN LEBIH AKTIF,<br>DAN INFORMASI LEBIH LENGKAP.'; I18N.id.sl7_cta = "JOIN SEKARANG"; I18N.id.sl8_br = "★ TIKTOK RESMI ★"; I18N.id.sl8_g = "FOLLOW DULU YA DUL!"; I18N.id.sl8_tag = 'JANGAN LUPA FOLLOW DUL! WASPADA CLONE — ASLI CUMA <b>@ROCKSTARSTOREE</b>'; I18N.id.ha_br = "★ AKUN SEPUH ★"; I18N.id.ha_t1 = "AKUN"; I18N.id.ha_t2 = "SEPUH ROBLOX"; I18N.id.ha_sub = 'Akun <b>Sepuh</b> Roblox berbagai map dengan <b>keamanan 100%</b> yang siap kalian pakai untuk <b>mendominasi</b> game <b>favorit</b> kalian dan bikin <b>percaya diri</b>.'; I18N.id.hb_br = "★ BRAINROT SEPUH ★"; I18N.id.hb_t1 = "BRAINROT"; I18N.id.hb_t2 = "SEPUH PREMIUM"; I18N.id.hb_sub = 'Brainrot <b>sepuh</b> kualitas <b>premium</b> berbagai map Roblox yang bikin kalian <b>sepuh</b> dengan <b>cepat</b> dan <b>mendominasi</b> permainan di map favorit kalian.'; I18N.id.hj_t1 = "JASA"; I18N.id.hj_t2 = "JOKI"; I18N.id.hj_sub = 'Layanan joki <b>profesional</b>, <b>cepat</b>, dan <b>aman 100%</b> untuk membantumu menjadi <b>sepuh</b> dengan <b>cepat</b> serta <b>mendominasi</b> game favoritmu.'; I18N.id.tm1 = "(100K+ Ulasan Pembeli)"; I18N.id.tm2 = "Top Up Robux Kilat & Aman"; I18N.id.tm3 = "Item & Pet Brainrot Sepuh"; I18N.id.tm4 = "Akun Sepuh Roblox"; I18N.id.tm5 = "Stok Selalu Premium"; I18N.id.tm6 = "SAFE 100%"; I18N.id.tm7 = "PROSES KILAT ⚡";
I18N.en.sl1_t = "EMBARRASSED BY YOUR FRIENDS?"; I18N.en.sl1_g = "A NOOB IN ROBLOX?"; I18N.en.sl1_sub = 'DON\'T WORRY, ROCKSTAR.STORE <span class="mega-blue">HAS THE FIX</span>'; I18N.en.sl1_tag = 'PREMIUM <b>ITEMS</b> GUARANTEED TO MAKE YOU <b>PRO</b> FAST AND <b>CONFIDENT</b>'; I18N.en.sl2_t = "WELCOME TO"; I18N.en.sl2_sub = 'THE ROBLOX STORE <span class="mega-blue">NO.1 IN THE WORLD</span>'; I18N.en.sl2_b1 = "Cheapest Prices"; I18N.en.sl2_b2 = "Fastest Process"; I18N.en.sl2_b3 = "100% Safe"; I18N.en.sl2_tag = 'EVERY ORDER <b>LIGHTNING FAST</b> AND GUARANTEED <b>PRO-LEVEL</b>'; I18N.en.sl3_t = "INSTANT ROBUX"; I18N.en.sl3_g = "CHEAPEST AROUND"; I18N.en.sl3_sub = "ID • GAMEPASS • GIFT CARD"; I18N.en.sl3_b1 = "Lightning Process"; I18N.en.sl3_b2 = "All Payments"; I18N.en.sl3_b3 = "100% Warranty"; I18N.en.sl3_cta = "Top Up Now 💰"; I18N.en.sl4_br = "★ BRAINROT & ACCOUNTS ★"; I18N.en.sl4_t = "GO PRO"; I18N.en.sl4_g = "LEVEL UP"; I18N.en.sl4_sub = "SECRET • OG • RARE MUTATION STOCK"; I18N.en.sl4_b1 = "Biggest Stock"; I18N.en.sl4_b2 = "Full Warranty"; I18N.en.sl4_b3 = "Fast Support"; I18N.en.sl4_cta = "Browse Catalog 🧠"; I18N.en.sl5_br = "★ ACCOUNT HUNTING SERVICE ★"; I18N.en.sl5_t = "WANNA BUY"; I18N.en.sl5_g = "A GAME ACCOUNT?"; I18N.en.sl5_rib = "RELAX, OUR ADMIN GOT YOU"; I18N.en.sl5_cta = "Find My Account 👤"; I18N.en.sl5_s1 = "SEND THE ACCOUNT SPECS YOU WANT"; I18N.en.sl5_s2 = "ADMIN FINDS THE ACCOUNT THAT FITS YOU BEST"; I18N.en.sl5_s3 = "ACCOUNT READY TO USE — ENJOY YOUR GAME"; I18N.en.sl6_br = "★ PRO BOOSTING ★"; I18N.en.sl6_t = "BOOSTING SERVICE"; I18N.en.sl6_g = "PRO BOOST FOR ALL MAPS"; I18N.en.sl6_sub = 'A boost service that is <span class="mega-blue">professional</span>, <span class="mega-blue">fast</span> and <span class="mega-blue">100% safe</span> to help you become <span class="mega-blue">pro</span> fast and <span class="mega-blue">dominate</span> your favorite game.'; I18N.en.sl6_b1 = "⚡ FAST PROCESS"; I18N.en.sl6_b2 = "🔒 SAFE & TRUSTED"; I18N.en.sl6_cta = "CLICK HERE 👆"; I18N.en.sl7_br = "★ OFFICIAL CHANNEL ★"; I18N.en.sl7_t = 'JOIN THE <span class="mega-gold">CHANNEL</span>'; I18N.en.sl7_g = "OFFICIAL ROCKSTAR"; I18N.en.sl7_sub = 'FASTER ORDERS, MORE ACTIVE ADMIN,<br>AND MORE COMPLETE UPDATES.'; I18N.en.sl7_cta = "JOIN NOW"; I18N.en.sl8_br = "★ OFFICIAL TIKTOK ★"; I18N.en.sl8_g = "FOLLOW FIRST, DUDE!"; I18N.en.sl8_tag = 'DON\'T FORGET TO FOLLOW! BEWARE OF CLONES — ONLY <b>@ROCKSTARSTOREE</b> IS REAL'; I18N.en.ha_br = "★ PRO ACCOUNTS ★"; I18N.en.ha_t1 = "ACCOUNTS"; I18N.en.ha_t2 = "PRO ROBLOX"; I18N.en.ha_sub = 'Pro Roblox accounts for all maps with <b>100% security</b>, ready to use to <b>dominate</b> your <b>favorite</b> games and feel <b>confident</b>.'; I18N.en.hb_br = "★ PRO BRAINROT ★"; I18N.en.hb_t1 = "BRAINROT"; I18N.en.hb_t2 = "PRO PREMIUM"; I18N.en.hb_sub = 'Premium quality <b>pro</b> brainrot for all Roblox maps that makes you <b>pro</b> fast and <b>dominates</b> your favorite maps.'; I18N.en.hj_t1 = "BOOSTING"; I18N.en.hj_t2 = "SERVICE"; I18N.en.hj_sub = 'A boosting service that is <b>professional</b>, <b>fast</b> and <b>100% safe</b> to help you become <b>pro</b> fast and <b>dominate</b> your favorite game.'; I18N.en.tm1 = "(100K+ Buyer Reviews)"; I18N.en.tm2 = "Fast & Safe Robux Top Up"; I18N.en.tm3 = "Pro Brainrot Items & Pets"; I18N.en.tm4 = "Pro Roblox Accounts"; I18N.en.tm5 = "Stock Always Premium"; I18N.en.tm6 = "SAFE 100%"; I18N.en.tm7 = "LIGHTNING PROCESS ⚡";
I18N.ja.sl1_t = "友だちに負けた？"; I18N.ja.sl1_g = "ROBLOX で悩んでる？"; I18N.ja.sl1_sub = '安心して、ROCKSTAR.STORE <span class="mega-blue">が解決</span>'; I18N.ja.sl1_tag = 'プレミアム<b>アイテム</b>で確実に<b>上達</b>、<b>自信</b>も GET'; I18N.ja.sl2_t = "ようこそ"; I18N.ja.sl2_sub = 'ROBLOXストア <span class="mega-blue">世界No.1</span>'; I18N.ja.sl2_b1 = "最安値"; I18N.ja.sl2_b2 = "最速処理"; I18N.ja.sl2_b3 = "安全100%"; I18N.ja.sl2_tag = '全注文<b>超高速</b>処理、確実に<b>上級</b>へ'; I18N.ja.sl3_t = "ROBUX即チャージ"; I18N.ja.sl3_g = "最安値"; I18N.ja.sl3_sub = "ID・ゲームパス・ギフトカード対応"; I18N.ja.sl3_b1 = "超高速処理"; I18N.ja.sl3_b2 = "全決済対応"; I18N.ja.sl3_b3 = "保証100%"; I18N.ja.sl3_cta = "今すぐチャージ 💰"; I18N.ja.sl4_br = "★ BRAINROT & アカウント ★"; I18N.ja.sl4_t = "上級化"; I18N.ja.sl4_g = "レベルアップ"; I18N.ja.sl4_sub = "シークレット・OG・レア変異ストック"; I18N.ja.sl4_b1 = "最大級ストック"; I18N.ja.sl4_b2 = "完全保証"; I18N.ja.sl4_b3 = "迅速サポート"; I18N.ja.sl4_cta = "一覧を見る 🧠"; I18N.ja.sl5_br = "★ アカウント探し代行 ★"; I18N.ja.sl5_t = "買いたい？"; I18N.ja.sl5_g = "ゲームアカウント？"; I18N.ja.sl5_rib = "安心して、管理人がしっかりサポート"; I18N.ja.sl5_cta = "アカウントを探す 👤"; I18N.ja.sl5_s1 = "希望のスペックを送る"; I18N.ja.sl5_s2 = "管理人が希望に合うアカウントを探す"; I18N.ja.sl5_s3 = "届いたらすぐ使える — ゲームを楽しもう"; I18N.ja.sl6_br = "★ プロブースト ★"; I18N.ja.sl6_t = "ブースト代行"; I18N.ja.sl6_g = "全マップ対応ブースト"; I18N.ja.sl6_sub = 'ブースト代行は<span class="mega-blue">プロ仕様</span>、<span class="mega-blue">高速</span>、<span class="mega-blue">安全100%</span>。あなたを<span class="mega-blue">上級プレイヤー</span>へ導き、<span class="mega-blue">お気に入りのゲームを支配</span>させます。'; I18N.ja.sl6_b1 = "⚡ 高速処理"; I18N.ja.sl6_b2 = "🔒 安全・信頼"; I18N.ja.sl6_cta = "ここをクリック 👆"; I18N.ja.sl7_br = "★ 公式チャンネル ★"; I18N.ja.sl7_t = '<span class="mega-gold">チャンネル</span>に参加'; I18N.ja.sl7_g = "公式 ROCKSTAR"; I18N.ja.sl7_sub = '注文がもっと速く、管理人の対応も活発、<br>情報ももっと充実。'; I18N.ja.sl7_cta = "今すぐ参加"; I18N.ja.sl8_br = "★ 公式 TIKTOK ★"; I18N.ja.sl8_g = "まずフォローだ！"; I18N.ja.sl8_tag = 'フォローお忘れなく！ 偽物にご注意 — 本物は<b>@ROCKSTARSTOREE</b>だけ'; I18N.ja.ha_br = "★ 上級アカウント ★"; I18N.ja.ha_t1 = "アカウント"; I18N.ja.ha_t2 = "上級ROBLOX"; I18N.ja.ha_sub = '全マップ対応の<b>上級</b>ROBLOXアカウント。<b>安全100%</b>ですぐ使えて、<b>お気に入りのゲーム</b>を<b>支配</b>し<b>自信</b>をつけよう。'; I18N.ja.hb_br = "★ 上級BRAINROT ★"; I18N.ja.hb_t1 = "BRAINROT"; I18N.ja.hb_t2 = "プレミアム上級"; I18N.ja.hb_sub = '全Robloxマップの<b>プレミアム</b>品質<b>brainrot</b>で、<b>上級</b>になり<b>お気に入りのマップを支配</b>。'; I18N.ja.hj_t1 = "ブースト"; I18N.ja.hj_t2 = "サービス"; I18N.ja.hj_sub = '<b>プロ仕様</b>、<b>高速</b>、<b>安全100%</b>のブースト代行で、あなたを<b>上級プレイヤー</b>へ導き、<b>お気に入りのゲーム</b>を支配させます。'; I18N.ja.tm1 = "(レビュー10万件以上)"; I18N.ja.tm2 = "Robuxチャージが早くて安全"; I18N.ja.tm3 = "上級Brainrotアイテム&ペット"; I18N.ja.tm4 = "上級ROBLOXアカウント"; I18N.ja.tm5 = "ストックはいつもプレミアム"; I18N.ja.tm6 = "安全100%"; I18N.ja.tm7 = "超高速処理 ⚡";
I18N.ko.sl1_t = "친구들 앞에서 부끄러워?"; I18N.ko.sl1_g = "ROBLOX에서 뒤처졌어?"; I18N.ko.sl1_sub = '걱정 마세요, ROCKSTAR.STORE <span class="mega-blue">해결사</span>'; I18N.ko.sl1_tag = '프리미엄<b>아이템</b>으로 빠르게 <b>상급</b>이 되고 <b>자신감</b>까지 UP'; I18N.ko.sl2_t = "환영합니다"; I18N.ko.sl2_sub = 'ROBLOX 스토어 <span class="mega-blue">세계 No.1</span>'; I18N.ko.sl2_b1 = "최저가"; I18N.ko.sl2_b2 = "최고 속도"; I18N.ko.sl2_b3 = "안전 100%"; I18N.ko.sl2_tag = '모든 주문 <b>초고속</b> 처리, 확실하게 <b>상급</b>으로'; I18N.ko.sl3_t = "ROBUX 즉시 충전"; I18N.ko.sl3_g = "최저가"; I18N.ko.sl3_sub = "ID • 게임패스 • 기프트카드"; I18N.ko.sl3_b1 = "초고속 처리"; I18N.ko.sl3_b2 = "모든 결제 지원"; I18N.ko.sl3_b3 = "보증 100%"; I18N.ko.sl3_cta = "지금 충전 💰"; I18N.ko.sl4_br = "★ BRAINROT & 계정 ★"; I18N.ko.sl4_t = "상급자 되기"; I18N.ko.sl4_g = "레벨 업"; I18N.ko.sl4_sub = "시크릿 • OG • 희귀 변이 스톡"; I18N.ko.sl4_b1 = "최대 재고"; I18N.ko.sl4_b2 = "완전 보증"; I18N.ko.sl4_b3 = "빠른 지원"; I18N.ko.sl4_cta = "목록 보기 🧠"; I18N.ko.sl5_br = "★ 계정 구해드림 ★"; I18N.ko.sl5_t = "계정 사고 싶어?"; I18N.ko.sl5_g = "게임 계정?"; I18N.ko.sl5_rib = "걱정 마세요, 관리자가 도와드려요"; I18N.ko.sl5_cta = "계정 찾기 👤"; I18N.ko.sl5_s1 = "원하는 계정 스펙을 보내세요"; I18N.ko.sl5_s2 = "관리자가 원하는 조건의 계정을 찾아드립니다"; I18N.ko.sl5_s3 = "계정은 바로 사용 가능 — 게임 즐기세요"; I18N.ko.sl6_br = "★ 프로 부스팅 ★"; I18N.ko.sl6_t = "부스팅 서비스"; I18N.ko.sl6_g = "모든 맵 프로 부스팅"; I18N.ko.sl6_sub = '부스팅 서비스는 <span class="mega-blue">프로급</span>, <span class="mega-blue">빠름</span>, <span class="mega-blue">100% 안전</span>. 당신을 <span class="mega-blue">상급자</span>로 만들어 <span class="mega-blue">선호하는 게임을 지배</span>하게 해줍니다.'; I18N.ko.sl6_b1 = "⚡ 빠른 처리"; I18N.ko.sl6_b2 = "🔒 안전 · 신뢰"; I18N.ko.sl6_cta = "여기 클릭 👆"; I18N.ko.sl7_br = "★ 공식 채널 ★"; I18N.ko.sl7_t = '<span class="mega-gold">채널</span> 참여'; I18N.ko.sl7_g = "공식 ROCKSTAR"; I18N.ko.sl7_sub = '주문은 더 빠르고, 관리자는 더 활발,<br>정보도 더 완벽하게.'; I18N.ko.sl7_cta = "지금 참여"; I18N.ko.sl8_br = "★ 공식 TIKTOK ★"; I18N.ko.sl8_g = "먼저 팔로우!"; I18N.ko.sl8_tag = '팔로우 잊지 마세요! 클론 조심 — 진짜는 <b>@ROCKSTARSTOREE</b>뿐'; I18N.ko.ha_br = "★ 상급 계정 ★"; I18N.ko.ha_t1 = "계정"; I18N.ko.ha_t2 = "상급 ROBLOX"; I18N.ko.ha_sub = '전 맵 대응 <b>상급</b> ROBLOX 계정, <b>100% 안전</b>. 바로 사용해 <b>선호하는 게임을 지배</b>하고 <b>자신감</b>을 키우세요.'; I18N.ko.hb_br = "★ 상급 BRAINROT ★"; I18N.ko.hb_t1 = "BRAINROT"; I18N.ko.hb_t2 = "프리미엄 상급"; I18N.ko.hb_sub = '전 Roblox 맵의 <b>프리미엄</b> 품질 <b>brainrot</b>로 빠르게 <b>상급</b>이 되어 <b>선호하는 맵을 지배</b>하세요.'; I18N.ko.hj_t1 = "부스팅"; I18N.ko.hj_t2 = "서비스"; I18N.ko.hj_sub = '<b>프로급</b>, <b>빠르고</b>, <b>100% 안전</b>한 부스팅 서비스로 <b>상급자</b>가 되어 <b>선호하는 게임</b>을 지배하세요.'; I18N.ko.tm1 = "(10만+ 구매 후기)"; I18N.ko.tm2 = "빠르고 안전한 Robux 충전"; I18N.ko.tm3 = "상급 Brainrot 아이템 & 펫"; I18N.ko.tm4 = "상급 ROBLOX 계정"; I18N.ko.tm5 = "항상 프리미엄 재고"; I18N.ko.tm6 = "안전 100%"; I18N.ko.tm7 = "초고속 처리 ⚡";
I18N.zh.sl1_t = "在朋友面前丢脸？"; I18N.zh.sl1_g = "在 ROBLOX 里被比下去？"; I18N.zh.sl1_sub = '别慌，ROCKSTAR.STORE <span class="mega-blue">帮你搞定</span>'; I18N.zh.sl1_tag = '入手<b>高级</b>道具，快速变<b>大佬</b>、<b>信心爆棚</b>'; I18N.zh.sl2_t = "欢迎来到"; I18N.zh.sl2_sub = 'ROBLOX 商店 <span class="mega-blue">世界 No.1</span>'; I18N.zh.sl2_b1 = "最低价"; I18N.zh.sl2_b2 = "最快处理"; I18N.zh.sl2_b3 = "100% 安全"; I18N.zh.sl2_tag = '所有订单<b>极速</b>处理，保证<b>进阶成大神</b>'; I18N.zh.sl3_t = "ROBUX 即时充值"; I18N.zh.sl3_g = "全网最低"; I18N.zh.sl3_sub = "ID • 游戏通行证 • 礼品卡"; I18N.zh.sl3_b1 = "闪电处理"; I18N.zh.sl3_b2 = "支付全支持"; I18N.zh.sl3_b3 = "100% 保障"; I18N.zh.sl3_cta = "立即充值 💰"; I18N.zh.sl4_br = "★ BRAINROT & 账号 ★"; I18N.zh.sl4_t = "变身高玩"; I18N.zh.sl4_g = "升级进阶"; I18N.zh.sl4_sub = "神秘款 • OG • 稀有变异库存"; I18N.zh.sl4_b1 = "库存最全"; I18N.zh.sl4_b2 = "全额包赔"; I18N.zh.sl4_b3 = "客服秒回"; I18N.zh.sl4_cta = "查看目录 🧠"; I18N.zh.sl5_br = "★ 代找账号 ★"; I18N.zh.sl5_t = "想买"; I18N.zh.sl5_g = "游戏账号？"; I18N.zh.sl5_rib = "放心，管理员帮你搞定"; I18N.zh.sl5_cta = "帮我找号 👤"; I18N.zh.sl5_s1 = "把账号要求发给我们"; I18N.zh.sl5_s2 = "管理员帮你找到心仪的账号"; I18N.zh.sl5_s3 = "到手即玩 — 尽情开黑"; I18N.zh.sl6_br = "★ 专业代肝 ★"; I18N.zh.sl6_t = "代肝服务"; I18N.zh.sl6_g = "全地图专业代肝"; I18N.zh.sl6_sub = '<span class="mega-blue">专业</span>、<span class="mega-blue">快速</span>、<span class="mega-blue">100% 安全</span>的代肝服务，帮你快速成为<span class="mega-blue">高玩</span>并<span class="mega-blue">称霸</span>心爱的游戏。'; I18N.zh.sl6_b1 = "⚡ 处理超快"; I18N.zh.sl6_b2 = "🔒 安全可靠"; I18N.zh.sl6_cta = "点这里 👆"; I18N.zh.sl7_br = "★ 官方频道 ★"; I18N.zh.sl7_t = '加入<span class="mega-gold">频道</span>'; I18N.zh.sl7_g = "ROCKSTAR 官方"; I18N.zh.sl7_sub = '下单更快、管理员在线更久、<br>消息更全面。'; I18N.zh.sl7_cta = "立即加入"; I18N.zh.sl8_br = "★ 官方 TIKTOK ★"; I18N.zh.sl8_g = "先关注再走！"; I18N.zh.sl8_tag = '别忘了关注！ 小心仿冒号 — 真的只有 <b>@ROCKSTARSTOREE</b>'; I18N.zh.ha_br = "★ 高级账号 ★"; I18N.zh.ha_t1 = "账号"; I18N.zh.ha_t2 = "高级 ROBLOX"; I18N.zh.ha_sub = '各大地图高级 Roblox 账号，<b>安全 100%</b>，到手即用，帮你在<b>爱玩</b>的游戏里<b>称霸</b>、<b>自信</b>满满。'; I18N.zh.hb_br = "★ 高级 BRAINROT ★"; I18N.zh.hb_t1 = "BRAINROT"; I18N.zh.hb_t2 = "高级精品"; I18N.zh.hb_sub = '各大 Roblox 地图<b>精品</b>品质 <b>brainrot</b>，让你<b>迅速</b>变<b>高玩</b>、<b>称霸</b>爱玩地图。'; I18N.zh.hj_t1 = "代肝"; I18N.zh.hj_t2 = "服务"; I18N.zh.hj_sub = '<b>专业</b>、<b>快速</b>、<b>100% 安全</b>的代肝服务，帮你快速成为<b>高玩</b>并<b>称霸</b>心爱的游戏。'; I18N.zh.tm1 = "(10万+ 买家评价)"; I18N.zh.tm2 = "Robux 充值又快又安全"; I18N.zh.tm3 = "高级 Brainrot 道具 & 宠物"; I18N.zh.tm4 = "高级 ROBLOX 账号"; I18N.zh.tm5 = "库存永远精品"; I18N.zh.tm6 = "安全 100%"; I18N.zh.tm7 = "极速处理 ⚡";
I18N.fr.sl1_t = "HONTE DEVANT TES POTES ?"; I18N.fr.sl1_g = "UN NOOB SUR ROBLOX ?"; I18N.fr.sl1_sub = 'TRANQUILLE, ROCKSTAR.STORE <span class="mega-blue">C\'EST LA SOLUTION</span>'; I18N.fr.sl1_tag = 'DES <b>ARTICLES</b> PREMIUM POUR DEVENIR <b>VÉTÉRAN</b> VITE ET <b>GAGNER EN CONFIANCE</b>'; I18N.fr.sl2_t = "BIENVENUE CHEZ"; I18N.fr.sl2_sub = 'LA BOUTIQUE ROBLOX <span class="mega-blue">N°1 DU MONDE</span>'; I18N.fr.sl2_b1 = "Prix les plus bas"; I18N.fr.sl2_b2 = "Traitement le plus rapide"; I18N.fr.sl2_b3 = "Sûr à 100%"; I18N.fr.sl2_tag = 'CHAQUE COMMANDE <b>EXPRESS</b> ET GARANTIE <b>VÉTÉRAN</b>'; I18N.fr.sl3_t = "ROBUX INSTANTANÉ"; I18N.fr.sl3_g = "LES MOINS CHERS"; I18N.fr.sl3_sub = "VIA ID • GAMEPASS • CARTE CADEAU"; I18N.fr.sl3_b1 = "Traitement éclair"; I18N.fr.sl3_b2 = "Tous les paiements"; I18N.fr.sl3_b3 = "Garantie 100%"; I18N.fr.sl3_cta = "Recharger maintenant 💰"; I18N.fr.sl4_br = "★ BRAINROT & COMPTES ★"; I18N.fr.sl4_t = "DEVENIR PRO"; I18N.fr.sl4_g = "CHANGE DE CLASSE"; I18N.fr.sl4_sub = "STOCK SECRET • OG • MUTATIONS RARES"; I18N.fr.sl4_b1 = "Stock le plus fourni"; I18N.fr.sl4_b2 = "Garantie totale"; I18N.fr.sl4_b3 = "SAV rapide"; I18N.fr.sl4_cta = "Voir le catalogue 🧠"; I18N.fr.sl5_br = "★ SERVICE DE RECHERCHE DE COMPTE ★"; I18N.fr.sl5_t = "TU VEUX ACHETER"; I18N.fr.sl5_g = "UN COMPTE DE JEU ?"; I18N.fr.sl5_rib = 'TRANQUILLE, L\'ADMIN S\'EN OCCUPE'; I18N.fr.sl5_cta = "Trouver mon compte 👤"; I18N.fr.sl5_s1 = "ENVOIE LES SPECS DU COMPTE QUE TU VEUX"; I18N.fr.sl5_s2 = 'L\'ADMIN TROUVE LE COMPTE À TON GOÛT'; I18N.fr.sl5_s3 = 'COMPTE PRÊT À L\'EMPLOI — PROFITE DU JEU'; I18N.fr.sl6_br = "★ BOOST PRO ★"; I18N.fr.sl6_t = "SERVICE DE BOOST"; I18N.fr.sl6_g = "BOOST PRO TOUS LES MAPS"; I18N.fr.sl6_sub = 'Un service de boost <span class="mega-blue">professionnel</span>, <span class="mega-blue">rapide</span> et <span class="mega-blue">sûr à 100%</span> pour te rendre <span class="mega-blue">pro</span> vite et <span class="mega-blue">dominer</span> ton jeu favori.'; I18N.fr.sl6_b1 = "⚡ TRAITEMENT RAPIDE"; I18N.fr.sl6_b2 = "🔒 SÛR ET FIABLE"; I18N.fr.sl6_cta = "CLIQUE ICI 👆"; I18N.fr.sl7_br = "★ CANAL OFFICIEL ★"; I18N.fr.sl7_t = 'REJOINS LE <span class="mega-gold">CANAL</span>'; I18N.fr.sl7_g = "OFFICIEL ROCKSTAR"; I18N.fr.sl7_sub = 'COMMANDES PLUS RAPIDES, ADMIN PLUS ACTIF,<br>ET DES INFOS PLUS COMPLÈTES.'; I18N.fr.sl7_cta = "REJOINDRE MAINTENANT"; I18N.fr.sl8_br = "★ TIKTOK OFFICIEL ★"; I18N.fr.sl8_g = 'SUIS D\'ABORD !'; I18N.fr.sl8_tag = 'N\'OUBLIE PAS DE SUIVRE ! ATTENTION AUX CLONES — LE SEUL VRAI EST <b>@ROCKSTARSTOREE</b>'; I18N.fr.ha_br = "★ COMPTES PRO ★"; I18N.fr.ha_t1 = "COMPTES"; I18N.fr.ha_t2 = "PRO ROBLOX"; I18N.fr.ha_sub = 'Comptes Roblox <b>pro</b> pour tous les maps avec <b>sécurité 100%</b>, prêts à l\'emploi pour <b>dominer</b> tes jeux <b>favoris</b> et gagner en <b>confiance</b>.'; I18N.fr.hb_br = "★ BRAINROT PRO ★"; I18N.fr.hb_t1 = "BRAINROT"; I18N.fr.hb_t2 = "PRO PREMIUM"; I18N.fr.hb_sub = 'Brainrot <b>pro</b> qualité <b>premium</b> pour tous les maps Roblox, pour devenir <b>pro</b> vite et <b>dominer</b> tes maps favoris.'; I18N.fr.hj_t1 = "SERVICE"; I18N.fr.hj_t2 = "DE BOOST"; I18N.fr.hj_sub = 'Un service de boost <b>professionnel</b>, <b>rapide</b> et <b>sûr à 100%</b> pour te rendre <b>pro</b> vite et <b>dominer</b> ton jeu favori.'; I18N.fr.tm1 = "(100K+ avis d'acheteurs)"; I18N.fr.tm2 = "Recharge Robux rapide et sûre"; I18N.fr.tm3 = "Articles & pets brainrot pro"; I18N.fr.tm4 = "Comptes Roblox pro"; I18N.fr.tm5 = "Stock toujours premium"; I18N.fr.tm6 = "SÛR 100%"; I18N.fr.tm7 = "TRAITEMENT ÉCLAIR ⚡";
I18N.th.sl1_t = "อายโว้ย ต่อหน้าเพื่อน?"; I18N.th.sl1_g = "แพ้ทางใน ROBLOX?"; I18N.th.sl1_sub = 'ไม่เป็นไร ROCKSTAR.STORE <span class="mega-blue">มีทางออก</span>'; I18N.th.sl1_tag = 'ไอเทม<b>พรีเมียม</b> การันตีเป็น<b>โปร</b>ทันทีและ<b>มั่นใจ</b>ขึ้น'; I18N.th.sl2_t = "ยินดีต้อนรับสู่"; I18N.th.sl2_sub = 'ร้าน ROBLOX <span class="mega-blue">อันดับ 1 ของโลก</span>'; I18N.th.sl2_b1 = "ราคาถูกที่สุด"; I18N.th.sl2_b2 = "เร็วที่สุด"; I18N.th.sl2_b3 = "ปลอดภัย 100%"; I18N.th.sl2_tag = 'ทุกออเดอร์ <b>เร็วปานสายฟ้า</b> และการันตี <b>โปร</b>'; I18N.th.sl3_t = "เติม ROBUX ทันที"; I18N.th.sl3_g = "ถูกที่สุด"; I18N.th.sl3_sub = "VIA ID • GAMEPASS • บัตรกำนัล"; I18N.th.sl3_b1 = "เร็วแบบฟ้าผ่า"; I18N.th.sl3_b2 = "จ่ายได้ทุกช่องทาง"; I18N.th.sl3_b3 = "ประกัน 100%"; I18N.th.sl3_cta = "เติมเลย 💰"; I18N.th.sl4_br = "★ BRAINROT & บัญชี ★"; I18N.th.sl4_t = "เป็นโปร"; I18N.th.sl4_g = "อัปเลเวล"; I18N.th.sl4_sub = "สต็อกซีเคร็ต • OG • มิวเทชันหายาก"; I18N.th.sl4_b1 = "สต็อกเยอะสุด"; I18N.th.sl4_b2 = "การันตีเต็ม 100%"; I18N.th.sl4_b3 = "ตอบแชทไว"; I18N.th.sl4_cta = "ดูแคตตาล็อก 🧠"; I18N.th.sl5_br = "★ บริการหาบัญชี ★"; I18N.th.sl5_t = "อยากซื้อ"; I18N.th.sl5_g = "บัญชีเกม?"; I18N.th.sl5_rib = "สบาย แอดมิน ROCKSTAR จัดให้"; I18N.th.sl5_cta = "หาบัญชี 👤"; I18N.th.sl5_s1 = "ส่งสเปกบัญชีที่อยากได้"; I18N.th.sl5_s2 = "แอดมินช่วยหาบัญชีตามที่คุณต้องการ"; I18N.th.sl5_s3 = "ได้บัญชีพร้อมเล่น — สนุกกับเกมเลย"; I18N.th.sl6_br = "★ บูสต์โปร ★"; I18N.th.sl6_t = "บริการบูสต์"; I18N.th.sl6_g = "บูสต์โปรหลายแมป"; I18N.th.sl6_sub = 'บริการบูสต์<span class="mega-blue">มืออาชีพ</span> <span class="mega-blue">เร็ว</span> และ<span class="mega-blue">ปลอดภัย 100%</span> ช่วยให้คุณเป็น<span class="mega-blue">โปร</span>เร็วและ<span class="mega-blue">ครอง</span>เกมที่ชอบ'; I18N.th.sl6_b1 = "⚡ ทำเร็ว"; I18N.th.sl6_b2 = "🔒 ปลอดภัย & วางใจ"; I18N.th.sl6_cta = "กดตรงนี้ 👆"; I18N.th.sl7_br = "★ ช่องทางทางการ ★"; I18N.th.sl7_t = 'เข้าร่วม<span class="mega-gold">ช่อง</span>'; I18N.th.sl7_g = "ทางการ ROCKSTAR"; I18N.th.sl7_sub = 'ออเดอร์ไวขึ้น แอดมินแอคทีฟขึ้น<br>อัปเดตครบขึ้น'; I18N.th.sl7_cta = "เข้าร่วมเลย"; I18N.th.sl8_br = "★ TIKTOK ทางการ ★"; I18N.th.sl8_g = "กดตามก่อนนะดอล!"; I18N.th.sl8_tag = 'อย่าลืม FOLLOW นะดอล! ระวังของเลียนแบบ — ของแท้มีแค่ <b>@ROCKSTARSTOREE</b>'; I18N.th.ha_br = "★ บัญชีระดับสูง ★"; I18N.th.ha_t1 = "บัญชี"; I18N.th.ha_t2 = "ระดับสูง ROBLOX"; I18N.th.ha_sub = 'บัญชี Roblox ระดับสูงหลายแมป <b>ปลอดภัย 100%</b> พร้อมใช้ทันที ช่วยให้คุณ<b>ครอง</b>เกม<b>ที่ชอบ</b>และ<b>มั่นใจ</b>เต็มร้อย'; I18N.th.hb_br = "★ BRAINROT ระดับสูง ★"; I18N.th.hb_t1 = "BRAINROT"; I18N.th.hb_t2 = "พรีเมียมระดับสูง"; I18N.th.hb_sub = 'Brainrot <b>คุณภาพพรีเมียม</b>หลายแมป Roblox ทำให้คุณ<b>โปร</b>เร็วและ<b>ครอง</b>แมปที่ชอบ'; I18N.th.hj_t1 = "บริการ"; I18N.th.hj_t2 = "บูสต์"; I18N.th.hj_sub = 'บริการบูสต์<b>มืออาชีพ</b> <b>เร็ว</b> และ<b>ปลอดภัย 100%</b> ช่วยให้คุณเป็น<b>โปร</b>เร็วและ<b>ครอง</b>เกมที่ชอบ'; I18N.th.tm1 = "(รีวิวจากผู้ซื้อ 100K+)"; I18N.th.tm2 = "เติม Robux ไวและปลอดภัย"; I18N.th.tm3 = "ไอเทม & สัตว์ Brainrot ระดับสูง"; I18N.th.tm4 = "บัญชี ROBLOX ระดับสูง"; I18N.th.tm5 = "สต็อกพรีเมียมตลอด"; I18N.th.tm6 = "ปลอดภัย 100%"; I18N.th.tm7 = "เร็วดั่งฟ้าผ่า ⚡";
I18N.vi.sl1_t = "MẶT NGƯỢNG TRƯỚC BẠN BÈ?"; I18N.vi.sl1_g = "VỀ CUỐI Ở ROBLOX?"; I18N.vi.sl1_sub = 'YÊN TÂM, ROCKSTAR.STORE <span class="mega-blue">Có giải pháp</span>'; I18N.vi.sl1_tag = 'MÓN <b>PREMIUM</b> CAM KẾT LÊN <b>CẤP</b> NHANH VÀ <b>TỰ TIN</b> HƠN'; I18N.vi.sl2_t = "CHÀO MỪNG ĐẾN"; I18N.vi.sl2_sub = 'CỬA HÀNG ROBLOX <span class="mega-blue">NO.1 THẾ GIỚI</span>'; I18N.vi.sl2_b1 = "Giá rẻ nhất"; I18N.vi.sl2_b2 = "Xử lý nhanh nhất"; I18N.vi.sl2_b3 = "An toàn 100%"; I18N.vi.sl2_tag = 'TẤT CẢ ĐƠN <b>SIÊU TỐC</b>, CAM KẾT LÊN <b>CẤP</b>'; I18N.vi.sl3_t = "NẠP ROBUX TỨC THÌ"; I18N.vi.sl3_g = "RẺ NHẤT"; I18N.vi.sl3_sub = "VÍA ID • GAMEPASS • THẺ QUÀ TẶNG"; I18N.vi.sl3_b1 = "Xử lý chớp nhoáng"; I18N.vi.sl3_b2 = "Thanh toán đủ kiểu"; I18N.vi.sl3_b3 = "Bảo hành 100%"; I18N.vi.sl3_cta = "Nạp ngay 💰"; I18N.vi.sl4_br = "★ BRAINROT & TÀI KHOẢN ★"; I18N.vi.sl4_t = "LÊN CẤP"; I18N.vi.sl4_g = "VƯỢN HÀNG ĐẦU"; I18N.vi.sl4_sub = "KHO SECRET • OG • MUTASI HIẾM"; I18N.vi.sl4_b1 = "Kho nhiều nhất"; I18N.vi.sl4_b2 = "Bảo đảm hoàn toàn"; I18N.vi.sl4_b3 = "CS trả lời cực nhanh"; I18N.vi.sl4_cta = "Xem danh mục 🧠"; I18N.vi.sl5_br = "★ DỊCH VỤ TÌM TÀI KHOẢN ★"; I18N.vi.sl5_t = "MUỐN MUA"; I18N.vi.sl5_g = "TÀI KHOẢN GAME?"; I18N.vi.sl5_rib = "YÊN TÂM, ADMIN ROCKSTAR LO HẾT"; I18N.vi.sl5_cta = "Tìm tài khoản 👤"; I18N.vi.sl5_s1 = "GỬI YÊU CẦU TÀI KHOẢN BẠN MUỐN"; I18N.vi.sl5_s2 = "ADMIN TÌM TÀI KHOẢN ĐÚNG MONG MUỐN CỦA BẠN"; I18N.vi.sl5_s3 = "TÀI KHOẢN XONG LÀ CHƠI ĐƯỢC — CHƠI VUI VẺ"; I18N.vi.sl6_br = "★ BOOST CHUYÊN ★"; I18N.vi.sl6_t = "DỊCH VỤ BOOST"; I18N.vi.sl6_g = "BOOST CHUYÊN NHIỀU MAP"; I18N.vi.sl6_sub = 'Dịch vụ boost <span class="mega-blue">chuyên nghiệp</span>, <span class="mega-blue">nhanh</span> và <span class="mega-blue">an toàn 100%</span> giúp bạn sớm thành <span class="mega-blue">cao thủ</span> và <span class="mega-blue">thống trị</span> game yêu thích.'; I18N.vi.sl6_b1 = "⚡ XỬ LÝ NHANH"; I18N.vi.sl6_b2 = "🔒 AN TOÀN & UY TÍN"; I18N.vi.sl6_cta = "BẤM VÀO ĐÂY 👆"; I18N.vi.sl7_br = "★ KÊNH CHÍNH HÃNG ★"; I18N.vi.sl7_t = 'THAM GIA <span class="mega-gold">KÊNH</span>'; I18N.vi.sl7_g = "CHÍNH HÃNG ROCKSTAR"; I18N.vi.sl7_sub = 'ĐƠN NHANH HƠN, ADMIN HOẠT ĐỘNG HƠN,<br>THÔNG TIN ĐẦY ĐỦ HƠN.'; I18N.vi.sl7_cta = "THAM GIA NGAY"; I18N.vi.sl8_br = "★ TIKTOK CHÍNH HÃNG ★"; I18N.vi.sl8_g = "FOLLOW TRƯỚC NHÉ DUL!"; I18N.vi.sl8_tag = 'ĐỪNG QUÊN FOLLOW NHÉ! CẢNH GIÁC VỚI CLONE — THẬT CHỈ CÓ <b>@ROCKSTARSTOREE</b>'; I18N.vi.ha_br = "★ TÀI KHOẢN CAO CẤP ★"; I18N.vi.ha_t1 = "TÀI KHOẢN"; I18N.vi.ha_t2 = "CAO CẤP ROBLOX"; I18N.vi.ha_sub = 'Tài khoản Roblox cao cấp nhiều map với <b>an toàn 100%</b>, dùng ngay để <b>thống trị</b> game <b>yêu thích</b> và <b>tự tin</b> hơn.'; I18N.vi.hb_br = "★ BRAINROT CAO CẤP ★"; I18N.vi.hb_t1 = "BRAINROT"; I18N.vi.hb_t2 = "CAO CẤP PREMIUM"; I18N.vi.hb_sub = 'Brainrot <b>chất lượng premium</b> nhiều map Roblox giúp bạn <b>lên cấp</b> nhanh và <b>thống trị</b> map yêu thích.'; I18N.vi.hj_t1 = "DỊCH VỤ"; I18N.vi.hj_t2 = "BOOST"; I18N.vi.hj_sub = 'Dịch vụ boost <b>chuyên nghiệp</b>, <b>nhanh</b> và <b>an toàn 100%</b> giúp bạn thành <b>cao thủ</b> nhanh và <b>thống trị</b> game yêu thích.'; I18N.vi.tm1 = "(100K+ đánh giá người mua)"; I18N.vi.tm2 = "Nạp Robux nhanh và an toàn"; I18N.vi.tm3 = "Món & thú Brainrot cao cấp"; I18N.vi.tm4 = "Tài khoản ROBLOX cao cấp"; I18N.vi.tm5 = "Kho luôn cao cấp"; I18N.vi.tm6 = "AN TOÀN 100%"; I18N.vi.tm7 = "XỬ LÝ CHÓP NHOÁNG ⚡";
function lang(){ try { return localStorage.getItem("rs_lang") || "id"; } catch(e){ return "id"; } }
function tr(k){ const L = I18N[lang()] || {}; if(L[k] !== undefined) return L[k]; const D = I18N.id || {}; return (D[k] !== undefined) ? D[k] : k; }
function applyLang(){
  const L = lang();
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if(I18N[L] && I18N[L][k] !== undefined) el.textContent = I18N[L][k];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const k = el.getAttribute("data-i18n-ph");
    if(I18N[L] && I18N[L][k] !== undefined) el.setAttribute("placeholder", I18N[L][k]);
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const k = el.getAttribute("data-i18n-html");
    if(I18N[L] && I18N[L][k] !== undefined) el.innerHTML = I18N[L][k];
  });
  const b = document.getElementById("langBtn");
  const info = RS_LANGS.find(x=>x.code===L);
  const D = I18N[L] || {};
  if(b && info) b.textContent = (D.lang_btn || "Bahasa") + " " + info.flag;
  const cb = document.getElementById("curBtn");
  const ci = RS_CURRENCY_INFO[currency()] || RS_CURRENCY_INFO.IDR;
  if(cb) cb.textContent = (D.cur_btn || "Mata Uang") + " " + ci.flag;
  const cb2 = document.getElementById("mnavCur");
  if(cb2) cb2.textContent = (D.cur_btn || "Mata Uang") + " " + ci.flag;
  const b2 = document.getElementById("mnavLang");
  const info2 = RS_LANGS.find(x=>x.code===L);
  if(b2 && info2) b2.textContent = (D.lang_btn || "Bahasa") + " " + info2.flag;
  const cartStr = String(D.cart || tr("cart")).trim();
  const cartParts = cartStr.split(/\s+/);
  const cartWord = cartParts.length > 1 ? cartParts.slice(1).join(" ") : cartStr;
  document.documentElement.style.setProperty("--fablabel", '"' + cartWord.replace(/"/g, "&quot;") + '"');
}
function toggleLang(){ /* legacy */ }
const RS_LANGS = [
  { code: "id", flag: "🇮🇩", label: "Indonesia" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "th", flag: "🇹🇭", label: "ไทย" },
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" }
];
function selectLang(code){
  try { localStorage.setItem("rs_lang", code); } catch(e) {}
  const L = code;
  ["langBtn","mnavLang"].forEach(id=>{ const b=document.getElementById(id); const info=RS_LANGS.find(x=>x.code===code); if(b&&info) b.textContent="Bahasa "+info.flag; });
  try { applyLang(); } catch(e) {}
  try { render(); } catch(e) {}
}
function anchorMenu(m, btn){
  /* Panel ikat-ke-tombol: muncul di bawah tombol yang diklik,
     dikawal biar tidak keluar layar, dibalik ke atas bila ruang bawah kurang. */
  if (!btn || !btn.getBoundingClientRect) btn = document.body;
  const r = btn.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
  m.style.display = "grid";
  const w = m.offsetWidth, h = m.offsetHeight;
  let x = Math.max(8, Math.min(r.left + r.width/2 - w/2, vw - w - 8));
  let y = r.bottom + 8;
  if (y + h > vh - 8) y = Math.max(8, Math.min(r.top - h - 8, vh - h - 8));
  m.style.left = Math.round(x) + "px";
  m.style.top = Math.round(y) + "px";
  m.style.transform = "none";
}
function toggleLangMenu(e){
  if (e) e.stopPropagation();
  const cm = document.getElementById("curMenu"); if (cm) cm.style.display="none";
  let m = document.getElementById("langMenu");
  if (!m){ m = document.createElement("div"); m.id="langMenu"; m.style.cssText="position:fixed;z-index:9999;background:#0e1628;border:1px solid var(--line);border-radius:10px;padding:6px;display:none;grid-template-columns:repeat(3,1fr);gap:4px;min-width:240px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;"; document.body.appendChild(m); }
  if (m.style.display==="grid"){ m.style.display="none"; return; }
  const cur = lang();
  m.innerHTML = RS_LANGS.map(l=>`<button onclick="selectLang('${l.code}');document.getElementById('langMenu').style.display='none';" style="background:transparent;border:none;color:#fff;padding:8px 6px;text-align:center;border-radius:6px;cursor:pointer;font-size:13px;">${l.code===cur?'<span style="color:#3b82f6">✓</span> ':''}${l.flag}<br>${l.label}</button>`).join("");
  anchorMenu(m, (e && e.currentTarget) || document.getElementById("langBtn") || document.getElementById("mnavLang"));
  document.addEventListener("click", function hide(ev){ if(!m.contains(ev.target)){ m.style.display="none"; document.removeEventListener("click",hide);} }, {once:true});
}
function toggleCurrency(){ /* legacy */ selectCurrency(currency()); }
const RS_CURRENCIES = { IDR: 1, USD: 0.000062, MYR: 0.00028, SGD: 0.000083, CNY: 0.00045, JPY: 0.0095, THB: 0.0022 };
const RS_CURRENCY_INFO = { IDR:{flag:"🇮🇩",sym:"Rp",loc:"id-ID"}, USD:{flag:"🇺🇸",sym:"$",loc:"en-US"}, MYR:{flag:"🇲🇾",sym:"RM",loc:"en-MY"}, SGD:{flag:"🇸🇬",sym:"S$",loc:"en-SG"}, CNY:{flag:"🇨🇳",sym:"¥",loc:"zh-CN"}, JPY:{flag:"🇯🇵",sym:"¥",loc:"ja-JP"}, THB:{flag:"🇹🇭",sym:"฿",loc:"th-TH"} };
// Fetch live rates from IDR
fetch("https://open.er-api.com/v6/latest/IDR").then(r=>r.json()).then(d=>{ if(d&&d.rates){ Object.keys(RS_CURRENCIES).forEach(c=>{ if(d.rates[c]) RS_CURRENCIES[c]=d.rates[c]; }); } }).catch(()=>{});
function currency(){ try { return localStorage.getItem("rs_currency") || "IDR"; } catch(e) { return "IDR"; } }
function setCurrency(c){ try { localStorage.setItem("rs_currency", c); } catch(e) {} }
function selectCurrency(c){
  if(!RS_CURRENCY_INFO[c]) c = "IDR";
  setCurrency(c);
  const info = RS_CURRENCY_INFO[c] || RS_CURRENCY_INFO.IDR;
  ["curBtn","mnavCur"].forEach(id=>{ const b=document.getElementById(id); if(b) b.textContent="Mata Uang "+info.flag; });
  try { render(); } catch(e) {}
}
function closeCurLangMenus(){ const cm=document.getElementById("curMenu"); if(cm) cm.style.display="none"; const lm=document.getElementById("langMenu"); if(lm) lm.style.display="none"; }
window.addEventListener("scroll", closeCurLangMenus, {passive:true});
window.addEventListener("touchmove", closeCurLangMenus, {passive:true});
window.addEventListener("wheel", closeCurLangMenus, {passive:true});
function toggleCurrencyMenu(e){
  if (e) e.stopPropagation();
  const lm = document.getElementById("langMenu"); if (lm) lm.style.display="none";
  let m = document.getElementById("curMenu");
  if (!m){ m = document.createElement("div"); m.id="curMenu"; m.style.cssText="position:fixed;z-index:9999;background:#0e1628;border:1px solid var(--line);border-radius:10px;padding:6px;display:none;grid-template-columns:repeat(3,1fr);gap:4px;min-width:180px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;"; document.body.appendChild(m); }
  if (m.style.display==="grid"){ m.style.display="none"; return; }
  m.innerHTML = Object.keys(RS_CURRENCIES).map(c=>{ const info=RS_CURRENCY_INFO[c]; return `<button onclick="selectCurrency('${c}');document.getElementById('curMenu').style.display='none';" style="background:transparent;border:none;color:#fff;padding:8px 6px;text-align:center;border-radius:6px;cursor:pointer;font-size:13px;">${c===currency()?'<span style="color:#3b82f6">✓</span> ':''}${info.flag}<br>${c}</button>`; }).join("");
  anchorMenu(m, (e && e.currentTarget) || document.getElementById("curBtn") || document.getElementById("mnavCur"));
  document.addEventListener("click", function hide(ev){ if(!m.contains(ev.target)){ m.style.display="none"; document.removeEventListener("click",hide);} }, {once:true});
}
function formatCurrency(idr){
  return "Rp " + Math.round(Number(idr) || 0).toLocaleString("id-ID");
}
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
    <h2>${currentPage === 'brainrot' ? tr("cat_brainrot") : (currentPage === 'akun' ? tr("cat_akun") : (currentPage === 'joki' ? tr("cat_joki") : tr("cat_topup")))}</h2>
    <p>${categories.length} ${tr("cat_sub")}</p>`;
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
      <img class="detailimg" src="${fixImg(files[k])}" alt="${item.name}" onerror="imgErr(this)">
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
        <img src="${itemImage}" alt="${item.name}" loading="lazy" onerror="imgErr(this)">
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
