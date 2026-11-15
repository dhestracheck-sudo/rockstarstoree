import Head from 'next/head';

import PageScripts from '../components/PageScripts';

import MegaSlider from '../components/MegaSlider';

import PaymentMethods from '../components/PaymentMethods';

import SiteFooter from '../components/SiteFooter';
import HomeArticles from '../components/HomeArticles';
import { fetchTableCatalog, formatRupiah } from '../lib/catalog-ssr';
import { HOME_INLINE_CSS } from '../lib/home-inline-css.generated';



const pageScripts = ["/site-scripts/home-02.js?v=20261115ps", "/site-scripts/home-03.js?v=20261115ps", "/site-scripts/home-04.js?v=20261115ps", "/site-scripts/home-05.js?v=20261115ps", "/site-scripts/home-06.js?v=20261115ps", "/site-scripts/home-07.js?v=20261115ps", "/site-scripts/home-08-lang.js?v=20261115ps", "/site-scripts/home-08.js?v=20261115ps", "/site-scripts/backnav-01.js?v=20261115ps", "/site-scripts/confetti-01.js?v=20261115ps", "/site-scripts/dopamine-booster.js?v=20261115ps"];



const SEO_PAGES = {

  home: {

    title: "Rockstar.Store | Solusi Sepuh Roblox",

    description: "Solusi sepuh Roblox di Rockstar.Store! Tersedia akun Roblox sepuh, item Brainrot, jasa joki, dan kebutuhan Roblox lengkap. Lihat pilihan produk, harga, dan cara pemesanan.",

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



const SEED_HOT_PRODUCTS = [

  {

    name: "AKUN SEPUH BREAK AND STEAL AN EGG 002",

    tab: "akun",

    price: 139000,

    image: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792486812931_340227_Screenshot_2026-10-20_155816.webp",

    thumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792486812931_340227_Screenshot_2026-10-20_155816.webp",

    fallbackThumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792486812931_340227_Screenshot_2026-10-20_155816.webp",

    clicks: 125,

    views: 246,

    sold: 0,

    stock: 1,

    isMarkedSoldOut: false

  },

  {

    name: "AKUN SEPUH STEAL AN EGG 058",

    tab: "akun",

    price: 100000,

    image: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792339090613_704356_Screenshot_2026-10-18_225632.webp",

    thumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792339090613_704356_Screenshot_2026-10-18_225632.webp",

    fallbackThumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792339090613_704356_Screenshot_2026-10-18_225632.webp",

    clicks: 78,

    views: 464,

    sold: 0,

    stock: 1,

    isMarkedSoldOut: false

  },

  {

    name: "AKUN SEPUH STEAL AN EGG 059",

    tab: "akun",

    price: 189000,

    image: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792395560518_599682_Screenshot_2026-10-19_143308.webp",

    thumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792395560518_599682_Screenshot_2026-10-19_143308.webp",

    fallbackThumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792395560518_599682_Screenshot_2026-10-19_143308.webp",

    clicks: 77,

    views: 399,

    sold: 0,

    stock: 1,

    isMarkedSoldOut: false

  },

  {

    name: "1 PET RAINBOW VOLCANIC DEVIL 3,5M/S+",

    tab: "brainrot",

    price: 10000,

    image: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792588699534_Screenshot_2026-10-21_201543.webp",

    thumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792588699534_Screenshot_2026-10-21_201543.webp",

    fallbackThumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792588699534_Screenshot_2026-10-21_201543.webp",

    clicks: 45,

    views: 90,

    sold: 0,

    stock: 10,

    isMarkedSoldOut: false

  },

  {

    name: "Game pass ALL GAME- 1 ROBUX (CONTOH BELI GAMEPAS 86 ROBUX BERARTI 86 X 150RP)",

    tab: "topup",

    price: 150,

    image: "/ROBUX.webp",

    thumbnail: "/ROBUX.webp",

    fallbackThumbnail: "/ROBUX.webp",

    clicks: 39,

    views: 0,

    sold: 0,

    stock: 999,

    isMarkedSoldOut: false

  },

  {

    name: "DADU ANIME - 1 UNIT ANIME 4,2 QI/S+",

    tab: "brainrot",

    price: 20000,

    image: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792585055304_Screenshot_2026-10-21_191657.webp",

    thumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792585055304_Screenshot_2026-10-21_191657.webp",

    fallbackThumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792585055304_Screenshot_2026-10-21_191657.webp",

    clicks: 32,

    views: 686,

    sold: 14,

    stock: 5,

    isMarkedSoldOut: false

  },

  {

    name: "AKUN SEPUH STEAL AN EGG 060",

    tab: "akun",

    price: 159000,

    image: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792423452355_137999_Screenshot_2026-10-19_222141.webp",

    thumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792423452355_137999_Screenshot_2026-10-19_222141.webp",

    fallbackThumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1792423452355_137999_Screenshot_2026-10-19_222141.webp",

    clicks: 27,

    views: 293,

    sold: 0,

    stock: 1,

    isMarkedSoldOut: false

  },

  {

    name: "JOKI AMBILIN PET PALING UJUNG MINIMAL 100B/S+",

    tab: "joki",

    price: 20000,

    image: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1793167490788_Screenshot_2026-10-20_220530.webp",

    thumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1793167490788_Screenshot_2026-10-20_220530.webp",

    fallbackThumbnail: "https://mvzlmjgfctdxnjxveuoo.supabase.co/storage/v1/object/public/foto/1793167490788_Screenshot_2026-10-20_220530.webp",

    clicks: 19,

    views: 57,

    sold: 247,

    stock: 999,

    isMarkedSoldOut: false

  }

].map((item) => ({
  ...item,
  thumbnail: getProductImageVariant(item.image, "tiny"),
  fallbackThumbnail: getProductImageVariant(item.image, "thumb"),
}));



let hotProductsCache = {

  data: SEED_HOT_PRODUCTS,

  timestamp: 0,

};

let isFetchingHot = false;



async function getCachedHotProducts() {

  const now = Date.now();

  // 1. Fresh cache (< 90 detik): langsung kembalikan dari memori Worker (0ms)

  if (now - hotProductsCache.timestamp < 300_000) {

    return hotProductsCache.data;

  }

  // 2. Data tersedia (termasuk snapshot awal): langsung kirim ke user (0ms wait)

  // dan perbarui data paling segar dari Supabase di latar belakang

  if (hotProductsCache.data && hotProductsCache.data.length > 0) {

    if (!isFetchingHot) {

      isFetchingHot = true;

      getInitialHotProducts()

        .then((fresh) => {

          if (Array.isArray(fresh) && fresh.length) {

            hotProductsCache = { data: fresh, timestamp: Date.now() };

          }

        })

        .catch(() => {})

        .finally(() => { isFetchingHot = false; });

    }

    return hotProductsCache.data;

  }

  // 3. Cadangan ekstrem jika data kosong

  try {

    const fresh = await getInitialHotProducts();

    if (Array.isArray(fresh) && fresh.length) {

      hotProductsCache = { data: fresh, timestamp: Date.now() };

    }

    return hotProductsCache.data || fresh;

  } catch {

    return hotProductsCache.data || SEED_HOT_PRODUCTS;

  }

}



const categoryProductsCache = new Map();



async function getCachedCategoryProducts(tab, category, limit = 24) {

  const key = `${tab}:${category}:${limit}`;

  const cached = categoryProductsCache.get(key);

  const now = Date.now();

  if (cached && (now - cached.timestamp < 300_000)) {

    return cached.data;

  }

  if (cached && (now - cached.timestamp < 600_000)) {

    getCategoryProducts(tab, category, limit).then((fresh) => {

      if (Array.isArray(fresh) && fresh.length) {

        categoryProductsCache.set(key, { data: fresh, timestamp: Date.now() });

      }

    }).catch(() => {});

    return cached.data;

  }

  const fresh = await getCategoryProducts(tab, category, limit);

  if (Array.isArray(fresh) && fresh.length) {

    categoryProductsCache.set(key, { data: fresh, timestamp: Date.now() });

  }

  return cached?.data || fresh;

}



async function getInitialHotProducts() {

  const headers = {

    apikey: PUBLIC_SUPABASE_KEY,

    Authorization: `Bearer ${PUBLIC_SUPABASE_KEY}`,

  };

  const request = async (path) => {

    try {

      const response = await fetch(`${PUBLIC_SUPABASE_URL}/rest/v1/${path}`, {

        headers,

        signal: AbortSignal.timeout(3000),

      });

      return response.ok ? await response.json() : [];

    } catch {

      return [];

    }

  };



  // Ambil langsung agregat klik (133 baris cepat) + katalog (tanpa query berat ke tabel klik mentah)

  const [aggRows, ...catalogRows] = await Promise.all([

    request(`klik_agregat?select=name,total&order=total.desc&limit=200`),

    ...HOT_PRODUCT_TABLES.map((table) =>

      request(`${table}?select=name,price,image,stock,soldout,sold,dilihat&price=gt.0&stock=gt.0&order=sold.desc,dilihat.desc&limit=150`),

    ),

  ]);



  const clicks = new Map();

  if (Array.isArray(aggRows) && aggRows.length) {

    for (const row of aggRows) {

      const name = String(row?.name || "").trim();

      const total = Number(row?.total) || 0;

      if (name && total > 0) clicks.set(name, total);

    }

  }



  const products = [];

  const seenProducts = new Set();

  for (const [catalogIndex, rows] of catalogRows.entries()) {

    const tab = HOT_PRODUCT_TABLES[catalogIndex] || "home";

    for (const row of Array.isArray(rows) ? rows : []) {

      const name = String(row?.name || "").trim();

      const price = Number(row?.price) || 0;

      const stock = Number(row?.stock);

      const isMarkedSoldOut = /^(ya|y|yes|habis|sold)/i.test(String(row?.soldout || "").trim());

      if (!name || name.startsWith("CAT:") || price <= 0 || !Number.isFinite(stock) || stock <= 0 || isMarkedSoldOut || seenProducts.has(name)) continue;

      seenProducts.add(name);

      const rawImage = String(row?.image || "").split("|")[0].trim();

      const image = rawImage

        ? (/^https?:\/\//i.test(rawImage)

          ? rawImage.replace(/^http:/i, "https:")

          : rawImage.startsWith("/") ? rawImage : `/${rawImage}`)

        : "/ROCKSTARLOGO.webp";

      products.push({

        name,

        tab,

        price,

        image,

        thumbnail: getProductImageVariant(image, "tiny"),

        fallbackThumbnail: getProductImageVariant(image, "thumb"),

        clicks: clicks.get(name) || 0,

        views: Number(row?.dilihat) || 0,

        sold: Number(row?.sold) || 0,

        stock,

        isMarkedSoldOut,

      });

    }

  }



  return products

    .sort((a, b) => b.clicks - a.clicks || b.views - a.views || b.sold - a.sold)

    .slice(0, 8);

}



function absImageUrl(raw) {

  if (/^https?:\/\//i.test(raw)) return raw.replace(/^http:/i, "https:");

  if (raw.startsWith("/")) return `https://rockstarstore.id${raw}`;

  return `https://rockstarstore.id/${raw}`;

}



/* SSR kategori: ambil produk nyata dari Supabase supaya halaman kategori

   membawa nama/harga produk di HTML (bukan halaman tipis untuk Google). */

async function getCategoryProducts(tab, category, limit = 24) {

  if (!tab || !category) return [];

  try {

    const categoryUrl = new URL("https://rockstarstore.id/");

    categoryUrl.searchParams.set("tab", tab);

    categoryUrl.searchParams.set("cat", category);

    const endpoint = `${PUBLIC_SUPABASE_URL}/rest/v1/${tab}?select=name,price,image,stock,soldout&price=gt.0&kategori=${encodeURIComponent(`eq.${category}`)}&order=urutan&limit=${limit}`;

    const response = await fetch(endpoint, {

      headers: {

        apikey: PUBLIC_SUPABASE_KEY,

        Authorization: `Bearer ${PUBLIC_SUPABASE_KEY}`,

      },

      signal: AbortSignal.timeout(3000),

    });

    if (!response.ok) return [];

    const rows = await response.json();

    return (Array.isArray(rows) ? rows : [])

      .map((row) => ({

        name: String(row?.name || "").trim(),

        tab,

        price: Number(row?.price) || 0,

        image: absImageUrl(String(row?.image || "").split("|")[0].trim() || "ROCKSTARLOGO.webp"),

        stock: Number(row?.stock),

        isMarkedSoldOut: /^(ya|y|yes|habis|sold)/i.test(String(row?.soldout || "").trim()),

        url: categoryUrl.href,

      }))

      .filter((product) => product.name && product.price > 0);

  } catch {

    return [];

  }

}



function buildItemListJsonLd(products, listName) {

  if (!Array.isArray(products) || !products.length) return null;

  return {

    "@type": "ItemList",

    name: listName,

    itemListElement: products.slice(0, 24).map((product, index) => ({

      "@type": "ListItem",

      position: index + 1,

      item: {

        "@type": "Product",

        name: product.name,

        image: product.image,

        category: product.kategori || "Layanan Roblox",

        brand: { "@type": "Brand", name: "Rockstar.Store" },

        offers: {

          "@type": "Offer",

          price: Number(product.price) || 0,

          priceCurrency: "IDR",

          availability: Number.isFinite(product.stock) && product.stock > 0 && !product.isMarkedSoldOut

            ? "https://schema.org/InStock"

            : "https://schema.org/OutOfStock",

          itemCondition: "https://schema.org/NewCondition",

          priceValidUntil: "2027-12-31",

          seller: { "@type": "Organization", name: "Rockstar.Store", url: "https://rockstarstore.id/" },

          url: product.url || (product.tab ? `https://rockstarstore.id/?tab=${product.tab}` : "https://rockstarstore.id/"),

        },

      },

    })),

  };

}



const storeJsonLd = {

  "@context": "https://schema.org",

  "@graph": [

    {

      "@type": "WebSite",

      "@id": "https://rockstarstore.id/#website",

      url: "https://rockstarstore.id/",

      name: "Rockstar.Store | Solusi Sepuh Roblox",

      alternateName: [

        "Rockstar.Store",

        "Rockstar Store",

        "Rockstarstore.id",

        "ROCKSTAR.STR",

        "Solusi Sepuh Roblox",

        "#1 Roblox Store Indonesia & Worldwide",

      ],

      inLanguage: ["id-ID", "ms-MY", "en-US"],

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

      "@type": ["OnlineStore", "Brand", "Organization"],

      "@id": "https://rockstarstore.id/#store",

      name: "Rockstar.Store",

      legalName: "Rockstar.Store - Solusi Sepuh Roblox",

      slogan: "Solusi Sepuh Roblox #1 di Indonesia, Malaysia & Dunia",

      disambiguatingDescription: "Independent Southeast Asian Roblox gaming marketplace (Brainrot items, verified Data Polos veteran accounts, manual boosting, Robux top-up). Not affiliated with Rockstar Games (GTA) or unrelated UGC groups.",

      url: "https://rockstarstore.id/",

      logo: "https://rockstarstore.id/ROCKSTARLOGO.png",

      image: "https://rockstarstore.id/ROCKSTARLOGO.png",

      description: "Rockstar.Store (https://rockstarstore.id) adalah toko dan marketplace kebutuhan Roblox #1 paling terpercaya di Indonesia, Malaysia, Asia Tenggara, dan dunia (Solusi Sepuh Roblox). Menyediakan Akun Roblox Sepuh, Item & Pet Brainrot Langka (Secret, OG, Mutasi), Jasa Joki Roblox Profesional berbagai map, serta Top Up Robux Instan. Rockstar.Store is the #1 trusted Roblox marketplace in Indonesia and worldwide for rare Brainrot items, stacked Roblox accounts, boosting services, and Robux.",

      currenciesAccepted: "IDR, MYR, USD",

      paymentAccepted: "QRIS, GoPay, DANA, OVO, ShopeePay, Bank Transfer, Touch n Go, Binance Pay",

      priceRange: "Rp 5.000 - Rp 5.000.000",

      areaServed: [

        { "@type": "Country", name: "Indonesia" },

        { "@type": "Country", name: "Malaysia" },

        { "@type": "Country", name: "Singapore" },

        { "@type": "Country", name: "Philippines" },

        { "@type": "Country", name: "United States" },

        { "@type": "Place", name: "Worldwide" },

      ],

      knowsAbout: [

        "Roblox",

        "Solusi Sepuh Roblox",

        "Item Brainrot Roblox",

        "Pet Brainrot Roblox",

        "Steal a Brainrot",

        "Grow a Garden Roblox",

        "Break and Steal an Egg",

        "Fisch Roblox",

        "Blox Fruits",

        "Anime Vanguards",

        "Blue Lock Rivals",

        "Dead Rails Roblox",

        "Akun Roblox Sepuh",

        "Stacked Roblox Accounts",

        "Jasa Joki Roblox",

        "Roblox Boosting Service",

        "Top Up Robux Murah",

      ],

      hasOfferCatalog: {

        "@type": "OfferCatalog",

        name: "Katalog Lengkap Rockstar.Store - Solusi Sepuh Roblox",

        itemListElement: [

          {

            "@type": "OfferCatalog",

            name: "Item & Pet Brainrot Roblox (Secret, OG, Mutasi)",

            url: "https://rockstarstore.id/?tab=brainrot",

          },

          {

            "@type": "OfferCatalog",

            name: "Akun Roblox Sepuh & Jasa Cari Akun",

            url: "https://rockstarstore.id/?tab=akun",

          },

          {

            "@type": "OfferCatalog",

            name: "Jasa Joki Roblox Aman & Cepat Berbagai Map",

            url: "https://rockstarstore.id/?tab=joki",

          },

          {

            "@type": "OfferCatalog",

            name: "Top Up Robux Instan",

            url: "https://rockstarstore.id/?tab=topup",

          },

        ],

      },

      sameAs: [

        "https://www.tiktok.com/@rockstarstoree",

        "https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q",

      ],

      contactPoint: {

        "@type": "ContactPoint",

        telephone: "+62-896-6429-9571",

        url: "https://wa.me/6289664299571",

        contactType: "customer service",

        areaServed: ["ID", "MY", "SG", "US", "Worldwide"],

        availableLanguage: ["Indonesian", "Malay", "English"],

      },

    },

    {

      "@type": "FAQPage",

      "@id": "https://rockstarstore.id/#ai-faq",

      mainEntity: [

        {

          "@type": "Question",

          name: "Di mana tempat beli item Brainrot Roblox dan akun Roblox sepuh paling aman dan terpercaya di Indonesia?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Rockstar.Store (https://rockstarstore.id) adalah toko dan marketplace kebutuhan Roblox terpercaya di Indonesia dan Malaysia dengan julukan 'Solusi Sepuh Roblox'. Menyediakan item dan pet Brainrot langka (Secret, OG, Transcendent, Mutasi), akun Roblox sepuh data polos anti-hackback, jasa joki manual berbagai map, serta top up Robux dengan konfirmasi langsung via WhatsApp Admin resmi (+62-896-6429-9571).",

          },

        },

        {

          "@type": "Question",

          name: "Di mana saya bisa melihat testimoni customer?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Buka galeri foto testimoni lengkap di halaman FAQ (https://rockstarstore.id/faq) atau join Saluran WhatsApp Rockstar.Store untuk melihat testimoni dan update terbaru.",

          },

        },

        {

          "@type": "Question",

          name: "Apa saja yang bisa dibeli di Rockstar.Store?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Tersedia Top Up Robux (/topup-robux), item dan pet Brainrot (/brainrot), akun Roblox sepuh data polos (/akun-sepuh), serta jasa joki manual untuk berbagai map (/joki-roblox).",

          },

        },

        {

          "@type": "Question",

          name: "Kenapa harus beli di Rockstar.Store?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Rockstar.Store menyediakan Top Up Robux, akun sepuh Roblox, Brainrot/pet sepuh, serta jasa joki profesional dalam satu tempat. Pesanan diteruskan ke admin melalui WhatsApp (+62-896-6429-9571) agar item, stok real-time, dan total pembayaran dikonfirmasi terlebih dahulu dengan mengutamakan keamanan akun.",

          },

        },

        {

          "@type": "Question",

          name: "Bagaimana cara order?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Pilih produk, tambahkan ke keranjang, lalu tekan Checkout. Periksa ringkasan pesanan dan pilih Kirim ke Admin supaya WhatsApp terbuka dengan detail order.",

          },

        },

        {

          "@type": "Question",

          name: "Bagaimana cara cek status pesanan saya?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Balas chat WhatsApp yang digunakan untuk mengirim pesanan dan tanyakan pembaruannya sambil menyertakan nama item atau ringkasan order agar admin lebih mudah membantu.",

          },

        },

        {

          "@type": "Question",

          name: "Apa saja metode pembayarannya?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Pembayaran tersedia melalui QRIS, GoPay, DANA, ShopeePay, OVO, All Bank (Indonesia & Malaysia MYR), dan Binance Pay. Konfirmasikan metode serta jumlah akhir kepada admin sebelum membayar.",

          },

        },

        {

          "@type": "Question",

          name: "Kenapa total pembayaran bisa berbeda dari harga produk?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Keranjang menjumlahkan harga produk yang dipilih. Jika ada biaya admin dari metode pembayaran tertentu, Admin Rock akan mengonfirmasi jumlah akhir sebelum pembayaran dilakukan.",

          },

        },

        {

          "@type": "Question",

          name: "Kapan item dikirim?",

          acceptedAnswer: {

            "@type": "Answer",

            text: "Setelah pembayaran dikonfirmasi, admin akan mengirim item di dalam game via Private Server atau memproses pesanan dan memberi petunjuk bila diperlukan.",

          },

        },

      ],

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

    .replace(/[<>\x00-\x1f]/g, "")

    .trim()

    .slice(0, 80);

  const category = tab !== "home" && /^[\p{L}\p{N}\s.'&(),+/-]+$/u.test(rawCategory) ? rawCategory : "";

  const isSearchPage = Boolean(String(firstQueryValue(query.q) || "").trim());

  const page = SEO_PAGES[tab];

  const title = category ? `${category} | Rockstar.Store` : page.title;

  const description = category

    ? `Jelajahi ${category} di Rockstar.Store. Lihat detail produk, harga, dan ketersediaannya sebelum memesan.`

    : page.description;

  const CLEAN_TAB_CANONICAL = {
    brainrot: "https://rockstarstore.id/brainrot",
    akun: "https://rockstarstore.id/akun-sepuh",
    joki: "https://rockstarstore.id/joki-roblox",
    topup: "https://rockstarstore.id/topup-robux",
  };

  let canonical = "https://rockstarstore.id/";
  if (!isSearchPage && tab !== "home") {
    if (!category && CLEAN_TAB_CANONICAL[tab]) {
      canonical = CLEAN_TAB_CANONICAL[tab];
    } else {
      const canonicalParams = new URLSearchParams();
      canonicalParams.set("tab", tab);
      if (category) canonicalParams.set("cat", category);
      canonical = `https://rockstarstore.id/?${canonicalParams.toString()}`;
    }
  }

  const robots = isSearchPage
    ? "noindex, follow"
    : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

  const webPageJsonLd = isSearchPage ? null : {

    "@type": "WebPage",

    "@id": canonical,

    url: canonical,

    name: title,

    description,

    inLanguage: "id-ID",

    isPartOf: { "@id": "https://rockstarstore.id/#website" },

  };



  return { title, description, canonical, robots, webPageJsonLd, tab: tab !== "home" ? tab : "", category };

}



export async function getServerSideProps(context) {

  const seo = getHomeSeo(context.query);

  const needHot = !context.query.q;

  const needCat = Boolean(!context.query.q && seo.category);

  const needTabCatalog = Boolean(!context.query.q && seo.tab && !seo.category && ["brainrot", "akun", "joki", "topup"].includes(seo.tab));

  const [hotProducts, catProducts, tabCatalogRaw] = await Promise.all([

    needHot ? getCachedHotProducts() : Promise.resolve([]),

    needCat ? getCachedCategoryProducts(seo.tab, seo.category) : Promise.resolve([]),

    needTabCatalog ? fetchTableCatalog(seo.tab, { timeoutMs: 3200, limit: 250 }) : Promise.resolve(null),

  ]);

  const ssrTabData = tabCatalogRaw && tabCatalogRaw.ok
    ? {
        categories: tabCatalogRaw.categories.slice(0, 24),
        products: tabCatalogRaw.products.slice(0, 12),
      }
    : null;

  if (!context.query.q) {

    context.res.setHeader("Cache-Control", "public, max-age=0, must-revalidate, s-maxage=180, stale-while-revalidate=1800");

  }

  const pageSeo = seo.category && catProducts.length === 0

    ? { ...seo, robots: "noindex, follow" }

    : seo;

  return {

    props: {

      ssrGeneratedAt: new Date().toISOString(),

      seo: pageSeo,

      hotProducts,

      catProducts,

      ssrTabData,

    },

  };

}



export default function HomePage({ ssrGeneratedAt, seo, hotProducts, catProducts, ssrTabData }) {

  const itemListSource = seo.category ? catProducts : hotProducts;

  const itemListJsonLd = buildItemListJsonLd(itemListSource, seo.category ? `Kategori ${seo.category}` : "Produk Populer Rockstar.Store");

  return (

    <>

      <Head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem("rs_teks_speed");var n=Number(s);if(!n || n > 60 || n < 1){ n = 22; localStorage.setItem("rs_teks_speed", "22"); }document.documentElement.style.setProperty("--announce-speed",n+"s");}catch(e){}})();` }} />

        {"\r\n"}

        <meta charSet="UTF-8" />

        {"\r\n"}

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {"\r\n"}

        <link rel="preconnect" href="https://mvzlmjgfctdxnjxveuoo.supabase.co" crossOrigin="anonymous" />



        <link rel="dns-prefetch" href="https://mvzlmjgfctdxnjxveuoo.supabase.co" />

        <link rel="preload" as="script" href="/site-scripts/home-08-lang.js?v=20261115ps" />
        <link rel="preload" as="script" href="/site-scripts/home-08.js?v=20261115ps" />

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

        <link rel="alternate" type="text/plain" href="https://rockstarstore.id/llms.txt" title="LLMs.txt - AI Search Knowledge Base" />

        <link rel="alternate" type="text/plain" href="https://rockstarstore.id/llms-full.txt" title="LLMs-Full.txt - Comprehensive AI Guide" />

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

        <meta property="og:image:width" content="500" />

        {"\r\n"}

        <meta property="og:image:height" content="500" />

        {"\r\n"}

        <meta property="og:image:type" content="image/png" />

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

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...storeJsonLd, "@graph": [...storeJsonLd["@graph"], ...(seo.webPageJsonLd ? [seo.webPageJsonLd] : []), ...(itemListJsonLd ? [itemListJsonLd] : [])] }).replace(/</g, String.fromCharCode(92) + "u003c") }} />

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

        <style dangerouslySetInnerHTML={{ __html: HOME_INLINE_CSS }} />

        {"\r\n"}



        {"\r\n"}

      </Head>

      {"\r\n\r\n"}

      <div id="loader" className="hide">

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

            {" • ⚡ Proses kilat • 💰 Harga termurah • Tiktok @rockstarstoree • "}

            <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">

              {"Join saluran WA"}

            </a>

            {" • ⚡ Proses kilat • 💰 Harga termurah • Tiktok @rockstarstoree • "}

            <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank">

              {"Join saluran WA"}

            </a>

            {" • "}

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

              <span className="hnico" aria-hidden="true">{"🏠 "}</span>

              <span data-i18n="nav_home">

                {"Beranda"}

              </span>

            </a>

            {"\n    "}

            <a href="/faq" className="headnav-extra">

              <span className="hnico" aria-hidden="true">{"❓ "}</span>

              <span>

                {"FAQ"}

              </span>

            </a>

            {"\n    "}

            <a href="/berita" className="headnav-extra">

              <span className="hnico" aria-hidden="true">{"📰 "}</span>

              <span>

                {"Berita"}

              </span>

            </a>

            {"\n    "}

            <a href="?tab=akun" onClick={(event) => { goToAkun(); event.preventDefault(); return false; }}>

              <span className="hnico" aria-hidden="true">{"👤 "}</span>

              <span data-i18n="nav_akun">

                {"Akun Sepuh"}

              </span>

            </a>

            {"\n    "}

            <a href="?tab=brainrot" onClick={(event) => { goToBrainrot(); event.preventDefault(); return false; }}>

              <span className="hnico" aria-hidden="true">{"🧠 "}</span>

              <span data-i18n="nav_brainrot_bn">

                {"Brainrot"}

              </span>

            </a>

            {"\r\n    "}

            <a href="?tab=joki" onClick={(event) => { goToJoki(); event.preventDefault(); return false; }}>

              <span className="hnico" aria-hidden="true">{"🏆 "}</span>

              <span data-i18n="nav_joki">

                {"Joki Sepuh"}

              </span>

            </a>

            {"\r\n  "}

          </nav>

          {"\r\n  "}

          <div className="searchwrap">

            <input type="text" id="searchInput" aria-label="Cari produk Roblox" placeholder="Cari item, misal: moon bloom, robux..." data-i18n-ph="search_ph" autoComplete="off" onKeyDown={(event) => { if(event.key==='Enter')closeMnav() }} />

            <button type="button" id="searchClearBtn" className="search-clear-btn" aria-label="Hapus pencarian" style={{ display: "none" }} onClick={() => { if (typeof window !== "undefined" && window.clearSearchInput) window.clearSearchInput(); }}>{"✕"}</button>

            <div id="searchSug" style={{ display: "none" }} />

          </div>

          {"\r\n  "}

          <div className="headicons">

            {"\r\n    "}

            <a className="cartbtn" href="/spin" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.22), rgba(43,78,255,0.35))", border: "1px solid rgba(212,175,55,0.55)", color: "#f3d27a", textDecoration: "none", fontWeight: 800, boxShadow: "0 4px 16px rgba(212,175,55,0.16)" }}><span>{"🎟️ Lucky Spin"}</span></a>

            <button className="cartbtn flashbtn" onClick={(event) => { goFlash() }}>

              <span data-i18n="flash_btn">

                {"⚡ Flash Sale"}

              </span>

            </button>

            {"\r\n    "}

            <button className="cartbtn" id="wishBtn" onClick={(event) => { openWishModal() }} style={{ background: "rgba(43,78,255,0.14)", border: "1px solid rgba(111,139,255,0.28)", color: "#fff" }}>

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

        <a className="mlink" href="/spin" style={{ textDecoration: "none", color: "#f3d27a", fontWeight: 700 }}><span className="lico">{"🎟️"}</span><span>{"Lucky Spin Grand Prize"}</span></a>

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

        <a className="mlink" href="/berita" style={{ textDecoration: "none" }}>

          <span className="lico">

            {"📰"}

          </span>

          <span>

            {"Berita & Tips"}

          </span>

        </a>

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

          <button className="cartbtn" onClick={(event) => { mnavGo(openWishModal) }} style={{ background: "rgba(43, 78, 255, 0.16)", border: "1px solid rgba(111, 139, 255, 0.32)" }}>

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

        <a className="btn-primary" href="/spin" style={{ background: "linear-gradient(135deg, rgba(22, 34, 74, 0.96) 0%, rgba(11, 18, 40, 0.98) 100%)", border: "1px solid rgba(243, 210, 122, 0.55)", color: "#f3d27a", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45), 0 0 14px rgba(243, 210, 122, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.16)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>{"Lucky Spin 🎟️"}</a>

        <button id="ctaJoki" className="btn-ghost" onClick={(event) => { goToJoki() }} data-i18n="cta_joki">

          {"Joki 🎮"}

        </button>

        {"\r\n    "}

      </div>

      {"\r\n  "}

        </div>

      {"\r\n  "}

      <div className="hero-visual">

        <img className="hero-logo" src="ROCKSTARLOGO.webp" srcSet="/optimized/ROCKSTARLOGO-220.webp 220w, /optimized/ROCKSTARLOGO-400.webp 400w, /ROCKSTARLOGO.webp 500w" sizes="(max-width: 768px) 180px, 320px" alt="Rockstar.Store" width="500" height="500" fetchPriority="high" decoding="async" />

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

                      alt={product.name}

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

        <div id="pageTitle" suppressHydrationWarning>
          {seo.category ? (
            <div className="cattitle">
              <h2>{seo.category} — Rockstar.Store</h2>
              <p>Daftar produk & harga kategori {seo.category} di Solusi Sepuh Roblox.</p>
            </div>
          ) : seo.tab ? (
            <div className="cattitle">
              <h2>{seo.title}</h2>
              <p>{seo.description}</p>
            </div>
          ) : (
            <div className="cattitle" style={{ marginBottom: "14px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "clamp(19px, 2.5vw, 26px)" }}>
                Rockstar.Store — Solusi Sepuh Roblox #1 Indonesia & Malaysia
              </h2>
              <p style={{ margin: 0, fontSize: "13px" }}>
                Pusat item Brainrot langka, Akun Roblox Sepuh Data Polos anti-hackback, Joki manual, & Top Up Robux.
              </p>
            </div>
          )}
        </div>

        {"\r\n  "}

        <div id="products" suppressHydrationWarning>
          {seo.category && Array.isArray(catProducts) && catProducts.length > 0 ? (
            <div className="catgrid">
              {catProducts.slice(0, 24).map((item, idx) => (
                <a
                  key={`${item.name}-${idx}`}
                  href={`/?tab=${encodeURIComponent(seo.tab || "brainrot")}&cat=${encodeURIComponent(seo.category)}&q=${encodeURIComponent(item.name)}`}
                  className="catcard"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="catimgwrap">
                    <img
                      src={item.image}
                      alt={item.name}
                      width={320}
                      height={220}
                      loading="lazy"
                    />
                  </div>
                  <div className="catbody" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                    <h2 style={{ fontSize: "14px", margin: 0, color: "#fff" }}>{item.name}</h2>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#f3d27a" }}>
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : seo.tab && ssrTabData?.categories?.length > 0 ? (
            <div className="catgrid">
              {ssrTabData.categories.map((c) => (
                <a
                  key={c.name}
                  href={`/?tab=${encodeURIComponent(seo.tab)}&cat=${encodeURIComponent(c.name)}`}
                  className="catcard"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="catimgwrap">
                    <img
                      src={c.thumb || c.image || "/ROCKSTARLOGO.webp"}
                      alt={`Kategori ${c.name}`}
                      width={320}
                      height={220}
                      loading="lazy"
                    />
                  </div>
                  <div className="catbody">
                    <h3>{c.name}</h3>
                    <span className="go">→</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <>
              <div className="banners">
                <a href="/brainrot" className="banner" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <small>BRAINROT • PET • TOKEN • TANAMAN</small>
                  <h3>Item & Pet Brainrot</h3>
                  <p>Stok Secret, OG, Transcendent & mutasi langka update real-time.</p>
                </a>
                <a href="/topup-robux" className="banner" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <small>ROBUX • GAMEPASS</small>
                  <h3>Top Up Robux</h3>
                  <p>Paket Robux aman bayar via QRIS, DANA, GoPay, OVO, MYR & Binance.</p>
                </a>
                <a href="/akun-sepuh" className="banner" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <small>AKUN SEPUH ROBLOX BERBAGAI MAP</small>
                  <h3>Akun Sepuh Data Polos</h3>
                  <p>Akun progres tinggi terverifikasi Data Polos & panduan anti-hackback.</p>
                </a>
                <a href="/joki-roblox" className="banner" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <small>JOKI SEPUH BERBAGAI MAP</small>
                  <h3>Jasa Joki Manual</h3>
                  <p>Push level, koin max, & event manual 100% tanpa script ilegal.</p>
                </a>
              </div>
              {Array.isArray(hotProducts) && hotProducts.length > 0 && (
                <div style={{ marginTop: "18px", padding: "14px 16px", borderRadius: "14px", background: "rgba(9, 17, 38, 0.72)", border: "1px solid rgba(112, 137, 255, 0.2)" }}>
                  <h2 style={{ fontSize: "14px", margin: "0 0 10px", color: "#f3d27a" }}>
                    Produk Populer Hari Ini di Rockstar.Store
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "8px" }}>
                    {hotProducts.slice(0, 8).map((item, idx) => (
                      <a
                        key={`${item.name}-${idx}`}
                        href={`/?tab=${encodeURIComponent(item.tab || "brainrot")}&q=${encodeURIComponent(item.name)}`}
                        style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "8px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontSize: "12px", textDecoration: "none" }}
                      >
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        <strong style={{ color: "#fde68a", whiteSpace: "nowrap" }}>{formatRupiah(item.price)}</strong>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

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
        <button className="bnitem" data-page="akun" onClick={(event) => { bnGo('akun') }} title="Beli Akun Sepuh Roblox">
          <span className="bnico">{"👤"}</span>
          <span className="bnlbl" data-i18n="nav_akun_bn">{"Akun Sepuh"}</span>
        </button>
        {"\r\n  "}
        <button className="bnitem" data-page="brainrot" onClick={(event) => { bnGo('brainrot') }} title="Brainrot">
          <span className="bnico">{"🧠"}</span>
          <span className="bnlbl" data-i18n="nav_brainrot_bn">{"Brainrot"}</span>
        </button>
        {"\r\n  "}
        <button className="bnitem flash" data-page="flash" onClick={(event) => { goFlash() }} title="Flash Sale">
          <span className="bnico">{"⚡"}</span>
          <span className="bnlbl" data-i18n="nav_flash_bn">{"Flash Sale"}</span>
        </button>
        {"\r\n  "}
        <button className="bnitem bnitem-home" data-page="home" onClick={(event) => { bnGo('home') }} title="Beranda">
          <div className="bnhome-bubble">
            <img src="/optimized/ROCKSTARLOGO-72.webp" alt="Rockstar Store" className="bnhome-logo" width="46" height="46" />
          </div>
          <span className="bnlbl" data-i18n="nav_home">{"Beranda"}</span>
        </button>
        {"\r\n  "}
        <button className="bnitem" data-page="joki" onClick={(event) => { bnGo('joki') }} title="Joki Sepuh Roblox">
          <span className="bnico">{"🏆"}</span>
          <span className="bnlbl" data-i18n="nav_joki_bn">{"Joki Sepuh"}</span>
        </button>
        {"\r\n  "}
        <a className="bnitem" data-page="spin" href="/spin" style={{ textDecoration: "none" }} title="Lucky Spin Grand Prize">
          <span className="bnico">{"🎟️"}</span>
          <span className="bnlbl" style={{ color: "#f3d27a", fontWeight: 700 }}>{"Spin"}</span>
        </a>
        {"\r\n  "}
        <button className="bnitem" data-page="faq" onClick={(event) => { bnGo('faq') }} title="FAQ">
          <span className="bnico">{"❓"}</span>
          <span className="bnlbl">{"FAQ"}</span>
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

          <b id="total" data-count="0">

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

            <input type="text" id="waChatInput" aria-label="Ketik pesan chat support" data-i18n-ph="wa_ph" placeholder="Ketik pesan..." onKeyDown={(event) => { if(event.key==='Enter')waSend() }} />

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

            <img id="testimoniPhotoViewerImage" className="testimoni-viewer-photo" width={800} height={800} alt="Foto testimoni ukuran penuh" />

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

          <details className="faq-item" open>

            {"\n      "}

            <summary>

              {"Di mana tempat beli item Brainrot Roblox dan akun Roblox sepuh paling aman dan terpercaya di Indonesia?"}

            </summary>

            {"\n      "}

            <div className="faq-answer">

              {"Rockstar.Store ("}
              <a href="https://rockstarstore.id/">https://rockstarstore.id</a>
              {") adalah toko dan marketplace kebutuhan Roblox terpercaya di Indonesia dan Malaysia dengan julukan 'Solusi Sepuh Roblox'. Menyediakan "}
              <a href="/brainrot">item dan pet Brainrot langka</a>
              {" (Secret, OG, Transcendent, Mutasi), "}
              <a href="/akun-sepuh">akun Roblox sepuh data polos anti-hackback</a>
              {", "}
              <a href="/joki-roblox">jasa joki manual berbagai map</a>
              {", serta "}
              <a href="/topup-robux">top up Robux</a>
              {" dengan konfirmasi langsung via WhatsApp Admin resmi (+62-896-6429-9571)."}

            </div>

            {"\n    "}

          </details>

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

      <HomeArticles />

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

