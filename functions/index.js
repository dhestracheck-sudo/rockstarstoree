const SUPABASE_URL = "https://mvzlmjgfctdxnjxveuoo.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZJIbLAyJKztU0Z14ZyQpGA_9_QooXth";
const PAGE_TABLES = { brainrot: "brainrot", topup: "topup", akun: "akun", joki: "joki" };
const LANGUAGES = ["id", "en", "ja", "ko", "zh", "fr", "th", "vi"];

const PAGE_META = {
  brainrot: {
    id: ["Item Brainrot Roblox | Rockstar.Store", "Jelajahi item Brainrot Roblox dari berbagai map. Lihat kategori, detail produk, dan harga di katalog Rockstar.Store."],
    en: ["Roblox Brainrot Items | Rockstar.Store", "Browse Brainrot items for popular Roblox maps at Rockstar.Store. Explore categories, product details, and prices before ordering."],
    ja: ["Robloxブレインロットアイテム | Rockstar.Store", "Rockstar.Storeで人気のRobloxマップ向けブレインロットアイテムをチェック。カテゴリー、商品情報、価格をご覧いただけます。"],
    ko: ["로블록스 브레인롯 아이템 | Rockstar.Store", "Rockstar.Store에서 인기 Roblox 맵의 브레인롯 아이템을 찾아보세요. 카테고리와 상품 정보, 가격을 확인할 수 있습니다."],
    zh: ["Roblox Brainrot 道具 | Rockstar.Store", "在 Rockstar.Store 浏览热门 Roblox 地图的 Brainrot 道具，查看分类、商品详情与价格后再下单。"],
    fr: ["Objets Brainrot Roblox | Rockstar.Store", "Découvrez des objets Brainrot pour les jeux Roblox populaires chez Rockstar.Store. Consultez les catégories, détails et prix."],
    th: ["ไอเทม Brainrot Roblox | Rockstar.Store", "เลือกชมไอเทม Brainrot สำหรับแมป Roblox ยอดนิยมที่ Rockstar.Store พร้อมดูหมวดหมู่ รายละเอียดสินค้า และราคา"],
    vi: ["Vật phẩm Brainrot Roblox | Rockstar.Store", "Khám phá vật phẩm Brainrot cho các map Roblox phổ biến tại Rockstar.Store. Xem danh mục, chi tiết sản phẩm và giá."]
  },
  topup: {
    id: ["Top Up Robux Roblox | Rockstar.Store", "Pilih paket top up Robux Roblox di Rockstar.Store. Cek pilihan nominal, metode pembayaran, dan cara pemesanan."],
    en: ["Buy Robux Top Up | Rockstar.Store", "Top up Robux for Roblox at Rockstar.Store. Compare available amounts, payment options, and ordering details."],
    ja: ["Robuxチャージ | Rockstar.Store", "Rockstar.StoreでRobloxのRobuxをチャージ。購入できる金額、支払い方法、注文手順をご確認ください。"],
    ko: ["Roblox Robux 충전 | Rockstar.Store", "Rockstar.Store에서 Roblox Robux를 충전하세요. 충전 금액과 결제 방법, 주문 절차를 확인할 수 있습니다."],
    zh: ["Roblox Robux 充值 | Rockstar.Store", "在 Rockstar.Store 为 Roblox 充值 Robux。查看可选金额、付款方式与下单步骤。"],
    fr: ["Recharge Robux Roblox | Rockstar.Store", "Rechargez vos Robux Roblox chez Rockstar.Store. Comparez les montants, les moyens de paiement et les étapes de commande."],
    th: ["เติม Robux Roblox | Rockstar.Store", "เติม Robux สำหรับ Roblox ที่ Rockstar.Store เลือกจำนวนเงิน ดูช่องทางชำระเงิน และขั้นตอนการสั่งซื้อ"],
    vi: ["Nạp Robux Roblox | Rockstar.Store", "Nạp Robux cho Roblox tại Rockstar.Store. Chọn mệnh giá, xem phương thức thanh toán và hướng dẫn đặt hàng."]
  },
  akun: {
    id: ["Akun Roblox Sepuh | Rockstar.Store", "Cari akun Roblox sepuh untuk berbagai map di Rockstar.Store. Lihat detail akun, harga, dan ketersediaannya sebelum memesan."],
    en: ["Roblox Accounts | Rockstar.Store", "Find Roblox accounts for popular maps at Rockstar.Store. Review account details, prices, and availability before ordering."],
    ja: ["Robloxアカウント | Rockstar.Store", "Rockstar.Storeで人気のRobloxマップ向けアカウントを探せます。アカウント情報、価格、在庫をご確認ください。"],
    ko: ["로블록스 계정 | Rockstar.Store", "Rockstar.Store에서 인기 Roblox 맵 계정을 찾아보세요. 계정 정보와 가격, 재고를 확인한 뒤 주문할 수 있습니다."],
    zh: ["Roblox 游戏账号 | Rockstar.Store", "在 Rockstar.Store 查找热门 Roblox 地图账号。下单前可查看账号信息、价格与库存状态。"],
    fr: ["Comptes Roblox | Rockstar.Store", "Trouvez des comptes pour les jeux Roblox populaires chez Rockstar.Store. Consultez les détails, les prix et la disponibilité."],
    th: ["บัญชี Roblox | Rockstar.Store", "ค้นหาบัญชีสำหรับแมป Roblox ยอดนิยมที่ Rockstar.Store ดูรายละเอียดบัญชี ราคา และสถานะสินค้าก่อนสั่งซื้อ"],
    vi: ["Tài khoản Roblox | Rockstar.Store", "Tìm tài khoản cho các map Roblox phổ biến tại Rockstar.Store. Xem thông tin tài khoản, giá và tình trạng hàng trước khi đặt."]
  },
  joki: {
    id: ["Jasa Joki Roblox Aman & Cepat | Rockstar.Store", "Cari jasa joki Roblox untuk map favoritmu. Lihat pilihan layanan, harga, dan cara pemesanan di Rockstar.Store."],
    en: ["Roblox Boosting Service | Rockstar.Store", "Explore Roblox boosting services for popular maps at Rockstar.Store. Compare available services, prices, and ordering details."],
    ja: ["Robloxブースト代行 | Rockstar.Store", "Rockstar.Storeで人気のRobloxマップ向けブースト代行をチェック。サービス内容、料金、注文方法をご覧いただけます。"],
    ko: ["로블록스 부스팅 서비스 | Rockstar.Store", "Rockstar.Store에서 인기 Roblox 맵 부스팅 서비스를 확인하세요. 서비스 종류와 가격, 주문 방법을 살펴볼 수 있습니다."],
    zh: ["Roblox 代练服务 | Rockstar.Store", "在 Rockstar.Store 查看热门 Roblox 地图代练服务，了解服务内容、价格与下单方式。"],
    fr: ["Service de boost Roblox | Rockstar.Store", "Découvrez nos services de boost pour les jeux Roblox populaires. Consultez les options, les prix et les modalités de commande."],
    th: ["บริการบูสต์ Roblox | Rockstar.Store", "เลือกบริการบูสต์สำหรับแมป Roblox ยอดนิยมที่ Rockstar.Store ดูตัวเลือกบริการ ราคา และวิธีสั่งซื้อ"],
    vi: ["Dịch vụ boost Roblox | Rockstar.Store", "Khám phá dịch vụ boost cho các map Roblox phổ biến tại Rockstar.Store. Xem lựa chọn dịch vụ, giá và cách đặt hàng."]
  }
};

const CATEGORY_COPY = {
  id: (name) => [name + " | Katalog Roblox Rockstar.Store", "Jelajahi " + name + " di Rockstar.Store. Lihat detail produk, harga, dan ketersediaan sebelum memesan."],
  en: (name) => [name + " | Roblox Catalog Rockstar.Store", "Browse " + name + " at Rockstar.Store. Check product details, prices, and availability before ordering."],
  ja: (name) => [name + " | Roblox商品 Rockstar.Store", "Rockstar.Storeで" + name + "をチェック。注文前に商品情報、価格、在庫をご確認いただけます。"],
  ko: (name) => [name + " | Roblox 상품 Rockstar.Store", "Rockstar.Store에서 " + name + " 상품을 확인하세요. 주문 전에 상품 정보와 가격, 재고를 살펴볼 수 있습니다."],
  zh: (name) => [name + " | Roblox 商品 Rockstar.Store", "在 Rockstar.Store 浏览" + name + "，下单前查看商品详情、价格与库存状态。"],
  fr: (name) => [name + " | Catalogue Roblox Rockstar.Store", "Découvrez " + name + " chez Rockstar.Store. Consultez les détails, les prix et la disponibilité avant de commander."],
  th: (name) => [name + " | แคตตาล็อก Roblox Rockstar.Store", "เลือกชม " + name + " ที่ Rockstar.Store ดูรายละเอียดสินค้า ราคา และสถานะสินค้าก่อนสั่งซื้อ"],
  vi: (name) => [name + " | Danh mục Roblox Rockstar.Store", "Khám phá " + name + " tại Rockstar.Store. Xem chi tiết sản phẩm, giá và tình trạng hàng trước khi đặt."]
};

const LABELS = {
  id: { back: "Semua kategori", categories: "kategori", products: "produk", stock: "Stok", sold: "Habis", buy: "Tambah ke keranjang", details: "Terverifikasi", contact: "Hubungi admin" },
  en: { back: "All categories", categories: "categories", products: "products", stock: "Stock", sold: "Sold out", buy: "Add to cart", details: "Verified", contact: "Contact admin" },
  ja: { back: "すべてのカテゴリ", categories: "カテゴリー", products: "商品", stock: "在庫", sold: "売り切れ", buy: "カートに追加", details: "認証済み", contact: "管理者に連絡" },
  ko: { back: "모든 카테고리", categories: "개 카테고리", products: "개 상품", stock: "재고", sold: "품절", buy: "장바구니에 담기", details: "인증 완료", contact: "관리자 문의" },
  zh: { back: "所有分类", categories: "个分类", products: "件商品", stock: "库存", sold: "已售罄", buy: "加入购物车", details: "已验证", contact: "联系管理员" },
  fr: { back: "Toutes les catégories", categories: "catégories", products: "produits", stock: "Stock", sold: "Épuisé", buy: "Ajouter au panier", details: "Vérifié", contact: "Contacter l’admin" },
  th: { back: "ทุกหมวดหมู่", categories: "หมวดหมู่", products: "สินค้า", stock: "สต็อก", sold: "สินค้าหมด", buy: "เพิ่มลงตะกร้า", details: "ยืนยันแล้ว", contact: "ติดต่อแอดมิน" },
  vi: { back: "Tất cả danh mục", categories: "danh mục", products: "sản phẩm", stock: "Còn hàng", sold: "Hết hàng", buy: "Thêm vào giỏ", details: "Đã xác minh", contact: "Liên hệ quản trị viên" }
};

const PAGE_HEADINGS = {
  id: { brainrot: "Brainrot", topup: "Top Up Robux", akun: "Akun Roblox", joki: "Jasa Joki" },
  en: { brainrot: "Brainrot Items", topup: "Robux Top Up", akun: "Roblox Accounts", joki: "Boosting Services" },
  ja: { brainrot: "Brainrotアイテム", topup: "Robuxチャージ", akun: "Robloxアカウント", joki: "ブーストサービス" },
  ko: { brainrot: "브레인롯 아이템", topup: "Robux 충전", akun: "Roblox 계정", joki: "부스팅 서비스" },
  zh: { brainrot: "Brainrot 道具", topup: "Robux 充值", akun: "Roblox 游戏账号", joki: "代练服务" },
  fr: { brainrot: "Objets Brainrot", topup: "Recharge Robux", akun: "Comptes Roblox", joki: "Services de boost" },
  th: { brainrot: "ไอเทม Brainrot", topup: "เติม Robux", akun: "บัญชี Roblox", joki: "บริการบูสต์" },
  vi: { brainrot: "Vật phẩm Brainrot", topup: "Nạp Robux", akun: "Tài khoản Roblox", joki: "Dịch vụ boost" }
};

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch]);
}

function safeImage(value) {
  const image = String(value || "").trim();
  return /^(https:\/\/|\/(?!\/))[^\s"<>]*$/i.test(image) ? image : "";
}

function thumbnail(value) {
  const image = safeImage(value);
  if (!image || image.indexOf("/storage/v1/object/") < 0) return image;
  const slash = image.lastIndexOf("/");
  return image.slice(0, slash + 1) + "thumb_" + image.slice(slash + 1);
}

function splitImages(value) {
  return String(value || "").split("|").map((image) => safeImage(image.trim().replace(/,+$/, ""))).filter(Boolean);
}

function isSoldOut(row) {
  return /^(ya|y|yes|habis|sold)/i.test(String(row.soldout || "").trim()) || !(Number(row.stock) > 0);
}

function buildCategories(rows) {
  const groups = new Map();
  const catImages = new Map();
  for (const row of rows) {
    const name = String(row && row.name || "").trim();
    if (!name.startsWith("CAT:")) continue;
    const category = String(row.kategori || name.slice(4)).trim() || name.slice(4).trim();
    const image = splitImages(row.image)[0] || "";
    if (category && image) catImages.set(category, image);
  }
  for (const row of rows) {
    const name = String(row && row.name || "").trim();
    if (!name || name.startsWith("CAT:") || name === "INFO_TEKS") continue;
    const categoryName = String(row.kategori || "Lainnya").trim() || "Lainnya";
    if (!groups.has(categoryName)) groups.set(categoryName, { name: categoryName, img: catImages.get(categoryName) || "", items: [] });
    const images = splitImages(row.image);
    const item = {
      name,
      price: Number(row.price) || 0,
      stock: isSoldOut(row) ? 0 : (Number(row.stock) || 0),
      img: images[0] || "",
      images,
      sold: Number(row.sold) || 0,
      views: Number(row.dilihat) || 0,
      originalPrice: Number(row.coret) > (Number(row.price) || 0) ? Number(row.coret) : 0
    };
    groups.get(categoryName).items.push(item);
    if (!groups.get(categoryName).img && images[0]) groups.get(categoryName).img = images[0];
  }
  for (const [name, image] of catImages) if (groups.has(name)) groups.get(name).img = image;
  return Array.from(groups.values()).map((category) => {
    category.items = category.items.map((item, index) => ({ item, index })).sort((a, b) => ((b.item.stock > 0) - (a.item.stock > 0)) || (a.index - b.index)).map(({ item }) => item);
    return category;
  });
}

function categoryEmoji(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.includes("robux")) return "💰";
  if (lower.includes("bundle")) return "🎁";
  if (lower.includes("gamepass") || lower.includes("game pass")) return "🎫";
  if (lower.includes("akun")) return "👤";
  if (lower.includes("joki")) return "🎮";
  if (lower.includes("telur") || lower.includes("egg")) return "🥚";
  if (lower.includes("garden") || lower.includes("tanam") || lower.includes("seed")) return "🌱";
  if (lower.includes("fish") || lower.includes("pancing") || lower.includes("dadu")) return "🎣";
  if (lower.includes("ayam") || lower.includes("curi")) return "🐔";
  if (lower.includes("koin") || lower.includes("coin")) return "🪙";
  if (lower.includes("kupon") || lower.includes("roll") || lower.includes("gulung")) return "🎰";
  return "🧠";
}

function formatRupiah(value) {
  return "Rp " + (Number(value) || 0).toLocaleString("id-ID");
}

function categoryMarkup(page, categories, lang, selectedIndex) {
  const labels = LABELS[lang] || LABELS.id;
  if (selectedIndex >= 0) {
    const category = categories[selectedIndex];
    const itemMarkup = category.items.map((item, itemIndex) => {
      const itemName = escapeHtml(item.name);
      const image = thumbnail(item.img || category.img);
      const imageMarkup = image ? `<img src="${escapeHtml(image)}" width="400" height="400" alt="${itemName}" loading="lazy">` : "";
      const available = item.stock > 0;
      const status = available ? `${escapeHtml(labels.stock)} ${item.stock}` : escapeHtml(labels.sold);
      const price = formatRupiah(item.price);
      const hidePrice = item.name.toLowerCase().includes("admin brainrot") && !item.name.toLowerCase().includes("be a lucky block") && !item.name.toLowerCase().includes("be flash");
      return `<div class="item" data-viewname="${itemName}" data-page="${page}" onclick="openDetail('${page}',${selectedIndex},${itemIndex})"><div class="thumb"><span class="catemoji">${categoryEmoji(category.name)}</span>${imageMarkup}${available ? "" : '<div class="soldstamp"><b>SOLD</b></div>'}</div><div class="ibody"><h3>${itemName}</h3><div class="meta"><span class="${available ? "stock" : "sold"}">${status}</span></div><div class="price">${hidePrice ? `<span style="color:var(--red);font-weight:600;font-size:14px;">${escapeHtml(labels.contact)}</span>` : `<span class="now">${price}</span>${item.originalPrice ? `<span class="was">${formatRupiah(item.originalPrice)}</span>` : ""}`}</div><div class="kilat"><span>⚡</span><span>🔒</span><span class="vbadge"><i>✓</i> ${escapeHtml(labels.details)}</span></div><button class="btn" ${available ? `onclick="event.stopPropagation();addItem(${selectedIndex},${itemIndex})"` : 'disabled style="background:#232c44;color:var(--mut);cursor:not-allowed;"'}>${available ? escapeHtml(labels.buy) : escapeHtml(labels.sold)}</button></div></div>`;
    }).join("");
    return {
      titleHtml: `<button class="backbtn" onclick="render()">${escapeHtml(labels.back)}</button><h2>${escapeHtml(category.name)}</h2><p>${category.items.length} ${escapeHtml(labels.products)}</p>`,
      productsHtml: `<div class="itemgrid">${itemMarkup}</div>`
    };
  }
  const cards = categories.map((category, index) => {
    const name = escapeHtml(category.name);
    const image = thumbnail(category.img);
    const imageMarkup = image ? `<img src="${escapeHtml(image)}" width="400" height="400" alt="${name}" loading="lazy">` : "";
    const href = `/?tab=${encodeURIComponent(page)}&cat=${encodeURIComponent(category.name)}${lang !== "id" ? `&lang=${encodeURIComponent(lang)}` : ""}`;
    return `<a class="catcard" href="${escapeHtml(href)}" onclick="event.preventDefault();showItems(${index})" style="display:block;color:inherit;text-decoration:none;"><div class="catimgwrap"><span class="catemoji">${categoryEmoji(category.name)}</span>${imageMarkup}</div><div class="catbody"><h3>${name}</h3><span class="go">→</span></div></a>`;
  }).join("");
  const headerText = (PAGE_HEADINGS[lang] && PAGE_HEADINGS[lang][page]) || PAGE_HEADINGS.id[page] || "Katalog Roblox";
  return {
    titleHtml: `<button class="backbtn" onclick="goHome()">${escapeHtml(labels.back)}</button><h2>${escapeHtml(headerText)}</h2><p>${categories.length} ${escapeHtml(labels.categories)}</p>`,
    productsHtml: `<div class="catgrid">${cards}</div>`
  };
}

async function getCatalogRows(context, table) {
  const cacheUrl = new URL("/__rs_ssr_catalog_cache?table=" + encodeURIComponent(table), context.request.url);
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
  try {
    const cached = await caches.default.match(cacheKey);
    if (cached) {
      const rows = await cached.json();
      if (Array.isArray(rows)) return rows;
    }
  } catch (_) {}

  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=urutan`;
  const response = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    signal: AbortSignal.timeout(1000)
  });
  if (!response.ok) throw new Error("Catalog request failed");
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("Catalog response was not an array");

  try {
    const cachedResponse = new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=20" }
    });
    context.waitUntil(caches.default.put(cacheKey, cachedResponse));
  } catch (_) {}
  return rows;
}

function routeMetadata(page, category, lang, requestUrl) {
  const pageMeta = (PAGE_META[page] && (PAGE_META[page][lang] || PAGE_META[page].id)) || ["Rockstar.Store | Roblox Catalog", "Browse Roblox products, categories, prices, and availability at Rockstar.Store."];
  const categoryMeta = category && CATEGORY_COPY[lang] ? CATEGORY_COPY[lang](category) : null;
  const [title, description] = categoryMeta || pageMeta;
  const canonicalParams = new URLSearchParams();
  canonicalParams.set("tab", page);
  if (category) canonicalParams.set("cat", category);
  if (lang !== "id") canonicalParams.set("lang", lang);
  const canonical = `https://rockstarstore.id/${canonicalParams.toString() ? `?${canonicalParams.toString()}` : ""}`;
  const alternates = Object.fromEntries(["id", "en", "ja", "ko", "zh", "fr", "th", "vi", "x-default"].map((code) => {
    const params = new URLSearchParams();
    params.set("tab", page);
    if (category) params.set("cat", category);
    if (code !== "id" && code !== "x-default") params.set("lang", code);
    return [code, `https://rockstarstore.id/?${params.toString()}`];
  }));
  return { title, description, canonical, alternates, locale: { id: "id_ID", en: "en_US", ja: "ja_JP", ko: "ko_KR", zh: "zh_CN", fr: "fr_FR", th: "th_TH", vi: "vi_VN" }[lang] || "id_ID" };
}

function markResponse(response, mode) {
  const headers = new Headers(response.headers);
  headers.set("X-RS-SSR", mode);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const page = String(url.searchParams.get("tab") || "").toLowerCase();
  if (request.method !== "GET" || url.pathname !== "/" || !PAGE_TABLES[page] || url.searchParams.has("q")) return context.next();

  const langParam = String(url.searchParams.get("lang") || "id").toLowerCase();
  const lang = LANGUAGES.includes(langParam) ? langParam : "id";
  let staticPage;
  try {
    const rows = await getCatalogRows(context, PAGE_TABLES[page]);
    const categories = buildCategories(rows);
    if (!categories.length) return context.next();
    const requestedCategory = String(url.searchParams.get("cat") || "").trim();
    const selectedIndex = requestedCategory ? categories.findIndex((category) => category.name.toLowerCase() === requestedCategory.toLowerCase()) : -1;
    const selectedCategory = selectedIndex >= 0 ? categories[selectedIndex] : null;
    const markup = categoryMarkup(page, categories, lang, selectedIndex);
    const metadata = routeMetadata(page, selectedCategory && selectedCategory.name, lang, url);
    staticPage = await context.next();

    const bootstrapRows = rows.map((row) => {
      const reduced = {};
      ["name", "kategori", "price", "stock", "soldout", "image", "sold", "dilihat", "deskripsi", "coret", "urutan"].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(row, key)) reduced[key] = row[key];
      });
      return reduced;
    });
    const bootstrap = JSON.stringify({ page, rows: bootstrapRows, categoryIndex: selectedIndex, categoryName: selectedCategory ? selectedCategory.name : null, lang }).replace(/</g, "\\u003c");
    const html = new HTMLRewriter()
      .on("html", { element(element) { element.setAttribute("lang", lang); } })
      .on("title", { element(element) { element.setInnerContent(metadata.title); } })
      .on('meta[name="description"]', { element(element) { element.setAttribute("content", metadata.description); } })
      .on('meta[name="robots"]', { element(element) { element.setAttribute("content", "index,follow"); } })
      .on('meta[property="og:title"]', { element(element) { element.setAttribute("content", metadata.title); } })
      .on('meta[property="og:description"]', { element(element) { element.setAttribute("content", metadata.description); } })
      .on('meta[property="og:url"]', { element(element) { element.setAttribute("content", metadata.canonical); } })
      .on('meta[property="og:locale"]', { element(element) { element.setAttribute("content", metadata.locale); } })
      .on('meta[name="twitter:title"]', { element(element) { element.setAttribute("content", metadata.title); } })
      .on('meta[name="twitter:description"]', { element(element) { element.setAttribute("content", metadata.description); } })
      .on('link[rel="canonical"]', { element(element) { element.setAttribute("href", metadata.canonical); } })
      .on('link[rel="alternate"][hreflang]', { element(element) {
        const language = element.getAttribute("hreflang");
        if (metadata.alternates[language]) element.setAttribute("href", metadata.alternates[language]);
      } })
      .on("#pageTitle", { element(element) { element.setInnerContent(markup.titleHtml, { html: true }); } })
      .on("#products", { element(element) { element.setInnerContent(markup.productsHtml + `<script>window.__RS_SSR_CATALOG__=${bootstrap};</script>`, { html: true }); } })
      .transform(staticPage);
    return markResponse(html, "rendered");
  } catch (_) {
    return markResponse(staticPage || await context.next(), "fallback");
  }
}
