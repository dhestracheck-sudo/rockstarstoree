const SUPABASE_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";
const PUBLIC_CATALOGS = [
  { tab: "brainrot", table: "brainrot" },
  { tab: "topup", table: "topup" },
  { tab: "akun", table: "akun" },
  { tab: "joki", table: "joki" },
];

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]);
}

function categoryFromRow(row) {
  const name = String(row.name || "").trim();
  if (name.startsWith("CAT:")) return String(row.kategori || name.slice(4)).trim();
  return String(row.kategori || "Lainnya").trim();
}

async function categoryUrls({ tab, table }) {
  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/${table}?select=name,kategori&order=urutan&limit=1000`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!response.ok) return [];

    const rows = await response.json();
    if (!Array.isArray(rows)) return [];
    const categories = new Set(rows.map(categoryFromRow).filter((category) =>
      category && category.length <= 80 && /^[\p{L}\p{N}\s.'&(),+/-]+$/u.test(category),
    ));
    return Array.from(categories, (category) => {
      const url = new URL("https://rockstarstore.id/");
      url.searchParams.set("tab", tab);
      url.searchParams.set("cat", category);
      return url.href;
    });
  } catch {
    return [];
  }
}

export async function getServerSideProps({ res }) {
  const pages = [
    "https://rockstarstore.id/",
    "https://rockstarstore.id/?tab=brainrot",
    "https://rockstarstore.id/?tab=topup",
    "https://rockstarstore.id/?tab=akun",
    "https://rockstarstore.id/?tab=joki",
    "https://rockstarstore.id/faq",
  ];
  const categories = (await Promise.all(PUBLIC_CATALOGS.map(categoryUrls))).flat();
  const urls = Array.from(new Set([...pages, ...categories]));
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join("\n")}\n</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=86400");
  res.statusCode = 200;
  res.end(xml);

  return { props: {} };
}

export default function SitemapXml() {
  return null;
}
