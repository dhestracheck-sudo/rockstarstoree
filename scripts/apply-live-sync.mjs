import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('site-scripts/home-08.js');
let code = fs.readFileSync(filePath, 'utf8');

const oldFetchSheet = /function fetchSheet\(sheet, cbName\)\{[\s\S]*?return sbGet\(tbl \+ "\?select=name,kategori,price,coret,deskripsi,stock,soldout,image,sold,dilihat,urutan&order=urutan"\);\s*\}/;

const newFetchSheet = `function fetchSheet(sheet, cbName){
  const tbl = sbTableOf(sheet);
  // Untuk tabel info di homepage, ambil HANYA INFO_TEKS dan INFO_KURS (jangan unduh ratusan foto testimoni / state spin)
  if(tbl === "info"){
    return sbGet("info?select=name,deskripsi&name=in.(INFO_TEKS,INFO_KURS,INFO_TEKS_SPEED,INFO_CATALOG_VERSION)");
  }
  if(tbl === "brainrot"){
    // Sinkronisasi otomatis real-time: langsung ambil dari Google Sheet agar setiap kali owner
    // menambah atau mengedit kategori di Google Sheet, website langsung otomatis ngikut seketika!
    const controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4500) : null;
    return fetch(SHEET_URL + "?sheet=Brainrot&_t=" + Date.now(), {
      signal: controller ? controller.signal : undefined,
      cache: "no-store"
    })
      .then(r => r.json())
      .then(arr => {
        if(timeoutId) clearTimeout(timeoutId);
        if(Array.isArray(arr) && arr.length > 0) return arr;
        return sbGet("brainrot?select=name,kategori,price,coret,deskripsi,stock,soldout,image,sold,dilihat,urutan&order=urutan");
      })
      .catch(() => {
        if(timeoutId) clearTimeout(timeoutId);
        return sbGet("brainrot?select=name,kategori,price,coret,deskripsi,stock,soldout,image,sold,dilihat,urutan&order=urutan");
      });
  }
  return sbGet(tbl + "?select=name,kategori,price,coret,deskripsi,stock,soldout,image,sold,dilihat,urutan&order=urutan");
}`;

if (!oldFetchSheet.test(code)) {
  console.error("Could not find old fetchSheet in home-08.js");
  process.exit(1);
}

code = code.replace(oldFetchSheet, newFetchSheet);

// Cache invalidation check in loadLiveStock
const oldWarmCacheCheck = `let hasWarmCache = false;
  try {`;

const newWarmCacheCheck = `let hasWarmCache = false;
  try {
    try {
      const SYNC_REV = "20261114-15cats";
      if(localStorage.getItem("rs_sync_rev") !== SYNC_REV){
        localStorage.removeItem("rs_last_full_sync");
        localStorage.setItem("rs_sync_rev", SYNC_REV);
      }
    } catch(_) {}`;

if (code.includes(oldWarmCacheCheck)) {
  code = code.replace(oldWarmCacheCheck, newWarmCacheCheck);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log("Successfully updated site-scripts/home-08.js with real-time Google Sheet sync!");
