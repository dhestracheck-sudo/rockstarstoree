// Code.gs — Backend Google Sheet untuk rockstar3 (index.html + admin.html)
// Paste ke: Sheet Anda > Extensions > Apps Script > hapus isi > paste file ini > Save > Deploy
//
// Sheet yang dibutuhkan:
//   Tab "Brainrot", baris 1 header (urutan bebas, nama fleksibel):
//     name | kategori | price | coret | stock | soldout | image | sold
//   coret = harga coret (opsional, tampil discount bila > price)
//   File CSV siap-import: Desktop/rockstar3/data-google-sheet.csv
//
// Mendukung:
//   GET  ?callback=__stockCb  -> JSONP array [{name,kategori,price,stock,soldout,image,sold}]
//   GET  (tanpa callback)     -> JSON murni (buat cek manual)
//   POST {action:"set", item_name, col, value, sheet}      -> admin ganti nama/harga/stok
//        col: 1=name, 2=price, 3=stock (kompatibel admin lama) ATAU nama kolom ("price","stock","soldout","image","kategori","sold","name")
//   POST {action:"add", item_name, kategori, price, stock, soldout, image, sold, sheet}
//        -> tambah baris baru. Ditolak kalau name sudah ada.
//        Untuk kategori baru: item_name = "CAT:<nama>", kategori = "<nama>".
//   POST {action:"delete", item_name, sheet} -> hapus baris (produk / baris CAT:).
//        -> simpan ke Drive folder ROCKSTAR-UPLOADS, update kolom image.
//        Kalau item_name "CAT:<kategori>" belum ada, otomatis tambah baris baru (tidak tampil sebagai produk di web).
//
// Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone > Deploy
// Pakai URL /exec yang SAMA di index.html (SHEET_URL) dan admin.html (SHEET_URL).

var SHEET_DEFAULT = "Brainrot";
var DRIVE_FOLDER = "ROCKSTAR-UPLOADS";

var HEADER_ALIASES = {
  name: ["name", "nama", "nama barang", "barang", "item_name", "item", "produk"],
  kategori: ["kategori", "category", "kat", "kelompok"],
  price: ["price", "harga", "rp"],
  coret: ["coret", "harga coret", "harga awal", "harga normal", "original", "originalprice", "was"],
  stock: ["stock", "stok", "sisa"],
  soldout: ["soldout", "sold out", "habis", "sold_out"],
  image: ["image", "gambar", "foto", "img", "link", "url", "file"],
  sold: ["sold", "terjual", "laku"]
};

function norm_(s) { return String((s === undefined || s === null) ? "" : s).trim().toLowerCase(); }

function canonKey_(header) {
  var h = norm_(header);
  for (var k in HEADER_ALIASES) {
    if (HEADER_ALIASES[k].indexOf(h) !== -1) return k;
  }
  return null;
}

function getSheet_(name, create) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = name ? ss.getSheetByName(name) : null;
  if (!sh && create && name) sh = ss.insertSheet(String(name).slice(0, 100));
  if (!sh) sh = ss.getSheetByName(SHEET_DEFAULT);
  if (!sh) sh = ss.getSheets()[0];
  return sh;
}

function readTable_() {
  var p = (typeof arguments[0] === "string") ? { sheet: arguments[0] } : (arguments[0] || {});
  var sh = getSheet_(p.sheet, true);
  var vals = sh.getDataRange().getValues();
  if (!vals.length) return { sheet: sh, headers: [], idx: {}, rows: [] };
  var headers = vals[0];
  var idx = {};
  for (var c = 0; c < headers.length; c++) {
    var k = canonKey_(headers[c]);
    if (k && !(k in idx)) idx[k] = c;
  }
  // pastikan kolom kanonis ada; kalau belum, tambah di kanan
  var need = ["name", "kategori", "price", "coret", "stock", "soldout", "image", "sold"];
  var changed = false;
  need.forEach(function (k) {
    if (!(k in idx)) {
      headers.push(k);
      idx[k] = headers.length - 1;
      changed = true;
    }
  });
  if (changed) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  return { sheet: sh, headers: headers, idx: idx, rows: vals };
}

function toObj_(row, idx) {
  function g(k, d) { return (k in idx && idx[k] < row.length) ? row[idx[k]] : d; }
  return {
    name: String(g("name", "")),
    kategori: String(g("kategori", "")),
    price: Number(g("price", 0)) || 0,
    coret: Number(g("coret", 0)) || 0,
    stock: Number(g("stock", 0)) || 0,
    soldout: String(g("soldout", "")),
    image: String(g("image", "")),
    sold: Number(g("sold", 0)) || 0
  };
}

// ---------- GET ----------
function doGet(e) {
  e = e || {};
  var p = e.parameter || {};
  var t = readTable_(p.sheet || SHEET_DEFAULT);
  var out = [];
  for (var r = 1; r < t.rows.length; r++) {
    var o = toObj_(t.rows[r], t.idx);
    if (!String(o.name).trim()) continue;
    out.push(o);
  }
  var json = JSON.stringify(out);
  if (p.callback) {
    return ContentService.createTextOutput(p.callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- POST ----------
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
    else if (e && e.parameter) body = e.parameter;
    var action = norm_(body.action);
    if (action === "set") return jsonOut_(actionSet_(body));
    if (action === "add") return jsonOut_(actionAdd_(body));
    if (action === "delete") return jsonOut_(actionDelete_(body));
    if (action === "delmany") return jsonOut_(actionDelMany_(body));
    if (action === "upload") return jsonOut_(actionUpload_(body));
    return jsonOut_({ result: "error: unknown action (pakai set / add / delete / delmany / upload). Kalau dapat ini, Deploy ulang Code.gs versi terbaru." });
  } catch (err) {
    return jsonOut_({ result: "error: " + String(err && err.message || err) });
  }
}

function jsonOut_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function resolveCol_(body, idx, headers) {
  var col = body.col;
  // kompatibel admin lama: 1=name, 2=price, 3=stock
  if (col === 1 || col === "1") return idx["name"];
  if (col === 2 || col === "2") return idx["price"];
  if (col === 3 || col === "3") return idx["stock"];
  var k = canonKey_(col);
  if (k && (k in idx)) return idx[k];
  var n = Number(col);
  if (isFinite(n) && n >= 1 && n <= headers.length) return n - 1;
  return -1;
}

function findRow_(t, itemName) {
  var ni = t.idx["name"];
  var target = String(itemName).trim();
  for (var r = 1; r < t.rows.length; r++) {
    if (String(t.rows[r][ni]).trim() === target) return r; // 0-based index baris
  }
  return -1;
}

function actionSet_(body) {
  var name = String(body.item_name || body.name || "").trim();
  if (!name) return { result: "error: item_name kosong" };
  var t = readTable_(body.sheet || SHEET_DEFAULT);
  var ci = resolveCol_(body, t.idx, t.headers);
  if (ci < 0) return { result: "error: kolom tidak dikenal: " + body.col };
  var r = findRow_(t, name);
  if (r < 0) return { result: "error: barang tidak ketemu: " + name };
  t.sheet.getRange(r + 1, ci + 1).setValue(body.value);
  return { result: "success" };
}

function actionAdd_(body) {
  var name = String(body.item_name || body.name || "").trim();
  if (!name) return { result: "error: item_name kosong" };
  var t = readTable_(body.sheet || SHEET_DEFAULT);
  if (findRow_(t, name) >= 0) return { result: "error: sudah ada: " + name };
  var kat = String(body.kategori || "").trim();
  if (!kat && name.indexOf("CAT:") === 0) kat = name.slice(4).trim();
  if (!kat) kat = "Lainnya";
  var row = [];
  for (var c = 0; c < t.headers.length; c++) row.push("");
  row[t.idx["name"]] = name;
  row[t.idx["kategori"]] = kat;
  row[t.idx["price"]] = Number(body.price) || 0;
  row[t.idx["coret"]] = Number(body.coret) || 0;
  row[t.idx["stock"]] = Number(body.stock) || 0;
  row[t.idx["soldout"]] = String(body.soldout || (name.indexOf("CAT:") === 0 ? "YA" : ""));
  row[t.idx["image"]] = String(body.image || "");
  row[t.idx["sold"]] = Number(body.sold) || 0;
  t.sheet.appendRow(row);
  return { result: "success" };
}

function actionDelMany_(body) {
  var names = body.names || body.items;
  if (!names || !names.length || typeof names.length !== "number") return { result: "error: names kosong" };
  var t = readTable_(body.sheet || SHEET_DEFAULT);
  var ni = t.idx["name"];
  var W = t.headers.length;
  var targets = {};
  for (var i = 0; i < names.length; i++) targets[String(names[i]).trim()] = true;
  var kept = [];
  var dropped = 0;
  for (var r = 0; r < t.rows.length; r++) {
    var row = t.rows[r].slice();
    while (row.length < W) row.push("");
    if (r > 0 && targets[String(row[ni]).trim()]) { dropped++; continue; }
    kept.push(row.slice(0, W));
  }
  // tulis ulang sekaligus (jauh lebih cepat daripada deleteRow satu-satu)
  t.sheet.clearContents();
  t.sheet.getRange(1, 1, kept.length, W).setValues(kept);
  return { result: "success", deleted: dropped, total: names.length };
}

function actionDelete_(body) {
  var name = String(body.item_name || body.name || "").trim();
  if (!name) return { result: "error: item_name kosong" };
  var t = readTable_(body.sheet || SHEET_DEFAULT);
  var r = findRow_(t, name);
  if (r < 0) return { result: "error: tidak ketemu: " + name };
  t.sheet.deleteRow(r + 1);
  return { result: "success" };
}

function getFolder_() {
  var it = DriveApp.getFoldersByName(DRIVE_FOLDER);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(DRIVE_FOLDER);
}

function actionUpload_(body) {
  var name = String(body.item_name || "").trim();
  if (!name) return { result: "error: item_name kosong" };
  if (!body.file) return { result: "error: file kosong" };
  var blob = Utilities.newBlob(Utilities.base64Decode(body.file), body.mime || "image/jpeg", body.filename || (name + ".jpg"));
  var folder = getFolder_();
  var file = folder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  var id = file.getId();
  var url = "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000";

  var t = readTable_(body.sheet || SHEET_DEFAULT);
  var r = findRow_(t, name);
  var ii = t.idx["image"];
  if (r >= 0) {
    t.sheet.getRange(r + 1, ii + 1).setValue(url);
  } else {
    // tambah baris baru. CAT:* = foto kategori (disembunyikan dari produk oleh web).
    var kat = String(body.kategori || "").trim();
    if (!kat && name.indexOf("CAT:") === 0) kat = name.slice(4).trim();
    if (!kat) kat = "Lainnya";
    var row = [];
    for (var c = 0; c < t.headers.length; c++) row.push("");
    row[t.idx["name"]] = name;
    row[t.idx["kategori"]] = kat;
    row[t.idx["price"]] = 0;
    row[t.idx["stock"]] = 0;
    row[t.idx["soldout"]] = name.indexOf("CAT:") === 0 ? "YA" : "";
    row[t.idx["image"]] = url;
    row[t.idx["sold"]] = 0;
    t.sheet.appendRow(row);
  }
  return { result: "success", url: url, id: id };
}

// Test manual dari editor: Run testRead lalu lihat View > Logs
function testRead() {
  var t = readTable_(SHEET_DEFAULT);
  Logger.log("headers=" + JSON.stringify(t.headers));
  Logger.log("rows=" + (t.rows.length - 1));
}
