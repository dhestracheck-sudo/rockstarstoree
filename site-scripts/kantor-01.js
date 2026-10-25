
const ADMIN_PIN = "112233";
const SB_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SB_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";

function unlock(){
  if(document.getElementById("pinInput").value === ADMIN_PIN){
    document.getElementById("pinCard").style.display = "none";
    document.getElementById("officeWrap").style.display = "block";
    seatCrew();
    refreshTalk();
    setInterval(refreshTalk, 30000);
  } else {
    alert("PIN salah.");
  }
}

/* kru pixel duduk mengetik di mejanya masing-masing */
function pxPerson(el, shirt, hair){
  if(!el) return;
  const P = { H: hair, S: "#f0c297", E: "#20202a", C: shirt, A: "#f0c297" };
  const rows = [
    "....HHHHHH..",
    "...HHHHHHHH.",
    "...HHHHHHHH.",
    "...SSSSSSSS.",
    "...SESSES...",
    "....SSSSSS..",
    "..CCCCCCCC..",
    ".ACCCCCCCCA.",
    ".ACCCCCCCCA.",
    "..CCCCCCCC..",
    "..CCCCCCCC.."
  ];
  const sh = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if(ch !== "." && P[ch]) sh.push(x + "px " + y + "px 0 " + P[ch]);
    });
  });
  el.innerHTML = "";
  const d = document.createElement("div");
  d.className = "px";
  d.style.boxShadow = sh.join(",");
  el.appendChild(d);
}
function seatCrew(){
  pxPerson(document.querySelector("#crew-cs .ava"), "#2b4eff", "#23232e");
  pxPerson(document.querySelector("#crew-gudang .ava"), "#e07b2b", "#4a3220");
  pxPerson(document.querySelector("#crew-bos .ava"), "#2ecc71", "#141414");
}

/* ucapan dari data asli */
function sbGet(path){
  return fetch(SB_URL + "/rest/v1/" + path, {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }
  }).then(r => r.json()).then(a => Array.isArray(a) ? a : []).catch(() => []);
}
function say(id, t){
  const el = document.getElementById(id);
  if(el) el.textContent = t;
}
function refreshTalk(){
  sbGet("orders?select=id&status=eq.baru").then(rows => {
    const baru = rows.length;
    say("bub-cs", baru ? "📦 " + baru + " order menunggu!" : "✅ Order aman!");
  });
  Promise.all([
    sbGet("brainrot?select=stock"), sbGet("akun?select=stock"),
    sbGet("topup?select=stock"), sbGet("joki?select=stock")
  ]).then(rs => {
    let habis = 0;
    rs.forEach(arr => arr.forEach(o => { if(Number(o.stock) === 0) habis++; }));
    say("bub-gudang", habis ? "⚠️ " + habis + " produk habis!" : "✅ Stok aman!");
  });
  const since = new Date(); since.setHours(0, 0, 0, 0);
  sbGet("orders?select=total,waktu&order=waktu.desc&limit=500").then(rows => {
    let n = 0, rp = 0;
    rows.forEach(o => {
      try {
        if(new Date(o.waktu).getTime() >= since.getTime()){ n++; rp += Number(o.total) || 0; }
      } catch(e) {}
    });
    say("bub-bos", "💰 Hari ini " + n + " order!");
  });
}
document.getElementById("crew-cs").addEventListener("click", () => location.href = "/analisis");
document.getElementById("crew-gudang").addEventListener("click", () => location.href = "/admin");
document.getElementById("crew-bos").addEventListener("click", () => location.href = "/analisis");
