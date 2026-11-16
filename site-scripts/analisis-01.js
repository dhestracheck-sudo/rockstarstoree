const ADMIN_PIN = "112233";
const ADMIN_SESSION_PIN_KEY = "rs_admin_unlocked_pin_v1";
const ANALISIS_TAB_KEY = "rs_analisis_active_tab_v1";
const SB_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SB_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";

function sbTable(sheet) {
  sheet = String(sheet || "").toLowerCase();
  if (sheet === "akun") return "akun";
  if (sheet === "info") return "info";
  if (sheet === "topup") return "topup";
  if (sheet === "joki") return "joki";
  return "brainrot";
}

function sbH(extra) {
  return Object.assign({ apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" }, extra || {});
}

function pinH(extra) {
  const h = sbH(extra);
  const p = document.getElementById("pinInput");
  h["x-admin-pin"] = p ? (p.value || "") : "";
  return h;
}

function sbList(sheet) {
  return fetch(SB_URL + "/rest/v1/" + sbTable(sheet) + "?select=name,kategori,stock,dilihat,sold&order=urutan", {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }
  }).then(r => r.json()).then(a => Array.isArray(a) ? a : []).catch(() => []);
}

function escHtml(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let CACHED_CATALOG_PROMISE = null;
function fetchCatalogOnce(force) {
  if (!force && CACHED_CATALOG_PROMISE) return CACHED_CATALOG_PROMISE;
  const tabs = ["Brainrot", "Akun", "Topup", "Joki"];
  CACHED_CATALOG_PROMISE = Promise.all(tabs.map(t => sbList(t).then(rows => ({ tab: t, rows }))))
    .catch(() => tabs.map(t => ({ tab: t, rows: [] })));
  return CACHED_CATALOG_PROMISE;
}

const lazyLoaded = { omzet: false, produk: false };
window.ANALISIS_ORDER_FILTER = "baru";
let CACHED_ORDERS_LIST = [];
let lastBaru = -1;

function openAnalisisTab(tabName) {
  const valid = ["orders", "omzet", "produk"];
  const next = valid.includes(tabName) ? tabName : "orders";
  document.querySelectorAll(".an-tab-btn").forEach(btn => {
    const active = btn.dataset.antab === next;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".an-tab-panel").forEach(p => {
    p.classList.toggle("active", p.id === "antab-" + next);
  });
  try { sessionStorage.setItem(ANALISIS_TAB_KEY, next); } catch (_) {}

  if (next === "omzet" && !lazyLoaded.omzet) {
    lazyLoaded.omzet = true;
    loadRekap();
  } else if (next === "produk" && !lazyLoaded.produk) {
    lazyLoaded.produk = true;
    loadAnalisis(false);
  }
}
window.openAnalisisTab = openAnalisisTab;

function setOrderFilter(mode) {
  window.ANALISIS_ORDER_FILTER = ["all", "baru", "lunas"].includes(mode) ? mode : "baru";
  renderOrdersList();
}
window.setOrderFilter = setOrderFilter;

function refreshAllAnalisis() {
  const btn = document.getElementById("analBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Memuat..."; }
  lazyLoaded.omzet = false;
  lazyLoaded.produk = false;
  CACHED_CATALOG_PROMISE = null;
  Promise.all([loadOrders(false), loadBriefing()]).finally(() => {
    if (btn) { btn.disabled = false; btn.textContent = "🔄 Muat Ulang"; }
    let cur = "orders";
    try { cur = sessionStorage.getItem(ANALISIS_TAB_KEY) || "orders"; } catch (_) {}
    if (cur === "omzet") { lazyLoaded.omzet = true; loadRekap(); }
    if (cur === "produk") { lazyLoaded.produk = true; loadAnalisis(true); }
  });
}
window.refreshAllAnalisis = refreshAllAnalisis;

function unlock() {
  const pinEl = document.getElementById("pinInput");
  const errEl = document.getElementById("pinError");
  const val = pinEl ? pinEl.value : "";
  if (val === ADMIN_PIN) {
    if (errEl) errEl.textContent = "";
    try { sessionStorage.setItem(ADMIN_SESSION_PIN_KEY, val); } catch (_) {}
    const pinCard = document.getElementById("pinCard");
    if (pinCard) pinCard.style.display = "none";
    const mainCard = document.getElementById("mainCard");
    if (mainCard) mainCard.style.display = "block";
    const btn = document.getElementById("analBtn");
    if (btn) btn.style.display = "inline-flex";
    const lbtn = document.getElementById("lockAnalisisBtn");
    if (lbtn) lbtn.style.display = "inline-flex";

    loadOrders(true);
    loadBriefing();

    let cur = "orders";
    try { cur = sessionStorage.getItem(ANALISIS_TAB_KEY) || "orders"; } catch (_) {}
    openAnalisisTab(cur);

    if (window.__orderTimer) clearInterval(window.__orderTimer);
    window.__orderTimer = setInterval(function () { loadOrders(false); }, 20000);
  } else {
    if (errEl) errEl.textContent = "PIN salah. Coba lagi.";
    else alert("PIN salah.");
    if (pinEl) { pinEl.focus(); pinEl.select(); }
  }
}
window.unlock = unlock;

function lockAnalisis() {
  try { sessionStorage.removeItem(ADMIN_SESSION_PIN_KEY); } catch (_) {}
  if (window.__orderTimer) clearInterval(window.__orderTimer);
  lazyLoaded.omzet = false;
  lazyLoaded.produk = false;
  const pinEl = document.getElementById("pinInput");
  if (pinEl) pinEl.value = "";
  const errEl = document.getElementById("pinError");
  if (errEl) errEl.textContent = "";
  const mainCard = document.getElementById("mainCard");
  if (mainCard) mainCard.style.display = "none";
  const btn = document.getElementById("analBtn");
  if (btn) btn.style.display = "none";
  const lbtn = document.getElementById("lockAnalisisBtn");
  if (lbtn) lbtn.style.display = "none";
  const pinCard = document.getElementById("pinCard");
  if (pinCard) pinCard.style.display = "block";
  if (pinEl) pinEl.focus();
}
window.lockAnalisis = lockAnalisis;

function loadBriefing() {
  const box = document.getElementById("asistenBox");
  if (!box) return Promise.resolve();
  return fetchCatalogOnce(false).then(tabs => {
    let habisLaris = 0, tipis = 0;
    tabs.forEach(t => (t.rows || []).forEach(o => {
      const nm = String(o.name || "").trim();
      if (!nm || nm.indexOf("CAT:") === 0 || nm.indexOf("INFO_") === 0) return;
      const st = Number(o.stock);
      if (st === 0 && (Number(o.dilihat) || 0) > 10) habisLaris++;
      else if (st > 0 && st <= 3) tipis++;
    }));
    const baruTxt = lastBaru > 0 ? lastBaru + " order menunggu" : "Semua order aman";
    const stokTxt = (habisLaris ? habisLaris + " produk habis" : (tipis ? tipis + " stok menipis" : "Stok aman"));
    box.innerHTML =
      '<div class="an-brief-stats">' +
        '<span class="an-chip ' + (lastBaru > 0 ? "warn" : "good") + '">📦 ' + baruTxt + '</span>' +
        '<span class="an-chip">' + (habisLaris || tipis ? "⚠️ " : "✅ ") + stokTxt + '</span>' +
      '</div>' +
      '<button type="button" class="an-pill-btn" onclick="openAnalisisTab(\'produk\')">Lihat detail →</button>';
  }).catch(() => {});
}

function orderBeep() {
  try {
    var C = window.AudioContext || window.webkitAudioContext;
    var c = new C(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = 880; g.gain.value = 0.08; o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
    o.stop(c.currentTime + 0.6);
  } catch (_) {}
}

var stkJobs = [];
function orderItemsHtml(o, oid) {
  let det = [];
  try { det = JSON.parse(o.items) || []; } catch (_) {}
  if (!Array.isArray(det) || !det.length) return escHtml(o.items).slice(0, 300);
  const rbxUser = (det[0] && det[0].u) ? String(det[0].u).trim() : "";
  const userHtml = rbxUser
    ? '<div class="an-order-buyer">👤 Roblox: <b>' + escHtml(rbxUser) + '</b></div>'
    : '';
  const listHtml = det.map(function (d, ix) {
    stkJobs.push({ id: "stk-" + oid + "-" + ix, tbl: sbTable(d.p), nm: d.n, q: Number(d.q) || 0 });
    return "• " + escHtml(d.n).slice(0, 58) + " ×" + (Number(d.q) || 0) +
      ' <span id="stk-' + oid + '-' + ix + '" style="color:var(--mut);font-size:12px;">cek stok...</span>';
  }).join("<br>");
  return userHtml + '<div class="an-order-items">' + listHtml + '</div>';
}

function refreshOrderStocks() {
  stkJobs.forEach(function (job) {
    fetch(SB_URL + "/rest/v1/" + job.tbl + "?select=stock&name=eq." + encodeURIComponent(job.nm), { headers: sbH() })
      .then(r => r.json()).then(function (rr) {
        const el = document.getElementById(job.id);
        if (!el) return;
        if (!(rr && rr[0] && rr[0].stock !== undefined && rr[0].stock !== null)) {
          el.textContent = "(produk tidak ketemu)";
          el.style.color = "#fca5a5";
          return;
        }
        el.textContent = "(stok kini: " + rr[0].stock + ")";
      }).catch(() => {});
  });
  stkJobs = [];
}

function orderWaktu(s) {
  try { return new Date(s).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch (_) { return ""; }
}

function renderOrdersList() {
  const box = document.getElementById("orderBox");
  if (!box) return;
  const rows = CACHED_ORDERS_LIST || [];
  const today = new Date().toDateString();
  let rekapN = 0, rekapRp = 0, nBaru = 0, nLunas = 0;

  rows.forEach(o => {
    const st = String(o.status || "baru");
    if (st === "baru") nBaru++;
    if (st === "lunas") {
      nLunas++;
      try {
        if (new Date(o.waktu).toDateString() === today) {
          rekapN++;
          rekapRp += Number(o.total) || 0;
        }
      } catch (_) {}
    }
  });

  const filter = window.ANALISIS_ORDER_FILTER || "baru";
  // Jika filter 'baru' kosong tetapi ada order lunas/all, tampilkan info bersih
  const filtered = rows.filter(o => filter === "all" || String(o.status || "baru") === filter);

  let h = '<div class="an-toolbar">' +
    '<div class="an-filter-pills">' +
      '<button type="button" class="an-filter-btn ' + (filter === "baru" ? "active" : "") + '" onclick="setOrderFilter(\'baru\')">Menunggu (' + nBaru + ')</button>' +
      '<button type="button" class="an-filter-btn ' + (filter === "lunas" ? "active" : "") + '" onclick="setOrderFilter(\'lunas\')">Lunas (' + nLunas + ')</button>' +
      '<button type="button" class="an-filter-btn ' + (filter === "all" ? "active" : "") + '" onclick="setOrderFilter(\'all\')">Semua (' + rows.length + ')</button>' +
    '</div>' +
    '<div style="display:flex;gap:6px;align-items:center;">' +
      '<span class="an-chip good">Hari ini: ' + rekapN + ' • Rp ' + rekapRp.toLocaleString("id-ID") + '</span>' +
      '<button type="button" class="an-pill-btn" onclick="notifOn()">🔔 Notif</button>' +
    '</div>' +
  '</div>';

  if (!filtered.length) {
    h += '<p class="hint">' + (filter === "baru" ? "Tidak ada order menunggu saat ini." : "Belum ada order di filter ini.") + '</p>';
  }

  const stCol = { baru: "#60a5fa", lunas: "#22c55e", batal: "#64748b" };
  stkJobs = [];
  filtered.slice(0, 25).forEach(function (o) {
    const st = String(o.status || "baru");
    const col = stCol[st] || "#94a3b8";
    h += '<div class="an-order-card" style="border-left-color:' + col + ';">' +
      '<div class="an-order-head">' +
        '<div><span class="an-order-id">#' + o.id + '</span> <span style="color:' + col + ';font-size:12px;font-weight:700;margin-left:6px;">' + escHtml(st.toUpperCase()) + '</span>' +
        '<span style="color:var(--mut);font-size:12px;margin-left:8px;">' + orderWaktu(o.waktu) + '</span></div>' +
        '<div class="an-order-price">Rp ' + Number(o.total || 0).toLocaleString("id-ID") + '</div>' +
      '</div>' +
      orderItemsHtml(o, o.id) +
      (st === "lunas" ? '<div data-cred="' + o.id + '"></div>' : '') +
      (st === "baru"
        ? '<div class="an-order-actions">' +
            '<button type="button" class="btn-lunas" onclick="orderSet(' + o.id + ',\'lunas\')">✅ Lunas</button>' +
            '<button type="button" class="btn-batal" onclick="orderSet(' + o.id + ',\'batal\')">✖ Batal</button>' +
          '</div>'
        : '') +
    '</div>';
  });

  box.innerHTML = h;
  refreshOrderStocks();
  refreshOrderCreds();
}

function loadOrders(first) {
  const box = document.getElementById("orderBox");
  const pCount = fetch(SB_URL + "/rest/v1/orders?select=status", { headers: sbH() })
    .then(r => r.json()).then(all => {
      try {
        const nBaruAll = (Array.isArray(all) ? all : []).filter(o => String(o.status) === "baru").length;
        if (!first && lastBaru >= 0 && nBaruAll > lastBaru) {
          orderBeep();
          try {
            if (window.Notification && Notification.permission === "granted") {
              new Notification("Order baru!", { body: nBaruAll + " menunggu diproses" });
            }
          } catch (_) {}
        }
        lastBaru = nBaruAll;
        document.title = (nBaruAll ? "(" + nBaruAll + ") " : "") + "Analisis — Rockstar.Store";
        loadBriefing();
      } catch (_) {}
    }).catch(() => {});

  const pRows = fetch(SB_URL + "/rest/v1/orders?select=*&order=waktu.desc&limit=40", { headers: sbH() })
    .then(r => r.json()).then(rows => {
      CACHED_ORDERS_LIST = (Array.isArray(rows) ? rows : []).filter(o => String(o.status) !== "batal");
      renderOrdersList();
    }).catch(() => {
      if (first && box) box.innerHTML = '<span class="err">Gagal ambil order.</span>';
    });

  return Promise.all([pCount, pRows]);
}

function notifOn() {
  try {
    if (!window.Notification) { alert("Browser tidak dukung notifikasi."); return; }
    Notification.requestPermission().then(function (p) { alert(p === "granted" ? "Notifikasi aktif ✅" : "Notifikasi ditolak."); });
  } catch (_) { alert("Browser tidak dukung notifikasi."); }
}
window.notifOn = notifOn;

function orderSet(id, st) {
  if (st === "batal" && !confirm("Batalkan order #" + id + "? Data akun kembali READY.")) return;
  if (st === "lunas" && !confirm("Lunaskan order #" + id + "? Stok berkurang dan akun otomatis diambil.")) return;

  fetch(SB_URL + "/rest/v1/orders?select=*&id=eq." + id, { headers: sbH() })
    .then(r => r.json()).then(function (rows) {
      const o = (rows && rows[0]) || null;
      if (!o) return;
      return fetch(SB_URL + "/rest/v1/orders?id=eq." + id, {
        method: "PATCH",
        headers: sbH(),
        body: JSON.stringify({ status: st })
      }).then(function () {
        let det = [];
        try { det = JSON.parse(o.items) || []; } catch (_) {}
        if (!Array.isArray(det)) det = [];

        if (st === "lunas") {
          det.forEach(function (d) {
            const tbl = sbTable(d.p);
            const q = Number(d.q) || 0;
            const isAkun = String(d.p || "").toLowerCase() === "akun";
            if (isAkun) {
              for (let k = 0; k < q; k++) {
                fetch(SB_URL + "/rest/v1/akun_data?select=id&product=eq." + encodeURIComponent(d.n) + "&status=eq.ready&order=id&limit=1", { headers: pinH() })
                  .then(r => r.json()).then(function (rr) {
                    if (!(rr && rr[0])) return;
                    const rid = rr[0].id;
                    fetch(SB_URL + "/rest/v1/akun_data?id=eq." + rid + "&status=eq.ready", {
                      method: "PATCH", headers: pinH({ Prefer: "return=representation" }),
                      body: JSON.stringify({ status: "sold", order_id: id })
                    }).then(r => r.json()).then(function (ok) {
                      if (!(ok && ok[0])) return;
                      fetch(SB_URL + "/rest/v1/" + tbl + "?select=sold&name=eq." + encodeURIComponent(d.n), { headers: sbH() })
                        .then(r => r.json()).then(function (sr) {
                          const curT = (sr && sr[0]) ? Number(sr[0].sold) || 0 : 0;
                          fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(d.n), {
                            method: "PATCH", headers: sbH(), body: JSON.stringify({ sold: curT + 1 })
                          }).catch(() => {});
                        }).catch(() => {});
                    }).catch(() => {});
                  }).catch(() => {});
              }
            } else {
              fetch(SB_URL + "/rest/v1/" + tbl + "?select=stock,sold&name=eq." + encodeURIComponent(d.n), { headers: sbH() })
                .then(r => r.json()).then(function (rr) {
                  if (!(rr && rr[0])) return;
                  const curS = Number(rr[0].stock) || 0;
                  const curT = Number(rr[0].sold) || 0;
                  fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(d.n), {
                    method: "PATCH", headers: sbH(),
                    body: JSON.stringify({ stock: Math.max(0, curS - q), sold: curT + q })
                  }).catch(() => {});
                }).catch(() => {});
            }
          });
        }

        if (st === "batal") {
          fetch(SB_URL + "/rest/v1/akun_data?select=id&order_id=eq." + id, { headers: pinH() })
            .then(r => r.json()).then(function (rr) {
              (rr || []).forEach(function (x) {
                fetch(SB_URL + "/rest/v1/akun_data?id=eq." + x.id, {
                  method: "PATCH", headers: pinH(),
                  body: JSON.stringify({ status: "ready", order_id: null })
                }).catch(() => {});
              });
            }).catch(() => {});
        }

        loadOrders(false);
        if (lazyLoaded.omzet) loadRekap();
      });
    }).catch(() => { alert("Gagal ubah status."); });
}
window.orderSet = orderSet;

function copyTxt(t, el) {
  const done = function () { if (el) { const o = el.textContent; el.textContent = "✅ Tersalin"; setTimeout(function () { el.textContent = o; }, 1200); } };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(done).catch(() => { fallbackCopy(t); done(); });
    } else { fallbackCopy(t); done(); }
  } catch (_) { fallbackCopy(t); done(); }
}
window.copyTxt = copyTxt;

function fallbackCopy(t) {
  try {
    const ta = document.createElement("textarea");
    ta.value = t; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
  } catch (_) {}
}

function refreshOrderCreds() {
  document.querySelectorAll("[data-cred]").forEach(function (el) {
    const oid = el.getAttribute("data-cred");
    fetch(SB_URL + "/rest/v1/akun_data?select=product,akun_id,akun_pw&order_id=eq." + oid + "&order=id", { headers: pinH() })
      .then(r => r.json()).then(function (rr) {
        if (!rr || !rr.length) return;
        el.innerHTML = rr.map(function (x) {
          const cred = String(x.akun_id) + " / " + String(x.akun_pw);
          const escCred = escHtml(cred);
          const safeJs = cred.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
          return '<div class="an-cred-box">🔑 ' + escHtml(String(x.product)).slice(0, 48) +
            '<br><b>' + escCred + '</b><br>' +
            '<button type="button" onclick="copyTxt(\'' + safeJs + '\',this)">📋 Copy Akun</button></div>';
        }).join("");
      }).catch(() => {});
  });
}

function loadRekap() {
  const box = document.getElementById("rekapBox");
  if (!box) return;
  box.innerHTML = '<p class="hint">Menghitung omzet...</p>';
  fetch(SB_URL + "/rest/v1/orders?select=status,total,waktu&order=waktu.desc&limit=5000", { headers: sbH() })
    .then(r => r.json()).then(function (rows) {
      rows = Array.isArray(rows) ? rows : [];
      const now = new Date();
      const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const start7 = startDay - 6 * 86400000;
      const start30 = startDay - 29 * 86400000;
      const P = { day: { n: 0, rp: 0 }, w7: { n: 0, rp: 0 }, m30: { n: 0, rp: 0 }, all: { n: 0, rp: 0 } };
      let hutang = 0, hutangRp = 0;
      rows.forEach(function (o) {
        if (String(o.status) !== "lunas") {
          if (String(o.status) === "baru") { hutang++; hutangRp += Number(o.total) || 0; }
          return;
        }
        const t = new Date(o.waktu).getTime();
        const rp = Number(o.total) || 0;
        P.all.n++; P.all.rp += rp;
        if (t >= start30) { P.m30.n++; P.m30.rp += rp; }
        if (t >= start7) { P.w7.n++; P.w7.rp += rp; }
        if (t >= startDay) { P.day.n++; P.day.rp += rp; }
      });
      function card(t, p) {
        return '<div class="an-kpi-card">' +
          '<div class="an-kpi-val money">Rp ' + p.rp.toLocaleString("id-ID") + '</div>' +
          '<div class="an-kpi-sub">' + p.n + ' order lunas</div>' +
          '<div class="an-kpi-lbl">' + t + '</div></div>';
      }
      box.innerHTML = '<div class="an-kpi-grid">' +
        card("Hari Ini", P.day) + card("7 Hari Terakhir", P.w7) + card("30 Hari Terakhir", P.m30) + card("Semua Waktu", P.all) +
        '</div>' +
        '<p class="hint" style="margin-top:12px;">⏳ Menunggu pembayaran: <b style="color:var(--txt);">' + hutang + ' order (Rp ' + hutangRp.toLocaleString("id-ID") + ')</b></p>';
    }).catch(() => { box.innerHTML = '<span class="err">Gagal ambil rekap.</span>'; });
}

function loadAnalisis(force) {
  const box = document.getElementById("analBox");
  if (!box) return;
  box.innerHTML = '<p class="hint">Menghitung statistik...</p>';
  fetchCatalogOnce(force).then(function (tabs) {
    const all = [];
    tabs.forEach(function (t) {
      (t.rows || []).forEach(function (o) {
        const nm = String(o.name || "").trim();
        if (!nm || nm.indexOf("CAT:") === 0 || nm.indexOf("INFO_") === 0) return;
        all.push({
          tab: t.tab, name: nm,
          kat: String(o.kategori || "-").trim() || "-",
          lihat: Number(o.dilihat) || 0,
          stok: Number(o.stock),
          laku: Number(o.sold) || 0
        });
      });
    });

    const totLihat = all.reduce((s, o) => s + o.lihat, 0);
    const top = all.slice().sort((a, b) => b.lihat - a.lihat).slice(0, 10);
    const perKat = {};
    all.forEach(o => { const k = o.tab + " / " + o.kat; perKat[k] = (perKat[k] || 0) + o.lihat; });
    const topKat = Object.keys(perKat).map(k => ({ k, v: perKat[k] })).sort((a, b) => b.v - a.v).slice(0, 5);
    const habisLaris = all.filter(o => o.stok === 0).sort((a, b) => b.lihat - a.lihat).slice(0, 8);
    const tipis = all.filter(o => o.stok > 0 && o.stok <= 3).sort((a, b) => a.stok - b.stok).slice(0, 10);
    const maxV = top.length ? top[0].lihat : 0;

    let h = '<div class="an-kpi-grid">' +
      '<div class="an-kpi-card"><div class="an-kpi-val">' + totLihat.toLocaleString("id-ID") + '</div><div class="an-kpi-lbl">Total Produk Dilihat</div></div>' +
      '<div class="an-kpi-card"><div class="an-kpi-val">' + all.length + '</div><div class="an-kpi-lbl">Produk Aktif</div></div>' +
      '<div class="an-kpi-card"><div class="an-kpi-val">' + tipis.length + '</div><div class="an-kpi-lbl">Stok Menipis (≤3)</div></div>' +
      '<div class="an-kpi-card"><div class="an-kpi-val">' + habisLaris.length + '</div><div class="an-kpi-lbl">Perlu Restock (Habis)</div></div>' +
    '</div>';

    h += '<div class="an-two-col">';
    h += '<div class="an-panel-box"><h3>🔥 Top 10 Paling Dilihat</h3>';
    if (!top.length || !maxV) h += '<p class="hint">Belum ada data lihat.</p>';
    top.forEach((o, i) => {
      const p = maxV ? Math.max(4, Math.round(o.lihat / maxV * 100)) : 0;
      h += '<div><b>' + (i + 1) + '.</b> ' + escHtml(o.name).slice(0, 50) +
        ' <span style="color:var(--mut);font-size:12px;">(' + escHtml(o.tab) + ' • 👁 ' + o.lihat.toLocaleString("id-ID") + ' • terjual ' + o.laku.toLocaleString("id-ID") + ')</span>' +
        '<div class="an-bar-track"><span class="an-bar-fill" style="width:' + p + '%;"></span></div></div>';
    });
    h += '</div>';

    h += '<div style="display:flex;flex-direction:column;gap:14px;">';
    h += '<div class="an-panel-box"><h3>⚠️ Stok Menipis &amp; Restock</h3>' +
      (habisLaris.length ? '<div style="margin-bottom:8px;"><b style="color:#fca5a5;">Habis paling banyak dicari:</b><br>' + habisLaris.slice(0, 5).map(o => "• " + escHtml(o.name).slice(0, 45) + " (👁 " + o.lihat + ")").join("<br>") + '</div>' : '') +
      (tipis.length ? '<div><b style="color:#fde047;">Stok tersisa ≤3:</b><br>' + tipis.map(o => "• " + escHtml(o.name).slice(0, 45) + " — sisa " + o.stok).join("<br>") + '</div>' : '<span class="ok">✅ Tidak ada stok menipis.</span>') +
      '</div>';

    h += '<div class="an-panel-box"><h3>📂 Kategori Terlaris</h3>' +
      (topKat.length ? topKat.map((k, i) => (i + 1) + ". " + escHtml(k.k) + " — 👁 " + k.v.toLocaleString("id-ID")).join("<br>") : '<span class="hint">Belum ada data.</span>') +
      '</div>';

    h += '<div class="an-panel-box"><h3>🛒 Aktivitas Pengunjung (7 Hari)</h3><div id="analAct"><span class="hint">Memuat aktivitas...</span></div></div>';
    h += '</div></div>';

    box.innerHTML = h;
    loadAktivitas();
  }).catch(() => { box.innerHTML = '<span class="err">Gagal ambil statistik produk.</span>'; });
}

function loadAktivitas() {
  const el = document.getElementById("analAct");
  if (!el) return;
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  fetch(SB_URL + "/rest/v1/klik?select=aksi,name,price&order=waktu.desc&limit=5000&waktu=gte." + encodeURIComponent(since), {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }
  }).then(r => r.json()).then(function (rows) {
    rows = Array.isArray(rows) ? rows : [];
    const cnt = { klik: 0, keranjang: 0, checkout: 0, "wishlist+": 0 };
    const topKlik = {}, topKer = {}, topWish = {};
    rows.forEach(o => {
      const a = String(o.aksi || "");
      if (cnt[a] !== undefined) cnt[a]++;
      const nm = String(o.name || "").slice(0, 50);
      if (a === "klik" && nm) topKlik[nm] = (topKlik[nm] || 0) + 1;
      if (a === "keranjang" && nm) topKer[nm] = (topKer[nm] || 0) + 1;
      if (a === "wishlist+" && nm) topWish[nm] = (topWish[nm] || 0) + 1;
    });
    const toplist = (m, n) => Object.keys(m).map(k => ({ k, v: m[k] })).sort((a, b) => b.v - a.v).slice(0, n);
    let h = '<div>👁 Klik: <b>' + cnt.klik + '</b> → 🛒 Keranjang: <b>' + cnt.keranjang + '</b> → 💬 Checkout: <b>' + cnt.checkout + '</b> • ❤️ Favorit: <b>' + cnt["wishlist+"] + '</b></div>';
    const tk = toplist(topKlik, 5), tc = toplist(topKer, 5), tw = toplist(topWish, 5);
    h += '<div style="margin-top:8px;"><b>Paling diklik:</b><br>' + (tk.length ? tk.map((o, i) => (i + 1) + ". " + escHtml(o.k) + " (" + o.v + "x)").join("<br>") : '<span class="hint">belum ada</span>') + '</div>';
    h += '<div style="margin-top:8px;"><b>Paling masuk keranjang:</b><br>' + (tc.length ? tc.map((o, i) => (i + 1) + ". " + escHtml(o.k) + " (" + o.v + "x)").join("<br>") : '<span class="hint">belum ada</span>') + '</div>';
    h += '<div style="margin-top:8px;"><b>Paling difavoritkan ❤️:</b><br>' + (tw.length ? tw.map((o, i) => (i + 1) + ". " + escHtml(o.k) + " (" + o.v + "x)").join("<br>") : '<span class="hint">belum ada</span>') + '</div>';
    el.innerHTML = h;
  }).catch(() => { el.textContent = "Gagal ambil aktivitas."; });
}

(function autoRestoreAnalisisSession() {
  try {
    if (sessionStorage.getItem(ADMIN_SESSION_PIN_KEY) === ADMIN_PIN) {
      const pinEl = document.getElementById("pinInput");
      if (pinEl) { pinEl.value = ADMIN_PIN; unlock(); }
    }
  } catch (_) {}
})();
