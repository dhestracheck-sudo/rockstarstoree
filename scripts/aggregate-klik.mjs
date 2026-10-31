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
const rows = await fetch(
  `${url}/rest/v1/klik?select=name&aksi=eq.klik&waktu=gte.${encodeURIComponent(since)}&limit=20000`,
  { headers },
).then((r) => {
  if (!r.ok) throw new Error("baca klik gagal: " + r.status);
  return r.json();
});

const counts = new Map();
for (const row of rows) {
  const name = String(row?.name || "").trim();
  if (name) counts.set(name, (counts.get(name) || 0) + 1);
}
const agg = [...counts.entries()].map(([name, total]) => ({ name, total }));

await fetch(`${url}/rest/v1/klik_agregat`, {
  method: "DELETE",
  headers: { ...headers, Prefer: "return=minimal" },
  body: JSON.stringify({}),
});

const res = await fetch(`${url}/rest/v1/klik_agregat`, {
  method: "POST",
  headers: { ...headers, Prefer: "return=minimal" },
  body: JSON.stringify(agg),
});
if (!res.ok) throw new Error("tulis agregat gagal: " + res.status);
console.log(`klik_agregat diperbarui: ${agg.length} produk dari ${rows.length} klik`);
