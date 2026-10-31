// Cron harian: agregat tabel klik 30 hari terakhir ke klik_agregat.
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY (simpan di GitHub Secrets, jangan commit).
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY belum diisi");

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const rows = [];
const pageSize = 1000;
let offset = 0;
while (true) {
  const r = await fetch(
    `${url}/rest/v1/klik?select=name&aksi=eq.klik&waktu=gte.${encodeURIComponent(since)}&limit=${pageSize}&offset=${offset}`,
    { headers }
  );
  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`baca klik gagal (${r.status}): ${errText}`);
  }
  const chunk = await r.json();
  if (!Array.isArray(chunk) || chunk.length === 0) break;
  rows.push(...chunk);
  if (chunk.length < pageSize || rows.length >= 20000) break;
  offset += pageSize;
}

const counts = new Map();
for (const row of rows) {
  const name = String(row?.name || "").trim();
  if (name) counts.set(name, (counts.get(name) || 0) + 1);
}
const agg = [...counts.entries()].map(([name, total]) => ({ name, total }));

if (agg.length > 0) {
  // PostgREST DELETE requires a filter/WHERE condition to delete rows
  const delRes = await fetch(`${url}/rest/v1/klik_agregat?name=not.is.null`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!delRes.ok && delRes.status !== 404) {
    const errText = await delRes.text();
    console.warn(`Hapus agregat lama warning (${delRes.status}):`, errText);
  }

  const res = await fetch(`${url}/rest/v1/klik_agregat`, {
    method: "POST",
    headers: {
      ...headers,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(agg),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`tulis agregat gagal (${res.status}): ${errText}`);
  }
}
console.log(`klik_agregat diperbarui: ${agg.length} produk dari ${rows.length} klik`);
