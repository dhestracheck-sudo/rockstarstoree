import Head from 'next/head';
import PageScripts from '../components/PageScripts';
import MegaSlider from '../components/MegaSlider';
import PaymentMethods from '../components/PaymentMethods';
import SiteFooter from '../components/SiteFooter';

const pageScripts = ["/site-scripts/home-02.js?v=perf-20261026", "/site-scripts/home-03.js?v=perf-20261026", "/site-scripts/home-04.js", "/site-scripts/home-05.js?v=perf-20261026", "/site-scripts/home-06.js", "/site-scripts/home-07.js", "/site-scripts/home-08.js?v=seo-hot-20261026-2"];

const SEO_PAGES = {
  home: {
    title: "Rockstar.Store | Top Up Robux, Akun & Brainrot Roblox",
    description: "Top up Robux, akun Roblox, item Brainrot, dan jasa joki tersedia di Rockstar.Store. Lihat pilihan produk, harga, dan cara pemesanan.",
  },
  brainrot: {
    title: "Item Brainrot Roblox | Rockstar.Store",
    description: "Jelajahi item Brainrot Roblox dari berbagai map. Lihat kategori, detail produk, dan harga di katalog Rockstar.Store.",
  },
  topup: {
    title: "Top Up Robux Roblox | Rockstar.Store",
    description: "Pilih paket top up Robux Roblox di Rockstar.Store. Cek pilihan nominal, metode pembayaran, dan cara pemesanan.",
  },
  akun: {
    title: "Akun Roblox Sepuh | Rockstar.Store",
    description: "Cari akun Roblox sepuh untuk berbagai map di Rockstar.Store. Lihat detail akun, harga, dan ketersediaannya sebelum memesan.",
  },
  joki: {
    title: "Jasa Joki Roblox Aman & Cepat | Rockstar.Store",
    description: "Cari jasa joki Roblox untuk map favoritmu. Lihat pilihan layanan, harga, dan cara pemesanan di Rockstar.Store.",
  },
};

const PUBLIC_SUPABASE_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const PUBLIC_SUPABASE_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";
const HOT_PRODUCT_TABLES = ["brainrot", "akun", "topup", "joki"];

function getProductImageVariant(image, prefix) {
  try {
    const url = new URL(image);
    const objectPrefix = "/storage/v1/object/public/foto/";
    if (url.origin !== PUBLIC_SUPABASE_URL || !url.pathname.startsWith(objectPrefix)) return image;
    const objectPath = url.pathname.slice(objectPrefix.length);
    const slash = objectPath.lastIndexOf("/");
    const directory = slash < 0 ? "" : objectPath.slice(0, slash + 1);
    const filename = objectPath.slice(slash + 1).replace(/^(?:thumb_|tiny_)/, "");
    url.pathname = `${objectPrefix}${directory}${prefix}_${filename}`;
    return url.toString();
  } catch {
    return image;
  }
}

async function getInitialHotProducts() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const headers = {
    apikey: PUBLIC_SUPABASE_KEY,
    Authorization: `Bearer ${PUBLIC_SUPABASE_KEY}`,
  };
  const request = async (path) => {
    try {
      const response = await fetch(`${PUBLIC_SUPABASE_URL}/rest/v1/${path}`, {
        headers,
        signal: AbortSignal.timeout(1800),
        cache: "no-store",
      });
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  };

  const [clickRows, ...catalogRows] = await Promise.all([
    request(`klik?select=name&aksi=eq.klik&order=waktu.desc&limit=2000&waktu=gte.${encodeURIComponent(since)}`),
    ...HOT_PRODUCT_TABLES.map((table) =>
      request(`${table}?select=name,price,image,sold,dilihat&order=urutan&limit=1000`),
    ),
  ]);

  const clicks = new Map();
  for (const row of Array.isArray(clickRows) ? clickRows : []) {
    const name = String(row?.name || "").trim();
    if (name) clicks.set(name, (clicks.get(name) || 0) + 1);
  }

  const products = [];
  const seenProducts = new Set();
  for (const rows of catalogRows) {
    for (const row of Array.isArray(rows) ? rows : []) {
      const name = String(row?.name || "").trim();
      const price = Number(row?.price) || 0;
      if (!name || name.startsWith("CAT:") || price <= 0 || seenProducts.has(name)) continue;
      seenProducts.add(name);
      const rawImage = String(row?.image || "").split("|")[0].trim();
      const image = rawImage
        ? (/^https?:\/\//i.test(rawImage)
          ? rawImage.replace(/^http:/i, "https:")
          : rawImage.startsWith("/") ? rawImage : `/${rawImage}`)
        : "/ROCKSTARLOGO.webp";
      products.push({
        name,
        price,
        image,
        thumbnail: getProductImageVariant(image, "tiny"),
        fallbackThumbnail: getProductImageVariant(image, "thumb"),
        clicks: clicks.get(name) || 0,
        views: Number(row?.dilihat) || 0,
        sold: Number(row?.sold) || 0,
      });
    }
  }

  return products
    .sort((a, b) => b.clicks - a.clicks || b.views - a.views || b.sold - a.sold)
    .slice(0, 8);
}

const storeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://rockstarstore.id/#website",
      url: "https://rockstarstore.id/",
      name: "Rockstar.Store",
      inLanguage: "id-ID",
      publisher: { "@id": "https://rockstarstore.id/#store" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://rockstarstore.id/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "OnlineStore",
      "@id": "https://rockstarstore.id/#store",
      name: "Rockstar.Store",
      url: "https://rockstarstore.id/",
      logo: "https://rockstarstore.id/ROCKSTARLOGO.png",
      image: "https://rockstarstore.id/ROCKSTARLOGO.png",
      description: "Top up Robux, item Brainrot, akun Roblox, dan jasa joki di Rockstar.Store.",
      sameAs: [
        "https://www.tiktok.com/@rockstarstoree",
        "https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+62-896-6429-9571",
        contactType: "customer service",
        availableLanguage: ["Indonesian", "English"],
      },
    },
  ],
};

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getHomeSeo(query = {}) {
  const requestedTab = String(firstQueryValue(query.tab) || "home").trim().toLowerCase();
  const tab = Object.prototype.hasOwnProperty.call(SEO_PAGES, requestedTab) ? requestedTab : "home";
  const rawCategory = String(firstQueryValue(query.cat) || "")
    .replace(/[<>\u0000-\u001f]/g, "")
    .trim()
    .slice(0, 80);
  const category = tab !== "home" && /^[\p{L}\p{N}\s.'&(),+/-]+$/u.test(rawCategory) ? rawCategory : "";
  const isSearchPage = Boolean(String(firstQueryValue(query.q) || "").trim());
  const page = SEO_PAGES[tab];
  const title = category ? `${category} | Rockstar.Store` : page.title;
  const description = category
    ? `Jelajahi ${category} di Rockstar.Store. Lihat detail produk, harga, dan ketersediaannya sebelum memesan.`
    : page.description;
  const canonicalParams = new URLSearchParams();

  if (!isSearchPage && tab !== "home") {
    canonicalParams.set("tab", tab);
    if (category) canonicalParams.set("cat", category);
  }

  const canonicalQuery = canonicalParams.toString();
  const canonical = `https://rockstarstore.id/${canonicalQuery ? `?${canonicalQuery}` : ""}`;
  const robots = isSearchPage ? "noindex,follow" : "index,follow";
  const webPageJsonLd = isSearchPage ? null : {
    "@type": "WebPage",
    "@id": canonical,
    url: canonical,
    name: title,
    description,
    inLanguage: "id-ID",
    isPartOf: { "@id": "https://rockstarstore.id/#website" },
  };

  return { title, description, canonical, robots, webPageJsonLd };
}

export async function getServerSideProps(context) {
  const hotProducts = context.query.q ? [] : await getInitialHotProducts();
  if (!context.query.q) {
    context.res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
  }
  return {
    props: {
      ssrGeneratedAt: new Date().toISOString(),
      seo: getHomeSeo(context.query),
      hotProducts,
    },
  };
}

export default function HomePage({ ssrGeneratedAt, seo, hotProducts }) {
  return (
    <>
      <Head>
        {"\r\n"}
        <meta charSet="UTF-8" />
        {"\r\n"}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {"\r\n"}
        <link rel="preconnect" href="https://mvzlmjgfctdxnjxveuoo.supabase.co" />
        <link rel="preload" as="image" href="/optimized/bg.webp" fetchPriority="high" />
        {"\r\n"}
        <title>{seo.title}</title>
        {"\r\n"}
        <meta name="description" content={seo.description} />
        <meta name="rs:ssr-rendered-at" content={ssrGeneratedAt} />
        <meta name="msvalidate.01" content="4B61D406BBA1A97F3C7318F6B74D91A5" />
        {"\r\n"}
        <meta name="robots" content={seo.robots} />
        {"\r\n"}
        <meta name="theme-color" content="#060913" />
        {"\r\n"}
        <meta name="mobile-web-app-capable" content="yes" />
        {"\r\n"}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {"\r\n"}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {"\r\n"}
        <meta name="apple-mobile-web-app-title" content="Rockstar" />
        {"\r\n"}
        <link rel="manifest" href="manifest.json" />
        {"\r\n"}
        <link rel="canonical" href={seo.canonical} />
        {"\r\n"}
        <link rel="alternate" hrefLang="id" href={seo.canonical} />
        {"\r\n"}
        <link rel="alternate" hrefLang="x-default" href={seo.canonical} />
        {"\r\n"}
        <meta property="og:type" content="website" />
        {"\r\n"}
        <meta property="og:site_name" content="Rockstar.Store" />
        {"\r\n"}
        <meta property="og:locale" content="id_ID" />
        {"\r\n"}
        <meta property="og:title" content={seo.title} />
        {"\r\n"}
        <meta property="og:description" content={seo.description} />
        {"\r\n"}
        <meta property="og:url" content={seo.canonical} />
        {"\r\n"}
        <meta property="og:image" content="https://rockstarstore.id/ROCKSTARLOGO.png" />
        {"\r\n"}
        <meta property="og:image:alt" content="Logo Rockstar.Store" />
        {"\r\n"}
        <meta name="twitter:card" content="summary_large_image" />
        {"\r\n"}
        <meta name="twitter:title" content={seo.title} />
        {"\r\n"}
        <meta name="twitter:description" content={seo.description} />
        {"\r\n"}
        <meta name="twitter:image" content="https://rockstarstore.id/ROCKSTARLOGO.png" />
        {"\r\n"}
        <link rel="icon" type="image/png" href="/ROCKSTARICON.png" sizes="192x192" />
        {"\r\n"}
        <link rel="apple-touch-icon" href="/ROCKSTARICON.png" />
        {"\r\n\r\n"}
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...storeJsonLd, "@graph": [...storeJsonLd["@graph"], ...(seo.webPageJsonLd ? [seo.webPageJsonLd] : [])] }).replace(/</g, String.fromCharCode(92) + "u003c") }} />
        {"\r\n\r\n"}
        {"\r\n\r\n"}
        {"\r\n"}
        {"\r\n"}
        {"\r\n\r\n"}
        {"\r\n"}
        {"\r\n"}
        <noscript dangerouslySetInnerHTML={{ __html: "" }} />
        {"\r\n\r\n"}
        {"\r\n"}
        {"\r\n\r\n"}
        {"\r\n"}
        {"\r\n\r\n"}
        {"\r\n\r\n"}
        <style dangerouslySetInnerHTML={{ __html: "\r\n:root {\r\n  --bg: #060913;\r\n  --bg2: #0b1120;\r\n  --card: #0e1628;\r\n  --line: rgba(120,150,255,0.14);\r\n  --txt: #f2f5ff;\r\n  --mut: #8b96b3;\r\n  --blue: #2b4eff;\r\n  --blue2: #6f8bff;\r\n  --wa: #25d366;\r\n  --red: #ff5d5d;\r\n  --green: #2ecc71;\r\n  --r: 18px;\r\n}\r\n* { box-sizing: border-box; }\r\nhtml { scroll-behavior: auto; overflow-anchor: none; }\r\nbody {\r\n  margin: 0;\r\n  font-family: var(--font-poppins), sans-serif;\r\n  background-color: var(--bg);\r\n  color: var(--txt);\r\n  min-height: 100vh;\r\n  padding-bottom: calc(96px + env(safe-area-inset-bottom));\r\n}\r\nbody::before {\r\n  content: \"\";\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: -1;\r\n  background:\r\n    linear-gradient(rgba(6,9,19,0.78), rgba(6,9,19,0.86)),\r\n    radial-gradient(900px 320px at 85% -60px, rgba(43,78,255,0.22), transparent 60%),\r\n    radial-gradient(700px 300px at 5% 0%, rgba(43,78,255,0.12), transparent 60%),\r\n    url(\"/optimized/bg.webp\") center top / cover no-repeat,\r\n    var(--bg);\r\n  pointer-events: none;\r\n}\r\n\r\n/* ===== loading screen ===== */\r\n#loader { position: fixed; inset: 0; z-index: 999; background: var(--bg); display: flex; flex-direction: column; gap: 18px; align-items: center; justify-content: center; transition: opacity 0.4s ease; }\r\n#loader.hide { opacity: 0; pointer-events: none; }\r\n#loader img { width: 110px; border-radius: 18px; }\r\n#loader .spin { width: 44px; height: 44px; border-radius: 50%; border: 4px solid var(--line); border-top-color: var(--blue2); animation: spin 0.9s linear infinite; }\r\n/* ===== rating & bar stok ===== */\r\n.stars { color: #ffd166; font-size: 13px; letter-spacing: 1px; }\r\n.stockbar { height: 8px; background: #1a2440; border-radius: 99px; overflow: hidden; margin-top: 6px; }\r\n.stockbar i { display: block; height: 100%; background: linear-gradient(90deg, var(--green), #7CFC00); border-radius: 99px; }\r\n.stocktxt { font-size: 14px; color: var(--txt); font-weight: 600; margin-top: 4px; }\r\n.stocklow { font-size: 14px; color: #ff8080; font-weight: 700; margin-top: 4px; }\r\n/* Produk tampil seperti halaman Akun: garis bar hijau, bintang & teks ✅/📦 disembunyikan.\r\n   Info stok/terjual tetap ada di baris meta + modal detail. */\r\n.stars, .stockbar, .stocktxt { display: none; }\r\n\r\n/* ===== announcement bar + header menempel (tanpa renggang) ===== */\r\n.topwrap {\r\n  position: sticky;\r\n  top: 0;\r\n  z-index: 101;\r\n}\r\n.announce {\r\n  background: linear-gradient(90deg, #12225e, var(--blue), #12225e);\r\n  color: #fff;\r\n  font-size: 14px;\r\n  font-weight: 600;\r\n  padding: 9px 14px;\r\n  letter-spacing: 0.2px;\r\n  overflow: hidden;\r\n  white-space: nowrap;\r\n  text-align: center;\r\n  text-overflow: ellipsis;\r\n}\r\n.announce a { color: #fff; font-weight: 700; text-decoration: underline; display: inline-block; padding: 12px 4px; margin: -12px 0; }\r\n.announce .run { display: inline-block; padding-left: 100%; animation: run 18s linear infinite; }\r\n.announce .customrun { display: block; white-space: nowrap; overflow: hidden; color: #fff; font-weight: 700; border-top: 1px solid rgba(255,255,255,0.15); }\r\n.announce .customrun > span { display: inline-block; padding-left: 100%; animation: run 22s linear infinite; }\r\n@keyframes run { to { transform: translateX(-100%); } }\r\n\r\n/* ===== header (gaya exstore: HP = logo + ☰, desktop = nav + cari + ikon) ===== */\r\nheader {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  gap: 10px;\r\n  height: auto;\r\n  padding: 9px 14px 12px;\r\n  background: rgba(0,4,40,0.8);\r\n  backdrop-filter: blur(14px);\r\n  border-bottom: 1px solid rgba(255,255,255,0.09);\r\n}\r\n.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; letter-spacing: 0.4px; white-space: nowrap; cursor: pointer; text-decoration: none; color: inherit; }\r\n.brand img { height: 34px; border-radius: 9px; }\r\n@media (prefers-reduced-motion: no-preference) {\r\n  .brand img { animation: logoFloat 2.4s ease-in-out infinite; filter: drop-shadow(0 0 4px rgba(66,105,255,.35)); }\r\n  @keyframes logoFloat {\r\n    0%,100% { transform: translateY(0) rotate(0) scale(1); }\r\n    50% { transform: translateY(-4px) rotate(-4deg) scale(1.05); }\r\n  }\r\n  .brandshine { color: #fff; }\r\n  .brl { display: inline-block; opacity: 0; animation: letterIn 0.45s ease forwards; }\r\n  @keyframes letterIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }\r\n}\r\n.brl { display: inline-block; }\r\n.headnav { display: none; align-items: center; gap: 2px; min-width: 0; }\r\n.headnav a { display: inline-flex; align-items: center; gap: 6px; color: var(--mut); font-size: 13.5px; font-weight: 600; padding: 9px 11px; border-radius: 10px; cursor: pointer; text-decoration: none; white-space: nowrap; transition: color .15s, background .15s; }\r\n.headnav a:hover { color: var(--txt); background: rgba(255,255,255,0.07); }\r\n.headicons { margin-left: auto; display: flex; align-items: center; gap: 8px; }\r\n.headicons .cartbtn { display: none; }\r\n.burger { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; flex-shrink: 0; border-radius: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.14); color: #fff; font-size: 16px; cursor: pointer; box-shadow: none; }\r\n.burger:active { transform: scale(0.94); }\r\n@media (min-width: 761px) {\r\n  header { gap: 14px; padding: 0 24px; flex-wrap: nowrap; height: 59px; }\r\n  header .searchwrap { display: flex; flex: 1; justify-content: center; order: 0; width: auto; }\r\n}\r\n@media (min-width: 901px) {\r\n  .headnav { display: flex; }\r\n  .headicons .cartbtn { display: flex; }\r\n  .burger { display: none; }\r\n}\r\n.searchwrap { display: flex; flex: 1; min-width: 0; justify-content: center; position: relative; }\r\n#searchInput {\r\n  width: min(420px, 100%);\r\n  padding: 10px 18px 10px 40px;\r\n  border-radius: 999px;\r\n  border: 1px solid var(--line);\r\n  background: var(--bg2) url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"%238b96b3\"><path d=\"M11.7 10.3l3.5 3.5-1.4 1.4-3.5-3.5A6 6 0 1 1 11.7 10.3zm-5.7.7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z\"/></svg>') 14px center no-repeat;\r\n  color: var(--txt);\r\n  font-family: var(--font-poppins), sans-serif;\r\n  font-size: 16px;\r\n  outline: none;\r\n}\r\n#searchInput:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(43,78,255,0.25); }\r\n/* ===== saran cari otomatis (tanpa scroll/Enter) ===== */\r\n.searchwrap { position: relative; }\r\n#searchSug {\r\n  position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%);\r\n  width: min(420px, calc(100vw - 28px)); background: var(--bg2); border: 1px solid var(--blue);\r\n  border-radius: 14px; overflow: hidden; z-index: 150; box-shadow: 0 18px 44px rgba(0,0,0,0.6);\r\n  max-height: 60vh; overflow-y: auto;\r\n}\r\n#searchSug .sug { display: flex; gap: 10px; align-items: center; padding: 9px 12px; cursor: pointer; border-bottom: 1px solid var(--line); }\r\n#searchSug .sug:last-child { border-bottom: none; }\r\n#searchSug .sug:hover { background: rgba(43,78,255,0.15); }\r\n#searchSug img { width: 44px; height: 44px; object-fit: cover; border-radius: 8px; flex-shrink: 0; background: #05080f; }\r\n#searchSug .sug b { display: block; font-size: 13.5px; }\r\n#searchSug .sug span { font-size: 12.5px; color: var(--mut); }\r\n#searchSug .sug .pr { margin-left: auto; font-weight: 700; color: #f3d27a; font-size: 13.5px; white-space: nowrap; }\r\n/* ===== bar install aplikasi ===== */\r\n#pwaBar {\r\n  position: fixed; left: 50%; transform: translateX(-50%); bottom: 92px; z-index: 95;\r\n  display: none; align-items: center; gap: 10px; max-width: 92vw;\r\n  background: var(--bg2); border: 1px solid var(--blue); border-radius: 999px;\r\n  padding: 10px 12px 10px 18px; font-size: 13.5px; box-shadow: 0 14px 40px rgba(0,0,0,0.6);\r\n}\r\n#pwaBar.show { display: flex; }\r\n#pwaBar button.go { background: var(--blue); color: #fff; border: none; border-radius: 999px; padding: 9px 16px; font-weight: 700; font-family: var(--font-poppins), sans-serif; cursor: pointer; white-space: nowrap; }\r\n#pwaBar button.x { background: transparent; border: none; color: var(--mut); font-size: 16px; cursor: pointer; }\r\n.cartbtn {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  background: var(--blue);\r\n  color: #fff;\r\n  border: none;\r\n  border-radius: 999px;\r\n  padding: 10px 18px;\r\n  font-family: var(--font-poppins), sans-serif;\r\n  font-weight: 700;\r\n  font-size: 14px;\r\n  cursor: pointer;\r\n  white-space: nowrap;\r\n  box-shadow: 0 6px 20px rgba(43,78,255,0.4);\r\n}\r\n/* Shortcut Flash Sale di header (background merah) — di HP tombol melebar mengisi ruang kosong samping Keranjang */\r\n.flashbtn {\r\n  background: linear-gradient(135deg, #ff3355, #d6122f);\r\n  box-shadow: 0 6px 20px rgba(224,19,54,0.45);\r\n}\r\n.flashbtn:hover { filter: brightness(1.1); }\r\n@media (max-width: 760px) { .flashbtn { flex: 1; justify-content: center; } }\r\n.cartbtn small {\r\n  background: #fff;\r\n  color: var(--blue);\r\n  border-radius: 999px;\r\n  min-width: 22px;\r\n  height: 22px;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: 12px;\r\n  padding: 0 5px;\r\n}\r\n\r\n/* ===== panel menu HP (geser saat tombol ☰ diklik — gaya exstore) ===== */\r\n.mpanel {\r\n  position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99;\r\n  display: none; flex-direction: column; gap: 9px;\r\n  padding: 104px 14px calc(110px + env(safe-area-inset-bottom));\r\n  background: rgba(4,7,20,0.97); backdrop-filter: blur(18px);\r\n  overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;\r\n}\r\n.mpanel.open { display: flex; }\r\n.mpanel .mlink {\r\n  display: flex; align-items: center; gap: 12px; width: 100%;\r\n  padding: 14px 16px; border-radius: 14px;\r\n  background: rgba(255,255,255,0.05); border: 1px solid var(--line);\r\n  color: var(--txt); font-family: var(--font-poppins), sans-serif;\r\n  font-weight: 600; font-size: 14.5px; text-align: left; cursor: pointer;\r\n  box-shadow: none; transition: background .15s, transform .1s;\r\n}\r\n.mpanel .mlink:active { transform: scale(0.98); background: rgba(43,78,255,0.18); }\r\n.mpanel .mlink .lico { font-size: 20px; width: 26px; text-align: center; flex-shrink: 0; }\r\n.mpanel .mnrow { display: flex; gap: 9px; }\r\n.mpanel .mnrow .cartbtn { flex: 1; justify-content: center; }\r\n#mnavSearchSlot { display: flex; }\r\n#mnavSearchSlot .searchwrap { display: flex; width: 100%; position: relative; }\r\n#mnavSearchSlot #searchInput { width: 100%; }\r\n.mpanel .mnote {\r\n  display: block; width: 100%;\r\n  font-family: var(--font-poppins), sans-serif; font-weight: 600;\r\n  font-size: 13.5px; color: var(--txt); text-align: center;\r\n  margin-top: 12px; padding: 12px 10px;\r\n  background: rgba(43,78,255,0.16);\r\n  border: 1px solid rgba(66,105,255,0.5);\r\n  border-radius: 14px; cursor: pointer;\r\n  transition: transform .15s ease, box-shadow .15s ease, background .15s ease;\r\n}\r\n.mpanel .mnote:hover, .mpanel .mnote:focus-visible { background: rgba(43,78,255,0.3); box-shadow: 0 0 18px rgba(43,78,255,0.4); outline: none; }\r\n.mpanel .mnote:active { transform: scale(0.96); }\r\n.mpanel .mnote b { color: #6f8bff; }\r\n@media (min-width: 901px) { .mpanel { display: none !important; } }\r\n\r\n/* ===== mega banner slider (EXSTORE style) ===== */\r\n.mega { position: relative; max-width: 1200px; margin: 18px auto 0; padding: 0 28px; }\r\n.mega-track { position: relative; overflow: hidden; border-radius: 22px; border: 1px solid rgba(111,139,255,.35); box-shadow: 0 24px 70px rgba(0,0,0,.55), 0 0 40px rgba(43,78,255,.22); }\r\n.mega-slide { display: none; position: relative; height: 380px; padding: 20px 30px 40px; text-align: center; overflow: hidden;\r\n  background: radial-gradient(700px 320px at 70% 10%, rgba(43,120,255,.35), transparent 60%), radial-gradient(500px 300px at 15% 90%, rgba(0,220,255,.18), transparent 60%), linear-gradient(115deg, #05091a 0%, #0a1440 45%, #0b2f7a 70%, #05091a 100%); }\r\n.mega-slide.s2 { background: radial-gradient(700px 320px at 70% 10%, rgba(150,80,255,.35), transparent 60%), radial-gradient(500px 300px at 15% 90%, rgba(255,80,200,.15), transparent 60%), linear-gradient(115deg, #0d0618 0%, #1c0f45 45%, #3b1470 70%, #0d0618 100%); }\r\n.mega-slide.s3 { background: radial-gradient(700px 320px at 70% 10%, rgba(0,220,160,.3), transparent 60%), radial-gradient(500px 300px at 15% 90%, rgba(255,200,40,.18), transparent 60%), linear-gradient(115deg, #04120d 0%, #06301f 45%, #0a4d33 70%, #04120d 100%); }\r\n.mega-slide.on { display: flex; align-items: center; justify-content: center; animation: megaIn .5s ease; }\r\n@keyframes megaIn { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: none; } }\r\n.mega-slide::before { content: \"\"; position: absolute; inset: -40%; pointer-events: none;\r\n  background: repeating-linear-gradient(115deg, transparent 0 60px, rgba(120,170,255,.08) 60px 92px, transparent 92px 190px);\r\n  animation: streak 14s linear infinite; }\r\n@keyframes streak { to { transform: translateX(190px); } }\r\n.mega-in { position: relative; z-index: 2; width: 100%; }\r\n.mega-brand { font-family: var(--font-poppins), sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 3px; color: #9fb4ff; margin-bottom: 6px; }\r\n.mega-logo { position: absolute; top: 12px; left: 14px; z-index: 3; display: flex; align-items: center; gap: 8px;\r\n  font-family: var(--font-poppins), sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; color: #fff;\r\n  text-shadow: 0 1px 4px rgba(0,0,0,.7); }\r\n.mega-logo img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; }\r\n.mega-title-w { font-family: var(--font-baloo-2), sans-serif; font-weight: 800; font-size: clamp(28px, 5vw, 54px); line-height: 1; color: #fff; margin: 0;\r\n  text-shadow: 0 2px 3px rgba(0,0,0,.75), 0 6px 18px rgba(0,0,0,.5); letter-spacing: .5px; }\r\n.mega-title-g { font-family: var(--font-baloo-2), sans-serif; font-weight: 800; font-size: clamp(42px, 8.5vw, 92px); line-height: 1.02; margin: 0 0 8px;\r\n  background: linear-gradient(180deg, #f2f7ff 0%, #a9c8ff 22%, #2f6dff 48%, #a9c8ff 72%, #123a9e 100%);\r\n  -webkit-background-clip: text; background-clip: text; color: transparent;\r\n  filter: drop-shadow(0 3px 4px rgba(0,0,0,.7)) drop-shadow(0 10px 22px rgba(0,0,0,.45)); }\r\n.mega-sub { font-family: var(--font-poppins), sans-serif; font-weight: 800; font-size: clamp(13px, 2.2vw, 19px); letter-spacing: 2px; color: #fff; margin: 6px 0 0; text-shadow: 0 2px 0 #000, 0 2px 8px rgba(0,0,0,.8); }\r\n.mega-badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 16px 0 6px; }\r\n.mega-badge { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-poppins), sans-serif; font-size: 13px; font-weight: 800; color: #fff;\r\n  background: rgba(0,0,0,.45); border: 1px solid rgba(255,215,80,.55); border-radius: 10px; padding: 8px 16px; box-shadow: 0 4px 14px rgba(0,0,0,.5); }\r\n.mega-badge .ck { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%;\r\n  background: radial-gradient(circle at 35% 30%, #ffe98a, #f5a623 70%); color: #4a2d00; font-size: 13px; font-weight: 900; }\r\n.mega-tag { font-family: var(--font-baloo-2), sans-serif; font-size: clamp(14px, 2.6vw, 22px); font-weight: 800; letter-spacing: 1px; color: #fff; margin: 10px 0 0; text-shadow: 0 2px 0 #000, 0 2px 10px rgba(0,0,0,.8); }\r\n.mega-tag b { color: #6ea8ff; }\r\n.mega-cta { margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }\r\n.mega-fig { position: absolute; bottom: 0; top: 0; width: 30%; z-index: 1; display: flex; align-items: flex-end; justify-content: center; pointer-events: none; }\r\n.mega-fig.left { left: 0; } .mega-fig.right { right: 0; }\r\n.mega-fig img { max-height: 100%; max-width: 100%; object-fit: contain;\r\n  filter: drop-shadow(0 0 22px rgba(80,140,255,.55)); animation: floaty 4s ease-in-out infinite; }\r\n@keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }\r\n.mega-dots { position: absolute; bottom: 12px; left: 0; right: 0; display: flex; gap: 7px; justify-content: center; z-index: 3; }\r\n.mega-dots i { width: 9px; height: 9px; border-radius: 99px; background: rgba(255,255,255,.35); cursor: pointer; transition: all .25s; }\r\n.mega-dots i.on { width: 26px; background: #5a78ff; box-shadow: 0 0 12px #5a78ff; }\r\n.mega-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; width: 46px; height: 46px; border-radius: 50%;\r\n  background: rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.3); color: #fff; font-size: 16px; cursor: pointer; }\r\n.mega-nav.l { left: 10px; } .mega-nav.r { right: 10px; }\r\n/* slide jasa cari akun: judul | maskot | langkah */\r\n.mega-flex { display: flex; align-items: center; justify-content: center; gap: 26px; text-align: left; }\r\n.mega-flex .mega-titlebox { flex: 1.15; min-width: 0; }\r\n.mega-flex .mega-char { flex: 0.85; display: flex; justify-content: center; }\r\n.mega-flex .mega-char img { max-height: 300px; max-width: 100%; object-fit: contain;\r\n  filter: drop-shadow(0 0 22px rgba(80,140,255,.55)); animation: floaty 4s ease-in-out infinite; }\r\n.mega-flex .mega-char.wide { flex: 1.1; }\r\n.mega-flex .mega-char.wide img { max-height: 330px; }\r\n.s4 .mega-title-w { font-size: clamp(22px, 3.2vw, 36px); }\r\n.s4 .mega-title-g { font-size: clamp(32px, 5vw, 58px); }\r\n.s4 .mega-ribbon { font-size: clamp(13px, 1.8vw, 18px); padding: 7px 16px; }\r\n.s4 .mega-flex { gap: 18px; }\r\n.s4 .mega-steps { gap: 10px; }\r\n.s4 .mega-step { font-size: 13px; padding: 10px 14px; }\r\n.s4 .mega-cta { margin-top: 10px; }\r\n.s4 .mega-char img { max-height: 310px; }\r\n/* slide 6 saluran: judul panjang dikecilin */\r\n.mega-gold { background: linear-gradient(180deg, #f2f7ff 0%, #a9c8ff 22%, #2f6dff 48%, #a9c8ff 72%, #123a9e 100%);\r\n  -webkit-background-clip: text; background-clip: text; color: transparent; }\r\n.mega-blue { color: #5b95ff; -webkit-text-fill-color: #5b95ff; background: none; font-weight: 800; }\r\n.s6 .mega-title-w { font-size: clamp(26px, 4.2vw, 46px); }\r\n.s6 .mega-title-g { font-size: clamp(30px, 5.4vw, 62px); }\r\n.s6 .mega-sub { font-size: clamp(12px, 1.9vw, 16px); letter-spacing: 1px; }\r\n.s6 .mega-badge.join { font-size: 15px; padding: 12px 30px; background: linear-gradient(180deg, #ffe45c, #f5a623); color: #1a1000; border: none; text-decoration: none; }\r\n/* slide 6: karakter napak ke bawah banner */\r\n.s6 .mega-in { align-items: flex-end; }\r\n.s6 .mega-char img { max-height: 340px; }\r\n.s6 .mega-phone { flex: 0.6; display: flex; justify-content: center; align-items: flex-end; }\r\n.s6 .mega-phone img { max-height: 300px; max-width: 100%; object-fit: contain; border-radius: 22px;\r\n  border: 2px solid rgba(255,255,255,.4); box-shadow: 0 0 34px rgba(37,211,102,.35), 0 0 34px rgba(0,220,255,.25); animation: floaty 4s ease-in-out infinite; }\r\n/* slide 7 tiktok */\r\n.s7 .mega-title-w { font-size: clamp(26px, 4.4vw, 48px); }\r\n.s7 .mega-title-g { font-size: clamp(28px, 4.8vw, 56px); }\r\n.s7 .mega-phone { flex: 0.7; display: flex; justify-content: center; }\r\n.s7 .mega-phone img { max-height: 330px; max-width: 100%; object-fit: contain; border-radius: 22px;\r\n  border: 2px solid rgba(255,255,255,.4); box-shadow: 0 0 34px rgba(255,0,90,.4), 0 0 34px rgba(0,220,255,.3); animation: floaty 4s ease-in-out infinite; }\r\n/* s7 HP gabung di blok mobile utama di atas */\r\n/* s6 HP gabung di blok mobile utama di atas */\r\n/* slide 5 joki: teks muat + foto asli berbingkai */\r\n.s5 .mega-title-w { font-size: clamp(22px, 3.4vw, 38px); }\r\n.s5 .mega-title-g { font-size: clamp(32px, 5.2vw, 60px); }\r\n.s5 .mega-badge { font-size: 12px; padding: 6px 12px; }\r\n.s5 .mega-badges { margin: 10px 0 2px; }\r\n.s5 .mega-cta { margin-top: 10px; }\r\n.s5 .mega-char.wide img { border-radius: 16px; border: 1px solid rgba(140,170,255,.55); object-fit: cover; box-shadow: 0 0 30px rgba(43,120,255,.45); }\r\n/* slide 5 Joki: kembali ke banner foto dan CTA sebelumnya */\r\n.s5 { background: linear-gradient(90deg, rgba(3,6,20,.94) 0%, rgba(3,6,20,.78) 38%, rgba(3,6,20,.25) 62%, rgba(3,6,20,0) 80%), url('jokiroblox.webp') center right / cover no-repeat; }\r\n.s5 .mega-char { display: none; }\r\n.s5 .mega-titlebox { text-shadow: 0 2px 12px rgba(0,0,0,.85); }\r\n.joki-hero { position: relative; overflow: hidden; padding: 6px 8px 2px; text-align: center; margin-bottom: 10px; }\r\n.s5 .mega-title-g { background: linear-gradient(180deg, #ffffff 0%, #c9dcff 25%, #4d86ff 50%, #c9dcff 75%, #1a4fc4 100%);\r\n  -webkit-background-clip: text; background-clip: text; color: transparent; }\r\n.joki-stars { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }\r\n.joki-stars i { position: absolute; border-radius: 50%; background: #cfe0ff; opacity: .5;\r\n  animation: jokiTwinkle 3s ease-in-out infinite; }\r\n.joki-stars i.g1 { background: #4dabf7; box-shadow: 0 0 9px 2px rgba(77,171,247,.9); }\r\n.joki-stars i.g2 { background: #ffd43b; box-shadow: 0 0 9px 2px rgba(255,212,59,.85); }\r\n@keyframes jokiTwinkle { 0%,100% { opacity: .25; transform: scale(.75); } 50% { opacity: 1; transform: scale(1.2); } }\r\n.joki-head { text-align: center; }\r\n.joki-title { font-family: var(--font-baloo-2), sans-serif; font-weight: 800; font-size: clamp(26px, 4.6vw, 44px); line-height: 1;\r\n  margin: 6px auto 0; display: inline-flex; gap: 10px; align-items: baseline; letter-spacing: .5px; }\r\n.joki-title .jasa { background: linear-gradient(180deg, #cfe2ff 0%, #6ea8ff 45%, #2f6dff 100%);\r\n  -webkit-background-clip: text; background-clip: text; color: transparent;\r\n  filter: drop-shadow(0 2px 4px rgba(0,0,0,.75)); }\r\n.joki-title .jokiw { color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,.8); }\r\n.joki-sub { font-family: var(--font-poppins), sans-serif; font-weight: 600; font-size: clamp(11px, 1.7vw, 14px); color: #dfe6ff;\r\n  margin: 12px auto 0; display: block; max-width: 620px; line-height: 1.55;\r\n  text-shadow: 0 2px 6px rgba(0,0,0,.9); }\r\n.joki-sub b { color: #6fb1ff; font-weight: 700; text-shadow: 0 0 14px rgba(77,171,247,.6); }\r\n@media (max-width: 560px) {\r\n  .joki-title { gap: 8px; }\r\n}\r\n.mega-steps { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; }\r\n.mega-step { background: linear-gradient(135deg, rgba(2,6,20,.88), rgba(10,25,70,.88)); border: 1px solid rgba(140,170,255,.5);\r\n  border-radius: 12px; padding: 12px 16px; font-family: var(--font-poppins), sans-serif; font-size: 14px; font-weight: 800; color: #fff;\r\n  box-shadow: 0 8px 24px rgba(0,0,0,.5); }\r\n.mega-step b { color: #6ea8ff; margin-right: 6px; }\r\n.mega-ribbon { display: inline-block; margin-top: 12px; font-family: var(--font-baloo-2), sans-serif; font-weight: 800;\r\n  font-size: clamp(15px, 2.4vw, 22px); color: #1a1000; background: linear-gradient(180deg, #ffe45c, #f5a623);\r\n  padding: 8px 22px; border-radius: 8px; box-shadow: 0 6px 18px rgba(245,166,35,.45); transform: skewX(-6deg); }\r\n/* HP: semua kesamping (tidak ke bawah), banner pendek */\r\n@media (max-width: 760px) {\r\n  .mega-fig { width: 30%; opacity: .95; }\r\n  .mega-fig img { max-height: 240px; }\r\n  .mega-flex { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px; text-align: left; }\r\n  .mega-titlebox { flex: 1 1 100%; min-width: 0; }\r\n  .mega-flex .mega-char, .mega-flex .mega-phone { display: none; } /* gambar samping off di HP → teks lebar penuh, banner tidak memanjang ke bawah */\r\n  /* slide Join Saluran & TikTok: foto ditampilkan sebagai thumbnail di SAMPING teks */\r\n  .s6 .mega-flex .mega-phone, .s7 .mega-flex .mega-phone { display: flex; flex: 0 0 calc(30% - 4px); justify-content: center; align-items: center; }\r\n  .s6 .mega-flex .mega-titlebox, .s7 .mega-flex .mega-titlebox { flex: 1 1 calc(68% - 4px); }\r\n  .s6 .mega-flex, .s7 .mega-flex { flex-wrap: nowrap; gap: 8px; align-items: center; }\r\n  .s6 .mega-flex .mega-phone img, .s7 .mega-flex .mega-phone img {\r\n    width: 88px; height: 145px; object-fit: cover; object-position: top center;\r\n    border-radius: 14px; border: 1px solid rgba(140,170,255,.45); box-shadow: 0 8px 24px rgba(0,0,0,.5);\r\n    max-height: none; max-width: 100%;\r\n  }\r\n  .mega-steps, .s4 .mega-steps { flex: 1 1 calc(42% - 4px); gap: 6px; flex-direction: column; flex-wrap: nowrap; min-width: 0; }\r\n  .mega-step, .s4 .mega-step { font-size: 10.5px; padding: 7px 9px; min-width: 0; }\r\n  .s4 .mega-titlebox { flex: 1 1 calc(58% - 4px); }\r\n  .s4 .mega-flex { gap: 8px; } /* samakan jarak: aturan lama gap:18px bikin baris pecah (ke bawah) */\r\n  .mega-cta { justify-content: flex-start !important; flex-wrap: nowrap; }\r\n  .mega-cta .btn-primary { padding: 9px 12px; font-size: 13px; white-space: nowrap; }\r\n  .mega-badges { margin: 8px 0 4px; gap: 6px; }\r\n  .mega-badge { font-size: 11.5px; padding: 5px 10px; gap: 5px; }\r\n  .mega-badge .ck { width: 17px; height: 17px; font-size: 11px; }\r\n  .s4 .mega-title-g { font-size: clamp(26px, 7vw, 34px); }\r\n  .s6 .mega-title-g { font-size: clamp(24px, 6.5vw, 32px); }\r\n  .s7 .mega-title-g { font-size: clamp(22px, 6vw, 30px); }\r\n}\r\n@media (max-width: 760px) {\r\n  .mega { padding: 0 12px; }\r\n  .mega-slide { height: auto; min-height: 340px; padding: 18px 14px 46px; }\r\n  .mega-fig { width: 34%; opacity: .4; }\r\n  .mega-nav { display: none; }\r\n}\r\n\r\n/* ===== hero split ===== */\r\n.hero {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 36px;\r\n  max-width: 1200px;\r\n  margin: 0 auto;\r\n  padding: 64px 28px 30px;\r\n}\r\n.hero-text { flex: 1.2; }\r\n.hero-kicker {\r\n  display: inline-block;\r\n  font-size: 12px;\r\n  font-weight: 700;\r\n  letter-spacing: 1.5px;\r\n  color: var(--blue2);\r\n  border: 1px solid rgba(111,139,255,.45);\r\n  background: rgba(43,78,255,0.12);\r\n  padding: 6px 14px;\r\n  border-radius: 999px;\r\n  margin-bottom: 16px;\r\n  box-shadow: 0 0 24px rgba(43,78,255,.25), inset 0 0 12px rgba(43,78,255,.08);\r\n}\r\n.hero h1 {\r\n  font-family: var(--font-baloo-2), sans-serif;\r\n  font-size: 58px;\r\n  line-height: 1.05;\r\n  margin: 0 0 14px;\r\n  letter-spacing: 0.5px;\r\n}\r\n.hero h1 span { background: linear-gradient(135deg, var(--blue2), #cdd9ff); -webkit-background-clip: text; background-clip: text; color: transparent; }\r\n.hero p { color: var(--mut); font-size: 16px; line-height: 1.7; margin: 0 0 26px; max-width: 520px; }\r\n.channel-link { display: inline-block; color: var(--wa); font-size: 14px; font-weight: 700; margin: -22px 0 12px; padding: 12px 6px; text-decoration: none; }\r\n.channel-link:hover { text-decoration: underline; }\r\n.hero-cta { display: flex; gap: 12px; flex-wrap: wrap; }\r\n.btn-primary, .btn-ghost {\r\n  font-family: var(--font-poppins), sans-serif;\r\n  font-weight: 700;\r\n  font-size: 15px;\r\n  border-radius: 12px;\r\n  padding: 14px 26px;\r\n  cursor: pointer;\r\n  transition: transform 0.15s ease, box-shadow 0.15s ease;\r\n}\r\n.btn-primary { background: linear-gradient(135deg, var(--blue), #5a78ff); color: #fff; border: none; box-shadow: 0 10px 28px rgba(43,78,255,0.45); }\r\n.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(43,78,255,0.55); filter:brightness(1.08); }\r\n.btn-ghost { background: rgba(43,78,255,0.06); color: var(--txt); border: 1px solid var(--line); }\r\n.btn-ghost:hover { border-color: var(--blue); background: rgba(43,78,255,0.14); }\r\n.hero-visual { flex: 0.8; display: flex; flex-direction: column; align-items: center; gap: 14px; }\r\n.hero-visual a { cursor: pointer; }\r\n.ava-caption {\r\n  text-align: center;\r\n  font-family: var(--font-baloo-2), sans-serif;\r\n  font-size: 14px;\r\n  letter-spacing: 1.4px;\r\n  line-height: 1.7;\r\n  color: #fff;\r\n  background: linear-gradient(135deg, rgba(43,78,255,0.28), rgba(43,78,255,0.07));\r\n  border: 1px solid rgba(111,139,255,0.55);\r\n  border-radius: 16px;\r\n  padding: 12px 24px;\r\n  box-shadow: 0 0 28px rgba(43,78,255,0.35), inset 0 0 18px rgba(43,78,255,0.12);\r\n}\r\n.ava-caption .finger { display: inline-block; font-size: 20px; animation: point 1.4s ease-in-out infinite; }\r\n.ava-caption b { color: var(--blue2); }\r\n@keyframes point { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }\r\n.hero-visual img.hero-logo {\r\n  width: min(200px, 60%);\r\n  aspect-ratio: 1 / 1;\r\n  height: auto;\r\n  object-fit: contain;\r\n  border-radius: 14px;\r\n  border: 1px solid var(--line);\r\n  box-shadow: 0 10px 30px rgba(0,0,0,0.5);\r\n}\r\n.hero-visual img:not(.hero-logo) {\r\n  width: min(340px, 80%);\r\n  border-radius: 24px;\r\n  border: 1px solid var(--line);\r\n  box-shadow: 0 0 0 8px rgba(43,78,255,0.08), 0 30px 80px rgba(43,78,255,0.3);\r\n}\r\n\r\n/* ===== server links ===== */\r\n.serverbtns { display: flex; gap: 12px; flex-wrap: wrap; }\r\n.serverbtn {\r\n  flex: 1;\r\n  min-width: 220px;\r\n  text-align: center;\r\n  background: rgba(43,78,255,0.12);\r\n  border: 1px solid var(--blue);\r\n  color: #fff;\r\n  font-weight: 700;\r\n  font-size: 14px;\r\n  border-radius: 12px;\r\n  padding: 14px 18px;\r\n  text-decoration: none;\r\n  transition: background 0.15s ease, transform 0.15s ease;\r\n}\r\n.serverbtn:hover { background: var(--blue); transform: translateY(-2px); }\r\n\r\n/* ===== stats strip ===== */\r\n.stats {\r\n  display: flex;\r\n  max-width: 1200px;\r\n  margin: 26px auto 0;\r\n  padding: 0 28px;\r\n  gap: 14px;\r\n  flex-wrap: wrap;\r\n}\r\n.stat {\r\n  flex: 1;\r\n  min-width: 150px;\r\n  background: var(--card);\r\n  border: 1px solid var(--line);\r\n  border-radius: 14px;\r\n  padding: 16px 18px;\r\n  text-align: center;\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 4px;\r\n}\r\n.stat b { display: block; font-family: var(--font-baloo-2), sans-serif; font-size: 24px; color: #fff; }\r\n.stat span { font-size: 12.5px; color: var(--mut); }\r\n\r\n/* ===== section titles ===== */\r\n.section { max-width: 1200px; margin: 0 auto; padding: 44px 28px 8px; }\r\n.section h2 { font-family: var(--font-baloo-2), sans-serif; font-size: 30px; margin: 0 0 4px; letter-spacing: 0.4px; border-left: 5px solid var(--blue); padding-left: 14px; }\r\n.section > p { color: var(--mut); margin: 0 0 20px; font-size: 14px; }\r\n\r\n/* ===== flash sale ===== */\r\n.flashsec { margin-top: 26px; }\r\n.flashhead {\r\n  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;\r\n  background: linear-gradient(90deg, #3d0a0a, #7a1010);\r\n  border: 1px solid var(--red); border-radius: var(--r);\r\n  padding: 16px 20px; margin-bottom: 0; cursor: pointer; user-select: none;\r\n}\r\n.flashhead h3 { font-family: var(--font-baloo-2), sans-serif; font-size: 24px; margin: 0; }\r\n.flashhead .arrow { margin-left: 4px; font-size: 18px; color: var(--blue2); }\r\n.flashhead .fomo { font-weight: 700; font-size: 13.5px; color: #ffb3b3; }\r\n.flashhead .timer {\r\n  margin-left: auto; font-family: var(--font-baloo-2), sans-serif; font-size: 22px;\r\n  background: #000; border-radius: 10px; padding: 6px 14px; letter-spacing: 2px;\r\n}\r\n.flashbody { margin-top: 18px; }\r\n.flashgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }\r\n.banners { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }\r\n.banner {\r\n  position: relative;\r\n  overflow: hidden;\r\n  border-radius: var(--r);\r\n  border: 1px solid var(--line);\r\n  background: linear-gradient(135deg, #101b3d, #0a1024);\r\n  padding: 30px 28px;\r\n  cursor: pointer;\r\n  min-height: 190px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  justify-content: flex-end;\r\n  transition: transform 0.2s ease, border-color 0.2s ease;\r\n}\r\n.banner:hover { transform: translateY(-4px); border-color: var(--blue); box-shadow: 0 18px 44px rgba(0,0,0,0.55), 0 0 28px rgba(43,78,255,0.22); }\r\n.banner::after {\r\n  content: \"→\";\r\n  position: absolute;\r\n  right: 22px;\r\n  top: 50%;\r\n  transform: translateY(-50%);\r\n  font-size: 30px;\r\n  color: var(--blue2);\r\n}\r\n.banner small { color: var(--blue2); font-weight: 700; letter-spacing: 1.5px; font-size: 12px; }\r\n.banner h3 { font-family: var(--font-baloo-2), sans-serif; font-size: clamp(22px, 3vw, 30px); margin: 6px 0 4px; line-height: 1.15; overflow-wrap: break-word; }\r\n.banner p { color: var(--mut); font-size: 13.5px; margin: 0; }\r\n\r\n/* ===== category cards ===== */\r\n.catgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }\r\n.catcard {\r\n  background: var(--card);\r\n  border: 1px solid var(--line);\r\n  border-radius: var(--r);\r\n  overflow: hidden;\r\n  cursor: pointer;\r\n  transition: transform 0.2s ease, border-color 0.2s ease;\r\n  content-visibility: auto;\r\n  contain-intrinsic-size: 280px 260px;\r\n}\r\n.catcard:hover { transform: translateY(-5px); border-color: var(--blue); }\r\n.catcard .catimgwrap { position: relative; height: 170px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #101b3d, #0a1024); }\r\n.catcard .catimgwrap .catemoji { font-size: 64px; }\r\n.catcard .catimgwrap img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }\r\n.catcard .catbody { padding: 14px 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }\r\n.catcard h3 { font-family: var(--font-baloo-2), sans-serif; font-size: 17px; letter-spacing: 0.3px; margin: 0; font-weight: 700; }\r\n.catcard .go {\r\n  flex-shrink: 0;\r\n  width: 34px; height: 34px;\r\n  border-radius: 50%;\r\n  background: rgba(43,78,255,0.15);\r\n  color: var(--blue2);\r\n  display: flex; align-items: center; justify-content: center;\r\n  font-size: 17px;\r\n}\r\n\r\n/* ===== item cards (new style) ===== */\r\n.itemgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 22px; }\r\n.item {\r\n  background: var(--card);\r\n  border: 1px solid var(--line);\r\n  border-radius: var(--r);\r\n  overflow: hidden;\r\n  display: flex;\r\n  flex-direction: column;\r\n  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;\r\n  cursor: pointer;\r\n  content-visibility: auto;\r\n  contain-intrinsic-size: 400px 560px;\r\n  position: relative;\r\n}\r\n.item::before {\r\n  content: \"\";\r\n  position: absolute;\r\n  top: 0; left: 0; right: 0; height: 3px;\r\n  background: linear-gradient(90deg, transparent, var(--blue2), transparent);\r\n  opacity: 0.7;\r\n  z-index: 3;\r\n}\r\n.item:hover { transform: translateY(-5px); border-color: var(--blue); box-shadow: 0 18px 44px rgba(0,0,0,0.5); }\r\n.item .thumb { position: relative; cursor: zoom-in; }\r\n.item .thumb::before { content:\"\"; display:block; padding-top:100%; }\r\n.item .thumb img, .item .mthumb img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }\r\n.badge-off, .badge-out { z-index: 2; }\r\n.item .thumb::after { content:\"\"; position:absolute; inset:0; background:linear-gradient(180deg, transparent 40%, rgba(6,9,19,.68)); pointer-events:none; }\r\n.item .thumb .catemoji { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:64px; }\r\n.item .thumb img { width:100%; aspect-ratio: 1/1; object-fit:cover; display:block; background:#05080f; filter:saturate(1.12) contrast(1.08); }\r\n.badge-off {\r\n  position: absolute;\r\n  top: 10px; left: 10px;\r\n  background: var(--red);\r\n  color: #fff;\r\n  font-size: 10px;\r\n  font-weight: 700;\r\n  padding: 4px 8px;\r\n  border-radius: 999px;\r\n}\r\n.badge-out {\r\n  position: absolute;\r\n  top: 12px; right: 12px;\r\n  background: rgba(0,0,0,0.75);\r\n  color: #fff;\r\n  font-size: 12px;\r\n  font-weight: 700;\r\n  padding: 5px 11px;\r\n  border-radius: 999px;\r\n  border: 1px solid var(--red);\r\n}\r\n.item .ibody { padding: 16px 18px 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }\r\n.item h3 { font-size: 16px; margin: 0; font-weight: 600; line-height: 1.45; letter-spacing: 0.2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\r\n.item .desc { font-size: 12.5px; color: var(--mut); margin: 0; line-height: 1.6; }\r\n.verified {\r\n  display: inline-flex; align-items: center; justify-content: center;\r\n  width: 18px; height: 18px; border-radius: 50%; background: var(--blue);\r\n  color: #fff; font-size: 11px; font-weight: 700; margin-left: 6px; vertical-align: middle;\r\n}\r\n.item .meta { font-size: 14px; color: var(--mut); display: flex; gap: 12px; }\r\n.item .meta .sold { color: #ffb3b3; font-weight: 600; }\r\n.item .meta .stock { color: var(--green); font-weight: 600; }\r\n.item .price { margin-top: 6px; padding-top: 6px; background: none; border: none; }\r\n.item .price .now { font-family: var(--font-baloo-2), sans-serif; font-size: 24px; color: #fff; }\r\n.item .price .was { font-size: 13px; color: var(--mut); text-decoration: line-through; margin-left: 8px; }\r\n.item .btn {\r\n  margin-top: auto;\r\n  background: linear-gradient(135deg, var(--blue), #5a78ff);\r\n  color: #fff;\r\n  border: none;\r\n  border-radius: 12px;\r\n  padding: 15px;\r\n  font-family: var(--font-poppins), sans-serif;\r\n  font-weight: 700;\r\n  font-size: 16px;\r\n  cursor: pointer;\r\n  transition: filter 0.15s ease;\r\n  box-shadow: 0 8px 22px rgba(43,78,255,0.35);\r\n}\r\n.item .btn:hover:not(:disabled) { filter: brightness(1.12); }\r\n.item .btn:disabled { background: #232c44; color: var(--mut); cursor: not-allowed; }\r\n.kilat { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; background: none; border: none; box-shadow: none; padding: 0; }\r\n.kilat > span { font-size: 12.5px; font-weight: 700; color: #fff; background: rgba(0,0,0,0.45); border: 1px solid var(--line); border-radius: 10px; padding: 6px 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); white-space: nowrap; }\r\n.item .price { margin-top: 6px; padding-top: 6px; background: none; border: none; min-height: 32px; }\r\n.kilat .vbadge { display:inline-flex; align-items:center; gap:6px; color:#fff; font-size:12.5px; font-weight:700; }\r\n.kilat .vbadge i { font-style:normal; display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:#1d9bf0; color:#fff; font-size:12px; font-weight:900; flex-shrink:0; box-shadow:0 0 8px rgba(29,155,240,0.6); }\r\n/* ===== stempel SOLD di tengah foto ===== */\r\n.soldstamp { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.55); z-index:2; }\r\n.soldstamp b { font-family: var(--font-baloo-2),sans-serif; font-size:34px; letter-spacing:5px; color:#fff; border:3px solid #ff5d5d; border-radius:12px; padding:6px 20px 6px 25px; transform:rotate(-12deg); background:rgba(255,93,93,.15); box-shadow:0 6px 24px rgba(0,0,0,.5); }\r\n/* ===== wishlist ===== */\r\n.wishbtn { position:absolute; bottom:10px; right:10px; width:34px; height:34px; border-radius:50%; border:1px solid var(--line); background:rgba(0,0,0,.65); font-size:15px; cursor:pointer; z-index:2; display:flex; align-items:center; justify-content:center; }\r\n/* Area sentuh diperbesar (±46px) tanpa membesarkan tampilan tombolnya */\r\n.wishbtn::before { content: \"\"; position: absolute; inset: -6px; }\r\n.wishbtn.on { border-color:#ff5d7e; background:rgba(255,60,90,.25); }\r\n.viewpill { position:absolute; top:10px; right:10px; z-index:3; background:rgba(0,0,0,.65); color:#fff; font-size:10px; font-weight:700; border-radius:999px; padding:3px 8px; }\r\n/* ===== terakhir dilihat + dibeli bersama ===== */\r\n.recentrow { display:flex; gap:10px; overflow-x:auto; padding:6px 2px 12px; scrollbar-width:none;\r\n  -webkit-mask-image: linear-gradient(to right, #000 92%, rgba(0,0,0,0) 100%);\r\n  mask-image: linear-gradient(to right, #000 92%, rgba(0,0,0,0) 100%); }\r\n.recentrow::-webkit-scrollbar { display:none; }\r\n.recentcard { min-width:150px; max-width:150px; background:var(--card); border:1px solid var(--line); border-radius:12px; overflow:hidden; cursor:pointer; flex-shrink:0; position:relative; }\r\n.recentcard .soldstamp b { font-size:18px; letter-spacing:3px; padding:4px 12px 4px 15px; }\r\n.recentcard img { width:100%; aspect-ratio:1/1; object-fit:cover; display:block; background:#05080f; }\r\n.recentcard .rb { padding:8px 10px 10px; }\r\n.recentcard .rn { font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\r\n.recentcard .rp { font-size:13px; color:#f3d27a; font-weight:700; }\r\n.statrow { display:flex; align-items:center; gap:8px; margin-top:8px; font-size:12px; color:var(--mut); }\r\n.statrow b.st-ok { color:var(--green); }\r\n.statrow b.st-no { color:var(--red); }\r\n/* ===== wishlist ===== */\r\n.payicons { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }\r\n.payicons span { font-size: 10.5px; font-weight: 700; border: 1px solid var(--line); border-radius: 6px; padding: 2px 8px; color: var(--mut); }\r\n.rm { font-size: 12.5px; font-weight: 700; color: #f3d27a; margin-top: 2px; }\r\n/* ===== sentuhan mewah & elegan: aksen biru + background foto grid ===== */\r\n.itemgrid { background: transparent; border: none; box-shadow: none; padding: 0; }\r\n.item { border: 1px solid rgba(66,105,255,0.25); box-shadow: 0 10px 30px rgba(0,0,0,0.45); }\r\n.item:hover { transform: translateY(-8px); border-color: rgba(111,139,255,0.65); box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 32px rgba(66,105,255,0.18); }\r\n.item .thumb { overflow: hidden; }\r\n.item .thumb img { transition: transform 0.5s ease; }\r\n.item:hover .thumb img { transform: scale(1.06); }\r\n.item .price .now { color: #f3d27a; text-shadow: 0 0 18px rgba(243,210,122,0.35); }\r\n.badge-off { background: var(--red); }\r\n.catcard { border: 1px solid rgba(66,105,255,0.18); }\r\n.catcard:hover { border-color: rgba(111,139,255,0.6); box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 24px rgba(66,105,255,0.12); }\r\n.catcard h3 { color: #dbe4ff; }\r\n\r\n/* carousel inside item (multi-photo) */\r\n.mthumb { position: relative; }\r\n.mthumb img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; background: #05080f; }\r\n.mnav {\r\n  position: absolute;\r\n  top: 50%;\r\n  transform: translateY(-50%);\r\n  width: 28px; height: 28px;\r\n  border-radius: 50%;\r\n  border: 2px solid #fff;\r\n  background: #fff;\r\n  color: var(--blue);\r\n  font-size: 13px;\r\n  font-weight: 900;\r\n  cursor: pointer;\r\n  box-shadow: 0 4px 16px rgba(0,0,0,0.55);\r\n  z-index: 3;\r\n}\r\n/* Area sentuh diperbesar (±46px) tanpa mengubah ukuran tampilan panah */\r\n.mnav::before { content: \"\"; position: absolute; inset: -9px; }\r\n.mnav.l { left: 10px; } .mnav.r { right: 10px; }\r\n.mdots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 3; }\r\n.mdots i { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); cursor: pointer; }\r\n.mdots i.on { background: #fff; }\r\n\r\n/* ===== back button ===== */\r\n.backbtn {\r\n  background: transparent;\r\n  border: 1px solid var(--line);\r\n  color: var(--txt);\r\n  border-radius: 10px;\r\n  padding: 9px 16px;\r\n  font-family: var(--font-poppins), sans-serif;\r\n  font-weight: 600;\r\n  font-size: 15px;\r\n  cursor: pointer;\r\n  margin-bottom: 18px;\r\n}\r\n.backbtn:hover { border-color: var(--blue); color: var(--blue2); }\r\n\r\n/* ===== bottom server CTA ===== */\n.server-cta { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }\r\n.server-cta .ava-big { cursor: pointer; }\r\n.server-cta .ava-big img {\r\n  width: min(280px, 80vw);\r\n  height: auto;\r\n  border-radius: 24px;\r\n  border: 1px solid var(--line);\r\n  box-shadow: 0 0 0 8px rgba(43,78,255,0.08), 0 30px 80px rgba(43,78,255,0.3);\r\n  transition: transform 0.2s ease;\r\n}\r\n.server-cta .ava-big img:hover { transform: scale(1.03); }\n\n/* ===== FAQ di bagian bawah beranda ===== */\n.faq-section.section { max-width: 1000px; padding-top: 46px; padding-bottom: 32px; scroll-margin-top: 90px; }\n.faq-section .faq-title { border: 0; padding: 0; margin: 0 0 26px; text-align: center; color: #9cddff; font-size: clamp(28px, 5vw, 44px); line-height: 1.15; letter-spacing: 1px; text-shadow: 0 0 24px rgba(49,181,255,.2); }\n.faq-list { display: grid; gap: 12px; }\n.faq-item { overflow: hidden; border: 1px solid rgba(49,181,255,.34); border-radius: 15px; background: linear-gradient(115deg, rgba(14,48,88,.94), rgba(12,37,72,.94)); box-shadow: 0 8px 24px rgba(0,0,0,.18); }\n.faq-item summary { position: relative; display: flex; align-items: center; min-height: 66px; padding: 17px 62px 17px 22px; color: #f5f8ff; font-size: 15px; line-height: 1.5; font-weight: 700; cursor: pointer; list-style: none; }\n.faq-item summary::-webkit-details-marker { display: none; }\n.faq-item summary::after { content: \"+\"; position: absolute; right: 18px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: #12a8e9; color: #fff; font-size: 21px; font-weight: 500; line-height: 1; }\n.faq-item[open] summary::after { content: \"−\"; }\n.faq-item summary:focus-visible { outline: 2px solid #9cddff; outline-offset: -4px; }\n.faq-answer { padding: 0 22px 20px; color: #c0cee4; font-size: 14px; line-height: 1.75; }\n.faq-answer a { color: #84d7ff; font-weight: 700; }\n@media (max-width: 760px) {\n  .faq-section.section { padding-top: 36px; padding-bottom: 26px; }\n  .faq-item summary { min-height: 62px; padding: 15px 54px 15px 16px; font-size: 14px; }\n  .faq-item summary::after { right: 14px; }\n  .faq-answer { padding: 0 16px 17px; font-size: 13px; }\n}\n\n/* ===== floating cart ===== */\n.fab {\r\n  position: fixed;\r\n  right: 22px;\r\n  bottom: 22px;\r\n  z-index: 90;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 10px;\r\n  align-items: flex-end;\r\n}\r\n.fab-main {\r\n  width: 60px; height: 60px;\r\n  border-radius: 50%;\r\n  border: none;\r\n  background: var(--blue);\r\n  color: #fff;\r\n  font-size: 24px;\r\n  cursor: pointer;\r\n  position: relative;\r\n  box-shadow: 0 12px 30px rgba(43,78,255,0.5);\r\n}\r\n.fab-main b {\r\n  position: absolute;\r\n  top: -4px; right: -4px;\r\n  background: var(--red);\r\n  color: #fff;\r\n  font-size: 12px;\r\n  min-width: 24px; height: 24px;\r\n  border-radius: 999px;\r\n  display: flex; align-items: center; justify-content: center;\r\n  padding: 0 6px;\r\n}\r\n\r\n/* ===== tombol WA mengambang + popup ===== */\r\n.wafab { position: fixed; left: 22px; bottom: 22px; z-index: 90; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }\r\n.wafab .wabtnrow { display: flex; gap: 10px; align-items: center; }\r\n#testiPop { position: absolute; right: 8px; bottom: calc(100% + 12px); width: 230px; min-height: 260px; justify-content: center; z-index: 3; }\r\n.wabtn {\r\n  width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;\r\n  background: var(--wa); display: flex; align-items: center; justify-content: center;\r\n  box-shadow: 0 12px 30px rgba(37,211,102,0.5); overflow: hidden; padding: 0;\r\n}\r\n.wabtn img { width: 100%; height: 100%; object-fit: cover; display: block; }\r\n.wabtn.testibtn { width: 60px; height: 60px; padding: 0; background: rgba(6,9,19,0.88); border: 1px solid var(--line); border-radius: 50%; position: relative; }\r\n.wabtn.testibtn img { width: 26px; height: 26px; border-radius: 50%; position: absolute; }\r\n.wabtn.testibtn .tring { position: absolute; inset: 0; animation: spin 14s linear infinite; }\r\n.wabtn.testibtn .tring svg { width: 100%; height: 100%; }\r\n.wabtn.testibtn .tring text { fill: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1px; font-family: var(--font-poppins), sans-serif; }\r\n@keyframes spin { to { transform: rotate(360deg); } }\r\n\r\n/* ===== bottom nav (menu bawah beremoji) ===== */\r\n.botnav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 95; display: flex; background: transparent; backdrop-filter: blur(6px); border-top: none; text-shadow: 0 1px 6px rgba(0,0,0,.85); padding: 6px 6px calc(6px + env(safe-area-inset-bottom)); }\r\n.bnitem { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 54px; padding: 6px 2px; border: none; background: none; border-radius: 14px; color: var(--mut); font-family: var(--font-poppins), sans-serif; cursor: pointer; transition: color .15s, background .15s, transform .12s; }\r\n.bnitem .bnico { font-size: 21px; line-height: 1; }\r\n.bnitem .bnlbl { font-size: 9.5px; font-weight: 600; line-height: 1.15; text-align: center; letter-spacing: .02em; }\r\n.bnitem.active { color: var(--blue2); background: rgba(43,78,255,.16); }\r\n.bnitem.flash { color: #ff5252; background: none; border-radius: 14px; }\r\n.bnitem.flash .bnico, .bnitem.flash .bnlbl { color: #ff5252; text-shadow: 0 1px 6px rgba(0,0,0,.9); }\r\n.bnitem:active { transform: scale(.93); }\r\n.fab, .wafab { bottom: calc(84px + env(safe-area-inset-bottom)); }\r\n.fab { left: 22px; right: auto; align-items: flex-start; }\r\n@media (min-width: 761px) {\r\n  .botnav { left: 50%; right: auto; transform: translateX(-50%); bottom: 18px; width: min(500px, calc(100% - 48px)); border: 1px solid var(--line); border-radius: 22px; box-shadow: 0 20px 50px rgba(0,0,0,.55); padding: 6px; background: rgba(6,9,19,.45); }\r\n  .fab, .wafab { bottom: 22px; }\r\n}\r\n.wabtn.testibtn img { width: 36px; height: 36px; border-radius: 50%; }\r\n/* ===== widget chat WA ala support ===== */\r\n.wapop.wachat { width: 98vw; max-width: 560px; padding: 0; overflow: hidden; border-radius: 24px; }\r\n.wachead { display: flex; align-items: center; gap: 18px; background: linear-gradient(135deg, #1b40d6, #0a1f6b); padding: 22px 22px; color: #fff; }\r\n.walogo { width: 190px; height: 190px; border-radius: 50%; background: var(--blue); color: #fff; font-family: var(--font-baloo-2), sans-serif; font-weight: 800; font-size: 90px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 0 4px rgba(66,105,255,0.85), 0 10px 26px rgba(0,0,0,0.45); overflow: hidden; }\r\n.walogo.nolabel::before { content: \"R\"; }\r\n.walogo img { width: 100%; height: 100%; object-fit: cover; display: block; }\r\n.wachead b { display: block; font-size: 34px; }\r\n.waonline { display: flex; align-items: center; gap: 8px; font-size: 24px; color: #b9c8ff; }\r\n.waonline i { width: 14px; height: 14px; border-radius: 50%; background: #6f8bff; display: inline-block; }\r\n.wax { margin-left: auto; background: transparent; border: none; color: #fff; font-size: 34px; cursor: pointer; }\r\n.wabody { display: flex; flex-direction: column; gap: 14px; padding: 18px; min-height: 420px; max-height: 58vh; overflow-y: auto; background: var(--bg); }\r\n.wabody .bm { max-width: 86%; padding: 18px 22px; border-radius: 20px; font-size: 26px; line-height: 1.5; }\r\n.wabody .bm.bot { align-self: flex-start; background: var(--card); border: 1px solid var(--line); }\r\n.wabody .bm.me { align-self: flex-end; background: var(--blue); color: #fff; }\r\n.wachips { display: flex; gap: 10px; padding: 0 18px 14px; flex-wrap: wrap; background: var(--bg); }\r\n.wachips button { border: 1px solid var(--blue); background: transparent; color: var(--blue2); border-radius: 999px; padding: 12px 22px; font-size: 20px; font-weight: 600; cursor: pointer; font-family: var(--font-poppins), sans-serif; }\r\n.wainput { display: flex; gap: 12px; padding: 16px 18px 20px; background: var(--bg); }\r\n.wainput input { flex: 1; border-radius: 999px; border: 1px solid var(--line); background: var(--bg2); color: var(--txt); padding: 20px 26px; font-family: var(--font-poppins), sans-serif; font-size: 24px; outline: none; min-width: 0; }\r\n.wainput button { width: 78px; height: 78px; flex-shrink: 0; border-radius: 50%; border: none; background: var(--blue); color: #fff; font-size: 34px; cursor: pointer; }\r\n.wapop {\r\n  background: var(--bg2); border: 1px solid var(--line); border-radius: 16px;\r\n  padding: 14px; width: 230px; box-shadow: 0 18px 44px rgba(0,0,0,0.5);\r\n  display: flex; flex-direction: column; gap: 10px; align-items: stretch; text-align: center;\r\n}\r\n.wapop img { width: 100%; height: 130px; object-fit: cover; border-radius: 10px; }\r\n.wapop .watext b { display: block; font-size: 14.5px; }\r\n.wapop .watext span { font-size: 12.5px; color: var(--mut); }\r\n.wapop a {\r\n  background: var(--blue); color: #fff; font-weight: 700; font-size: 14px;\r\n  border-radius: 10px; padding: 12px; text-decoration: none; font-family: var(--font-poppins), sans-serif;\r\n}\r\n\r\n/* ===== chat Min Rock — tombol mengambang kanan-bawah (animasi gelombang ala exstore) ===== */\r\n.rockchat {\r\n  position: fixed; right: 16px; bottom: calc(84px + env(safe-area-inset-bottom));\r\n  z-index: 93; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;\r\n}\r\n/* Tulisan \"Butuh bantuan?\" di PERUT foto Min Rock (menumpuk di tengah foto) */\r\n#rcBubbleWrap {\r\n  position: fixed; right: 16px; bottom: calc(84px + env(safe-area-inset-bottom) + 140px - 32px);\r\n  z-index: 94; pointer-events: none;\r\n}\r\n.rc-wrap { position: relative; width: 140px; height: 140px; flex-shrink: 0; animation: rcPulse 2.6s ease-in-out infinite; transform: translate3d(0,0,0); will-change: transform; }\r\n/* Foto Min Rock tampil UTUH (tanpa lingkaran, tanpa kotak) — fotonya dipertegas */\r\n.rc-btn {\r\n  position: absolute; inset: 0; width: 140px; height: 140px; padding: 0;\r\n  border: none; border-radius: 0; background: none; box-shadow: none;\r\n  cursor: pointer; display: block; overflow: visible;\r\n}\r\n.rc-btn:active { transform: scale(0.93); }\r\n.rc-btn img {\r\n  width: 100%; height: 100%; object-fit: contain; display: block;\r\n  filter: saturate(1.15) contrast(1.08) brightness(1.03)\r\n          drop-shadow(0 6px 14px rgba(0,0,0,0.55));\r\n}\r\n.rc-btn::after { content: none; }\r\n.rc-ring { display: none; }\r\n.rc-ring.rc-d2 { animation-delay: 1s; }\r\n@keyframes rcRipple { 0% { transform: scale(1); opacity: 0.85; } 100% { transform: scale(1.75); opacity: 0; } }\r\n@keyframes rcPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }\r\n.rc-bubble {\r\n  position: relative;\r\n  max-width: 260px;\r\n  background: var(--bg2); border: 1px solid var(--line);\r\n  border-radius: 16px 16px 4px 16px;\r\n  padding: 11px 16px;\r\n  font-size: 14px; line-height: 1.5;\r\n  color: var(--txt);\r\n  box-shadow: 0 14px 34px rgba(0,0,0,0.6);\r\n  pointer-events: auto;\r\n  cursor: pointer;\r\n}\r\n.rc-bubble b { color: #6f8bff; }\r\n.rc-bx { display: none !important; }\r\n@keyframes rcPop { from { opacity: 0; transform: translateY(10px) scale(0.92); } to { opacity: 1; transform: none; } }\r\n@keyframes rcWiggle { 0%,86%,100% { transform: translateY(0) rotate(0); } 90% { transform: translateY(-5px) rotate(-1.5deg); } 94% { transform: translateY(-2px) rotate(1.5deg); } }\r\n@media (min-width: 761px) { .rockchat { right: 22px; bottom: 22px; } }\r\n\r\n/* ===== modal ===== */\r\n.overlay {\r\n  display: none;\r\n  position: fixed;\r\n  inset: 0;\r\n  background: rgba(3,5,12,0.7);\r\n  backdrop-filter: blur(6px);\r\n  z-index: 200;\r\n}\r\n.modal {\r\n  position: fixed;\r\n  top: 50%; left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  background: var(--bg2);\r\n  border: 1px solid var(--line);\r\n  border-radius: 20px;\r\n  width: min(540px, 92vw);\r\n  max-height: 74vh;\r\n  overflow-y: auto;\r\n  padding: 24px;\r\n  box-shadow: 0 30px 80px rgba(0,0,0,0.6);\r\n}\r\n.modal h2 { font-family: var(--font-baloo-2), sans-serif; margin: 0 0 14px; font-size: 24px; }\r\n.mrow {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: center;\r\n  background: var(--card);\r\n  border: 1px solid var(--line);\r\n  border-radius: 12px;\r\n  padding: 10px 12px;\r\n  margin-bottom: 10px;\r\n  font-size: 13px;\r\n}\r\n.mrow img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }\r\n.mrow .grow { flex: 1; }\r\n.mrow .del {\r\n  background: var(--red);\r\n  border: none;\r\n  color: #fff;\r\n  border-radius: 8px;\r\n  padding: 7px 12px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  font-size: 12px;\r\n}\r\n/* ===== detail produk (popup besar) ===== */\r\n.detailimg { width: 100%; max-height: 52vh; object-fit: contain; background: #05080f; border-radius: 12px; display: block; }\r\n.dthumbs { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }\r\n.dthumbs img { width: 62px; height: 62px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; }\r\n.dthumbs img.on { border-color: var(--blue2); }\r\n.detailmeta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 13px; color: var(--mut); margin-top: 8px; }\r\n.detailmeta .sold { color: #ffb3b3; font-weight: 600; }\r\n.detailmeta .stock { color: var(--green); font-weight: 600; }\r\n.detaildesc { font-size: 15.5px; line-height: 1.7; color: var(--txt); margin: 10px 0 0; }\r\n.detailprice { margin-top: 10px; }\r\n.detailprice .now { font-family: var(--font-baloo-2), sans-serif; font-size: 30px; }\r\n.detailprice .was { color: var(--mut); text-decoration: line-through; margin-left: 10px; }\r\n.mtotal { border-top: 1px solid var(--line); margin-top: 12px; padding-top: 12px; font-weight: 700; }\r\n.mtotal span { color: var(--mut); font-weight: 400; font-size: 13px; }\r\n.mactions { display: flex; gap: 10px; margin-top: 16px; }\r\n.mactions button { flex: 1; border-radius: 10px; padding: 12px; font-weight: 700; font-family: var(--font-poppins), sans-serif; cursor: pointer; border: none; }\r\n.mactions .ghost { background: transparent; border: 1px solid var(--line); color: var(--txt); }\r\n.mactions .go { background: var(--blue); color: #fff; }\r\n.mactions .wa { background: var(--wa); color: #062b16; }\r\n.mactions .danger { background: var(--red); color: #fff; }\r\n\r\nfooter {\r\n  margin-top: 60px;\r\n  border-top: 1px solid var(--line);\r\n  padding: 28px;\r\n  text-align: center;\r\n  color: var(--mut);\r\n  font-size: 13px;\r\n}\r\nfooter a { color: var(--wa); text-decoration: none; font-weight: 700; display: inline-block; padding: 12px 4px; margin: -12px 0; }\r\n\r\n@media (max-width: 760px) {\r\n  body { background-attachment: scroll; }\r\n  .brandshine { display: none; }\r\n  #searchInput { width: 100%; padding: 8px 14px 8px 34px; font-size: 14px; }\r\n  .hero { flex-direction: column; padding: 40px 18px 10px; text-align: center; }\r\n  .hero h1 { font-size: 40px; }\r\n  .hero p { margin-left: auto; margin-right: auto; }\r\n  .hero-cta { justify-content: center; }\r\n  .banners { grid-template-columns: repeat(2, 1fr); gap: 12px; }\r\n  .banner { padding: 16px 10px; min-height: 142px; justify-content: center; align-items: center; text-align: center; }\r\n  .banner::after { display: none; }\r\n  .banner small { font-size: 11px; letter-spacing: 1.3px; }\r\n  .banner h3 { font-size: 25px; font-weight: 800; line-height: 1.08; margin: 6px 0 0; text-shadow: 0 2px 12px rgba(0,0,0,0.5); }\r\n  .banner p { display: none; }\r\n  .section { padding: 32px 16px 6px; }\n  .stats { padding: 0 16px; }\r\n  .itemgrid { grid-template-columns: repeat(2, 1fr); gap: 12px; }\r\n  .flashgrid, .catgrid { grid-template-columns: repeat(2, 1fr); gap: 12px; }\r\n  .catcard .catimgwrap { height: 110px; }\r\n  .catcard .catimgwrap .catemoji { font-size: 44px; }\r\n  .catcard .catbody { padding: 10px 12px 12px; }\r\n  .catcard h3 { font-size: 14px; }\r\n  .catcard .go { width: 28px; height: 28px; font-size: 14px; }\r\n  .brand { font-size: 15px; }\r\n  .brand img { height: 32px; }\r\n  .cartbtn { padding: 8px 14px; font-size: 13px; }\r\n  /* Tulisan berjalan TETAP ikut saat scroll (permintaan owner) — bar atas lengket\r\n     penuh (marquee + header), tidak ada lagi auto-collapse .slim */\r\n  /* Foto Min Rock khusus HP: dikecilkan 1× lagi (140px → 110px) */\r\n  .rc-wrap, .rc-btn { width: 110px; height: 110px; }\r\n  .rc-bubble { max-width: 118px; font-size: 10px; padding: 6px 8px; }\r\n  /* Tulisan berjalan dirapatkan di HP: font & padding kecil agar bar atas tidak tebal */\r\n  .announce { font-size: 11.5px; padding: 6px 10px; letter-spacing: 0; }\r\n  .announce a { padding: 7px 3px; margin: -7px 0; }\r\n  .announce .customrun { font-size: 10.5px; }\r\n  .item .ibody { padding: 10px 10px 12px; gap: 5px; }\r\n  /* Kartu HP dirampingkan: peringatan stok menipis (⚠️) juga disembunyikan di layar kecil */\r\n  .item .stocklow { display: none; }\r\n  .item h3 { font-size: 15px; }\r\n  .item .meta { font-size: 11.5px; }\r\n  .item .price .now { font-size: 20px; }\r\n  .item .price .was { font-size: 11px; display: block; margin-left: 0; }\r\n  .item .btn { font-size: 12px; padding: 12px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\r\n  .item .kilat > span { font-size: 10px; padding: 4px 6px; }\r\n  .item .kilat { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; gap: 4px;\r\n    -webkit-mask-image: linear-gradient(to right, #000 86%, rgba(0,0,0,0) 100%);\r\n    mask-image: linear-gradient(to right, #000 86%, rgba(0,0,0,0) 100%); }\r\n  .item .kilat::-webkit-scrollbar { display: none; }\r\n  .item .kilat > span { flex-shrink: 0; }\r\n  .kilat .vbadge i { width: 15px; height: 15px; font-size: 10px; }\r\n  .modal { width: 94vw; padding: 18px 16px; border-radius: 16px; }\r\n  .modal h2 { font-size: 20px; }\r\n  .serverbtn { min-width: 0; font-size: 13px; padding: 12px 14px; overflow-wrap: break-word; }\r\n  .mactions { flex-wrap: wrap; }\r\n}\r\n@media (min-width: 901px) {\r\n  .section { max-width: min(1640px, 97vw); padding: 52px 40px 8px; }\r\n  .itemgrid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }\r\n  .flashgrid { grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); }\r\n  .catgrid { grid-template-columns: repeat(auto-fill, minmax(205px, 1fr)); }\r\n  .banners { grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); }\r\n}\r\n@media (min-width: 2000px) {\r\n  .section { max-width: min(1900px, 97vw); }\r\n}\r\n@media (min-width: 901px) {\r\n  /* tombol keranjang: pil panjang bertulisan (desktop saja) */\r\n  .fab-main {\r\n    width: auto; min-width: 66px; height: 64px;\r\n    border-radius: 999px;\r\n    display: flex; align-items: center; gap: 12px;\r\n    padding: 0 26px; font-size: 26px;\r\n  }\r\n  .fab-main::after {\r\n    content: var(--fablabel, \"Keranjang\");\r\n    font-family: var(--font-poppins), sans-serif; font-weight: 700;\r\n    font-size: 16.5px; letter-spacing: .02em;\r\n  }\r\n  .fab-main b { top: -6px; right: -10px; min-width: 28px; height: 28px; font-size: 14px; }\r\n  /* foto Min Rock (ke WA): diperbesar */\r\n  .rockchat { bottom: calc(112px + env(safe-area-inset-bottom)); }\r\n  .rc-wrap, .rc-btn { width: 184px; height: 184px; }\r\n  #rcBubbleWrap { right: 20px; bottom: calc(112px + env(safe-area-inset-bottom) + 192px); }\r\n  .rc-bubble { font-size: 16px; max-width: 340px; padding: 13px 18px; }\r\n  /* bar bawah desktop: melebar sampai ujung kiri-kanan layar */\r\n  .botnav {\r\n    left: 0; right: 0; transform: none;\r\n    bottom: 0; width: 100%; max-width: none;\r\n    border-radius: 0; border: none;\r\n    padding: 10px 18px calc(10px + env(safe-area-inset-bottom));\r\n  }\r\n  /* banner auto-scroll di atas: penuh sampai ujung kiri-kanan */\r\n  .mega {\r\n    width: 100vw; max-width: 100vw;\r\n    margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw);\r\n    padding: 0;\r\n  }\r\n  body { overflow-x: hidden; }\r\n  /* tombol keranjang kiri-bawah: naik di atas bar bawah agar tidak tertutup */\r\n  .fab { bottom: 96px; left: 24px; }\r\n  /* hero utama: satu layar penuh + tulisan diperbesar (desktop saja) */\r\n  .hero {\r\n    max-width: min(1640px, 97vw);\r\n    min-height: 100vh;\r\n    gap: 60px;\r\n    padding: 40px 40px 50px;\r\n  }\r\n  .hero-kicker { font-size: clamp(12px, 1.15vw, 15px); padding: 9px 20px; }\r\n  .hero h1 { font-size: clamp(40px, 6vw, 78px); }\r\n  .hero p { font-size: clamp(16px, 1.55vw, 19.5px); max-width: 680px; }\r\n  .channel-link { font-size: clamp(14px, 1.4vw, 18px); }\r\n  .hero-cta .btn-primary, .hero-cta .btn-ghost { font-size: clamp(15px, 1.35vw, 17.5px); padding: 16px 30px; border-radius: 14px; }\r\n  .hero-visual img.hero-logo { width: min(320px, 80%); }\r\n  /* rapatkan: stats -> bagian katalog di bawahnya (naikkan semua) */\r\n  .stats { margin: 10px auto 0; max-width: min(1640px, 97vw); }\r\n  .section { padding-top: 26px; }\r\n}\r\n/* nav atas ringkas di lebar sedeng (901-1400): label panjang menyusut (…), tombol header lebih hemat tempat */\r\n@media (min-width: 901px) and (max-width: 1400px) {\r\n  .headnav { gap: 10px; }\r\n  .headnav a { font-size: 13.5px; padding: 9px 8px; }\r\n  .headnav a span { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n  .headicons { gap: 8px; }\r\n  .cartbtn { padding: 10px 13px; font-size: 13px; }\r\n}\r\n@media (min-width: 901px) and (max-width: 1140px) {\r\n  .brandshine { font-size: 12px; }\r\n  .headnav { gap: 6px; }\r\n  .headnav a span { max-width: 110px; }\r\n  .searchwrap { display: none !important; }\r\n  .headicons { gap: 6px; }\r\n}\r\n\r\n/* ===== Ticker Pita Berjalan (Skema Terpercaya) ===== */\r\n.trust-marquee {\r\n  width: 100vw;\r\n  max-width: 100vw;\r\n  margin-left: calc(50% - 50vw);\r\n  margin-right: calc(50% - 50vw);\r\n  overflow: hidden;\r\n  background: linear-gradient(90deg, rgba(6,9,19,0.92), rgba(27,47,130,0.45) 50%, rgba(6,9,19,0.92));\r\n  border-top: 1px solid rgba(111,139,255,0.22);\r\n  border-bottom: 1px solid rgba(111,139,255,0.22);\r\n  padding: 11px 0;\r\n  display: flex;\r\n  user-select: none;\r\n  margin-top: 16px;\r\n  margin-bottom: 6px;\r\n}\r\n.trust-track {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 32px;\r\n  white-space: nowrap;\r\n  animation: trustScroll 30s linear infinite;\r\n  will-change: transform;\r\n  transform: translate3d(0,0,0);\r\n}\r\n.trust-track:hover {\r\n  animation-play-state: paused;\r\n}\r\n.trust-item {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  font-size: 13.5px;\r\n  font-weight: 600;\r\n  color: #f2f5ff;\r\n  letter-spacing: 0.25px;\r\n}\r\n.trust-item b { color: #fff; }\r\n.trust-item .vstar { color: #ffd166; font-size: 14px; letter-spacing: 1px; }\r\n.trust-item .vbadge-mini {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 16px;\r\n  height: 16px;\r\n  border-radius: 50%;\r\n  background: #1d9bf0;\r\n  color: #fff;\r\n  font-size: 11px;\r\n  font-weight: 900;\r\n  box-shadow: 0 0 7px rgba(29,155,240,0.6);\r\n}\r\n.trust-dot { color: #6f8bff; opacity: 0.55; font-size: 13px; }\r\n@keyframes trustScroll {\r\n  from { transform: translate3d(0, 0, 0); }\r\n  to { transform: translate3d(-50%, 0, 0); }\r\n}\r\n" }} />
        {"\r\n"}

        {"\r\n"}
      </Head>
      {"\r\n\r\n"}
      <div id="loader">
        <img src="ROCKSTARLOGO.webp" srcSet="/optimized/ROCKSTARLOGO-220.webp 220w, /optimized/ROCKSTARLOGO-400.webp 400w, /ROCKSTARLOGO.webp 500w" sizes="110px" alt="Rockstar" width="110" height="110" />
        <div className="spin" />
      </div>
      {"\r\n\r\n"}
      <div className="topwrap">
        {"\r\n"}
        <div className="announce">
          <span className="run" data-i18n-html="run_html">
            {"⚡ Proses kilat • 💰 Harga termurah • Tiktok @rockstarstoree • "}
            <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">
              {"Join saluran WA"}
            </a>
            {" • ⚡ Proses kilat • 💰 Harga termurah • Tiktok @rockstarstoree • "}
            <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">
              {"Join saluran WA"}
            </a>
          </span>
          <span className="customrun" id="customrun" style={{ display: "none" }} />
        </div>
        {"\r\n\r\n"}
        <header>
          {"\r\n  "}
          <a className="brand" href="/" onClick={(event) => { goHome(); event.preventDefault(); return false; }} title="Rockstar.Store — Beranda" aria-label="Rockstar.Store — Beranda">
            <img src="ROCKSTARLOGO.webp" srcSet="/optimized/ROCKSTARLOGO-72.webp 72w, /optimized/ROCKSTARLOGO-220.webp 220w, /ROCKSTARLOGO.webp 500w" sizes="34px" alt="Rockstar.Store" width="34" height="34" />
            {" "}
            <span className="brandshine">
              {"ROCKSTAR.STORE"}
            </span>
          </a>
          {"\r\n  "}
          <nav className="headnav">
            {"\n    "}
            <a href="/" onClick={(event) => { goHome(); event.preventDefault(); return false; }}>
              {"🏠 "}
              <span data-i18n="nav_home">
                {"Beranda"}
              </span>
            </a>
            {"\n    "}
            <a href="/faq">
              {"❓ "}
              <span>
                {"FAQ"}
              </span>
            </a>
            {"\n    "}
            <a href="?tab=akun" onClick={(event) => { goToAkun(); event.preventDefault(); return false; }}>
              {"👤 "}
              <span data-i18n="nav_akun">
                {"Akun Sepuh"}
              </span>
            </a>
            {"\n    "}
            <a href="?tab=brainrot" onClick={(event) => { goToBrainrot(); event.preventDefault(); return false; }}>
              {"🧠 "}
              <span data-i18n="nav_brainrot_bn">
                {"Brainrot"}
              </span>
            </a>
            {"\r\n    "}
            <a href="?tab=joki" onClick={(event) => { goToJoki(); event.preventDefault(); return false; }}>
              {"🏆 "}
              <span data-i18n="nav_joki">
                {"Joki Sepuh"}
              </span>
            </a>
            {"\r\n  "}
          </nav>
          {"\r\n  "}
          <div className="searchwrap">
            <input type="text" id="searchInput" placeholder="Cari item, misal: moon bloom, robux..." data-i18n-ph="search_ph" autoComplete="off" onKeyDown={(event) => { if(event.key==='Enter')closeMnav() }} />
            <div id="searchSug" style={{ display: "none" }} />
          </div>
          {"\r\n  "}
          <div className="headicons">
            {"\r\n    "}
            <button className="cartbtn flashbtn" onClick={(event) => { goFlash() }}>
              <span data-i18n="flash_btn">
                {"⚡ Flash Sale"}
              </span>
            </button>
            {"\r\n    "}
            <button className="cartbtn" id="wishBtn" onClick={(event) => { openWishModal() }} style={{ background: "#6d28d9" }}>
              {"🤍 "}
              <small id="wishCount">
                {"0"}
              </small>
            </button>
            {"\r\n    "}
            <button className="cartbtn" onClick={(event) => { openCartModal() }}>
              <span data-i18n="cart">
                {"🛒 Keranjang"}
              </span>
              {" "}
              <small id="cartCount">
                {"0"}
              </small>
            </button>
            {"\r\n    "}
            <button className="cartbtn" id="langBtn" onClick={(event) => { toggleLangMenu(event) }} style={{ background: "#0e1628", border: "1px solid var(--line)" }}>
              {"Bahasa 🇮🇩"}
            </button>
            {"\r\n    "}
            <button className="cartbtn" id="curBtn" onClick={(event) => { toggleCurrencyMenu(event) }} style={{ background: "#0e1628", border: "1px solid var(--line)" }}>
              {"Mata Uang 🇮🇩"}
            </button>
            {"\r\n    "}
            <button className="burger" id="burgerBtn" onClick={(event) => { toggleMnav() }} aria-label="Buka menu">
              {"☰"}
            </button>
            {"\r\n  "}
          </div>
          {"\r\n"}
        </header>
        {"\r\n"}
      </div>
      {"\r\n"}
      <div className="mpanel" id="mnav">
        {"\n  "}
        <button className="mlink" onClick={(event) => { mnavGo(goHome) }}>
          <span className="lico">
            {"🏠"}
          </span>
          <span data-i18n="nav_home">
            {"Beranda"}
          </span>
        </button>
        {"\n  "}
        <a className="mlink" href="/faq" style={{ textDecoration: "none" }}>
          <span className="lico">
            {"❓"}
          </span>
          <span>
            {"FAQ & Cara Beli"}
          </span>
        </a>
        {"\n  "}
        <button className="mlink" onClick={(event) => { mnavGo(goToAkun) }}>
          <span className="lico">
            {"👤"}
          </span>
          <span data-i18n="nav_akun">
            {"Akun Sepuh"}
          </span>
        </button>
        {"\n  "}
        <button className="mlink" onClick={(event) => { mnavGo(goToBrainrot) }}>
          <span className="lico">
            {"🧠"}
          </span>
          <span data-i18n="cat_brainrot">
            {"Katalog Brainrot"}
          </span>
        </button>
        {"\r\n  "}
        <button className="mlink" onClick={(event) => { mnavGo(goToTopUp) }}>
          <span className="lico">
            {"💎"}
          </span>
          <span data-i18n="nav_topup">
            {"Top Up Robux"}
          </span>
        </button>
        {"\r\n  "}
        <button className="mlink" onClick={(event) => { mnavGo(goToJoki) }}>
          <span className="lico">
            {"🏆"}
          </span>
          <span data-i18n="nav_joki">
            {"Joki Sepuh"}
          </span>
        </button>
        {"\r\n  "}
        <button className="mlink" onClick={(event) => { mnavGo(goFlash) }}>
          <span className="lico">
            {"⚡"}
          </span>
          <span data-i18n="flash_btn">
            {"Flash Sale"}
          </span>
        </button>
        {"\r\n  "}
        <button className="mlink" onClick={(event) => { mnavGo(() => window.openTestimoniGallery?.()) }}>
          <span className="lico">
            {"⭐"}
          </span>
          <span data-i18n="nav_testi">
            {"Testimoni"}
          </span>
        </button>
        {"\r\n  "}
        <div className="mnrow">
          {"\r\n    "}
          <button className="cartbtn" onClick={(event) => { mnavGo(openCartModal) }}>
            <span data-i18n="cart">
              {"🛒 Keranjang"}
            </span>
            {" "}
            <small id="mnavCartCount">
              {"0"}
            </small>
          </button>
          {"\r\n    "}
          <button className="cartbtn" onClick={(event) => { mnavGo(openWishModal) }} style={{ background: "#6d28d9" }}>
            {"🤍 "}
            <small id="mnavWishCount">
              {"0"}
            </small>
          </button>
          {"\r\n  "}
        </div>
        {"\r\n  "}
        <button className="cartbtn" id="mnavLang" onClick={(event) => { toggleLangMenu(event) }} style={{ background: "#0e1628", border: "1px solid var(--line)", justifyContent: "center" }}>
          {"Bahasa 🇮🇩"}
        </button>
        {"\r\n  "}
        <button className="cartbtn" id="mnavCur" onClick={(event) => { toggleCurrencyMenu(event) }} style={{ background: "#0e1628", border: "1px solid var(--line)", justifyContent: "center" }}>
          {"Mata Uang 🇮🇩"}
        </button>
        {"\r\n  "}
        <button type="button" className="mnote" data-i18n-html="rc_bub" onClick={(event) => { closeMnav();openWaChat(); }}>
          {"Butuh bantuan? Chat "}
          <b>
            {"Min Rock"}
          </b>
          {" aja 💬"}
        </button>
        {"\r\n"}
      </div>
      {"\r\n\r\n"}
      <MegaSlider />
      <section className="hero">
        {"\r\n  "}
        <div className="hero-text">
          {"\r\n    "}
          <span className="hero-kicker" data-i18n="kicker">
            {"#1 STORE BRAINROT TERLENGKAP DI INDONESIA DAN MALAYSIA"}
          </span>
          {"\r\n    "}
          <h1 data-i18n-html="hero_h1">
            {"SOLUSI SEPUH "}
            <span>
              {"ROBLOX"}
            </span>
            {" KAMU 🇮🇩🇲🇾"}
          </h1>
          {"\r\n    "}
      <p data-i18n-html="hero_p">
        {"Rockstar Store menyediakan brainrot "}
        <b style={{ color: "var(--blue2)" }}>premium</b>
        {", akun "}
        <b style={{ color: "var(--blue2)" }}>premium</b>
        {", dan jasa joki "}
        <b style={{ color: "var(--blue2)" }}>profesional</b>
        {" yang bikin Roblox-mu makin "}
        <b style={{ color: "var(--blue2)" }}>sepuh</b>
        {" dan berkelas "}
        <b style={{ color: "var(--blue2)" }}>
          {"sultan"}
        </b>
        {", serta membantumu "}
        <b style={{ color: "var(--blue2)" }}>menang</b>
        {" di setiap map yang kamu mainkan. Sudah pasti bikin temanmu iri dan kepanasan. "}
        <b style={{ color: "var(--blue2)" }}>
          {"Waktunya naik kelas dan mendominasi setiap permainan! 🚀"}
        </b>
      </p>
      {"\r\n    "}
      <a className="channel-link" href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank" rel="noopener" data-i18n="channel">
        {"📢 Join Saluran WhatsApp"}
      </a>
      {"\r\n    "}
      <div className="hero-cta">
        {"\r\n      "}
        <button id="ctaBrainrot" className="btn-primary" onClick={(event) => { goToBrainrot() }} data-i18n="cta_brainrot">
          {"Katalog Brainrot 🧠"}
        </button>
        {"\r\n      "}
        <button id="ctaTopup" className="btn-ghost" onClick={(event) => { goToTopUp() }} data-i18n="cta_topup">
          {"Top Up Robux 💰"}
        </button>
        {"\r\n      "}
        <button id="ctaAkun" className="btn-ghost" onClick={(event) => { goToAkun() }} data-i18n="cta_akun">
          {"Katalog Akun 👤"}
        </button>
        {"\r\n      "}
        <button id="ctaJoki" className="btn-ghost" onClick={(event) => { goToJoki() }} data-i18n="cta_joki">
          {"Joki 🎮"}
        </button>
        {"\r\n    "}
      </div>
      {"\r\n  "}
        </div>
      {"\r\n  "}
      <div className="hero-visual">
        <img className="hero-logo" src="ROCKSTARLOGO.webp" srcSet="/optimized/ROCKSTARLOGO-220.webp 220w, /optimized/ROCKSTARLOGO-400.webp 400w, /ROCKSTARLOGO.webp 500w" sizes="200px" alt="Rockstar.Store" width="500" height="500" fetchPriority="high" decoding="async" />
      </div>
      </section>
      {"\r\n"}
      {"\r\n\r\n"}
      <div className="trust-marquee" aria-label="Informasi Toko Terpercaya">
        {"\r\n  "}
        <div className="trust-track">
          {"\r\n    "}
          <div className="trust-item">
            <span className="vstar">
              {"⭐⭐⭐⭐⭐"}
            </span>
            {" "}
            <b>
              {"4.9/5.0 Rating"}
            </b>
            {" "}
            <span data-i18n="tm1">
              {"(100K+ Ulasan Pembeli)"}
            </span>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"⚡ "}
            <b data-i18n="tm2">
              {"Top Up Robux Kilat & Aman"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"🧠 "}
            <b data-i18n="tm3">
              {"Item & Pet Brainrot Sepuh"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"👤 "}
            <b data-i18n="tm4">
              {"Akun Sepuh Roblox"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"📦 "}
            <b data-i18n="tm5">
              {"Stok Selalu Premium"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"🛡️ "}
            <b data-i18n="tm6">
              {"SAFE 100%"}
            </b>
            {" "}
            <b data-i18n="tm7">
              {"PROSES KILAT ⚡"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            <span className="vstar">
              {"⭐⭐⭐⭐⭐"}
            </span>
            {" "}
            <b>
              {"4.9/5.0 Rating"}
            </b>
            {" "}
            <span data-i18n="tm1">
              {"(100K+ Ulasan Pembeli)"}
            </span>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"⚡ "}
            <b data-i18n="tm2">
              {"Top Up Robux Kilat & Aman"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"🧠 "}
            <b data-i18n="tm3">
              {"Item & Pet Brainrot Sepuh"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"👤 "}
            <b data-i18n="tm4">
              {"Akun Sepuh Roblox"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"📦 "}
            <b data-i18n="tm5">
              {"Stok Selalu Premium"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n    "}
          <div className="trust-item">
            {"🛡️ "}
            <b data-i18n="tm6">
              {"SAFE 100%"}
            </b>
            {" "}
            <b data-i18n="tm7">
              {"PROSES KILAT ⚡"}
            </b>
          </div>
          {"\r\n    "}
          <span className="trust-dot">
            {"•"}
          </span>
          {"\r\n  "}
        </div>
        {"\r\n"}
      </div>
      {"\r\n\r\n"}
      <section className="hot-product-banner" id="hotProductBanner" aria-labelledby="hotProductTitle">
        <div className="hot-product-heading">
          <h2 id="hotProductTitle">{"HOT PRODUCT"}</h2>
          <span aria-hidden="true">{"🔥"}</span>
        </div>
        <div className="hot-product-window" aria-label="Produk terpopuler">
          <div className="hot-product-track" id="hotProductTrack" aria-live="polite">
            {hotProducts?.length ? [false, true].map((isClone) => (
              <div className="hot-product-group" aria-hidden={isClone || undefined} key={isClone ? "clone" : "products"}>
                {hotProducts.map((product, index) => (
                  <a
                    className="hot-product-card"
                    href={`/?q=${encodeURIComponent(product.name)}`}
                    aria-label={`${product.name}, Rp ${Number(product.price).toLocaleString("id-ID")}`}
                    tabIndex={isClone ? -1 : 0}
                    key={`${isClone ? "clone-" : ""}${product.name}-${index}`}
                  >
                    <img
                      src={product.thumbnail || product.image}
                      data-fallback={product.fallbackThumbnail !== product.thumbnail ? product.fallbackThumbnail : ""}
                      data-full={product.image !== product.fallbackThumbnail ? product.image : ""}
                      alt=""
                      width={68}
                      height={68}
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        const image = event.currentTarget;
                        const fallback = image.dataset.fallback;
                        image.dataset.fallback = "";
                        if (fallback && image.getAttribute("src") !== fallback) {
                          image.src = fallback;
                          return;
                        }
                        const fullImage = image.dataset.full;
                        image.dataset.full = "";
                        if (fullImage && image.getAttribute("src") !== fullImage) {
                          image.src = fullImage;
                          return;
                        }
                        image.onerror = null;
                        image.src = "/ROCKSTARLOGO.webp";
                      }}
                    />
                    <span className="hot-product-info">
                      <span className="hot-product-name">{product.name}</span>
                      <span className="hot-product-meta">
                        {product.clicks > 0 ? `🔥 ${product.clicks}x · ` : "🔥 Hot product · "}Rp {Number(product.price).toLocaleString("id-ID")}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            )) : <div className="hot-product-message">{"Memuat produk populer…"}</div>}
          </div>
        </div>
      </section>
      {"\r\n\r\n"}
      {"\r\n\r\n"}
      {"\r\n\r\n"}
      <main className="section">
        {"\r\n  "}
        <div id="pageTitle" />
        {"\r\n  "}
        <div id="products" />
        {"\r\n  "}
        <noscript>
          {"\r\n    "}
          <div style={{ padding: "16px", color: "#8b96b3", lineHeight: "1.8" }}>
            {"\r\n      "}
          </div>
          <p>
            <b style={{ color: "#fff" }}>
              {"Rockstar.Store"}
            </b>
            {" — top up Robux, item Brainrot & akun Roblox premium. Proses kilat, aman 100%."}
          </p>
          {"\r\n      "}
          <p>
            {"Aktifkan JavaScript untuk belanja, atau buka katalog langsung:"}
          </p>
          {"\r\n      "}
          {"\r\n      "}
          <ul>
            {"\r\n        "}
            <li>
              <a href="/?tab=brainrot" style={{ color: "#6f8bff" }}>
                {"Katalog Brainrot"}
              </a>
              {" — KOTAK GULUNG UNTUK BRAINROT, Grow A Garden 2, drill, LEMPAR KOIN, DADU ANIME, NAIK DAN JATUHKAN BLOCK KEBERUNTUNGAN, dll."}
            </li>
            {"\r\n        "}
            <li>
              <a href="/?tab=topup" style={{ color: "#6f8bff" }}>
                {"Top Up Robux"}
              </a>
              {" — 160/240/320/500+ Robux via login."}
            </li>
            {"\r\n        "}
            <li>
              <a href="/?tab=akun" style={{ color: "#6f8bff" }}>
                {"Katalog Akun"}
              </a>
              {" — akun sepuh siap pakai."}
            </li>
            {"\r\n        "}
            <li>
              <a href="/?tab=joki" style={{ color: "#6f8bff" }}>
                {"Joki"}
              </a>
              {" — jasa leveling & login."}
            </li>
            {"\r\n      "}
          </ul>
          {"\r\n      "}
          {"\r\n    "}
          {"\r\n  "}
        </noscript>
        {"\r\n"}
      </main>
      {"\r\n\r\n"}
      <div id="pwaBar">
        <span id="pwaTxt" />
        <button className="go" id="pwaBtn" style={{ display: "none" }} onClick={(event) => { pwaInstall() }}>
          {"Install 📲"}
        </button>
        <button className="x" onClick={(event) => { hidePwaBar() }}>
          {"✕"}
        </button>
      </div>
      {"\r\n"}
      <nav className="botnav" id="botnav">
        {"\r\n  "}
        <button className="bnitem" data-page="home" onClick={(event) => { bnGo('home') }} title="Beranda">
          <span className="bnico">
            {"🏠"}
          </span>
          <span className="bnlbl" data-i18n="nav_home">
            {"Beranda"}
          </span>
        </button>
        {"\r\n  "}
        <button className="bnitem" data-page="akun" onClick={(event) => { bnGo('akun') }} title="Beli Akun Sepuh Roblox">
          <span className="bnico">
            {"👤"}
          </span>
          <span className="bnlbl" data-i18n="nav_akun_bn">
            {"Akun Sepuh"}
          </span>
        </button>
        {"\r\n  "}
        <button className="bnitem" data-page="brainrot" onClick={(event) => { bnGo('brainrot') }} title="Brainrot">
          <span className="bnico">
            {"🧠"}
          </span>
          <span className="bnlbl" data-i18n="nav_brainrot_bn">
            {"Brainrot"}
          </span>
        </button>
        {"\r\n  "}
        <button className="bnitem flash" data-page="flash" onClick={(event) => { goFlash() }} title="Flash Sale">
          <span className="bnico">
            {"⚡"}
          </span>
          <span className="bnlbl" data-i18n="nav_flash_bn">
            {"Flash Sale"}
          </span>
        </button>
        {"\r\n  "}
        <button className="bnitem" data-page="joki" onClick={(event) => { bnGo('joki') }} title="Joki Sepuh Roblox">
          <span className="bnico">
            {"🏆"}
          </span>
          <span className="bnlbl" data-i18n="nav_joki_bn">
            {"Joki Sepuh"}
          </span>
        </button>
        {"\r\n  "}
        <button className="bnitem" data-page="faq" onClick={(event) => { bnGo('faq') }} title="FAQ">
          <span className="bnico">
            {"❓"}
          </span>
          <span className="bnlbl">
            {"FAQ"}
          </span>
        </button>
        {"\r\n  "}
        <div className="wapop" id="testiPop" style={{ display: "none" }}>
          {"\r\n    "}
          <div className="watext">
            <b data-i18n="testi_t">
              {"⭐ Testimoni Customer"}
            </b>
            <span data-i18n="testi_x">
              {"100K+ testimoni amanah, klik tombol di bawah untuk lihat di saluran WA"}
            </span>
          </div>
          {"\r\n    "}
          <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank" rel="noopener" data-i18n="testi_btn">
            {"Lihat Testimoni"}
          </a>
          {"\r\n  "}
        </div>
        {"\r\n"}
      </nav>
      {"\r\n\r\n"}
      <div className="fab">
        {"\r\n  "}
        <button className="fab-main" onClick={(event) => { openCartModal() }}>
          {"🛒"}
          <b id="total">
            {"0"}
          </b>
        </button>
        {"\r\n"}
      </div>
      {"\r\n\r\n"}
      <div className="rockchat" id="rockchat">
        {"\r\n\r\n  "}
        <div id="rcBubbleWrap">
          <div className="rc-bubble" id="rcBubble" onClick={(event) => { openWaChat() }} title="Chat WhatsApp Min Rock">
            <span data-i18n-html="rc_bub">
              {"Butuh bantuan? Chat "}
              <b>
                {"Min Rock"}
              </b>
              {" aja 💬"}
            </span>
          </div>
        </div>
        {"\r\n  "}
        <div className="rc-wrap">
          {"\r\n    "}
          <span className="rc-ring" />
          {"\r\n    "}
          <span className="rc-ring rc-d2" />
          {"\r\n    "}
          <button className="rc-btn" id="waBtn" onClick={(event) => { openWaChat() }} aria-label="Chat WhatsApp Min Rock" title="Chat Min Rock di WhatsApp">
            {"\r\n      "}
            <img src="figur-8064.webp" srcSet="/optimized/figur-8064-220.webp 220w, /figur-8064.webp 524w" sizes="110px" alt="Min Rock" width="110" height="110" loading="lazy" />
            {"\r\n    "}
          </button>
          {"\r\n  "}
        </div>
        {"\r\n  "}
        <div className="wapop wachat" id="waPop" style={{ display: "none" }}>
          {"\r\n    "}
          <div className="wachead">
            {"\r\n      "}
            <span className="walogo">
              <img src="figur-8064.webp" srcSet="/optimized/figur-8064-220.webp 220w, /figur-8064.webp 524w" sizes="40px" alt="Min Rock" width="110" height="110" loading="lazy" onError={(event) => { event.currentTarget.style.display='none';event.currentTarget.parentNode.classList.add('nolabel'); }} />
            </span>
            {"\r\n      "}
            <div>
              <b>
                {"Rockstar Support"}
              </b>
              <span className="waonline">
                <i />
                <span data-i18n="wa_online">
                  {"Online"}
                </span>
              </span>
            </div>
            {"\r\n      "}
            <button className="wax" onClick={(event) => { toggleWaPop() }} aria-label="Tutup">
              {"✕"}
            </button>
            {"\r\n    "}
          </div>
          {"\r\n    "}
          <div className="wabody" id="waBody" />
          {"\r\n    "}
          <div className="wainput">
            {"\r\n      "}
            <input type="text" id="waChatInput" data-i18n-ph="wa_ph" placeholder="Ketik pesan..." onKeyDown={(event) => { if(event.key==='Enter')waSend() }} />
            {"\r\n      "}
            <button onClick={(event) => { waSend() }} aria-label="Kirim">
              {"➤"}
            </button>
            {"\r\n    "}
          </div>
          {"\r\n  "}
        </div>
        {"\r\n"}
      </div>
      {"\r\n\r\n"}
      <div className="overlay" id="serverModal">
        {"\r\n  "}
        <div className="modal">
          {"\r\n    "}
          <h2 data-i18n="server_t">
            {"🔗 Link Server Rock Star"}
          </h2>
          {"\r\n    "}
        </div>
        <p style={{ color: "var(--mut)", fontSize: "13.5px", margin: "0 0 14px" }} data-i18n="server_sub">
          {"Klik server untuk join langsung dari Roblox"}
        </p>
        {"\r\n    "}
        <div className="serverbtns" style={{ flexDirection: "column" }}>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=6caff481af8f144eb47162f2e1a3e2eb&type=Server" target="_blank" rel="noopener">
            {"🎲 Server Kotak Gulung untuk Brainrot"}
          </a>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=7268a4699798254193752fa24104e7f7&type=Server" target="_blank" rel="noopener">
            {"🍂 Server Fall for Brainrot"}
          </a>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=f0a1cedc6be4f041a22d1079ca713f2d&type=Server" target="_blank" rel="noopener">
            {"🪙 Server Lempar Koin"}
          </a>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=41a39158889f0f40a1ba639898c22c9f&type=Server" target="_blank" rel="noopener">
            {"🌱 Server Grow A Garden 2"}
          </a>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=592596d70f7d1044ae692f625524368e&type=Server" target="_blank" rel="noopener">
            {"🐔 Server Tarik Telur"}
          </a>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=555c4557fd120c4ab3a050b2116a2e6c&type=Server" target="_blank" rel="noopener">
            {"🎲 Server Dadu Anime"}
          </a>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=33212d5bded8e24e8e290f40fd34b8cf&type=Server" target="_blank" rel="noopener">
            {"🥊 Server Boxing for Brainrot"}
          </a>
          {"\r\n      "}
          <a className="serverbtn" href="https://www.roblox.com/share?code=a6e16fde64c68d4c85e7f68dc5596eda&type=Server" target="_blank" rel="noopener">
            {"🧠 Server Become Brainrot"}
          </a>
          {"\r\n    "}
        </div>
        {"\r\n    "}
        <div className="mactions">
          {"\r\n      "}
          <button className="ghost" onClick={(event) => { closeServerModal() }} data-i18n="tutup">
            {"Tutup"}
          </button>
          {"\r\n    "}
        </div>
        {"\r\n  "}
      </div>
      {"\r\n"}
      {"\r\n\r\n"}
      <div className="overlay" id="cartModal">
        {"\r\n  "}
        <div className="modal">
          {"\r\n    "}
          <h2 data-i18n="cart_title">
            {"📋 Keranjang Saya"}
          </h2>
          {"\r\n    "}
          <div id="cartList" />
          {"\r\n    "}
          <div className="mactions">
            {"\r\n      "}
            <button className="ghost" onClick={(event) => { closeCartModal() }} data-i18n="lanjut">
              {"Lanjut Belanja"}
            </button>
            {"\r\n      "}
            <button className="go" onClick={(event) => { checkout() }} data-i18n="checkout">
              {"Checkout"}
            </button>
            {"\r\n    "}
          </div>
          {"\r\n  "}
        </div>
        {"\r\n"}
      </div>
      {"\r\n\r\n"}
      <div className="overlay" id="wishModal">
        {"\r\n  "}
        <div className="modal">
          {"\r\n    "}
          <h2 data-i18n="wish_title">
            {"❤️ Wishlist Saya"}
          </h2>
          {"\r\n    "}
          <div id="wishList" />
          {"\r\n    "}
          <div className="mactions">
            {"\r\n      "}
            <button className="ghost" onClick={(event) => { closeWishModal() }} data-i18n="tutup">
              {"Tutup"}
            </button>
            {"\r\n    "}
          </div>
          {"\r\n  "}
        </div>
        {"\r\n"}
      </div>
      {"\r\n\r\n"}
      <div className="overlay" id="detailModal" onClick={(event) => { if(event.target.id==='detailModal')closeDetail() }}>
        {"\r\n  "}
        <div className="modal" id="detailBox" style={{ width: "min(640px,94vw)" }} />
        {"\r\n"}
      </div>
      {"\r\n\r\n"}
      <section className="section server-cta" id="serverCta">
        {"\n  "}
        <a className="ava-big" href="#server" onClick={(event) => { openServerModal(); event.preventDefault(); return false; }} title="Lihat Link Server">
          <img src="ROCKSTAR AVATAR.webp?v=2" srcSet="/optimized/ROCKSTAR AVATAR-280.webp 280w, /optimized/ROCKSTAR AVATAR-560.webp 560w, /ROCKSTAR AVATAR.webp?v=2 581w" sizes="(max-width: 600px) 110px, 278px" alt="Rockstar Avatar - Link Server" width="581" height="583" loading="lazy" decoding="async" />
        </a>
        {"\n  "}
        <div className="ava-caption">
          <span className="finger">
            {"👆"}
          </span>
          <br />
          {"KLIK AVA ROCKSTAR"}
          <br />
          {"BUAT MASUK "}
          <b>
            {"PRIVAT SERVER MABAR GRATIS"}
          </b>
        </div>
        {"\n"}
      </section>
      {"\n\n"}
      <section className="section testi-cta-section" aria-label="Testimoni pelanggan">
        <button className="testimoni-cta" type="button" onClick={() => window.openTestimoniGallery?.()}>
          {"LIHAT SEMUA TESTIMONI →"}
        </button>
      </section>
      <div
        className="overlay"
        id="testimoniModal"
        onClick={(event) => { if (event.target.id === "testimoniModal") window.closeTestimoniGallery?.(); }}
      >
        <div className="modal testimoni-modal" role="dialog" aria-modal="true" aria-labelledby="testimoniModalTitle">
          <div className="testimoni-modal-head">
            <h2 id="testimoniModalTitle">{"⭐ Testimoni Customer"}</h2>
            <button className="ghost" type="button" onClick={() => window.closeTestimoniGallery?.()}>
              {"Tutup"}
            </button>
          </div>
          <p className="testimoni-channel">
            {"Testimoni lengkap dan update terbaru tersedia di Saluran WhatsApp Rockstar.Store. "}
            <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank" rel="noopener noreferrer">
              {"Join saluran →"}
            </a>
          </p>
          <div id="testimoniGalleryContent">
            <p id="testimoniGalleryStatus" className="hint" aria-live="polite">{"Memuat foto testimoni..."}</p>
            <div id="testimoniGalleryGrid" className="testimoni-grid" />
            <button
              id="testimoniGalleryMore"
              className="ghost testimoni-more"
              type="button"
              style={{ display: "none" }}
              onClick={() => window.loadMoreTestimoni?.()}
            >
              {"Muat foto lainnya"}
            </button>
          </div>
          <div id="testimoniPhotoViewer" style={{ display: "none" }}>
            <div className="testimoni-viewer-actions">
              <button className="ghost" type="button" onClick={() => window.returnToTestimoniGallery?.()}>
                {"← Kembali ke galeri"}
              </button>
            </div>
            <img id="testimoniPhotoViewerImage" className="testimoni-viewer-photo" alt="Foto testimoni ukuran penuh" />
          </div>
        </div>
      </div>
      {"\n\n"}
      <section className="section faq-section" id="faq" aria-labelledby="faqTitle">
        {"\n  "}
        <h2 className="faq-title" id="faqTitle">
          {"PERTANYAAN UMUM (FAQ)"}
        </h2>
        {"\n  "}
        <div className="faq-list">
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Di mana saya bisa melihat testimoni customer?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Buka "}
              <a href="#testimoniModal" onClick={(event) => { event.preventDefault(); window.openTestimoniGallery?.(); }}>
                {"galeri foto testimoni lengkap"}
              </a>
              {" atau "}
              <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank" rel="noopener noreferrer">
                {"join Saluran WhatsApp Rockstar.Store"}
              </a>
              {" untuk melihat testimoni dan update terbaru."}
            </div>
            {"\n    "}
          </details>
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Apa saja yang bisa dibeli di Rockstar.Store?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Tersedia Top Up Robux, item dan pet Brainrot, akun Roblox, serta jasa joki untuk berbagai map."}
            </div>
            {"\n    "}
          </details>
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Kenapa harus beli di Rockstar.Store?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Rockstar.Store menyediakan Top Up Robux, akun sepuh Roblox, Brainrot/pet sepuh, serta jasa joki profesional dalam satu tempat. Kami menghadirkan produk berkualitas terbaik dan premium, serta selalu mengutamakan keamanan akun. Kamu dapat melihat detail, harga, dan ketersediaan produk sebelum memesan. Pesanan diteruskan ke admin melalui WhatsApp agar item dan total pembayaran dapat dikonfirmasi terlebih dahulu. Siap menjadi sepuh Roblox dan mendominasi permainan bersama Rockstar.Store!"}
            </div>
            {"\n    "}
          </details>
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Bagaimana cara order?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Pilih produk, tambahkan ke keranjang, lalu tekan Checkout. Periksa ringkasan pesanan dan pilih "}
              <b>
                {"Kirim ke Admin"}
              </b>
              {" supaya WhatsApp terbuka dengan detail order. "}
              <a href="/faq">
                {"Lihat panduan cara beli bergambar."}
              </a>
            </div>
            {"\n    "}
          </details>
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Bagaimana cara cek status pesanan saya?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Balas chat WhatsApp yang digunakan untuk mengirim pesanan dan tanyakan pembaruannya. Sertakan nama item atau ringkasan order agar admin lebih mudah membantu."}
            </div>
            {"\n    "}
          </details>
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Apa saja metode pembayarannya?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Pembayaran tersedia melalui QRIS, GoPay, DANA, ShopeePay, OVO, All Bank, dan Binance Pay. Konfirmasikan metode serta jumlah akhir kepada admin sebelum membayar, lalu kirim bukti pembayaran melalui WhatsApp."}
            </div>
            {"\n    "}
          </details>
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Kenapa total pembayaran bisa berbeda dari harga produk?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Keranjang menjumlahkan harga produk yang dipilih. Jika ada biaya dari metode pembayaran, admin akan mengonfirmasi jumlah akhir sebelum pembayaran dilakukan."}
            </div>
            {"\n    "}
          </details>
          {"\n    "}
          <details className="faq-item">
            {"\n      "}
            <summary>
              {"Kapan item dikirim?"}
            </summary>
            {"\n      "}
            <div className="faq-answer">
              {"Setelah pembayaran dikonfirmasi, admin akan mengirim item di dalam game dan memberi petunjuk bila diperlukan."}
            </div>
            {"\n    "}
          </details>
          {"\n  "}
        </div>
        {"\n"}
      </section>
      {"\n\n"}
      <PaymentMethods />
      {"\n\n"}
      <SiteFooter />
      {"\n\r\n"}
      {"\r\n\r\n"}
      <PageScripts sources={pageScripts} />
    </>
  );
}
