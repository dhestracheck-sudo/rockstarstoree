import { ARTICLES } from "../data/articles";

const SUPABASE_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";

const PUBLIC_CATALOGS = [
  { tab: "brainrot", table: "brainrot" },
  { tab: "topup", table: "topup" },
  { tab: "akun", table: "akun" },
  { tab: "joki", table: "joki" },
];

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]);
}

async function categoryUrls({ tab, table }) {
  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/${table}?select=name,kategori,price&order=urutan&limit=1000`;
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
    const categories = new Set(
      rows
        .filter((row) => String(row?.name || "").trim() && !String(row.name).trim().startsWith("CAT:") && Number(row?.price) > 0)
        .map((row) => String(row?.kategori || "").trim())
        .filter((category) =>
          category && category.length <= 80 && /^[\p{L}\p{N}\s.'&(),+/-]+$/u.test(category),
        )
    );
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
  const lastmod = new Date().toISOString().slice(0, 10);

  const mainPages = [
    { loc: "https://rockstarstore.id/", changefreq: "daily", priority: "1.0" },
    { loc: "https://rockstarstore.id/berita", changefreq: "daily", priority: "0.9" },
    { loc: "https://rockstarstore.id/?tab=brainrot", changefreq: "daily", priority: "0.8" },
    { loc: "https://rockstarstore.id/?tab=topup", changefreq: "daily", priority: "0.8" },
    { loc: "https://rockstarstore.id/?tab=akun", changefreq: "daily", priority: "0.8" },
    { loc: "https://rockstarstore.id/?tab=joki", changefreq: "daily", priority: "0.8" },
    { loc: "https://rockstarstore.id/faq", changefreq: "monthly", priority: "0.6" },
    { loc: "https://rockstarstore.id/spin", changefreq: "weekly", priority: "0.6" },
    { loc: "https://rockstarstore.id/llms.txt", changefreq: "weekly", priority: "0.4" },
    { loc: "https://rockstarstore.id/llms-full.txt", changefreq: "weekly", priority: "0.4" },
  ];

  const articlePages = ARTICLES.map((a) => ({
    loc: `https://rockstarstore.id/berita/${a.slug}`,
    changefreq: "weekly",
    priority: "0.8",
    lastmod: a.isoDate ? a.isoDate.slice(0, 10) : lastmod,
  }));

  const categories = (await Promise.all(PUBLIC_CATALOGS.map(categoryUrls))).flat();
  const categoryPages = Array.from(new Set(categories)).map((loc) => ({
    loc,
    changefreq: "weekly",
    priority: "0.7",
  }));

  const allUrls = [...mainPages, ...articlePages, ...categoryPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${item.lastmod || lastmod}</lastmod>
    <changefreq>${item.changefreq || "weekly"}</changefreq>
    <priority>${item.priority || "0.7"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=86400");
  res.statusCode = 200;
  res.end(xml);

  return { props: {} };
}

export default function SitemapXml() {
  return null;
}
