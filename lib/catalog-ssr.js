export const SITE_URL = "https://rockstarstore.id";
export const SUPABASE_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";
export const WHATSAPP_OFFICIAL_URL = "https://wa.me/6289664299571";

export const TAB_CLEAN_URL_MAP = {
  brainrot: "/brainrot",
  akun: "/akun-sepuh",
  joki: "/joki-roblox",
  topup: "/topup-robux",
};

const SOLD_OUT_RE = /^(ya|y|yes|habis|sold)/i;

export function encodeLocalAssetPath(rawPath) {
  const s = String(rawPath || "").trim();
  if (!s) return "/ROCKSTARLOGO.webp";
  if (/^https?:\/\//i.test(s)) return s;
  const clean = s.replace(/^\/+/, "");
  return (
    "/" +
    clean
      .split("/")
      .map((seg) => encodeURIComponent(decodeSafe(seg)))
      .join("/")
  );
}

function decodeSafe(seg) {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

export function resolveProductImage(rawImg, fallbackImg = "/ROCKSTARLOGO.webp") {
  const firstPart = String(rawImg || "")
    .split("|")
    .map((s) => s.trim().replace(/,+$/, "").trim())
    .find(Boolean);

  if (!firstPart) {
    return fallbackImg || "/ROCKSTARLOGO.webp";
  }
  if (/^https?:\/\//i.test(firstPart)) {
    return firstPart;
  }
  return encodeLocalAssetPath(firstPart);
}

export function toThumbImage(fullUrl) {
  const u = String(fullUrl || "");
  if (!u || u.includes("/thumb_") || !u.includes("/storage/v1/object/")) {
    return u;
  }
  const idx = u.lastIndexOf("/");
  if (idx === -1) return u;
  return `${u.slice(0, idx + 1)}thumb_${u.slice(idx + 1)}`;
}

export function toAbsoluteImageUrl(imgUrl) {
  const u = String(imgUrl || "").trim();
  if (!u) return `${SITE_URL}/ROCKSTARLOGO.png`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}${u.startsWith("/") ? u : `/${u}`}`;
}

export function formatRupiah(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return "Hubungi Admin";
  return `Rp ${Math.round(num).toLocaleString("id-ID")}`;
}

export function isItemAvailable(item) {
  if (!item || !item.name) return false;
  const name = String(item.name).trim();
  if (!name || name.startsWith("CAT:")) return false;
  if (item.soldout && SOLD_OUT_RE.test(String(item.soldout).trim())) return false;
  if (typeof item.stock !== "undefined") {
    const stockNum = Number(item.stock);
    if (!Number.isFinite(stockNum) || stockNum <= 0) return false;
  }
  return Number(item.price) > 0;
}

function getSupabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

export async function fetchTableCatalog(table, { timeoutMs = 4500, limit = 600 } = {}) {
  const validTables = ["brainrot", "akun", "joki", "topup"];
  if (!validTables.includes(table)) {
    return {
      ok: false,
      categories: [],
      products: [],
      stats: { totalProducts: 0, availableCount: 0, minPrice: 0, maxPrice: 0, categoryCount: 0 },
    };
  }

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=name,kategori,price,coret,deskripsi,stock,soldout,image,sold,dilihat,urutan&order=urutan.asc&limit=${limit}`;
    const res = await fetch(url, {
      headers: getSupabaseHeaders(),
      signal: controller ? controller.signal : undefined,
    });

    if (!res.ok) {
      throw new Error(`Supabase HTTP ${res.status}`);
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) {
      throw new Error("Unexpected Supabase payload");
    }

    const catMap = new Map();
    const rawProducts = [];

    for (const row of rows) {
      const name = String(row?.name || "").trim();
      if (!name) continue;

      if (name.startsWith("CAT:")) {
        const catName = String(row.kategori || name.slice(4)).trim();
        if (!catName) continue;
        const resolvedImg = resolveProductImage(row.image, "/ROCKSTARLOGO.webp");
        const existing = catMap.get(catName.toLowerCase());
        const urutanNum = Number(row.urutan);
        if (!existing) {
          catMap.set(catName.toLowerCase(), {
            name: catName,
            image: resolvedImg,
            thumb: toThumbImage(resolvedImg),
            urutan: Number.isFinite(urutanNum) ? urutanNum : 9999,
            count: 0,
            availableCount: 0,
          });
        } else if (!existing.image || existing.image === "/ROCKSTARLOGO.webp") {
          existing.image = resolvedImg;
          existing.thumb = toThumbImage(resolvedImg);
        }
        continue;
      }

      const price = Number(row.price);
      if (!Number.isFinite(price) || price <= 0) continue;

      const kategori = String(row.kategori || "Lainnya").trim() || "Lainnya";
      const catKey = kategori.toLowerCase();
      if (!catMap.has(catKey)) {
        catMap.set(catKey, {
          name: kategori,
          image: "/ROCKSTARLOGO.webp",
          thumb: "/ROCKSTARLOGO.webp",
          urutan: 9999,
          count: 0,
          availableCount: 0,
        });
      }

      const available = isItemAvailable(row);
      const catEntry = catMap.get(catKey);
      catEntry.count += 1;
      if (available) catEntry.availableCount += 1;

      const fallbackImg = catEntry.image || "/ROCKSTARLOGO.webp";
      const fullImg = resolveProductImage(row.image, fallbackImg);
      const coret = Number(row.coret);

      rawProducts.push({
        name,
        kategori,
        price: Math.round(price),
        coret: Number.isFinite(coret) && coret > price ? Math.round(coret) : 0,
        deskripsi: String(row.deskripsi || "").trim(),
        stock: Number.isFinite(Number(row.stock)) ? Number(row.stock) : 0,
        sold: Number.isFinite(Number(row.sold)) ? Number(row.sold) : 0,
        urutan: Number.isFinite(Number(row.urutan)) ? Number(row.urutan) : 9999,
        isAvailable: available,
        image: fullImg,
        thumb: toThumbImage(fullImg),
      });
    }

    const categories = Array.from(catMap.values())
      .filter((c) => c.count > 0 || c.image !== "/ROCKSTARLOGO.webp")
      .sort((a, b) => a.urutan - b.urutan || a.name.localeCompare(b.name, "id"));

    // Display available products first, preserving curated urutan order
    const products = rawProducts.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return a.urutan - b.urutan;
    });

    const activePrices = products.filter((p) => p.isAvailable && p.price > 0).map((p) => p.price);
    const allPrices = products.map((p) => p.price).filter((p) => p > 0);
    const pricePool = activePrices.length ? activePrices : allPrices;

    return {
      ok: true,
      categories,
      products,
      stats: {
        totalProducts: products.length,
        availableCount: products.filter((p) => p.isAvailable).length,
        minPrice: pricePool.length ? Math.min(...pricePool) : 0,
        maxPrice: pricePool.length ? Math.max(...pricePool) : 0,
        categoryCount: categories.length,
      },
    };
  } catch {
    return {
      ok: false,
      categories: [],
      products: [],
      stats: { totalProducts: 0, availableCount: 0, minPrice: 0, maxPrice: 0, categoryCount: 0 },
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function fetchTestimonialsSummary(limit = 6, timeoutMs = 4000) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const url = `${SUPABASE_URL}/rest/v1/info?name=like.INFO_TESTIMONI_*&select=name,image,urutan&order=urutan.desc,name.desc&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "count=exact",
      },
      signal: controller ? controller.signal : undefined,
    });

    if (!res.ok) {
      return { totalCount: 0, samples: [] };
    }

    const contentRange = res.headers.get("content-range") || "";
    const totalMatch = contentRange.match(/\/(\d+)\s*$/);
    const rows = await res.json();
    const samples = Array.isArray(rows)
      ? rows
          .filter((r) => r && r.image)
          .slice(0, limit)
          .map((r, idx) => {
            const full = resolveProductImage(r.image, "/ROCKSTARLOGO.webp");
            return {
              name: String(r.name || `testimoni-${idx + 1}`),
              image: full,
              thumb: toThumbImage(full),
            };
          })
      : [];

    const totalCount = totalMatch ? parseInt(totalMatch[1], 10) : samples.length;
    return { totalCount: Number.isFinite(totalCount) ? totalCount : samples.length, samples };
  } catch {
    return { totalCount: 0, samples: [] };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
