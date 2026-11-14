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

async function restore() {
  console.log('1. Loading step 5031 dump (original 63 Supabase brainrot rows)...');
  const step5031Raw = fs.readFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\64f45527-cc82-41ec-a896-da5632441e3d\\.system_generated\\steps\\5031\\output.txt', 'utf8');
  const jsonStr = step5031Raw.substring(step5031Raw.indexOf('['), step5031Raw.lastIndexOf(']') + 1);
  const orig63 = JSON.parse(jsonStr);
  console.log(`   Found ${orig63.length} original rows.`);

  // Load existing rows in current brainrot table to preserve images/details of matching rows
  const curRes = await sbRequest('brainrot?select=*', 'GET');
  const curMap = new Map();
  if (Array.isArray(curRes.data)) {
    curRes.data.forEach(r => curMap.set(r.name, r));
  }

  // Price dictionary from klik table
  const priceMap = {
    'BRAINROT NARAKA RANDOM LV MAX (500)': 10000,
    '1 PET RAINBOW VOLCANIC DEVIL 3,5M/S+': 15000,
    'DAPAT 2 KANDANG ILAHI (WAJIB DUNIA 1 )': 5000,
    '1 pet random 16 qi+/s (WAJIB DUNIA 2)': 10000,
    '1 pet random 80 qi+/s (WAJIB DUNIA 2)': 15000,
    '1 pet random 200 qi+/s (WAJIB DUNIA 2)': 20000,
    '1 pet random 6 qi+/s (WAJIB DUNIA 2)': 5000,
    'GENESIS DRAGON 600QI+ (WAJIB DUNIA 2)': 50000,
    '1 pet promodal random 30 Oc+/S (PENGHASILAN TERGANTUNG REBIRTH)': 10000,
    '1 PET PRIMODAL RANDOM 100 Oc+/s(penghasilan tergantung rebirth)': 20000,
    '1 pet PRIMODIAL MANO SHARK LV MAX TIER S 2,2NO/S (PENGHASILAN TERGANTUNG REBIRTH)': 100000,
    '1 pet primodial random 50 Oc/s+ (penghasilan tergantung rebirh)': 15000,
    '1 pet primodial random 400 OC/s+(penghasilan tergantung rebirth)': 30000,
    'DADU ANIME - 1 UNIT ANIME 4,2 QI/S+': 15000
  };

  // Build restored rows
  const restoredRows = orig63.map(orig => {
    const existing = curMap.get(orig.name);
    const isCat = orig.name.startsWith('CAT:');
    if (existing) {
      return {
        name: orig.name,
        kategori: orig.kategori,
        price: existing.price || priceMap[orig.name] || 0,
        coret: existing.coret || 0,
        deskripsi: existing.deskripsi || '',
        stock: existing.stock || (isCat ? 0 : 99),
        soldout: existing.soldout || (isCat ? 'YA' : ''),
        image: existing.image || '',
        sold: existing.sold || 0,
        dilihat: existing.dilihat || 0,
        urutan: orig.urutan
      };
    }
    return {
      name: orig.name,
      kategori: orig.kategori,
      price: priceMap[orig.name] || 0,
      coret: 0,
      deskripsi: '',
      stock: isCat ? 0 : 99,
      soldout: isCat ? 'YA' : '',
      image: '',
      sold: 0,
      dilihat: 0,
      urutan: orig.urutan
    };
  });

  // Assign images for categories if missing
  const FOTO_BASE = 'https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/';
  const catImageMap = {
    'CAT:LOMPAT UNTUK MENDAPATKAN KOTAK': FOTO_BASE + 'thumb_1794587379473_439562_Screenshot_2026-11-13_232805.webp',
    'CAT:CURI HEWAN PELIHARAN DAN NAIKINYA': FOTO_BASE + 'thumb_1794587379657_598347_Screenshot_2026-11-13_232755.webp',
    'CAT:TAP UNTUK PET': FOTO_BASE + 'thumb_1794587379339_934380_Screenshot_2026-11-13_232907.webp',
    'CAT:MENJADI BRAINROT': FOTO_BASE + '1789750194877_BECOME_BRAINROT_FRAGOLA.webp'
  };

  const itemImageMap = {
    '1 pet PRIMODIAL MANO SHARK LV MAX TIER S 2,2NO/S (PENGHASILAN TERGANTUNG REBIRTH)': FOTO_BASE + 'thumb_1794587379227_568858_Screenshot_2026-11-13_232847.webp',
    '1 pet promodal random 30 Oc+/S (PENGHASILAN TERGANTUNG REBIRTH)': FOTO_BASE + 'thumb_1794587379102_972373_Screenshot_2026-11-13_232837.webp',
    '1 PET PRIMODAL RANDOM 100 Oc+/s(penghasilan tergantung rebirth)': FOTO_BASE + 'thumb_1794587379214_81384_Screenshot_2026-11-13_232818.webp',
    '1 pet primodial random 50 Oc/s+ (penghasilan tergantung rebirh)': FOTO_BASE + 'thumb_1794587379129_118389_Screenshot_2026-11-13_232812.webp',
    '1 pet primodial random 400 OC/s+(penghasilan tergantung rebirth)': FOTO_BASE + 'thumb_1794587379054_740384_Screenshot_2026-11-13_232831.webp',
    'GENESIS DRAGON 600QI+ (WAJIB DUNIA 2)': FOTO_BASE + 'thumb_1794587379657_598347_Screenshot_2026-11-13_232755.webp',
    'BRAINROT NARAKA RANDOM LV MAX (500)': FOTO_BASE + '1789750194877_BECOME_BRAINROT_FRAGOLA.webp',
    '1 PET RAINBOW VOLCANIC DEVIL 3,5M/S+': FOTO_BASE + 'thumb_1794587379339_934380_Screenshot_2026-11-13_232907.webp'
  };

  restoredRows.forEach(r => {
    if (catImageMap[r.name] && !r.image) r.image = catImageMap[r.name];
    if (itemImageMap[r.name] && !r.image) r.image = itemImageMap[r.name];
  });

  console.log('2. Deleting current brainrot rows in Supabase...');
  await sbRequest('brainrot?name=neq.__never_match__', 'DELETE');

  console.log('3. Inserting original restored rows...');
  const CHUNK_SIZE = 25;
  for (let i = 0; i < restoredRows.length; i += CHUNK_SIZE) {
    const chunk = restoredRows.slice(i, i + CHUNK_SIZE);
    const res = await sbRequest('brainrot', 'POST', chunk);
    console.log(`   Inserted chunk ${i + 1} - ${i + chunk.length}, status: ${res.status}`);
  }

  // 4. Verify count
  const verifyRes = await sbRequest('brainrot?select=name,kategori&order=urutan', 'GET');
  const verifyCats = verifyRes.data.filter(r => r.name.startsWith('CAT:'));
  console.log('✅ RESTORE COMPLETE! Supabase brainrot table now has', verifyRes.data.length, 'rows and', verifyCats.length, 'categories:');
  verifyCats.forEach((c, i) => console.log('   ' + (i + 1) + '.', c.name));
}

restore().catch(console.error);
