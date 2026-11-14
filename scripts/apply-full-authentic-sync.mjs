import fs from 'node:fs';
import https from 'node:https';

const SB_URL = 'https://mvzlmjgfctdxnjxveuoo.supabase.co';
const SB_KEY = 'sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth';

function sbRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SB_URL + '/rest/v1/' + path);
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(url, {
      method: method || 'GET',
      rejectUnauthorized: false,
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '[]') });
        } catch(e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('1. Loading authentic clean rows from scripts/clean_original_supabase.json...');
  const cleanRows = JSON.parse(fs.readFileSync('scripts/clean_original_supabase.json', 'utf8'));
  console.log(`   Found ${cleanRows.length} baseline rows.`);

  // Load current rows to preserve any accurate metrics
  const curRes = await sbRequest('brainrot?select=*', 'GET');
  const curMap = new Map();
  if (Array.isArray(curRes.data)) {
    curRes.data.forEach(r => curMap.set(r.name, r));
  }

  // Construct restored dataset
  const finalRows = [];

  for (const row of cleanRows) {
    const existing = curMap.get(row.name) || {};
    const isCat = row.name.startsWith('CAT:');

    let img = row.image || existing.image || '';
    if (/\.png$/i.test(img)) {
      img = img.replace(/\.png$/i, '.webp');
    }

    // Specific overrides
    if (row.name === 'CAT:MENJADI BRAINROT') {
      img = 'BECOME A BRAINROT DISPLAY.webp';
    } else if (row.name === 'BRAINROT NARAKA RANDOM LV MAX (500)') {
      img = 'BECOME BRAINROT STELLAR RANDOM LV MAX.webp';
    } else if (row.name === 'CAT:CURI HEWAN PELIHARAN DAN NAIKINYA') {
      img = 'https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1794551080964_670931_Screenshot_2026-11-13_132209.webp';
    } else if (row.name === 'GENESIS DRAGON 600QI+ (WAJIB DUNIA 2)') {
      img = 'https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1794309326645_Screenshot_2026-11-10_181432.webp';
    } else if (row.kategori === 'CURI HEWAN PELIHARAN DAN NAIKINYA' && !isCat && row.name !== 'GENESIS DRAGON 600QI+ (WAJIB DUNIA 2)') {
      // User specifically rejected the wrong $20T/s screenshots that were incorrectly assigned.
      // Revert to empty string so it cleanly displays with category banner fallback
      img = '';
    }

    // DADU ANIME Product 1 & 2 handling
    if (row.name === 'DADU ANIME - 1 UNIT ANIME 4,2 QI/S+') {
      // Add Product 1: DADU ANIME - 1 ANIME CELESTIAL RANDOM 1 QD/S+
      finalRows.push({
        urutan: 51,
        kategori: 'DADU ANIME',
        name: 'DADU ANIME - 1 ANIME CELESTIAL RANDOM 1 QD/S+',
        price: 15000,
        coret: 60000,
        deskripsi: 'MINIMAL SUDAH 1000 ROLL UNTUK MEMBUKA TRADE',
        stock: 4,
        soldout: '',
        image: 'https://drive.google.com/thumbnail?id=13DA0sPJrwpCvEOL579XoqLtzkUIsxTmt&sz=w1000',
        sold: 13,
        dilihat: 160
      });

      // Product 2: DADU ANIME - 1 UNIT ANIME 4,2 QI/S+
      finalRows.push({
        urutan: 52,
        kategori: 'DADU ANIME',
        name: 'DADU ANIME - 1 UNIT ANIME 4,2 QI/S+',
        price: 15000,
        coret: 0,
        deskripsi: 'MINIMAL SUDAH 1000 ROLL UNTUK MEMBUKA TRADE',
        stock: 5,
        soldout: '',
        image: 'https://drive.google.com/thumbnail?id=1MLf3dVNRbUvTzKHimUNY3CcdxdiASrTA&sz=w1000',
        sold: 14,
        dilihat: 48
      });
      continue;
    }

    finalRows.push({
      urutan: row.urutan,
      kategori: row.kategori,
      name: row.name,
      price: row.price || 0,
      coret: existing.coret || 0,
      deskripsi: existing.deskripsi || '',
      stock: isCat ? 0 : (existing.stock !== undefined ? existing.stock : 10),
      soldout: isCat ? 'YA' : (existing.soldout || ''),
      image: img,
      sold: existing.sold || 0,
      dilihat: existing.dilihat || 0
    });
  }

  console.log(`2. Prepared ${finalRows.length} rows for Supabase brainrot table.`);
  
  // Clear brainrot table
  console.log('3. Deleting current brainrot rows...');
  const delRes = await sbRequest('brainrot?name=neq.__never_match__', 'DELETE');
  console.log('   Delete status:', delRes.status);

  // Insert in chunks
  console.log('4. Inserting final rows...');
  const CHUNK_SIZE = 25;
  for (let i = 0; i < finalRows.length; i += CHUNK_SIZE) {
    const chunk = finalRows.slice(i, i + CHUNK_SIZE);
    const insRes = await sbRequest('brainrot', 'POST', chunk);
    console.log(`   Inserted chunk ${i + 1} - ${i + chunk.length}, status: ${insRes.status}`);
  }

  // Verify
  console.log('5. Verifying database state...');
  const verify = await sbRequest('brainrot?select=*&order=urutan.asc', 'GET');
  console.log(`   Total rows in DB: ${verify.data.length}`);
  
  const dadu = verify.data.filter(r => r.kategori === 'DADU ANIME');
  console.log('\n=== DADU ANIME IN DB (' + dadu.length + ' rows) ===');
  dadu.forEach(d => console.log(`   [${d.urutan}] ${d.name} | Rp ${d.price} (coret ${d.coret}) | stok: ${d.stock} | sold: ${d.sold} | views: ${d.dilihat} | img: ${d.image}`));

  const curi = verify.data.filter(r => r.kategori === 'CURI HEWAN PELIHARAN DAN NAIKINYA');
  console.log('\n=== CURI HEWAN IN DB (' + curi.length + ' rows) ===');
  curi.forEach(c => console.log(`   [${c.urutan}] ${c.name} | Rp ${c.price} | stok: ${c.stock} | sold: ${c.sold} | img: ${c.image}`));

  const menjadi = verify.data.filter(r => r.kategori === 'MENJADI BRAINROT');
  console.log('\n=== MENJADI BRAINROT IN DB (' + menjadi.length + ' rows) ===');
  menjadi.forEach(m => console.log(`   [${m.urutan}] ${m.name} | img: ${m.image}`));
}

run().catch(console.error);
