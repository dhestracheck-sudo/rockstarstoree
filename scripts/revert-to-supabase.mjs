import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('site-scripts/home-08.js');
let code = fs.readFileSync(filePath, 'utf8');

const regex = /function fetchSheet\(sheet, cbName\)\{[\s\S]*?return sbGet\(tbl \+ "\?select=name,kategori,price,coret,deskripsi,stock,soldout,image,sold,dilihat,urutan&order=urutan"\);\s*\}/;

const original = `function fetchSheet(sheet, cbName){
  const tbl = sbTableOf(sheet);
  // Untuk tabel info di homepage, ambil HANYA INFO_TEKS dan INFO_KURS (jangan unduh ratusan foto testimoni / state spin)
  if(tbl === "info"){
    return sbGet("info?select=name,deskripsi&name=in.(INFO_TEKS,INFO_KURS,INFO_TEKS_SPEED,INFO_CATALOG_VERSION)");
  }
  return sbGet(tbl + "?select=name,kategori,price,coret,deskripsi,stock,soldout,image,sold,dilihat,urutan&order=urutan");
}`;

code = code.replace(regex, original);
fs.writeFileSync(filePath, code, 'utf8');
console.log("Reverted fetchSheet to pure Supabase sbGet!");
