import https from 'node:https';

const SHEET_BASE = 'https://script.google.com/macros/s/AKfycbxFQEIeLqMYXC6tN7SG8i5Un7FDM_QgEJ7-Y78uihxjHBfC01TvyEk082nKzG5y5aip/exec';
const SB_URL = 'https://mvzlmjgfctdxnjxveuoo.supabase.co';
const SB_KEY = 'sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth';

function fetchGoogleSheet(sheetName) {
  return new Promise((resolve, reject) => {
    function get(url) {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON from sheet ' + sheetName + ': ' + data.slice(0, 100)));
          }
        });
      }).on('error', reject);
    }
    get(SHEET_BASE + '?sheet=' + sheetName);
  });
}

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

async function syncBrainrot() {
  console.log('1. Fetching Brainrot from Google Sheets...');
  const rows = await fetchGoogleSheet('Brainrot');
  console.log('   Fetched', rows.length, 'rows from Google Sheet.');
  
  const catRows = rows.filter(r => String(r.name || '').trim().startsWith('CAT:'));
  console.log('   Total categories found in Sheet:', catRows.length);
  catRows.forEach((c, idx) => console.log('   ' + (idx + 1) + '.', c.name));

  // 2. Fetch current Supabase brainrot rows
  console.log('2. Fetching Supabase brainrot table...');
  const currentSb = await sbRequest('brainrot?select=*', 'GET');
  console.log('   Current Supabase brainrot rows:', currentSb.data.length);

  // 3. Clear old Supabase brainrot table
  console.log('3. Replacing Supabase brainrot table with fresh Google Sheet data...');
  const delRes = await sbRequest('brainrot?name=neq.__never_match__', 'DELETE');
  console.log('   Delete status:', delRes.status);

  // 4. Clean rows and assign incremental urutan if missing
  const cleanRows = rows.map((r, i) => ({
    name: String(r.name || '').trim(),
    kategori: String(r.kategori || '').trim(),
    price: Number(r.price) || 0,
    coret: Number(r.coret) || 0,
    deskripsi: String(r.deskripsi || '').trim(),
    stock: Number(r.stock) || 0,
    soldout: String(r.soldout || '').trim(),
    image: String(r.image || '').trim(),
    sold: Number(r.sold) || 0,
    dilihat: Number(r.dilihat) || 0,
    urutan: Number(r.urutan) || (i + 1)
  })).filter(r => r.name.length > 0);

  // 5. Insert in chunks
  const CHUNK_SIZE = 25;
  for (let i = 0; i < cleanRows.length; i += CHUNK_SIZE) {
    const chunk = cleanRows.slice(i, i + CHUNK_SIZE);
    const insertRes = await sbRequest('brainrot', 'POST', chunk);
    console.log(`   Inserted chunk ${i + 1} - ${i + chunk.length}, status: ${insertRes.status}`);
  }

  // 6. Verify count
  const verifyRes = await sbRequest('brainrot?select=name,kategori&order=urutan', 'GET');
  const verifyCats = verifyRes.data.filter(r => r.name.startsWith('CAT:'));
  console.log('✅ Synchronized! Supabase now has', verifyRes.data.length, 'rows and', verifyCats.length, 'categories:');
  verifyCats.forEach((c, i) => console.log('   ' + (i + 1) + '.', c.name));
}

syncBrainrot().catch(console.error);
