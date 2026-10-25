const SHEET_URL = "https://script.google.com/macros/s/AKfycbxFQEIeLqMYXC6tN7SG8i5Un7FDM_QgEJ7-Y78uihxjHBfC01TvyEk082nKzG5y5aip/exec";
const TEKS_SHEET = "Info";
const TEKS_NAME = "INFO_TEKS";
// Supabase (sumber data utama pengganti Sheet)
const SB_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SB_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";
function sbTable(sheet){
  sheet = String(sheet || "").toLowerCase();
  if(sheet === "akun") return "akun";
  if(sheet === "info") return "info";
  if(sheet === "topup") return "topup";
  if(sheet === "joki") return "joki";
  return "brainrot";
}
function sbCol(col){
  if(col === 1 || col === "1") return "name";
  if(col === 2 || col === "2") return "price";
  if(col === 3 || col === "3") return "stock";
  var k = String(col == null ? "" : col).trim().toLowerCase();
  return ["name","kategori","price","coret","deskripsi","stock","soldout","image","sold","dilihat"].indexOf(k) !== -1 ? k : "";
}
function sbH(extra){
  var h = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };
  if(extra) for(var k in extra) h[k] = extra[k];
  return h;
}
function sbList(sheet){
  return fetch(SB_URL + "/rest/v1/" + sbTable(sheet) + "?select=*&order=urutan", { headers: sbH() })
    .then(r => r.json()).then(a => Array.isArray(a) ? a : []).catch(() => []);
}
function b64ToBlob(b64, mime){
  var bin = atob(b64), n = bin.length, u8 = new Uint8Array(n);
  for(var i = 0; i < n; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime || "image/jpeg" });
}
function safeName(s){ return String(s || "foto").replace(/[^\w.\-]+/g, "_").slice(0, 80); }
function makeThumb(blob, maxEdge, quality){
  maxEdge = Number(maxEdge) > 0 ? Number(maxEdge) : 480;
  quality = Number(quality) > 0 ? Number(quality) : 0.75;
  return new Promise(resolve => {
    try {
      const url = URL.createObjectURL(blob);
      const im = new Image();
      im.onload = () => {
        try {
          URL.revokeObjectURL(url);
          const sc = Math.min(1, maxEdge / Math.max(im.naturalWidth, im.naturalHeight));
          const cv = document.createElement("canvas");
          cv.width = Math.max(1, Math.round(im.naturalWidth * sc));
          cv.height = Math.max(1, Math.round(im.naturalHeight * sc));
          cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
          cv.toBlob(b => resolve(b || null), "image/webp", quality);
        } catch(e){ resolve(null); }
      };
      im.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      im.src = url;
    } catch(e){ resolve(null); }
  });
}
function makeTinyThumb(blob){ return makeThumb(blob, 128, 0.7); }
const ADMIN_PIN = "112233"; // <-- GANTI PIN INI
const ADMIN_V = "v2026.10.24.5";
document.getElementById("adminV").textContent = "(" + ADMIN_V + ")";

function CURSHEET(){
  const s = document.getElementById("sheetSel");
  return (s && s.value) ? s.value : "Brainrot";
}

function show_(id){
  const el = document.getElementById(id);
  if(el) el.style.display = "block";
}

/* tinggi bar Tab Sheet + nav lengket (biar konten anchor tidak ketutup) */
function stickSync(){
  var bh = document.getElementById("sheetBar").offsetHeight || 0;
  var nh = document.getElementById("miniNav").offsetHeight || 0;
  document.documentElement.style.setProperty("--barh", bh + "px");
  document.documentElement.style.setProperty("--stickh", (bh + nh) + "px");
}
window.addEventListener("resize", stickSync);

function unlock(){
  if(document.getElementById("pinInput").value === ADMIN_PIN){
    document.getElementById("pinCard").style.display = "none";
    ["analTopBtn","miniNav","sheetCard","teksCard","sectTestimoni","testimoniCard","sectServerConfig","serverConfigCard","sectAkun","akunDataCard","sectProd","sectCat","sectAdd","mainCard","prevCard","slideCard","catCard","editCard","renameCard","renameCatCard","addCard"].forEach(show_);
    document.getElementById("featMenu").style.display = "grid";
    document.getElementById("sheetBar").style.display = "flex";
    stickSync();
    loadTeks();
    loadItems();
    loadAkunProds();
    loadTestimoniAdmin();
    loadServerSettings();
  } else {
    alert("PIN salah.");
  }
}

/* ===== brankas data akun (PIN-gated, pengunjung tidak bisa baca) ===== */
let AKUN_ROWS = [];
function pinH(extra){
  const h = sbH(extra);
  h["x-admin-pin"] = document.getElementById("pinInput").value || "";
  return h;
}
function loadAkunProds(){
  sbList("Akun").then(function(arr){
    try {
      const sel = document.getElementById("akunProdSel");
      sel.innerHTML = "";
      const have = {};
      (arr || []).forEach(function(o){
        const nm = String(o.name || "").trim();
        if(!nm || nm.indexOf("CAT:") === 0) return;
        have[nm] = true;
        const op = document.createElement("option");
        op.value = nm; op.textContent = nm.slice(0, 70);
        sel.appendChild(op);
      });
      // Brankas bisa berisi nama produk lama (habis rename) — tetap tampilkan biar sandi tidak "hilang"
      fetch(SB_URL + "/rest/v1/akun_data?select=product", { headers: pinH() })
        .then(r => r.json()).then(function(br){
          try {
            const seen = {};
            (br || []).forEach(function(o){
              const nm = String(o.product || "").trim();
              if(!nm || have[nm] || seen[nm]) return;
              seen[nm] = true; have[nm] = true;
              const op = document.createElement("option");
              op.value = nm; op.textContent = nm.slice(0, 60) + " ⚠️";
              sel.appendChild(op);
            });
          } catch(e) {}
          loadAkunData();
          loadAkunRekap();
        }).catch(function(){ loadAkunData(); loadAkunRekap(); });
    } catch(e) {}
  });
}
function loadAkunData(){
  const prod = document.getElementById("akunProdSel").value;
  const box = document.getElementById("akunDataList");
  const cnt = document.getElementById("akunCount");
  if(!prod){ box.innerHTML = ""; cnt.textContent = ""; return; }
  box.innerHTML = '<p class="hint">Memuat...</p>';
  fetch(SB_URL + "/rest/v1/akun_data?select=*&product=eq." + encodeURIComponent(prod) + "&order=id", { headers: pinH() })
  .then(r => r.json()).then(function(arr){
    try {
      AKUN_ROWS = Array.isArray(arr) ? arr : [];
      const readyRows = AKUN_ROWS.filter(o => String(o.status) === "ready");
      const soldRows = AKUN_ROWS.filter(o => String(o.status) === "sold");
      const trashRows = AKUN_ROWS.filter(o => String(o.status) === "hapus");
      const modalReady = readyRows.reduce((s, o) => s + (Number(o.modal) || 0), 0);
      cnt.innerHTML = "READY: <b style='color:var(--green);'>" + readyRows.length + "</b> • SOLD: <b>" + soldRows.length + "</b> • 💰 modal tertanam: <b>Rp " + modalReady.toLocaleString("id-ID") + "</b> (stok produk ikut angka READY)";
      const live = readyRows.concat(soldRows);
      let h = "";
      if(!live.length) h += '<p class="hint">Belum ada data aktif. Tambahkan di atas.</p>';
      h += live.map(function(o){
        const st = String(o.status);
        const col = st === "ready" ? "var(--green)" : "var(--mut)";
        return '<div class="arow">' +
          '<div class="ainfo"><b>#' + o.id + '</b> <span style="color:' + col + ';font-weight:700;">' + escAkun(st.toUpperCase()) + '</span><br>' +
          '<span>ID: ' + escAkun(o.akun_id) + '</span><br>' +
          '<span>PW: <span id="pw-' + o.id + '">•••</span> <a href="javascript:void(0)" onclick="togglePw(' + o.id + ')" style="color:var(--blue2);">👁</a></span><br>' +
          '<span style="color:var(--mut);">Modal: Rp ' + (Number(o.modal) || 0).toLocaleString("id-ID") + '</span></div>' +
          '<button onclick="delAkunData(' + o.id + ')" class="danger">Hapus</button></div>';
      }).join("");
      h += '<button onclick="document.getElementById(\'akunTrash\').style.display=(document.getElementById(\'akunTrash\').style.display===\'none\'?\'block\':\'none\')" class="ghost">🗑️ Sampah (' + trashRows.length + ')</button>';
      h += '<div id="akunTrash" style="display:none;">';
      if(!trashRows.length) h += '<p class="hint">Sampah kosong.</p>';
      h += trashRows.map(function(o){
        return '<div class="arow" style="opacity:.85;">' +
          '<div class="ainfo"><b>#' + o.id + '</b> <span style="color:var(--red);font-weight:700;">HAPUS</span><br>' +
          '<span>ID: ' + escAkun(o.akun_id) + '</span><br>' +
          '<span>PW: <span id="pw-' + o.id + '">•••</span> <a href="javascript:void(0)" onclick="togglePw(' + o.id + ')" style="color:var(--blue2);">👁</a></span><br>' +
          '<span style="color:var(--mut);">Modal: Rp ' + (Number(o.modal) || 0).toLocaleString("id-ID") + '</span></div>' +
          '<div class="abtn"><button onclick="restoreAkunData(' + o.id + ')" class="succ">↩️ Balikin</button>' +
          '<button onclick="purgeAkunData(' + o.id + ')" class="danger">🔥 Hapus permanen</button></div></div>';
      }).join("") + '</div>';
      box.innerHTML = h;
    } catch(e){ box.innerHTML = '<span class="err">Gagal tampilkan.</span>'; }
  }).catch(function(){ box.innerHTML = '<span class="err">Gagal ambil (cek PIN/koneksi).</span>'; });
}
function escAkun(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function loadAkunRekap(){
  const box = document.getElementById("akunRekap");
  box.innerHTML = '<p class="hint">Memuat...</p>';
  fetch(SB_URL + "/rest/v1/akun_data?select=product,status,modal", { headers: pinH() })
  .then(r => r.json()).then(function(arr){
    try {
      const m = {};
      (arr || []).forEach(function(o){
        const p = String(o.product || "").trim() || "-";
        if(!m[p]) m[p] = { ready: 0, sold: 0, hapus: 0, modal: 0 };
        const st = String(o.status);
        if(st === "ready"){ m[p].ready++; m[p].modal += Number(o.modal) || 0; }
        else if(st === "sold") m[p].sold++;
        else m[p].hapus++;
      });
      const keys = Object.keys(m).sort();
      if(!keys.length){ box.innerHTML = '<p class="hint">Brankas kosong.</p>'; return; }
      box.innerHTML = keys.map(function(p){
        return '<div class="arow">' +
          '<div class="ainfo"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escAkun(p).slice(0, 50) + '</div>' +
          '<div style="color:var(--mut);font-size:12px;">💰 modal tertanam: Rp ' + m[p].modal.toLocaleString("id-ID") + (m[p].hapus ? ' • 🗑️ ' + m[p].hapus : '') + '</div></div>' +
          '<span style="color:var(--green);font-weight:700;white-space:nowrap;">READY ' + m[p].ready + '</span>' +
          '<span style="color:var(--mut);white-space:nowrap;">SOLD ' + m[p].sold + '</span>' +
          '<button onclick="akunRekapPilih(\'' + p.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + '\')">Buka</button></div>';
      }).join("");
    } catch(e){ box.innerHTML = '<span class="err">Gagal hitung.</span>'; }
  }).catch(function(){ box.innerHTML = '<span class="err">Gagal ambil.</span>'; });
}
function akunRekapPilih(p){
  const sel = document.getElementById("akunProdSel");
  if(!Array.from(sel.options).some(function(o){ return o.value === p; })){
    const op = document.createElement("option");
    op.value = p; op.textContent = String(p).slice(0, 60) + " ⚠️";
    sel.appendChild(op);
  }
  sel.value = p;
  loadAkunData();
}
function togglePw(id){
  const o = AKUN_ROWS.find(x => x.id === id);
  const el = document.getElementById("pw-" + id);
  if(!o || !el) return;
  el.textContent = (el.textContent === "•••") ? String(o.akun_pw) : "•••";
}
function addAkunData(){
  const prod = document.getElementById("akunProdSel").value;
  const aid = document.getElementById("akunIdInput").value.trim();
  const apw = document.getElementById("akunPwInput").value.trim();
  const amodal = Number(document.getElementById("akunModalInput").value) || 0;
  const st = document.getElementById("statusAkun");
  if(!prod){ st.innerHTML = '<span class="err">Pilih produk dulu.</span>'; return; }
  if(!aid || !apw){ st.innerHTML = '<span class="err">Isi ID + password.</span>'; return; }
  st.textContent = "Menyimpan...";
  fetch(SB_URL + "/rest/v1/akun_data", {
    method: "POST", headers: pinH({ Prefer: "return=representation" }),
    body: JSON.stringify({ product: prod, akun_id: aid, akun_pw: apw, modal: amodal, status: "ready" })
  }).then(r => r.json()).then(function(a){
    if(Array.isArray(a) && a.length){
      st.innerHTML = '<span class="ok">✅ Tersimpan! Stok produk +1 otomatis.</span>';
      document.getElementById("akunIdInput").value = "";
      document.getElementById("akunPwInput").value = "";
      document.getElementById("akunModalInput").value = "";
      loadAkunData();
      loadAkunRekap();
    } else st.innerHTML = '<span class="err">Gagal simpan.</span>';
  }).catch(function(){ st.innerHTML = '<span class="err">Gagal kirim, cek koneksi.</span>'; });
}
function delAkunData(id){
  if(!confirm("Pindahkan data #" + id + " ke sampah? (bisa dibalikin)")) return;
  fetch(SB_URL + "/rest/v1/akun_data?id=eq." + id, {
    method: "PATCH", headers: pinH(), body: JSON.stringify({ status: "hapus" })
  })
  .then(function(){ loadAkunData(); loadAkunRekap(); })
  .catch(function(){ alert("Gagal hapus."); });
}
function restoreAkunData(id){
  fetch(SB_URL + "/rest/v1/akun_data?id=eq." + id, {
    method: "PATCH", headers: pinH(), body: JSON.stringify({ status: "ready", order_id: null })
  })
  .then(function(){ loadAkunData(); loadAkunRekap(); })
  .catch(function(){ alert("Gagal kembalikan."); });
}
function purgeAkunData(id){
  if(!confirm("HAPUS PERMANEN data #" + id + "? ID/PW hilang selamanya!")) return;
  if(!confirm("Yakin? Tidak bisa dibatalkan.")) return;
  fetch(SB_URL + "/rest/v1/akun_data?id=eq." + id, { method: "DELETE", headers: pinH() })
  .then(function(){ loadAkunData(); loadAkunRekap(); })
  .catch(function(){ alert("Gagal hapus."); });
}

let ALL_ITEMS = [];

// Foto bawaan dari kode web (dipakai kalau kolom image Sheet masih kosong).
// Dibuat otomatis dari index.html — jangan edit manual.
const FALLBACK_IMG_MAP = {"KOTAK GULUNG UNTUK BRAINROT - 1 BRAINROT RANDOM LV MAX  500SX+/S(TERGANTUNG)": "ROLL CASE BRAINROT MECHA CERBERUS 40SX.webp", "KOTAK GULUNG UNTUK BRAINROT - 1 BRAINROT RANDOM LV MAX  1SP+/S(TERGANTUNG)": "ROLL CASE BRAINROT 1SP RANDOM BRAINROT.webp", "block keberuntungan ledakan daya - 1 BRAINROT RANDOM ILAHI TDC/s+": "BLOCK KEBERUNTUNGAN LEDAKAN DAYA TDC.webp", "block keberuntungan ledakan daya - 1 BRAINROT RANDOM OMEGA QADC/s+": "BLOCK KEBERUNTUNGAN LEDAKAN DAYA QADC.webp", "Grow A Garden 2 - DAPAT 1 STAR FRUIT SEED": "GAG2 SEED STRAFRUIT.webp", "Grow A Garden 2 - DAPAT 1 SUN BLOOM SEED": "GAG2 SUN BLOOM SEED.webp", "Grow A Garden 2 - DAPAT 4 MOON BLOOM SEED (PROMO TERBATAS)": "GAG2 SEED MOON BLOOM.webp", "Grow A Garden 2 - DAPAT 4 HYPNO BLOOM SEED (PROMO TERBATAS)": "GAG 2 HYPO BLOOM.webp", "Grow A Garden 2 - DAPAT 2 DRAGON BRETH SEED": "GAG 2 DRAGON BRETH SEED.webp", "Grow A Garden 2 - DAPAT 4 VENOM SEED": "GAG2 VENOM SEED.webp", "Grow A Garden 2 - DAPAT 3 GHOST PAPER SEED": "gag 2 ghost paper seed .webp", "Grow A Garden 2 - DAPAT 2 VENUS FLY TRAP SEED": "GAG 2 VENUS FLY TRAP.webp", "Grow A Garden 2 - DAPAT 1 PET BALD EAGLE (MYTIC)": "GAG2 BALD EAGLE.webp", "Grow A Garden 2 - DAPAT 1 PET UNICORN (MYTIC)": "GAG2 UNICORN.webp|GAG2 UNICORN SKILL.webp", "Grow A Garden 2 - DAPAT 1 PET BEAR (MYTIC)": "GAG 2 BEAR PET.webp", "Grow A Garden 2 - DAPAT 1 DRAGONFLY (MYTIC)": "GAG2 DRAGONFLY.webp|GAG2 DRAGONFLY SKILL.webp", "Grow A Garden 2 - DAPAT 10 MEGA SEED": "GAG2 MEGA SEED.webp", "Grow A Garden 2 - DAPAT 300m sheckless(duit gag2)via buah": "GAG2 9M SHECKLESS.webp", "Grow A Garden 2 - DAPAT 1B sheckless(duit gag2)via buah": "GAG2 9M SHECKLESS.webp", "Grow A Garden 2 - DAPAT 15 SUPER SPRINKLE (GEAR)": "GAG2 SUPER SPRINKLE.webp", "Grow A Garden 2 - DAPAT 15 SUPER WATERING (GEAR)": "GAG 2 SUPER WATERING.webp", "be flash for brainrot - 1 BRAINROT RANDOM 10QI/S": "flash brainrot brainrot random10qi.webp", "be flash for brainrot - 1 GOD ESOK SEKOLA 50%": "flash brainrot esok god 55PERSEN.webp", "build a base and steal - 1 YETI OG(INFERNO) 1B/S": "BUILD AND STEAL BASE YETI INFERNO 1B.webp", "NAIK DAN JATUHKAN BLOCK KEBERUNTUNGAN - 1 BRAINROT MASTODONTIK OMNIVERSE (HACKER) 700SP+/s": "NAIK DAN JATUHKAN BLOCK OMNIVERSE MASTORDENTIK LV MAX 700SP.webp", "NAIK DAN JATUHKAN BLOCK KEBERUNTUNGAN - 1 BRAINROT CAPTAIN MOBY OMNIVERSE (HACKER) 300SP/s": "NAIK DAN JATUHKAN BLOCK OMINVERSE KAPTAIN MOBY LV MAX 300SP.webp", "drill for brainrot - 1 ketupat kepat inf/s(tamat)": "Screenshot 2026-04-18 102335.webp", "drill for brainrot - 2 ketupat kepat inf/s(tamat)": "Screenshot 2026-04-18 102335.webp", "drill for brainrot - 1 MY EXAME 16M/s duit bulan": "DRILL BRAINROT MY EXAME 16M S.webp", "drill for brainrot - 2 NUCLEARO 16M/s duit bulan": "DRILL BRAINROT MY EXAME 16M S.webp", "Swing obby for brainrot - naga sepuh lv 500.000(langsung tamat)": "Screenshot 2026-04-14 055828.webp", "CAPYBARA VS TANAMAN - 1 ANGEL CAPYBARA TITAN 600K DPS": "CAPYBARA VS TANAMAN ANGEL CAPYBARA TITAN 600K DPS.webp", "CAPYBARA VS TANAMAN - 1 SHINIGAMI CAPYBARA TITAN 1.3M DPS": "CAPYBARA VS TANAMAN SHINIGAMI CAPYBARA TITAN 1.3M DPS.webp", "KEKUATAN MENUMBUHKAN LENGAN ANDA - 1 BRAINROT SOVEREIGN RANDOM 500O+/S": "GROW ARM SOVEREIGN RANDOM 3O S.webp", "KEKUATAN MENUMBUHKAN LENGAN ANDA - 1 BRAINROT SOVEREIGN RANDOM 1N+/S": "GROW ARM SVOREGIN RANDOM 1 N.webp", "STEAL A EGG - 1 PET RANDOM 100M/S+": "STEAL A EGG PET RANDOM 100M.webp", "BECOME A BRAINROT - 1 BRAINROT STELLAR RANDOM LV MAX(500)": "BECOME BRAINROT STELLAR RANDOM LV MAX.webp", "BECOME A BRAINROT - UP LV MAX 2 BRAINROT BEBAS": "BECOME A BRAINROT DISPLAY.webp", "di dalam kepala brainrot - 1 ABADI RANDOM 1sp/s+": "INSIDE BRAINROT HEAD ETERHNAL 1SP.webp", "di dalam kepala brainrot - 2 ABADI RANDOM 1sp/s+": "INSIDE BRAINROT HEAD ETERHNAL 1SP.webp", "di dalam kepala brainrot - 1 ABADI RANDOM 1sx/s+": "inside brainrot head abadi 1sx.webp", "di dalam kepala brainrot - 2 ABADI RANDOM 1sx/s+": "inside brainrot head abadi 1sx.webp", "BE MONKEY FOR BRAINROT - DAPAT 1 BRAINROT ALMIGHTY 69 1SXI/S LV MAX": "BE MONKEY 69 1 SX ALGMYTI.webp", "BE MONKEY FOR BRAINROT - DAPAT 2 BRAINROT ALMIGHTY 69 1SXI/S LV MAX": "BE MONKEY 69 1 SX ALGMYTI.webp", "pecahkan tape for brainrot - 1 brainrot RANDOM 1SX+/S": "TAPE BRAINROT 1SX .webp", "pecahkan tape for brainrot - 2 brainrot RANDOM 1SX+/S": "TAPE BRAINROT 1SX .webp", "LEPAR KOIN - DAPAT 10 SUN PALACE (SOVEREIGN) 239 DD TERGANTUNG LUCK UANG": "LEMPAR KOIN TURBIN 500 DC.webp", "LEPAR KOIN - DAPAT 20 SUN PALACE (SOVEREIGN) 239 DD TERGANTUNG LUCK UANG": "LEMPAR KOIN TURBIN 500 DC.webp", "SWING WEB FOR LUCKY BLOCK - 1 BRAINROT ADMIN RANDOM 1QI/S+ TERGANTUNG REBIRTH (LANGSUNG SEPUH)": "SWING WEB BRAINROT ADMIN RANDOM 1QI.webp", "JATUH FOR BRAINROT - 1 BRAINROT RANDOM LV MAX  500N+/S": "FALL FOR BRAINROT ETERNAL RANDOM 3 N.webp", "JATUH FOR BRAINROT - 1 BRAINROT RANDOM LV MAX  1DE+/S": "FALL FOR BRAINROT BRAINROT RANDOM 10N+.webp", "JATUH FOR BRAINROT - 1 BRAINROT TRANSENDENT LV MAX 1UD+/S": "FALL FOR BRAINROT BRAINROT RANDOM 10N+.webp", "BRAIN BLAST FOR LUCKY BLOCK - 1 BRAINROT RANDOM EMPEREYAN 40 QA+/S(TERGANTUNG REBIRTH) LV MAX": "BRAINBLAST EMPERAYAEN 40QA+.webp", "BRAIN BLAST FOR LUCKY BLOCK - 2 BRAINROT RANDOM EMPEREYAN 40 QA+/S(TERGANTUNG REBIRTH) LV MAX": "BRAINBLAST EMPERAYAEN 40QA+.webp", "MINE PER KLICK - DAPAT 15 BATU 1 B": "MINE PER KLICK BATU 1 B.webp", "steal a brainrot-chat admin": "WhatsApp Image 2026-04-14 at 08.02.58.webp", "steal a brainrot-1 garam dan madung": "WhatsApp Image 2026-04-17 at 13.13.31.webp", "token tsunami brainrot(300)": "token.webp", "token tsunami brainrot(1000)": "token.webp", "token grow a garden(250)": "token.webp", "RUSH LUCKY BLOCK - 2 MALAM XEON 1.6T+/S LV MAX TERGANTUNG REBIRTH + BONUS": "RUSH LUCKY BLOCK XEON 1.6T.webp", "RUSH LUCKY BLOCK - 4 MALAM XEON 1.6T+/S LV MAX TERGANTUNG REBIRTH + BONUS": "RUSH LUCKY BLOCK XEON 1.6T.webp", "tendang block keberuntungan -DAPAT 1 brainrot ABYSALL COINATOR lv max 4.8Q/s(ASTRAL) sepuh langka": "KALB COIATOR ASTRAL 4.8Q.webp", "tendang block keberuntungan -DAPAT 2 brainrot ABYSALL COINATOR lv max 4.8Q/s(ASTRAL) sepuh langka": "KALB COIATOR ASTRAL 4.8Q.webp", "Top Up robux(via login) - 80 ROBUX": "ROBUX.webp", "Top Up robux(via login) - 160 ROBUX": "ROBUX.webp", "Top Up robux(via login) - 240 ROBUX": "ROBUX.webp", "Top Up robux(via login) - 320 ROBUX": "ROBUX.webp", "Top Up robux(via login) - 500 ROBUX": "ROBUX.webp", "Top Up robux(via login) - 1000 ROBUX": "ROBUX.webp", "Game pass ALL GAME- 1 ROBUX (CONTOH BELI GAMEPAS 86 ROBUX BERARTI 86 X 150RP)": "ROBUX.webp", "CONTOH - Akun sepuh data polos (ganti dengan akun asli)": "ROBUX.webp|token.webp", "CONTOH - Akun sepuh data polos full gamepass (ganti dengan akun asli)": "ROBUX.webp|token.webp", "CONTOH - Akun Roblox berbagai map (ganti dengan akun asli)": "ROBUX.webp|token.webp"};

function prefill(){
  const name = document.getElementById("itemSel").value;
  const o = ALL_ITEMS.find(x => String(x.name).trim() === name);
  if(o){
    document.getElementById("priceInput").value = o.price || "";
    document.getElementById("stockInput").value = (o.stock === 0 || o.stock) ? o.stock : "";
    document.getElementById("soldInput").value = (o.sold === 0 || o.sold) ? o.sold : "";
    document.getElementById("coretInput").value = (o.coret > 0) ? o.coret : "";
    document.getElementById("descInput").value = String(o.deskripsi || "");
    document.getElementById("catInfo").textContent = String(o.kategori || "-").trim() || "-";
    document.getElementById("catInfo2").textContent = String(o.kategori || "-").trim() || "-";
    document.getElementById("curProdSlide").textContent = name;
    document.getElementById("curProdEdit").textContent = name;
    document.getElementById("curProdRename").textContent = name;
    renderPreview(name, o);
    renderSlides();
  } else {
    document.getElementById("catInfo").textContent = "-";
    document.getElementById("catInfo2").textContent = "-";
    document.getElementById("curProdSlide").textContent = "-";
    document.getElementById("curProdEdit").textContent = "-";
    document.getElementById("curProdRename").textContent = "-";
    renderPreview("", null);
    renderSlides();
  }
}

function postSet(col, value, stEl, btn, okMsg){
  const name = document.getElementById("itemSel").value;
  const st = document.getElementById(stEl);
  if(!name){ st.innerHTML = '<span class="err">Pilih barang dulu.</span>'; return Promise.resolve(false); }
  btn.disabled = true;
  st.textContent = "Menyimpan...";
  return postOne({ action: "set", item_name: name, col: col, value: value, sheet: CURSHEET() }).then(d => {
    btn.disabled = false;
    if(d.result === "success"){
      st.innerHTML = '<span class="ok">' + okMsg + '</span>';
      return true;
    }
    st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
    return false;
  }).catch(() => {
    btn.disabled = false;
    st.innerHTML = '<span class="err">Gagal kirim, cek koneksi.</span>';
    return false;
  });
}

// Tambah baris ke data lokal + dropdown TANPA reset pilihan (tidak seperti loadItems).
function addLocalRow(o){
  const nm = String(o.name).trim();
  if(ALL_ITEMS.some(x => String(x.name).trim() === nm)) return;
  ALL_ITEMS.push(o);
  if(nm.indexOf("CAT:") !== 0){
    const sel = document.getElementById("itemSel");
    const op = document.createElement("option");
    op.value = nm; op.textContent = nm.slice(0, 70);
    sel.appendChild(op);
  }
  const k = String(o.kategori || "").trim();
  ["catSel","catRenameSel","addCatSel"].forEach(id => {
    const s = document.getElementById(id);
    if(s && k && !Array.from(s.options).some(p => p.value === k)){
      const op = document.createElement("option");
      op.value = k; op.textContent = k.slice(0, 70);
      s.appendChild(op);
    }
  });
}

function updItem(name, patch){
  const o = ALL_ITEMS.find(x => String(x.name).trim() === name);
  if(o) Object.assign(o, patch);
  return o;
}

// Refresh tampilan TANPA reset dropdown (tidak seperti loadItems).
function syncAfterProduct(name){
  prefill();
  const o = ALL_ITEMS.find(x => String(x.name).trim() === name);
  if(o) renderPreview(name, o);
  renderSlides();
}

function deleteProduct(){
  const name = document.getElementById("itemSel").value;
  const st = document.getElementById("statusAll");
  if(!name){ st.innerHTML = '<span class="err">Pilih barang dulu.</span>'; return; }
  if(!confirm("HAPUS barang ini dari Sheet?\n" + name)) return;
  if(!confirm("Yakin? Tidak bisa dibatalkan.")) return;
  st.textContent = "Menghapus...";
  const doneProd = () => {
    st.innerHTML = '<span class="ok">✅ Barang dihapus!</span>';
    ALL_ITEMS = ALL_ITEMS.filter(x => String(x.name).trim() !== name);
    const sel = document.getElementById("itemSel");
    const opt = Array.from(sel.options).find(p => p.value === name);
    if(opt) opt.remove();
    syncAfterProduct(sel.value);
  };
  postOne({ action: "delete", item_name: name, sheet: CURSHEET() }).then(d => {
    if(d.result === "success"){ doneProd(); return; }
    if(String(d.result || "").indexOf("unknown action") !== -1){
      st.innerHTML = '<span class="err">Backend belum update. Deploy ulang Code.gs terbaru (New version).</span>';
      return;
    }
    st.textContent = "Memeriksa ke Sheet...";
    verifyGone([name]).then(left => {
      if(!left.length){ doneProd(); st.innerHTML += ' <span style="color:var(--mut);">(terverifikasi)</span>'; }
      else st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
    });
  }).catch(() => {
    st.textContent = "Koneksi putus, memeriksa ke Sheet...";
    verifyGone([name]).then(left => {
      if(!left.length){ doneProd(); st.innerHTML += ' <span style="color:var(--mut);">(terverifikasi)</span>'; }
      else st.innerHTML = '<span class="err">Gagal kirim, cek koneksi.</span>';
    });
  });
}

// Cek nilai 1 sel di database (untuk pastikan simpan beneran).
function verifySet(name, col, value){
  return sbList(CURSHEET()).then(arr => {
    try {
      const o = arr.find(x => String(x.name).trim() === name);
      if(!o) return false;
        const key = col === 1 ? "name" : col === 2 ? "price" : col === 3 ? "stock" : col;
        const a = (o[key] !== undefined) ? String(o[key]).trim() : "";
        const b = String(value).trim();
        if(key === "price" || key === "stock" || key === "sold" || key === "coret") return Number(a) === Number(b);
        return a === b;
      } catch(e){ return false; }
    }).catch(() => false);
}

// Cek baris mana yang masih ada di database (untuk pastikan hapus beneran).
function verifyGone(names){  return sbList(CURSHEET())
    .then(arr => {
      try {
        const have = {};
        arr.forEach(o => { have[String(o.name).trim()] = true; });
        return names.filter(nm => have[nm]);
      } catch(e){ return names; }
    }).catch(() => names);
}

// Cek apakah 1 nama SUDAH ada di database (untuk pastikan tambah beneran).
function verifyExists(name){
  return sbList(CURSHEET())
    .then(arr => {
      try {
        return arr.some(o => String(o.name).trim() === name);
      } catch(e){ return false; }
    }).catch(() => false);
}

function deleteCategory(){
  const kat = document.getElementById("catRenameSel").value;
  const st = document.getElementById("statusCatRename");
  const btn = document.getElementById("delCatBtn");
  if(!kat){ st.innerHTML = '<span class="err">Pilih kategori dulu.</span>'; return; }
  const n = ALL_ITEMS.filter(o => String(o.kategori || "").trim() === kat || String(o.name).trim() === "CAT:" + kat).length;
  if(!confirm("HAPUS kategori \"" + kat + "\" + " + n + " baris (termasuk foto display)?")) return;
  if(!confirm("Yakin? Tidak bisa dibatalkan.")) return;
  btn.disabled = true;
  const names = ALL_ITEMS.filter(o => String(o.kategori || "").trim() === kat || String(o.name).trim() === "CAT:" + kat).map(o => String(o.name).trim());
  const t0 = Date.now();
  const tick = setInterval(() => {
    st.textContent = "Menghapus " + names.length + " baris sekaligus... (" + Math.round((Date.now() - t0) / 1000) + " dtk)";
  }, 500);
  st.textContent = "Menghapus " + names.length + " baris sekaligus... (0 dtk)";
  const afterDel = okCount => {
    btn.disabled = false;
    if(okCount > 0){
      ALL_ITEMS = ALL_ITEMS.filter(o => !(String(o.kategori || "").trim() === kat || String(o.name).trim() === "CAT:" + kat));
      ["catSel","catRenameSel","addCatSel"].forEach(id => {
        const s = document.getElementById(id);
        const opt = Array.from(s.options).find(p => p.value === kat);
        if(opt) opt.remove();
      });
      document.getElementById("catRenameOldName").textContent = document.getElementById("catRenameSel").value || "-";
      prefillCat();
      prefill();
    }
    st.innerHTML = okCount >= names.length
      ? '<span class="ok">✅ Kategori dihapus (' + okCount + '/' + names.length + ')!</span>'
      : '<span class="err">Terhapus ' + okCount + '/' + names.length + ' — tekan lagi tombol hapus untuk sisanya.</span>';
  };
  const seqDel = () => {
    // cadangan kalau backend belum update (tanpa delmany): hapus satu-satu
    clearInterval(tick);
    let done = 0, di = 0;
    let chain = Promise.resolve(true);
    names.forEach(nm => {
      chain = chain.then(() => postOne({ action: "delete", item_name: nm, sheet: CURSHEET() }).then(d => {
        di++;
        st.textContent = "Menghapus " + di + "/" + names.length + "...";
        if(d.result === "success" || String(d.result || "").indexOf("tidak ketemu") !== -1) done++;
        return true;
      }).catch(() => true));
    });
    chain.then(() => afterDel(done)).catch(() => { btn.disabled = false; st.innerHTML = '<span class="err">Gagal kirim, cek koneksi.</span>'; });
  };
  postOne({ action: "delmany", names: names, sheet: CURSHEET() }, 90000).then(d => {
    clearInterval(tick);
    const secs = Math.round((Date.now() - t0) / 1000);
    if(d.result === "success"){ afterDel(d.deleted); st.innerHTML += ' <span style="color:var(--mut);">(' + secs + ' dtk)</span>'; return; }
    if(String(d.result || "").indexOf("unknown action") !== -1){ seqDel(); return; }
    // tulisnya mungkin berhasil tapi laporannya gagal -> verifikasi ke Sheet
    st.textContent = "Memeriksa ke Sheet...";
    verifyGone(names).then(left => {
      btn.disabled = false;
      if(!left.length){ afterDel(names.length); st.innerHTML += ' <span style="color:var(--mut);">(terverifikasi)</span>'; }
      else st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + ' — sisa ' + left.length + ' baris, tekan lagi.</span>';
    });
  }).catch(() => {
    clearInterval(tick);
    st.textContent = "Koneksi putus, memeriksa ke Sheet...";
    verifyGone(names).then(left => {
      btn.disabled = false;
      if(!left.length){ afterDel(names.length); st.innerHTML += ' <span style="color:var(--mut);">(terverifikasi)</span>'; }
      else st.innerHTML = '<span class="err">Gagal kirim, sisa ' + left.length + ' baris — tekan lagi.</span>';
    });
  });
}

// POST dengan coba-ulang 1x khusus error transient (respon aneh/timeout).
// Error permanen (unknown action, tidak ketemu, kosong, kolom) langsung dikembalikan.
function postRetry(body, tries, ms){
  tries = tries || 2;
  return postOne(body, ms).then(d => {
    if(d.result === "success") return d;
    const r = String(d.result || "");
    const permanen = r.indexOf("unknown action") !== -1 || r.indexOf("tidak ketemu") !== -1 ||
      r.indexOf("sudah ada") !== -1 || r.indexOf("kosong") !== -1 || r.indexOf("kolom") !== -1;
    if(permanen || tries <= 1) return d;
    return postRetry(body, tries - 1, ms);
  });
}

// Cek isi kolom image di database berubah atau tidak (untuk pastikan upload beneran).
function verifyImg(name, oldFull){
  return sbList(CURSHEET())
    .then(arr => {
      try {
        const o = arr.find(x => String(x.name).trim() === name);
        const v = o ? String(o.image || "").trim() : "";
        return (v && v !== String(oldFull || "").trim()) ? v : "";
      } catch(e){ return ""; }
    }).catch(() => "");
}

function saveAll(){
  const name = document.getElementById("itemSel").value;
  const st = document.getElementById("statusAll");
  const btn = document.getElementById("saveAllBtn");
  if(!name){ st.innerHTML = '<span class="err">Pilih barang dulu.</span>'; return; }
  const priceRaw = document.getElementById("priceInput").value;
  const stockRaw = document.getElementById("stockInput").value;
  const soldRaw = document.getElementById("soldInput").value;
  const coretRaw = document.getElementById("coretInput").value;
  const descRaw = document.getElementById("descInput").value.trim();
  const newName = document.getElementById("nameInput").value.trim();
  const jobs = [];
  if(priceRaw !== ""){
    if(!(Number(priceRaw) > 0)){ st.innerHTML = '<span class="err">Harga tidak valid.</span>'; return; }
    jobs.push({ col: 2, value: Number(priceRaw), label: "harga" });
  }
  if(stockRaw !== ""){
    if(isNaN(Number(stockRaw))){ st.innerHTML = '<span class="err">Stok tidak valid.</span>'; return; }
    jobs.push({ col: 3, value: Number(stockRaw), label: "stok" });
  }
  if(soldRaw !== ""){
    if(isNaN(Number(soldRaw))){ st.innerHTML = '<span class="err">Terjual tidak valid.</span>'; return; }
    jobs.push({ col: "sold", value: Number(soldRaw), label: "terjual" });
  }
  if(coretRaw !== ""){
    if(isNaN(Number(coretRaw)) || Number(coretRaw) < 0){ st.innerHTML = '<span class="err">Harga coret tidak valid.</span>'; return; }
    jobs.push({ col: "coret", value: Number(coretRaw), label: "coret" });
  }
  jobs.push({ col: "deskripsi", value: descRaw, label: "deskripsi" });
  if(newName) jobs.push({ col: 1, value: newName, label: "nama" });
  if(!jobs.length){ st.innerHTML = '<span class="err">Tidak ada perubahan (isi dulu yang mau diganti).</span>'; return; }
  if(!confirm("Simpan berbarengan (" + jobs.map(j => j.label).join(", ") + ") untuk:\n" + name + " ?")) return;
  btn.disabled = true;
  st.textContent = "Menyimpan 1/" + jobs.length + "...";
  let chain = Promise.resolve(true);
  const gagal = [];
  jobs.forEach((jb, idx) => {
    chain = chain.then(ok => {
      st.textContent = "Menyimpan " + (idx+1) + "/" + jobs.length + " (" + jb.label + ")...";
      // nama barang bisa berubah di tengah jalan: selalu pakai nama terbaru
      const cur = (idx > 0 && jobs[idx-1].col === 1) ? jobs[idx-1].value : document.getElementById("itemSel").value;
      return postRetry({ action: "set", item_name: idx === 0 ? name : cur, col: jb.col, value: jb.value, sheet: CURSHEET() }, 3).then(d => {
        if(d.result === "success") return true;
        return verifySet(idx === 0 ? name : cur, jb.col, jb.value).then(sama => {
          if(sama){ jb.verified = true; return true; }
          gagal.push(jb.label + " (" + (d.result || "?") + ")");
          return false;
        });
      });
    });
  });
  chain.then(() => {
    btn.disabled = false;
    if(!gagal.length){
      const v = jobs.some(jb => jb.verified) ? ' (terverifikasi)' : '';
      st.innerHTML = '<span class="ok">✅ Semua tersimpan berbarengan!' + v + '</span>';
      let finalName = name;
      jobs.forEach(jb => {
        if(jb.col === 1){
          updItem(finalName, { name: jb.value });
          const sel = document.getElementById("itemSel");
          const opt = Array.from(sel.options).find(p => p.value === finalName);
          if(opt){ opt.value = jb.value; opt.textContent = String(jb.value).slice(0, 70); }
          finalName = jb.value;
          sel.value = finalName;
        }
        else if(jb.col === 2) updItem(finalName, { price: jb.value });
        else if(jb.col === 3) updItem(finalName, { stock: jb.value });
        else if(jb.col === "sold") updItem(finalName, { sold: jb.value });
        else if(jb.col === "coret") updItem(finalName, { coret: jb.value });
        else if(jb.col === "deskripsi") updItem(finalName, { deskripsi: jb.value });
      });
      document.getElementById("nameInput").value = "";
      syncAfterProduct(finalName);
    } else {
      st.innerHTML = '<span class="err">Gagal: ' + gagal.join(" | ") + ' — tekan 🔄 Muat ulang lalu coba lagi.</span>';
    }
  }).catch(() => { btn.disabled = false; st.innerHTML = '<span class="err">Gagal kirim, cek koneksi.</span>'; });
}

function renameItem(){
  // digabung ke saveAll (tombol hijau) — fungsi lama tidak dipakai
  return;
}

function savePriceStock(){
  // digabung ke saveAll (tombol hijau) — fungsi lama tidak dipakai
  return;
}

function fillProductOptions(filter){
  const sel = document.getElementById("itemSel");
  const cur = sel.value;
  sel.innerHTML = "";
  ALL_ITEMS.forEach(o => {
    const nm = String(o.name || "").trim();
    if (!nm || nm.indexOf("CAT:") === 0 || nm.indexOf("INFO_") === 0) return;
    if (filter && nm.toLowerCase().indexOf(filter) === -1) return;
    const op = document.createElement("option");
    op.value = nm;
    op.textContent = nm.slice(0, 70);
    sel.appendChild(op);
  });
  if(cur && Array.from(sel.options).some(p => p.value === cur)) sel.value = cur;
  sel.onchange = prefill;
  prefill();
}

function catList(){
  const cats = [];
  ALL_ITEMS.forEach(o => {
    const nm = String(o.name || "").trim();
    if (nm.indexOf("INFO_") === 0) return;
    const k = String(o.kategori || "").trim();
    if (k && k !== "INFO" && cats.indexOf(k) === -1) cats.push(k);
  });
  cats.sort();
  return cats;
}

function fillCatOptions(filter){
  const cats = catList().filter(k => !filter || k.toLowerCase().indexOf(filter) !== -1);
  ["catSel","catRenameSel","addCatSel"].forEach(id => {
    const s = document.getElementById(id);
    const cur = s.value;
    s.innerHTML = "";
    cats.forEach(k => {
      const op = document.createElement("option");
      op.value = k;
      op.textContent = k.slice(0, 70);
      s.appendChild(op);
    });
    if(cur && cats.indexOf(cur) !== -1) s.value = cur;
  });
  document.getElementById("catRenameSel").onchange = () => {
    document.getElementById("catRenameOldName").textContent = document.getElementById("catRenameSel").value || "-";
  };
  document.getElementById("catRenameOldName").textContent = document.getElementById("catRenameSel").value || "-";
  document.getElementById("catSel").onchange = prefillCat;
  prefillCat();
}

function loadTeks(){
  // Tabel "info" Supabase, tidak campur Brainrot.
  sbList("Info").then(function(arr){
    try {
      var o = (arr || []).find(function(x){ return String(x.name || "").trim() === TEKS_NAME; });
      document.getElementById("teksInput").value = o ? String(o.deskripsi || "") : "";
      var k = (arr || []).find(function(x){ return String(x.name || "").trim() === "INFO_KURS"; });
      if(k && Number(k.deskripsi)) document.getElementById("kursInput").value = Number(k.deskripsi);
    } catch(e) {}
  });
}

const DEFAULT_ROCKSTAR_SERVERS = [
  { label: "🎲 Server Kotak Gulung untuk Brainrot", url: "https://www.roblox.com/share?code=6caff481af8f144eb47162f2e1a3e2eb&type=Server" },
  { label: "🍂 Server Fall for Brainrot", url: "https://www.roblox.com/share?code=7268a4699798254193752fa24104e7f7&type=Server" },
  { label: "🪙 Server Lempar Koin", url: "https://www.roblox.com/share?code=f0a1cedc6be4f041a22d1079ca713f2d&type=Server" },
  { label: "🌱 Server Grow A Garden 2", url: "https://www.roblox.com/share?code=41a39158889f0f40a1ba639898c22c9f&type=Server" },
  { label: "🐔 Server Tarik Telur", url: "https://www.roblox.com/share?code=592596d70f7d1044ae692f625524368e&type=Server" },
  { label: "🎲 Server Dadu Anime", url: "https://www.roblox.com/share?code=555c4557fd120c4ab3a050b2116a2e6c&type=Server" },
  { label: "🥊 Server Boxing for Brainrot", url: "https://www.roblox.com/share?code=33212d5bded8e24e8e290f40fd34b8cf&type=Server" },
  { label: "🧠 Server Become Brainrot", url: "https://www.roblox.com/share?code=a6e16fde64c68d4c85e7f68dc5596eda&type=Server" }
];
let TESTIMONI_INFO_ROWS = [];
let SERVER_DRAFTS = [];
let SERVER_SETTING_EXISTS = false;

function isPublicFotoUrl(value){
  try {
    var u = new URL(String(value || ""));
    return u.protocol === "https:" && u.hostname === new URL(SB_URL).hostname && u.pathname.indexOf("/storage/v1/object/public/foto/") === 0;
  } catch(e){ return false; }
}
function fotoThumbUrl(value){
  var u = String(value || "");
  var slash = u.lastIndexOf("/");
  return slash < 0 ? u : u.slice(0, slash + 1) + "thumb_" + u.slice(slash + 1);
}
function setTestimoniAdminListExpanded(expanded){
  const box = document.getElementById("testimoniAdminList");
  const toggle = document.getElementById("testimoniListToggle");
  if(!box || !toggle) return;
  const count = TESTIMONI_INFO_ROWS.length;
  const open = !!expanded && count > 0;
  box.style.display = open ? "grid" : "none";
  const tools = document.getElementById("testimoniBulkTools");
  if(tools) tools.style.display = open ? "flex" : "none";
  toggle.disabled = count === 0;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.textContent = count
    ? (open ? "🙈 Sembunyikan foto" : "👁️ Tampilkan foto") + " yang sudah diunggah (" + count + ")"
    : "Belum ada foto tersimpan";
  updateTestimoniSelection();
}
function toggleTestimoniAdminList(){
  const toggle = document.getElementById("testimoniListToggle");
  const isOpen = toggle && toggle.getAttribute("aria-expanded") === "true";
  setTestimoniAdminListExpanded(!isOpen);
}
function loadTestimoniAdmin(){
  const box = document.getElementById("testimoniAdminList");
  if(!box) return Promise.resolve();
  const toggle = document.getElementById("testimoniListToggle");
  const wasExpanded = toggle && toggle.getAttribute("aria-expanded") === "true";
  if(toggle){ toggle.disabled = true; toggle.textContent = "Memuat daftar foto..."; }
  box.innerHTML = "";
  return sbList("Info").then(function(arr){
    TESTIMONI_INFO_ROWS = (arr || []).filter(function(row){
      return String(row.name || "").trim().indexOf("INFO_TESTIMONI_") === 0 && isPublicFotoUrl(row.image);
    }).sort(function(a,b){ return Number(a.urutan || 0) - Number(b.urutan || 0); });
    box.innerHTML = "";
    if(!TESTIMONI_INFO_ROWS.length){ setTestimoniAdminListExpanded(false); return; }
    TESTIMONI_INFO_ROWS.forEach(function(row, i){
      const card = document.createElement("div");
      card.className = "testimoni-admin-card";
      const selectLabel = document.createElement("label");
      selectLabel.className = "testimoni-card-select";
      const select = document.createElement("input");
      select.type = "checkbox";
      select.className = "testimoni-row-checkbox";
      select.value = String(row.name || "");
      select.setAttribute("aria-label", "Pilih foto testimoni " + (i + 1));
      select.onchange = function(){ card.classList.toggle("selected", select.checked); updateTestimoniSelection(); };
      selectLabel.appendChild(select);
      selectLabel.appendChild(document.createTextNode("Pilih foto ini"));
      const link = document.createElement("a");
      link.href = row.image; link.target = "_blank"; link.rel = "noopener noreferrer";
      const img = document.createElement("img");
      img.src = fotoThumbUrl(row.image); img.loading = "lazy"; img.decoding = "async";
      img.alt = "Foto testimoni " + (i + 1);
      img.onerror = function(){ if(img.src !== row.image) img.src = row.image; };
      link.appendChild(img);
      const cap = document.createElement("small"); cap.textContent = "Foto testimoni #" + (i + 1);
      card.appendChild(selectLabel); card.appendChild(link); card.appendChild(cap); box.appendChild(card);
    });
    setTestimoniAdminListExpanded(wasExpanded);
  });
}

let TESTIMONI_DELETE_BUSY = false;
function updateTestimoniSelection(){
  const box = document.getElementById("testimoniAdminList");
  const countLabel = document.getElementById("testimoniSelectionCount");
  const deleteBtn = document.getElementById("testimoniDeleteBtn");
  const selectAll = document.getElementById("testimoniSelectAll");
  if(!box || !countLabel || !deleteBtn || !selectAll) return;
  const checks = Array.from(box.querySelectorAll(".testimoni-row-checkbox"));
  const selected = checks.filter(function(check){ return check.checked; }).length;
  countLabel.textContent = selected + " dipilih dari " + checks.length;
  deleteBtn.disabled = selected === 0 || TESTIMONI_DELETE_BUSY;
  selectAll.checked = checks.length > 0 && selected === checks.length;
  selectAll.indeterminate = selected > 0 && selected < checks.length;
}
function toggleAllTestimoniRows(checked){
  document.querySelectorAll("#testimoniAdminList .testimoni-row-checkbox").forEach(function(input){
    input.checked = !!checked;
    input.closest(".testimoni-admin-card").classList.toggle("selected", !!checked);
  });
  updateTestimoniSelection();
}
function fotoStoragePath(value){
  try {
    const u = new URL(String(value || "").trim());
    const prefix = "/storage/v1/object/public/foto/";
    if(!isPublicFotoUrl(u.href) || u.pathname.indexOf(prefix) !== 0) return "";
    const path = decodeURIComponent(u.pathname.slice(prefix.length));
    return /^[A-Za-z0-9._-]+$/.test(path) && path.indexOf("..") === -1 ? path : "";
  } catch(e){ return ""; }
}
async function deleteSelectedTestimoniPhotos(){
  if(TESTIMONI_DELETE_BUSY) return;
  const status = document.getElementById("testimoniUploadStatus");
  const checks = Array.from(document.querySelectorAll("#testimoniAdminList .testimoni-row-checkbox:checked"));
  const names = Array.from(new Set(checks.map(function(check){ return String(check.value || "").trim(); })))
    .filter(function(name){ return /^INFO_TESTIMONI_[A-Za-z0-9_-]+$/.test(name) && TESTIMONI_INFO_ROWS.some(function(row){ return String(row.name || "").trim() === name; }); });
  if(!names.length){ status.textContent = "Pilih satu atau beberapa foto dulu."; updateTestimoniSelection(); return; }
  if(!confirm("Hapus " + names.length + " foto testimoni yang dipilih beserta thumbnail-nya? Penghapusan permanen dan tidak bisa dibatalkan.")) return;

  const rows = names.map(function(name){ return TESTIMONI_INFO_ROWS.find(function(row){ return String(row.name || "").trim() === name; }); });
  const paths = [];
  for(const row of rows){
    const photoPath = fotoStoragePath(row && row.image);
    if(!photoPath){ status.textContent = "Ada foto dengan URL Storage tidak valid. Tidak ada yang dihapus."; return; }
    paths.push(photoPath, "thumb_" + photoPath);
  }
  const uniquePaths = Array.from(new Set(paths));
  if(uniquePaths.length > 1000){ status.textContent = "Pilihan terlalu banyak untuk satu kali hapus. Pilih maksimal 500 foto."; return; }

  TESTIMONI_DELETE_BUSY = true;
  updateTestimoniSelection();
  const deleteBtn = document.getElementById("testimoniDeleteBtn");
  deleteBtn.textContent = "Menghapus foto...";
  status.textContent = "Menghapus file foto dan thumbnail dari Supabase Storage...";
  try {
    const storageResponse = await fetch(SB_URL + "/storage/v1/object/foto", {
      method: "DELETE",
      headers: sbH(),
      body: JSON.stringify({ prefixes: uniquePaths })
    });
    if(!storageResponse.ok) throw new Error("Storage menolak penghapusan (HTTP " + storageResponse.status + "). Periksa izin delete pada bucket foto.");

    let deletedCount = 0;
    for(let i = 0; i < names.length; i += 100){
      const batch = names.slice(i, i + 100);
      status.textContent = "File foto terhapus. Menghapus data galeri " + Math.min(i + batch.length, names.length) + "/" + names.length + "...";
      const rowResponse = await fetch(SB_URL + "/rest/v1/info?name=in.(" + batch.join(",") + ")", {
        method: "DELETE",
        headers: sbH({ Prefer: "return=representation" })
      });
      if(!rowResponse.ok) throw new Error("File terhapus, tetapi data galeri gagal dihapus (HTTP " + rowResponse.status + "). Muat ulang lalu coba hapus lagi.");
      const deletedRows = await rowResponse.json().catch(function(){ return []; });
      deletedCount += Array.isArray(deletedRows) ? deletedRows.length : 0;
      if(!Array.isArray(deletedRows) || deletedRows.length !== batch.length){
        throw new Error("File terhapus, tetapi hanya " + deletedCount + "/" + names.length + " data galeri yang terhapus.");
      }
    }
    status.innerHTML = '<span class="ok">✅ ' + names.length + ' foto beserta thumbnail berhasil dihapus.</span>';
    await loadTestimoniAdmin();
  } catch(e){
    status.innerHTML = '<span class="err">Gagal menghapus: ' + String(e && e.message || "koneksi Supabase") + '</span>';
    await loadTestimoniAdmin();
  } finally {
    TESTIMONI_DELETE_BUSY = false;
    deleteBtn.textContent = "🗑️ Hapus yang dipilih";
    updateTestimoniSelection();
  }
}

async function uploadTestimoniPhotos(){
  const input = document.getElementById("testimoniFiles");
  const button = document.getElementById("testimoniUploadBtn");
  const status = document.getElementById("testimoniUploadStatus");
  const files = Array.from(input.files || []);
  if(!files.length){ status.textContent = "Pilih foto dulu."; return; }
  if(files.length > 100){ status.textContent = "Maksimal 100 foto per proses upload."; return; }
  const eligible = files.filter(function(file){ return file.size <= 8 * 1024 * 1024; });
  const skipped = files.length - eligible.length;
  if(!eligible.length){ status.textContent = "Semua foto melebihi batas 8 MB per file."; return; }
  button.disabled = true;
  let ok = 0, failed = 0;
  for(let i = 0; i < eligible.length; i++){
    const file = eligible[i];
    status.textContent = "Mengunggah " + (i + 1) + "/" + eligible.length + " — " + file.name;
    const itemName = "INFO_TESTIMONI_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
    try {
      const result = await sendUpload(file, { action: "upload", item_name: itemName, filename: file.name,
        mime: file.type || "image/jpeg", sheet: "Info", kategori: "INFO" });
      if(result && result.result === "success") ok++; else failed++;
    } catch(e){ failed++; }
  }
  input.value = "";
  button.disabled = false;
  status.textContent = "Selesai: " + ok + " foto berhasil" + (skipped ? ", " + skipped + " dilewati karena melebihi 8 MB" : "") + (failed ? ", " + failed + " gagal." : ".");
  await loadTestimoniAdmin();
}

function validRobloxServerUrl(value){
  try {
    const u = new URL(String(value || "").trim());
    return u.protocol === "https:" && (u.hostname === "roblox.com" || u.hostname === "www.roblox.com") &&
      u.pathname === "/share" && !!u.searchParams.get("code") && u.searchParams.get("type") === "Server";
  } catch(e){ return false; }
}
function loadServerSettings(){
  const status = document.getElementById("serverSettingsStatus");
  if(status) status.textContent = "Memuat daftar server...";
  return sbList("Info").then(function(arr){
    const row = (arr || []).find(function(item){ return String(item.name || "").trim() === "INFO_SERVERS"; });
    SERVER_SETTING_EXISTS = !!row;
    if(row){
      try {
        const saved = JSON.parse(String(row.deskripsi || "[]"));
        SERVER_DRAFTS = Array.isArray(saved) ? saved.map(function(item){
          return { label: String(item.label || "").trim(), url: String(item.url || "").trim() };
        }).filter(function(item){ return item.label && validRobloxServerUrl(item.url); }) : [];
      } catch(e){ SERVER_DRAFTS = []; }
      if(status) status.textContent = "Memakai daftar yang tersimpan di Supabase.";
    } else {
      SERVER_DRAFTS = DEFAULT_ROCKSTAR_SERVERS.map(function(item){ return { label: item.label, url: item.url }; });
      if(status) status.textContent = "Menampilkan link bawaan. Klik Simpan untuk mulai mengaturnya dari panel.";
    }
    renderServerDrafts();
  });
}
function renderServerDrafts(){
  const box = document.getElementById("serverDraftList");
  if(!box) return;
  box.innerHTML = "";
  if(!SERVER_DRAFTS.length){ box.textContent = "Belum ada link server. Tambahkan link di bawah."; return; }
  SERVER_DRAFTS.forEach(function(item, i){
    const row = document.createElement("div"); row.className = "srow";
    const name = document.createElement("input"); name.type = "text"; name.maxLength = 60; name.placeholder = "Nama server"; name.value = item.label;
    name.style.flex = "1 1 190px"; name.oninput = function(){ SERVER_DRAFTS[i].label = name.value; };
    const url = document.createElement("input"); url.type = "url"; url.placeholder = "Link private server Roblox"; url.value = item.url;
    url.style.flex = "2 1 300px"; url.oninput = function(){ SERVER_DRAFTS[i].url = url.value; };
    const del = document.createElement("button"); del.type = "button"; del.className = "del"; del.textContent = "Hapus";
    del.onclick = function(){ SERVER_DRAFTS.splice(i, 1); renderServerDrafts(); };
    row.appendChild(name); row.appendChild(url); row.appendChild(del); box.appendChild(row);
  });
}
function addServerDraft(){
  const label = document.getElementById("serverNameInput").value.trim();
  const url = document.getElementById("serverUrlInput").value.trim();
  const status = document.getElementById("serverSettingsStatus");
  if(!label){ status.textContent = "Isi nama server dulu."; return; }
  if(!validRobloxServerUrl(url)){ status.textContent = "Masukkan link https://www.roblox.com/share?code=...&type=Server yang valid."; return; }
  if(SERVER_DRAFTS.length >= 50){ status.textContent = "Maksimal 50 link server."; return; }
  SERVER_DRAFTS.push({ label: label.slice(0, 60), url: url });
  document.getElementById("serverNameInput").value = "";
  document.getElementById("serverUrlInput").value = "";
  status.textContent = "Link ditambahkan ke daftar sementara. Klik Simpan Daftar Server untuk menerapkan.";
  renderServerDrafts();
}
async function saveServerSettings(){
  const status = document.getElementById("serverSettingsStatus");
  const button = document.getElementById("serverSaveBtn");
  const clean = SERVER_DRAFTS.map(function(item){ return { label: String(item.label || "").trim().slice(0, 60), url: String(item.url || "").trim() }; });
  if(clean.length > 50 || clean.some(function(item){ return !item.label || !validRobloxServerUrl(item.url); })){
    status.textContent = "Periksa nama dan URL Roblox di setiap baris sebelum menyimpan."; return;
  }
  button.disabled = true; status.textContent = "Menyimpan daftar server...";
  const body = { item_name: "INFO_SERVERS", kategori: "INFO", deskripsi: JSON.stringify(clean), sheet: "Info" };
  const result = SERVER_SETTING_EXISTS
    ? await postRetry({ action: "set", item_name: "INFO_SERVERS", col: "deskripsi", value: body.deskripsi, sheet: "Info" }, 2)
    : await postRetry(Object.assign({ action: "add" }, body), 2);
  button.disabled = false;
  if(result && result.result === "success"){
    SERVER_SETTING_EXISTS = true;
    status.textContent = "Daftar server tersimpan. Link baru tampil saat pengunjung membuka panel server.";
  } else status.textContent = "Gagal menyimpan: " + String(result && result.result || "koneksi Supabase");
}

function saveTeks(){
  const v = document.getElementById("teksInput").value.trim();
  const st = document.getElementById("statusTeks");
  const btn = document.getElementById("teksBtn");
  btn.disabled = true;
  st.textContent = "Menyimpan ke sheet Info...";
  postRetry({ action: "set", item_name: TEKS_NAME, col: "deskripsi", value: v, sheet: TEKS_SHEET }, 2).then(function(d){
    if(d.result === "success"){ st.innerHTML = '<span class="ok">✅ Tersimpan! Refresh web untuk lihat.</span>'; btn.disabled = false; return; }
    // Baris belum ada di sheet Info baru -> buat otomatis sekali
    if(String(d.result || "").indexOf("tidak ketemu") !== -1 || String(d.result || "").indexOf("barang tidak ketemu") !== -1){
      postRetry({ action: "add", item_name: TEKS_NAME, kategori: "INFO", deskripsi: v, sheet: TEKS_SHEET }, 2).then(function(d2){
        btn.disabled = false;
        if(d2.result === "success") st.innerHTML = '<span class="ok">✅ Tersimpan! Refresh web untuk lihat.</span>';
        else st.innerHTML = '<span class="err">Gagal: ' + (d2.result || "?") + '</span>';
      });
      return;
    }
    btn.disabled = false;
    st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
  });
}

function defaultTeks(){
  const st = document.getElementById("statusTeks");
  const btn = document.getElementById("teksDefBtn");
  if(!confirm("Kembalikan teks berjalan ke bawaan?")) return;
  btn.disabled = true;
  st.textContent = "Menyimpan...";
  postRetry({ action: "set", item_name: TEKS_NAME, col: "deskripsi", value: "", sheet: TEKS_SHEET }, 2).then(function(d){
    btn.disabled = false;
    if(d.result === "success"){ document.getElementById("teksInput").value = ""; st.innerHTML = '<span class="ok">✅ Kembali default!</span>'; }
    else st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
  });
}

function saveKurs(){
  const raw = String(document.getElementById("kursInput").value || "").replace(/[^0-9.]/g, "");
  const v = Number(raw);
  const st = document.getElementById("statusKurs");
  const btn = document.getElementById("kursBtn");
  if(!(v > 0)){ st.innerHTML = '<span class="err">Isi kurs dulu (misal 3600).</span>'; return; }
  btn.disabled = true;
  st.textContent = "Menyimpan kurs...";
  postRetry({ action: "set", item_name: "INFO_KURS", col: "deskripsi", value: String(v), sheet: TEKS_SHEET }, 2).then(function(d){
    if(d.result === "success"){ st.innerHTML = '<span class="ok">✅ Kurs tersimpan! Web convert otomatis.</span>'; btn.disabled = false; return; }
    if(String(d.result || "").indexOf("tidak ketemu") !== -1){
      postRetry({ action: "add", item_name: "INFO_KURS", kategori: "INFO", deskripsi: String(v), sheet: TEKS_SHEET }, 2).then(function(d2){
        btn.disabled = false;
        if(d2.result === "success") st.innerHTML = '<span class="ok">✅ Kurs tersimpan! Web convert otomatis.</span>';
        else st.innerHTML = '<span class="err">Gagal: ' + (d2.result || "?") + '</span>';
      });
      return;
    }
    btn.disabled = false;
    st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
  });
}

function muatUlang(){
  const st = document.getElementById("statusReload");
  const btn = document.getElementById("reloadBtn");
  btn.disabled = true;
  st.textContent = "Memuat...";
  loadItems().then(() => {
    btn.disabled = false;
    st.textContent = "✅ Daftar termuat (" + document.getElementById("itemSel").options.length + " barang).";
  });
}

function loadItems(){
  return sbList(CURSHEET()).then(arr => {
    try {
      ALL_ITEMS = Array.isArray(arr) ? arr : [];
      document.getElementById("itemSearch").value = "";
      document.getElementById("catSearch").value = "";
      fillProductOptions("");
      fillCatOptions("");
      loadTeks();
      muatFotoBackground();
    } catch(e) {}
  });
}

// Data Supabase sudah lengkap (termasuk foto) — sinkron ulang diam-diam.
function muatFotoBackground(){
  sbList(CURSHEET()).then(arr => {
    try {
      if(!arr.length) return;
      const byName = {};
      ALL_ITEMS.forEach(o => { byName[String(o.name).trim()] = o; });
      arr.forEach(o => {
        const k = String(o.name || "").trim();
        if(k && byName[k]) Object.assign(byName[k], o);
      });
      prefill();
      renderSlides();
      const nm = document.getElementById("itemSel").value;
      const cur = ALL_ITEMS.find(x => String(x.name).trim() === nm);
      if(cur) renderPreview(nm, cur);
    } catch(e) {}
  });
}

document.getElementById("catFileInput").addEventListener("change", e => {
  const f = e.target.files[0];
  if(!f) return;
  const img = document.getElementById("catPreview");
  img.src = URL.createObjectURL(f);
  img.style.display = "block";
});

function renderPreview(name, o){
  const img = document.getElementById("prevImg");
  document.getElementById("prevName").textContent = name || "-";
  if(!o){
    img.removeAttribute("src");
    document.getElementById("prevMeta").textContent = "-";
    document.getElementById("prevPrice").textContent = "-";
    return;
  }
  const first = imgRawOf(name).v.split("|").map(s => s.trim()).filter(Boolean)[0] || "";
  if(first) img.src = first; else img.removeAttribute("src");
  const n = v => (v === 0 || v) ? Number(v).toLocaleString("id-ID") : "-";
  document.getElementById("prevMeta").textContent =
    (String(o.kategori || "-").trim() || "-") + " • Stok: " + n(o.stock) + " • Terjual: " + n(o.sold) +
    (String(o.deskripsi || "").trim() ? " • " + String(o.deskripsi).trim().slice(0, 80) : "");
  document.getElementById("prevPrice").innerHTML = "Rp " + n(o.price) +
    ((Number(o.coret) > Number(o.price)) ? ' <span style="font-size:13px;color:var(--mut);text-decoration:line-through;">Rp ' + Number(o.coret).toLocaleString("id-ID") + '</span>' : '');
}

function imgRawOf(name){
  const o = ALL_ITEMS.find(x => String(x.name).trim() === name);
  if(!o) return { v: "", fb: false };
  const s = String(o.image || "").trim();
  if(s) return { v: s, fb: false };
  return { v: FALLBACK_IMG_MAP[name] || "", fb: true };
}

function curSlides(){
  const name = document.getElementById("itemSel").value;
  return imgRawOf(name).v.split("|").map(s => s.trim()).filter(Boolean).slice(0, 20);
}

function renderSlides(){
  const box = document.getElementById("slideList");
  const name = document.getElementById("itemSel").value;
  const src = imgRawOf(name);
  const arr = src.v.split("|").map(s => s.trim()).filter(Boolean).slice(0, 20);
  if(!arr.length){ box.innerHTML = '<p class="hint">Belum ada foto. Tambahkan di bawah (maks 20).</p>'; return; }
  box.innerHTML = (src.fb ? '<p class="hint">Foto bawaan kode (Sheet masih kosong) — ubah/tambah untuk menulis ke Sheet.</p>' : '') + arr.map((u, i) =>
    '<div class="srow">' +
    '<img class="sthumb" src="' + u.replace(/"/g, "&quot;") + '" onerror="this.style.display=\'none\'">' +
    '<div class="sinfo"><b>Slide ' + (i+1) + (i===0 ? ' (utama)' : '') + '</b><br><span>' + u.slice(0, 60) + (u.length > 60 ? '...' : '') + '</span></div>' +
    '<div class="sacts">' +
    '<button onclick="slideMove(' + i + ',-1)">⬆️</button>' +
    '<button onclick="slideMove(' + i + ',1)">⬇️</button>' +
    (i===0 ? '' : '<button onclick="slideMain(' + i + ')">⭐ Utama</button>') +
    '<button onclick="slideReplace(' + i + ')">🔄 Ganti</button>' +
    '<button class="del" onclick="slideDelete(' + i + ')">🗑️</button>' +
    '</div></div>'
  ).join("") + '<input type="file" id="slideReplaceInput" accept="image/*" style="display:none;">';
  document.getElementById("slideReplaceInput").addEventListener("change", e => {
    const f = e.target.files[0];
    if(f) slideUploadToSlot(parseInt(e.target.dataset.slot, 10), f);
  });
}

function saveSlides(arr, stMsg, onFail){
  const name = document.getElementById("itemSel").value;
  const st = document.getElementById("statusSlide");
  if(!name){ st.innerHTML = '<span class="err">Pilih barang dulu.</span>'; return; }
  st.textContent = "Menyimpan...";
  postOne({ action: "set", item_name: name, col: "image", value: arr.slice(0, 20).join("|"), sheet: CURSHEET() }).then(d => {
    if(d.result === "success"){
      st.innerHTML = '<span class="ok">' + (stMsg || '✅ Tersimpan!') + '</span>';
      updItem(name, { image: arr.slice(0, 20).join("|") });
      syncAfterProduct(name);
    } else {
      st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
      if(onFail) onFail();
    }
  }).catch(() => {
    st.innerHTML = '<span class="err">Gagal kirim, cek koneksi.</span>';
    if(onFail) onFail();
  });
}

function slideUploadToSlot(i, f){
  const st = document.getElementById("statusSlide");
  if(f.size > 8 * 1024 * 1024){ st.innerHTML = '<span class="err">Foto maksimal 8 MB.</span>'; return; }
  st.textContent = "Memeriksa & mengupload...";
  const name = document.getElementById("itemSel").value;
  const backup = curSlides().join("|");
  sendUpload(f, { action: "upload", item_name: name, filename: f.name, mime: f.type || "image/jpeg", sheet: CURSHEET() }, backup).then(d => {
    if(d.result === "success" && d.url){
      const arr = curSlides();
      arr[i] = d.url;
      saveSlides(arr, '✅ Slide ' + (i+1) + ' diganti!', () => {
        // gabung gagal setelah timpa: kembalikan foto lama
        postOne({ action: "set", item_name: name, col: "image", value: backup, sheet: CURSHEET() });
      });
      document.getElementById("slideFileInput").value = "";
    } else if(String(d.result || "").indexOf("file rusak") !== -1){
      st.innerHTML = '<span class="err">File rusak / bukan gambar (pakai JPG/PNG). Ganti file.</span>';
    } else {
      st.innerHTML = '<span class="err">Gagal upload: ' + (d.result || "?") + '</span>';
    }
  });
}

function slideReplace(i){
  const inp = document.getElementById("slideReplaceInput");
  inp.dataset.slot = i;
  inp.click();
}

function slideDelete(i){
  const arr = curSlides();
  if(!confirm("Hapus slide " + (i+1) + " ?")) return;
  arr.splice(i, 1);
  saveSlides(arr, '✅ Slide dihapus!');
}

function slideMove(i, d){
  const arr = curSlides();
  const j = i + d;
  if(j < 0 || j >= arr.length) return;
  const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  saveSlides(arr, '✅ Urutan dipindah!');
}

function slideMain(i){
  const arr = curSlides();
  const u = arr.splice(i, 1)[0];
  arr.unshift(u);
  saveSlides(arr, '✅ Slide ' + (i+1) + ' jadi foto utama!');
}

let stageQueue = [];
function stageFiles(){
  const inp = document.getElementById("slideFileInput");
  const files = Array.from(inp.files || []);
  const st = document.getElementById("statusSlide");
  const room = 20 - curSlides().length - stageQueue.length;
  if(files.length > room){
    st.innerHTML = '<span class="err">Antrean penuh (sisa ' + Math.max(room, 0) + '). Upload dulu yang ada.</span>';
    inp.value = "";
    return;
  }
  files.forEach(f => {
    if(f.size > 8 * 1024 * 1024){ return; }
    stageQueue.push(f);
  });
  inp.value = "";
  renderStage();
  if(files.length) st.textContent = stageQueue.length + " foto di antrean — klik Tambah Foto Ini untuk upload berurutan.";
}
function renderStage(){
  const box = document.getElementById("stageList");
  if(!stageQueue.length){ box.innerHTML = ""; return; }
  box.innerHTML = '<p class="hint">Antrean upload (sesuai urutan pilih/klik):</p>' + stageQueue.map((f, i) =>
    '<div class="qrow">' +
    '<b style="color:var(--blue2);">#' + (i + 1) + '</b><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + String(f.name).replace(/</g, "&lt;").slice(0, 40) + '</span>' +
    '<button onclick="stageMove(' + i + ',-1)">⬆️</button>' +
    '<button onclick="stageMove(' + i + ',1)">⬇️</button>' +
    '<button onclick="stageDrop(' + i + ')">✖</button></div>'
  ).join("");
}
function stageMove(i, d){
  const j = i + d;
  if(j < 0 || j >= stageQueue.length) return;
  const t = stageQueue[i]; stageQueue[i] = stageQueue[j]; stageQueue[j] = t;
  renderStage();
}
function stageDrop(i){
  stageQueue.splice(i, 1);
  renderStage();
}
function slideAddFile(){
  const arr = curSlides();
  const st = document.getElementById("statusSlide");
  const name = document.getElementById("itemSel").value;
  if(!name){ st.innerHTML = '<span class="err">Pilih barang dulu.</span>'; return; }
  const todo = stageQueue.slice();
  if(!todo.length){ st.innerHTML = '<span class="err">Pilih foto dulu (bisa berkali-kali, masuk antrean).</span>'; return; }
  const room = 20 - arr.length;
  if(todo.length > room){ st.innerHTML = '<span class="err">Maksimal 20 slide (sisa ' + room + ').</span>'; return; }
  const btn = document.getElementById("slideAddBtn");
  if(btn.disabled) return;
  btn.disabled = true;
  let done = 0;
  st.textContent = "Mengupload 0/" + todo.length + " (paralel)...";
  const ups = todo.map(f => prepImage(f).then(p => {
    if(!p.ok) throw new Error("file rusak: " + f.name);
    const path = Date.now() + "_" + Math.floor(Math.random() * 1e6) + "_" + safeName(p.name);
    const blob = b64ToBlob(p.base64, p.mime);
    const putFull = fetch(SB_URL + "/storage/v1/object/foto/" + path, {
      method: "PUT",
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": p.mime, "x-upsert": "true" },
      body: blob
    });
    const putThumb = makeThumb(blob).then(tblob => {
      if(!tblob) return;
      return fetch(SB_URL + "/storage/v1/object/foto/thumb_" + path, {
        method: "PUT",
        headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "image/webp", "x-upsert": "true" },
        body: tblob
      }).catch(function(){});
    });
    const putTiny = makeTinyThumb(blob).then(tblob => {
      if(!tblob) return;
      return fetch(SB_URL + "/storage/v1/object/foto/tiny_" + path, {
        method: "PUT",
        headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "image/webp", "x-upsert": "true" },
        body: tblob
      }).catch(function(){});
    });
    return Promise.all([putFull, putThumb, putTiny]).then(rs => {
      if(!rs[0].ok) throw new Error("upload gagal: " + f.name);
      done++;
      st.textContent = "Mengupload " + done + "/" + todo.length + " (paralel)...";
      return SB_URL + "/storage/v1/object/public/foto/" + path;
    });
  }));
  Promise.all(ups).then(urls => {
    const full = arr.concat(urls).join("|").split("|").map(s => s.trim()).filter(Boolean).slice(0, 20).join("|");
    return postOne({ action: "set", item_name: name, col: "image", value: full, sheet: CURSHEET() }).then(d => {
      if(d.result !== "success") throw new Error(d.result || "gagal simpan");
      updItem(name, { image: full });
      syncAfterProduct(name);
      stageQueue = [];
      renderStage();
      document.getElementById("slideAddBtn").disabled = false;
      st.innerHTML = '<span class="ok">✅ ' + urls.length + ' slide ditambah berurutan!</span>';
    });
  }).catch(err => {
    syncAfterProduct(name);
    document.getElementById("slideAddBtn").disabled = false;
    st.innerHTML = '<span class="err">Gagal: ' + (err.message || "?") + ' — terupload ' + done + '/' + todo.length + '.</span>';
  });
}

function slideAddUrl(){
  const arr = curSlides();
  if(arr.length >= 20){ document.getElementById("statusSlide").innerHTML = '<span class="err">Maksimal 20 slide.</span>'; return; }
  const u = document.getElementById("slideUrlInput").value.trim();
  if(!u){ document.getElementById("statusSlide").innerHTML = '<span class="err">Tempel link dulu.</span>'; return; }
  arr.push(u);
  saveSlides(arr, '✅ Link ditambah!');
  document.getElementById("slideUrlInput").value = "";
}

function uploadCat(){
  const kat = document.getElementById("catSel").value;
  const f = document.getElementById("catFileInput").files[0];
  const st = document.getElementById("statusCat");
  const btn = document.getElementById("catUpBtn");
  if(!kat){ st.innerHTML = '<span class="err">Pilih kategori dulu.</span>'; return; }
  if(!f){ st.innerHTML = '<span class="err">Pilih foto dulu.</span>'; return; }
  if(f.size > 8 * 1024 * 1024){ st.innerHTML = '<span class="err">Foto maksimal 8 MB.</span>'; return; }
  btn.disabled = true;
  st.textContent = "Memeriksa & mengupload foto kategori, tunggu...";
  sendUpload(f, { action: "upload", item_name: "CAT:" + kat, filename: f.name, mime: f.type || "image/jpeg", sheet: CURSHEET(), kategori: kat }, (ALL_ITEMS.find(x => String(x.name).trim() === "CAT:" + kat) || { image: "" }).image || "").then(d => {
    if(d.result === "success"){
      st.innerHTML = '<span class="ok">✅ Foto kategori terpasang!' + (d.verified ? ' (terverifikasi)' : '') + ' Refresh web utama untuk lihat.</span><br><a href="' + d.url + '" target="_blank" style="color:var(--blue2);">Lihat foto</a>';
      updItem("CAT:" + kat, { image: d.url });
      if(!ALL_ITEMS.some(x => String(x.name).trim() === "CAT:" + kat)){
        addLocalRow({ name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: d.url, sold: 0 });
      }
      prefillCat();
      document.getElementById("catFileInput").value = "";
    } else if(String(d.result || "").indexOf("file rusak") !== -1){
      st.innerHTML = '<span class="err">File rusak / bukan gambar (pakai JPG/PNG). Ganti file.</span>';
    } else {
      st.innerHTML = '<span class="err">Gagal: ' + (d.result || d.error || "?") + '. Kalau baris CAT belum ada, tambah manual 1 baris di Sheet: name=CAT:' + kat + ', kategori=' + kat + ', lalu upload ulang.</span>';
    }
    btn.disabled = false;
  }).catch(err => {
    st.innerHTML = '<span class="err">Gagal kirim: periksa koneksi / deploy terbaru.</span>';
    btn.disabled = false;
  });
}

function needAdd_(d, st, btn){
  // backend lama belum kenal action=add -> minta deploy ulang
  if(d.result === "success") return false;
  if(String(d.result || "").indexOf("unknown action") !== -1){
    st.innerHTML = '<span class="err">Backend belum update. Deploy ulang Code.gs terbaru (New version), lalu coba lagi.</span>';
    btn.disabled = false;
    return true;
  }
  return false;
}

function addCategory(){
  const kat = document.getElementById("addCatName").value.trim();
  const f = document.getElementById("addCatFile").files[0];
  const st = document.getElementById("statusAddCat");
  const btn = document.getElementById("addCatBtn");
  if(!kat){ st.innerHTML = '<span class="err">Isi nama kategori dulu.</span>'; return; }
  btn.disabled = true;
  st.textContent = "Menambah kategori...";
  postOne({ action: "add", item_name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: "", sold: 0, sheet: CURSHEET() }).then(d => {
    if(needAdd_(d, st, btn)) return;
    if(d.result !== "success"){
      st.textContent = "Memeriksa ke Sheet...";
      verifyExists("CAT:" + kat).then(ex => {
        btn.disabled = false;
        if(ex){ st.innerHTML = '<span class="ok">✅ Kategori ternyata sudah masuk! (terverifikasi)</span>'; addLocalRow({ name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: "", sold: 0 }); document.getElementById("catSel").value = kat; prefillCat(); }
        else st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
      });
      return;
    }
    if(!f){
      st.innerHTML = '<span class="ok">✅ Kategori ditambah! Refresh web untuk lihat.</span>';
      document.getElementById("addCatName").value = "";
      btn.disabled = false;
      addLocalRow({ name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: "", sold: 0 });
      document.getElementById("catSel").value = kat;
      prefillCat();
      return;
    }
    if(f.size > 8 * 1024 * 1024){ st.innerHTML = '<span class="err">Maksimal 8 MB (kategori sudah ditambah).</span>'; btn.disabled = false; addLocalRow({ name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: "", sold: 0 }); return; }
    st.textContent = "Kategori ok, memeriksa & mengupload foto...";
    sendUpload(f, { action: "upload", item_name: "CAT:" + kat, filename: f.name, mime: f.type || "image/jpeg", sheet: CURSHEET(), kategori: kat }).then(u => {
      if(u.result === "success"){ st.innerHTML = '<span class="ok">✅ Kategori + foto ditambah!</span>'; addLocalRow({ name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: u.url, sold: 0 }); }
      else if(String(u.result || "").indexOf("file rusak") !== -1){ st.innerHTML = '<span class="err">Kategori ditambah, tapi file rusak / bukan gambar — upload ulang pakai JPG/PNG.</span>'; addLocalRow({ name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: "", sold: 0 }); }
      else { st.innerHTML = '<span class="err">Kategori ditambah, foto gagal: ' + (u.result || "?") + '</span>'; addLocalRow({ name: "CAT:" + kat, kategori: kat, price: 0, stock: 0, soldout: "YA", image: "", sold: 0 }); }
      document.getElementById("addCatName").value = "";
      document.getElementById("addCatFile").value = "";
      btn.disabled = false;
      document.getElementById("catSel").value = kat;
      prefillCat();
    });
  });
}

function addProduct(){
  const nm = document.getElementById("addName").value.trim();
  const kat = document.getElementById("addCatSel").value;
  const price = Number(document.getElementById("addPrice").value);
  const stockRaw = document.getElementById("addStock").value;
  const coretRaw = document.getElementById("addCoret").value;
  const descVal = document.getElementById("addDesc").value.trim();
  const f = document.getElementById("addFile").files[0];
  const st = document.getElementById("statusAdd");
  const btn = document.getElementById("addBtn");
  if(!nm){ st.innerHTML = '<span class="err">Isi nama produk dulu.</span>'; return; }
  if(!kat){ st.innerHTML = '<span class="err">Pilih kategorinya dulu.</span>'; return; }
  if(!(price > 0)){ st.innerHTML = '<span class="err">Isi harga dulu.</span>'; return; }
  if(stockRaw === "" || isNaN(Number(stockRaw))){ st.innerHTML = '<span class="err">Isi stok dulu.</span>'; return; }
  btn.disabled = true;
  st.textContent = "Menambah produk...";
  const coretVal = (coretRaw !== "" && !isNaN(Number(coretRaw))) ? Number(coretRaw) : 0;
  postOne({ action: "add", item_name: nm, kategori: kat, price: price, coret: coretVal, deskripsi: descVal, stock: Number(stockRaw), soldout: "", image: "", sold: 0, sheet: CURSHEET() }).then(d => {
    if(needAdd_(d, st, btn)) return;
    if(d.result !== "success"){
      st.textContent = "Memeriksa ke Sheet...";
      verifyExists(nm).then(ex => {
        btn.disabled = false;
        if(ex){ st.innerHTML = '<span class="ok">✅ Produk ternyata sudah masuk! (terverifikasi)</span>'; addLocalRow({ name: nm, kategori: kat, price: price, coret: coretVal, deskripsi: descVal, stock: Number(stockRaw), soldout: "", image: "", sold: 0 }); document.getElementById("itemSel").value = nm; syncAfterProduct(nm); }
        else st.innerHTML = '<span class="err">Gagal: ' + (d.result || "?") + '</span>';
      });
      return;
    }
    if(!f){
      st.innerHTML = '<span class="ok">✅ Produk ditambah! Tambah fotonya via panel slide.</span>';
      document.getElementById("addName").value = "";
      btn.disabled = false;
      addLocalRow({ name: nm, kategori: kat, price: price, coret: coretVal, deskripsi: descVal, stock: Number(stockRaw), soldout: "", image: "", sold: 0 });
      document.getElementById("itemSel").value = nm;
      syncAfterProduct(nm);
      return;
    }
    if(f.size > 8 * 1024 * 1024){ st.innerHTML = '<span class="err">Maksimal 8 MB (produk sudah ditambah).</span>'; btn.disabled = false; addLocalRow({ name: nm, kategori: kat, price: price, coret: coretVal, deskripsi: descVal, stock: Number(stockRaw), soldout: "", image: "", sold: 0 }); document.getElementById("itemSel").value = nm; syncAfterProduct(nm); return; }
    st.textContent = "Produk ok, memeriksa & mengupload foto...";
    sendUpload(f, { action: "upload", item_name: nm, filename: f.name, mime: f.type || "image/jpeg", sheet: CURSHEET() }).then(u => {
      const img = (u.result === "success") ? u.url : "";
      if(u.result === "success") st.innerHTML = '<span class="ok">✅ Produk + foto ditambah!</span>';
      else if(String(u.result || "").indexOf("file rusak") !== -1) st.innerHTML = '<span class="err">Produk ditambah, tapi file rusak / bukan gambar — tambah ulang via panel slide pakai JPG/PNG.</span>';
      else st.innerHTML = '<span class="err">Produk ditambah, foto gagal: ' + (u.result || "?") + '</span>';
      document.getElementById("addName").value = "";
      document.getElementById("addFile").value = "";
      btn.disabled = false;
      addLocalRow({ name: nm, kategori: kat, price: price, coret: coretVal, deskripsi: descVal, stock: Number(stockRaw), soldout: "", image: img, sold: 0 });
      document.getElementById("itemSel").value = nm;
      syncAfterProduct(nm);
    });
  });
}

function catDisplayOf(kat){
  const row = ALL_ITEMS.find(x => String(x.name).trim() === "CAT:" + kat);
  if(row && String(row.image || "").trim()) return String(row.image).split("|").map(s => s.trim()).filter(Boolean)[0] || "";
  const p = ALL_ITEMS.find(x => String(x.kategori || "").trim() === kat && String(x.name).trim().indexOf("CAT:") !== 0 && String(x.image || "").trim());
  if(p) return String(p.image).split("|").map(s => s.trim()).filter(Boolean)[0] || "";
  return "";
}

function prefillCat(){
  const kat = document.getElementById("catSel").value;
  const u = kat ? catDisplayOf(kat) : "";
  const img = document.getElementById("catOld");
  if(u) img.src = u; else img.removeAttribute("src");
  document.getElementById("catOldCap").textContent = u || "Belum ada foto display.";
}

function infoMap(rows){
  const m = {};
  (rows || []).forEach((r, i) => {
    const k = String((r && r[0] !== undefined) ? r[0] : "").trim().toLowerCase();
    if(["teks", "mode", "open", "close"].indexOf(k) !== -1 && !(k in m)){
      m[k] = (i + 1 < rows.length && rows[i + 1][0] !== undefined) ? String(rows[i + 1][0]).trim() : "";
    }
  });
  return m;
}

async function sbAction(action, tbl, body, signal){
  if(action === "set"){
    var name = String(body.item_name || body.name || "").trim();
    var col = sbCol(body.col);
    if(!name) return { result: "error: item_name kosong" };
    if(!col) return { result: "error: kolom tidak dikenal: " + body.col };
    var patch = {}; patch[col] = body.value;
    var r = await fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(name), {
      method: "PATCH", headers: sbH({ Prefer: "return=representation" }),
      body: JSON.stringify(patch), signal: signal
    });
    if(!r.ok) return { result: "error: gagal simpan (" + r.status + ")" };
    var a = await r.json();
    if(Array.isArray(a) && a.length) return { result: "success" };
    return { result: "error: barang tidak ketemu: " + name };
  }
  if(action === "add"){
    var nm = String(body.item_name || body.name || "").trim();
    if(!nm) return { result: "error: item_name kosong" };
    var kat = String(body.kategori || "").trim();
    if(!kat && nm.indexOf("CAT:") === 0) kat = nm.slice(4).trim();
    if(!kat) kat = "Lainnya";
    var maxU = 0;
    try {
      var mr = await fetch(SB_URL + "/rest/v1/" + tbl + "?select=urutan&order=urutan.desc&limit=1", { headers: sbH(), signal: signal });
      var ma = await mr.json();
      if(Array.isArray(ma) && ma[0] && isFinite(Number(ma[0].urutan))) maxU = Number(ma[0].urutan);
    } catch(e) {}
    var row = { name: nm, kategori: kat, price: Number(body.price) || 0, coret: Number(body.coret) || 0,
      deskripsi: String(body.deskripsi || ""), stock: Number(body.stock) || 0,
      soldout: String(body.soldout || (nm.indexOf("CAT:") === 0 ? "YA" : "")),
      image: String(body.image || ""), sold: Number(body.sold) || 0, dilihat: 0, urutan: maxU + 1 };
    var r2 = await fetch(SB_URL + "/rest/v1/" + tbl, {
      method: "POST", headers: sbH({ Prefer: "return=representation" }),
      body: JSON.stringify(row), signal: signal
    });
    if(r2.status === 409) return { result: "error: sudah ada: " + nm };
    if(!r2.ok) return { result: "error: gagal tambah (" + r2.status + ")" };
    return { result: "success" };
  }
  if(action === "delete"){
    var dn = String(body.item_name || body.name || "").trim();
    if(!dn) return { result: "error: item_name kosong" };
    var r3 = await fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(dn), {
      method: "DELETE", headers: sbH(), signal: signal
    });
    if(!r3.ok) return { result: "error: gagal hapus (" + r3.status + ")" };
    return { result: "success" };
  }
  if(action === "delmany"){
    var names = body.names || body.items || [];
    var ok = 0;
    for(var i = 0; i < names.length; i++){
      var x = String(names[i]).trim();
      if(!x) continue;
      try {
        var rd = await fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(x), {
          method: "DELETE", headers: sbH(), signal: signal
        });
        if(rd.ok) ok++;
      } catch(e) {}
    }
    return { result: "success", deleted: ok, total: names.length };
  }
  if(action === "upload"){
    var un = String(body.item_name || "").trim();
    if(!un) return { result: "error: item_name kosong" };
    if(!body.file) return { result: "error: file kosong" };
    var blob = b64ToBlob(body.file, body.mime);
    var path = Date.now() + "_" + safeName(body.filename || (un + ".jpg"));
    var up = await fetch(SB_URL + "/storage/v1/object/foto/" + path, {
      method: "PUT",
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY,
        "Content-Type": body.mime || "application/octet-stream", "x-upsert": "true" },
      body: blob, signal: signal
    });
    if(!up.ok) return { result: "error: upload foto gagal (" + up.status + ")" };
    // thumb hemat untuk katalog (best-effort: gagal = abaikan, full tetap jalan)
    try {
      const tblob = await makeThumb(blob);
      if(tblob){
        await fetch(SB_URL + "/storage/v1/object/foto/thumb_" + path, {
          method: "PUT",
          headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY,
            "Content-Type": "image/webp", "x-upsert": "true" },
          body: tblob, signal: signal
        });
      }
      const tiny = await makeTinyThumb(blob);
      if(tiny){
        await fetch(SB_URL + "/storage/v1/object/foto/tiny_" + path, {
          method: "PUT",
          headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY,
            "Content-Type": "image/webp", "x-upsert": "true" },
          body: tiny, signal: signal
        });
      }
    } catch(e) {}
    var url = SB_URL + "/storage/v1/object/public/foto/" + path;
    var cur = null;
    try {
      var gr = await fetch(SB_URL + "/rest/v1/" + tbl + "?select=image&name=eq." + encodeURIComponent(un), { headers: sbH(), signal: signal });
      var ga = await gr.json();
      cur = (Array.isArray(ga) && ga[0]) || null;
    } catch(e) {}
    if(cur){
      if(body.append){
        var parts = String(cur.image || "").split("|").map(function(s){ return s.trim(); }).filter(Boolean);
        parts.push(url);
        var full = parts.join("|");
        await fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(un), {
          method: "PATCH", headers: sbH(), body: JSON.stringify({ image: full }), signal: signal
        });
        return { result: "success", url: url, full: full };
      }
      await fetch(SB_URL + "/rest/v1/" + tbl + "?name=eq." + encodeURIComponent(un), {
        method: "PATCH", headers: sbH(), body: JSON.stringify({ image: url }), signal: signal
      });
    } else {
      var kc = String(body.kategori || "").trim();
      if(!kc && un.indexOf("CAT:") === 0) kc = un.slice(4).trim();
      if(!kc) kc = "Lainnya";
      await fetch(SB_URL + "/rest/v1/" + tbl, {
        method: "POST", headers: sbH(),
        body: JSON.stringify({ name: un, kategori: kc, price: 0, coret: 0, deskripsi: "", stock: 0,
          soldout: un.indexOf("CAT:") === 0 ? "YA" : "", image: url, sold: 0, dilihat: 0 }), signal: signal
      });
    }
    return { result: "success", url: url };
  }
  return { result: "error: unknown action (" + action + ")" };
}

async function postOne(body, ms){
  ms = ms || 45000;
  const ctl = new AbortController();
  const timer = setTimeout(() => { try { ctl.abort(); } catch(e) {} }, ms);
  try {
    var action = String((body && body.action) || "").toLowerCase();
    var tbl = sbTable(body && body.sheet);
    var out = await sbAction(action, tbl, body || {}, ctl.signal);
    clearTimeout(timer);
    return out;
  } catch(err) {
    clearTimeout(timer);
    return { result: "error: timeout/koneksi (> " + Math.round(ms/1000) + "s)" };
  }
}

// Cek file benar-benar gambar yang bisa dibuka browser (tolak file rusak/HEIC/tipe aneh).
function validImageFile(f){
  return new Promise(resolve => {
    if(!f){ resolve(false); return; }
    if(f.type && String(f.type).indexOf("image/") !== 0){ resolve(false); return; }
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => { URL.revokeObjectURL(url); resolve(true); };
    im.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
    im.src = url;
  });
}

// Upload file yang sudah lolos validasi. body = {action:"upload", item_name, ...} tanpa file.
// Foto dikompres dulu (maks 1600px) supaya upload jauh lebih cepat.
function sendUpload(f, body, oldFull){
  // Semua file lewat kompres WebP q82 (file kecil tetap cepat + kualitas utuh)
  return prepImage(f).then(p => {
    if(!p.ok) return { result: "error: file rusak / bukan gambar (pakai JPG/PNG)" };
    body.file = p.base64;
    body.mime = p.mime;
    body.filename = p.name;
    return postRetry(body, 3, 90000).then(d => {
      if(d.result === "success") return d;
      return verifyImg(body.item_name, oldFull || "").then(full => {
        if(full) return { result: "success", url: full.split("|").map(s => s.trim()).filter(Boolean)[0] || full, verified: true };
        return d;
      });
    });
  });
}

function prepImage(f){
  return validImageFile(f).then(ok => {
    if(!ok) return { ok: false };
    return new Promise(resolve => {
      const url = URL.createObjectURL(f);
      const im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const MAX = 1600;
          const sc = Math.min(1, MAX / Math.max(im.naturalWidth, im.naturalHeight));
          const cv = document.createElement("canvas");
          cv.width = Math.max(1, Math.round(im.naturalWidth * sc));
          cv.height = Math.max(1, Math.round(im.naturalHeight * sc));
          cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
          // Samakan optimasi web: selalu WebP q82 (fallback JPEG bila browser jadul)
          let mime = "image/webp";
          let dataUrl = "";
          try { dataUrl = cv.toDataURL(mime, 0.82); } catch(e) { dataUrl = ""; }
          let nm = String(f.name || "foto").replace(/\.[^.]+$/, "");
          if(!dataUrl || dataUrl === "data:,"){
            mime = "image/jpeg";
            dataUrl = cv.toDataURL(mime, 0.85);
            nm = nm + ".jpg";
          } else {
            nm = nm + ".webp";
          }
          resolve({ ok: true, base64: dataUrl.split(",")[1], mime: mime, name: nm });
        } catch(e){ resolve({ ok: false }); }
      };
      im.onerror = () => { URL.revokeObjectURL(url); resolve({ ok: false }); };
      im.src = url;
    });
  });
}

function renameCat(){
  const oldKat = document.getElementById("catRenameSel").value;
  const newKat = document.getElementById("catNameInput").value.trim();
  const st = document.getElementById("statusCatRename");
  const btn = document.getElementById("renameCatBtn");
  if(!oldKat){ st.innerHTML = '<span class="err">Pilih kategori dulu.</span>'; return; }
  if(!newKat){ st.innerHTML = '<span class="err">Isi nama kategori baru dulu.</span>'; return; }
  if(!confirm("Ganti kategori:\n" + oldKat + "\nmenjadi:\n" + newKat + "\n?")) return;
  btn.disabled = true;
  st.textContent = "Menyimpan nama kategori...";
  const targets = ALL_ITEMS.filter(o => String(o.kategori || "").trim() === oldKat && String(o.name || "").trim().indexOf("CAT:") !== 0);
  let chain = Promise.resolve(true);
  targets.forEach(o => {
    const nm = String(o.name).trim();
    chain = chain.then(() => postOne({ action: "set", item_name: nm, col: "kategori", value: newKat, sheet: CURSHEET() }));
  });
  chain = chain.then(() => postOne({ action: "set", item_name: "CAT:" + oldKat, col: "kategori", value: newKat, sheet: CURSHEET() }));
  chain = chain.then(() => postOne({ action: "set", item_name: "CAT:" + oldKat, col: 1, value: "CAT:" + newKat, sheet: CURSHEET() }));
  chain.then(() => {
    st.innerHTML = '<span class="ok">✅ Nama kategori diganti! Refresh web utama.</span>';
    document.getElementById("catNameInput").value = "";
    btn.disabled = false;
    ALL_ITEMS.forEach(o => {
      if(String(o.kategori || "").trim() === oldKat) o.kategori = newKat;
      if(String(o.name).trim() === "CAT:" + oldKat) o.name = "CAT:" + newKat;
    });
    ["catSel","catRenameSel","addCatSel"].forEach(id => {
      const s = document.getElementById(id);
      Array.from(s.options).forEach(p => { if(p.value === oldKat){ p.value = newKat; p.textContent = newKat.slice(0, 70); } });
      s.value = newKat;
    });
    document.getElementById("catRenameOldName").textContent = newKat;
    prefill();
    prefillCat();
  }).catch(() => { st.innerHTML = '<span class="err">Gagal kirim, cek koneksi.</span>'; btn.disabled = false; });
}