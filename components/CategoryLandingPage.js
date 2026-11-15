import Head from "next/head";
import Link from "next/link";
import SiteFooter from "./SiteFooter";
import { CATEGORY_LANDINGS } from "../lib/category-landings";
import { ARTICLES_META } from "../data/articles-meta";
import {
  SITE_URL,
  WHATSAPP_OFFICIAL_URL,
  formatRupiah,
  toAbsoluteImageUrl,
} from "../lib/catalog-ssr";

const NAV_TABS = [
  { href: "/", label: "Beranda" },
  { href: "/brainrot", label: "Brainrot", slug: "brainrot" },
  { href: "/akun-sepuh", label: "Akun Sepuh", slug: "akun-sepuh" },
  { href: "/joki-roblox", label: "Joki Roblox", slug: "joki-roblox" },
  { href: "/topup-robux", label: "Top Up Robux", slug: "topup-robux" },
  { href: "/berita", label: "Berita & Guide" },
  { href: "/faq", label: "FAQ" },
];

export default function CategoryLandingPage({
  landingKey,
  categories = [],
  products = [],
  stats = {},
}) {
  const config = CATEGORY_LANDINGS[landingKey] || CATEGORY_LANDINGS.brainrot;
  const {
    slug,
    tab,
    canonicalUrl,
    title,
    metaDescription,
    kicker,
    breadcrumbLabel,
    h1,
    heroSubtitle,
    quickAnswer,
    articleCategories = [],
    comparisonTitle,
    comparisonColumns = [],
    comparisonRows = [],
    safetySteps = [],
    faqs = [],
    relatedLinks = [],
  } = config;

  const relatedArticles = ARTICLES_META.filter((a) =>
    articleCategories.includes(a.category)
  ).slice(0, 4);

  const schemaProducts = products.slice(0, 12);
  const ogImage = schemaProducts[0]?.image
    ? toAbsoluteImageUrl(schemaProducts[0].image)
    : `${SITE_URL}/ROCKSTARLOGO.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: breadcrumbLabel,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        url: canonicalUrl,
        name: title,
        description: metaDescription,
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#store` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
        mainEntity: { "@id": `${canonicalUrl}#itemlist` },
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#itemlist`,
        name: h1,
        numberOfItems: schemaProducts.length,
        itemListElement: schemaProducts.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Product",
            name: item.name,
            description:
              item.deskripsi ||
              `${item.name} (${item.kategori}) di Rockstar.Store — Solusi Sepuh Roblox terpercaya Indonesia & Malaysia.`,
            image: toAbsoluteImageUrl(item.image),
            category: item.kategori || breadcrumbLabel,
            brand: { "@type": "Brand", name: "Rockstar.Store" },
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/?tab=${tab}&q=${encodeURIComponent(item.name)}`,
              priceCurrency: "IDR",
              price: String(item.price),
              availability: item.isAvailable
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              priceValidUntil: "2027-12-31",
              seller: {
                "@type": "Organization",
                name: "Rockstar.Store",
                url: `${SITE_URL}/`,
              },
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  const totalText = stats.totalProducts ? `${stats.totalProducts}+` : "Update Harian";
  const availableText =
    typeof stats.availableCount === "number" && stats.availableCount > 0
      ? `${stats.availableCount} Ready`
      : "Cek Stok WA";
  const minPriceText =
    stats.minPrice && stats.minPrice > 0 ? formatRupiah(stats.minPrice) : "Terjangkau";

  return (
    <div className="rs-cat-page">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="id" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        <link
          rel="alternate"
          type="text/plain"
          href="https://rockstarstore.id/llms.txt"
          title="LLMs.txt - AI Search Knowledge Base"
        />
        <link
          rel="alternate"
          type="text/plain"
          href="https://rockstarstore.id/llms-full.txt"
          title="LLMs-Full.txt - Comprehensive AI Guide"
        />
        <link rel="icon" type="image/png" href="/ROCKSTARICON.png" sizes="192x192" />

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:site_name" content="Rockstar.Store" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <header className="rs-cat-header">
        <div className="rs-cat-header-inner">
          <Link href="/" className="rs-cat-brand">
            <img
              src="/ROCKSTARLOGO.webp"
              alt="Rockstar.Store Logo"
              width={36}
              height={36}
            />
            <span>ROCKSTAR.STORE</span>
          </Link>

          <nav className="rs-cat-nav" aria-label="Navigasi Utama Kategori">
            {NAV_TABS.map((nav) => {
              const active = nav.slug === slug;
              return (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className={active ? "rs-cat-nav-link is-active" : "rs-cat-nav-link"}
                >
                  {nav.label}
                </Link>
              );
            })}
          </nav>

          <a href={`/?tab=${tab}`} className="rs-cat-header-cta">
            Buka Katalog App ↗
          </a>
        </div>
      </header>

      <main className="rs-cat-main">
        <nav className="rs-cat-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <span aria-hidden="true">/</span>
          <span className="current">{breadcrumbLabel}</span>
        </nav>

        <section className="rs-cat-hero">
          <span className="rs-cat-kicker">{kicker}</span>
          <h1>{h1}</h1>
          <p className="rs-cat-subtitle">{heroSubtitle}</p>

          <div className="rs-cat-metrics" aria-label="Statistik Katalog Live">
            <div className="rs-cat-metric">
              <span className="label">Total Listing</span>
              <strong>{totalText}</strong>
            </div>
            <div className="rs-cat-metric">
              <span className="label">Status Stok</span>
              <strong>{availableText}</strong>
            </div>
            <div className="rs-cat-metric">
              <span className="label">Harga Mulai</span>
              <strong>{minPriceText}</strong>
            </div>
            <div className="rs-cat-metric">
              <span className="label">Metode Bayar</span>
              <strong>QRIS • MYR • Binance</strong>
            </div>
          </div>

          <div className="rs-cat-hero-actions">
            <a href={`/?tab=${tab}`} className="rs-cat-btn-primary">
              🛒 Buka Katalog & Keranjang Interaktif
            </a>
            <a
              href={WHATSAPP_OFFICIAL_URL}
              target="_blank"
              rel="noreferrer"
              className="rs-cat-btn-secondary"
            >
              💬 Tanya Admin Rock (+62-896-6429-9571)
            </a>
          </div>
        </section>

        <section className="rs-cat-quick-answer" aria-label="Ringkasan Cepat Rockstar.Store">
          <div className="rs-cat-qa-badge">⚡ Ringkasan Resmi Rockstar.Store</div>
          <p>{quickAnswer}</p>
        </section>

        {categories.length > 0 && (
          <section className="rs-cat-section" aria-labelledby="cat-dir-heading">
            <div className="rs-cat-section-head">
              <h2 id="cat-dir-heading">Kategori {breadcrumbLabel}</h2>
              <p>Pilih map atau jenis layanan di bawah untuk melihat daftar stok interaktif.</p>
            </div>
            <div className="rs-cat-dir-grid">
              {categories.slice(0, 24).map((cat) => (
                <a
                  key={cat.name}
                  href={`/?tab=${tab}&cat=${encodeURIComponent(cat.name)}`}
                  className="rs-cat-dir-card"
                >
                  <img
                    src={cat.thumb || cat.image || "/ROCKSTARLOGO.webp"}
                    alt={`Kategori ${cat.name} di Rockstar.Store`}
                    width={52}
                    height={52}
                    loading="lazy"
                    onError={(e) => {
                      const fallback = cat.image || "/ROCKSTARLOGO.webp";
                      if (e.currentTarget.src !== fallback && !e.currentTarget.dataset.fb) {
                        e.currentTarget.dataset.fb = "1";
                        e.currentTarget.src = fallback;
                      } else if (!e.currentTarget.dataset.fb2) {
                        e.currentTarget.dataset.fb2 = "1";
                        e.currentTarget.src = "/ROCKSTARLOGO.webp";
                      }
                    }}
                  />
                  <div className="rs-cat-dir-info">
                    <h3>{cat.name}</h3>
                    <span>
                      {cat.availableCount > 0
                        ? `${cat.availableCount} Ready Stock`
                        : `${cat.count} Listing`}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="rs-cat-section" aria-labelledby="prod-showcase-heading">
          <div className="rs-cat-section-head">
            <h2 id="prod-showcase-heading">Daftar Produk & Stok {breadcrumbLabel} Terbaru</h2>
            <p>
              Data stok sinkron langsung dengan katalog utama Rockstar.Store. Klik item untuk
              membuka detail & checkout di app.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="rs-cat-prod-grid">
              {products.slice(0, 24).map((item, idx) => (
                <article key={`${item.name}-${idx}`} className="rs-cat-prod-card">
                  <a
                    href={`/?tab=${tab}&q=${encodeURIComponent(item.name)}`}
                    className="rs-cat-prod-media"
                  >
                    <img
                      src={item.thumb || item.image || "/ROCKSTARLOGO.webp"}
                      alt={`${item.name} — ${item.kategori}`}
                      width={320}
                      height={220}
                      loading="lazy"
                      onError={(e) => {
                        const fallback = item.image || "/ROCKSTARLOGO.webp";
                        if (e.currentTarget.src !== fallback && !e.currentTarget.dataset.fb) {
                          e.currentTarget.dataset.fb = "1";
                          e.currentTarget.src = fallback;
                        } else if (!e.currentTarget.dataset.fb2) {
                          e.currentTarget.dataset.fb2 = "1";
                          e.currentTarget.src = "/ROCKSTARLOGO.webp";
                        }
                      }}
                    />
                    <span
                      className={
                        item.isAvailable ? "rs-cat-stock is-ready" : "rs-cat-stock is-sold"
                      }
                    >
                      {item.isAvailable ? `Ready (${item.stock || 1})` : "Terjual / Cek WA"}
                    </span>
                  </a>
                  <div className="rs-cat-prod-body">
                    <span className="rs-cat-prod-cat">{item.kategori}</span>
                    <h3>
                      <a href={`/?tab=${tab}&q=${encodeURIComponent(item.name)}`}>
                        {item.name}
                      </a>
                    </h3>
                    <div className="rs-cat-prod-price-row">
                      <div>
                        {item.coret > item.price && (
                          <span className="rs-cat-prod-coret">
                            {formatRupiah(item.coret)}
                          </span>
                        )}
                        <strong className="rs-cat-prod-price">
                          {formatRupiah(item.price)}
                        </strong>
                      </div>
                      <a
                        href={`/?tab=${tab}&q=${encodeURIComponent(item.name)}`}
                        className="rs-cat-prod-cta"
                      >
                        Order ↗
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rs-cat-empty">
              <p>
                Stok sedang disinkronkan. Klik{" "}
                <a href={`/?tab=${tab}`}>Buka Katalog Interaktif</a> atau{" "}
                <a href={WHATSAPP_OFFICIAL_URL} target="_blank" rel="noreferrer">
                  Chat Admin Rock di WhatsApp
                </a>{" "}
                untuk cek ketersediaan terbaru.
              </p>
            </div>
          )}
        </section>

        <section className="rs-cat-section" aria-labelledby="compare-heading">
          <div className="rs-cat-section-head">
            <h2 id="compare-heading">{comparisonTitle}</h2>
          </div>
          <div className="rs-cat-table-wrap">
            <table className="rs-cat-table">
              <thead>
                <tr>
                  {comparisonColumns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rs-cat-section" aria-labelledby="safety-heading">
          <div className="rs-cat-section-head">
            <h2 id="safety-heading">Standar Keamanan & Alur Order Rockstar.Store</h2>
          </div>
          <div className="rs-cat-steps-grid">
            {safetySteps.map((step) => (
              <div key={step.title} className="rs-cat-step-card">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rs-cat-section" aria-labelledby="faq-heading">
          <div className="rs-cat-section-head">
            <h2 id="faq-heading">Pertanyaan Umum Seputar {breadcrumbLabel}</h2>
          </div>
          <div className="rs-cat-faq-list">
            {faqs.map((faq) => (
              <details key={faq.question} className="rs-cat-faq-item">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {relatedArticles.length > 0 && (
          <section className="rs-cat-section" aria-labelledby="guides-heading">
            <div className="rs-cat-section-head">
              <h2 id="guides-heading">Panduan & Tips Pilihan dari Berita Sepuh</h2>
            </div>
            <div className="rs-cat-guides-grid">
              {relatedArticles.map((art) => (
                <Link key={art.slug} href={`/berita/${art.slug}`} className="rs-cat-guide-card">
                  <span className="rs-cat-guide-cat">{art.category}</span>
                  <h3>{art.title}</h3>
                  <span className="rs-cat-guide-more">Baca Panduan Lengkap →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rs-cat-crosslinks" aria-label="Layanan Lainnya">
          {relatedLinks.map((lnk) => (
            <Link key={lnk.href} href={lnk.href} className="rs-cat-cross-pill">
              {lnk.label} →
            </Link>
          ))}
        </section>
      </main>

      <SiteFooter />

      <style jsx global>{`
        .rs-cat-page {
          min-height: 100vh;
          background: radial-gradient(circle at top center, #0e1d44 0%, #050914 48%, #03060e 100%);
          color: #e2e8f0;
          font-family: var(--font-poppins), "Poppins", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .rs-cat-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(5, 9, 20, 0.94);
          border-bottom: 1px solid rgba(96, 165, 250, 0.22);
          backdrop-filter: blur(10px);
        }
        .rs-cat-header-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .rs-cat-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: 0.5px;
          text-decoration: none;
        }
        .rs-cat-brand img {
          border-radius: 50%;
          border: 1px solid rgba(243, 210, 122, 0.45);
        }
        .rs-cat-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .rs-cat-nav-link {
          padding: 7px 12px;
          border-radius: 99px;
          font-size: 12.5px;
          font-weight: 700;
          color: #cbd5e1;
          text-decoration: none;
          border: 1px solid transparent;
          transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;
        }
        .rs-cat-nav-link:hover {
          color: #ffffff;
          background: rgba(59, 130, 246, 0.16);
        }
        .rs-cat-nav-link.is-active {
          color: #fef08a;
          background: rgba(37, 99, 235, 0.3);
          border-color: rgba(243, 210, 122, 0.45);
        }
        .rs-cat-header-cta {
          padding: 8px 15px;
          border-radius: 99px;
          font-size: 12.5px;
          font-weight: 800;
          color: #060913;
          background: linear-gradient(135deg, #f3d27a, #eab308);
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(234, 179, 8, 0.32);
        }
        .rs-cat-main {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px 16px 54px;
        }
        .rs-cat-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #94a3b8;
          margin-bottom: 18px;
        }
        .rs-cat-breadcrumb a {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 600;
        }
        .rs-cat-breadcrumb .current {
          color: #f8fafc;
          font-weight: 700;
        }
        .rs-cat-hero {
          background: linear-gradient(145deg, rgba(16, 30, 68, 0.92), rgba(7, 13, 30, 0.96));
          border: 1px solid rgba(96, 165, 250, 0.3);
          border-radius: 22px;
          padding: clamp(22px, 4vw, 38px);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45);
        }
        .rs-cat-kicker {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #f3d27a;
          background: rgba(243, 210, 122, 0.12);
          border: 1px solid rgba(243, 210, 122, 0.35);
          padding: 5px 12px;
          border-radius: 99px;
          margin-bottom: 12px;
        }
        .rs-cat-hero h1 {
          margin: 0 0 12px;
          font-size: clamp(24px, 4.4vw, 38px);
          line-height: 1.2;
          font-weight: 900;
          color: #ffffff;
        }
        .rs-cat-subtitle {
          margin: 0 0 22px;
          max-width: 780px;
          font-size: 15px;
          line-height: 1.65;
          color: #cbd5e1;
        }
        .rs-cat-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }
        .rs-cat-metric {
          background: rgba(4, 9, 22, 0.72);
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .rs-cat-metric .label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          color: #93c5fd;
          margin-bottom: 3px;
        }
        .rs-cat-metric strong {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
        }
        .rs-cat-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .rs-cat-btn-primary,
        .rs-cat-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
        }
        .rs-cat-btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: 1px solid #60a5fa;
          color: #ffffff;
          box-shadow: 0 8px 22px rgba(37, 99, 235, 0.42);
        }
        .rs-cat-btn-secondary {
          background: rgba(16, 185, 129, 0.14);
          border: 1px solid rgba(52, 211, 153, 0.45);
          color: #6ee7b7;
        }
        .rs-cat-quick-answer {
          margin-top: 22px;
          background: linear-gradient(135deg, rgba(243, 210, 122, 0.1), rgba(37, 99, 235, 0.12));
          border: 1px solid rgba(243, 210, 122, 0.38);
          border-radius: 18px;
          padding: 18px 20px;
        }
        .rs-cat-qa-badge {
          font-size: 12px;
          font-weight: 800;
          color: #fde68a;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
        }
        .rs-cat-quick-answer p {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.65;
          color: #f8fafc;
        }
        .rs-cat-section {
          margin-top: 38px;
        }
        .rs-cat-section-head h2 {
          margin: 0 0 6px;
          font-size: clamp(20px, 3vw, 26px);
          font-weight: 800;
          color: #ffffff;
        }
        .rs-cat-section-head p {
          margin: 0 0 18px;
          font-size: 14px;
          color: #94a3b8;
        }
        .rs-cat-dir-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .rs-cat-dir-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(12, 22, 49, 0.88);
          border: 1px solid rgba(96, 165, 250, 0.24);
          text-decoration: none;
          transition: transform 0.16s ease, border-color 0.16s ease;
        }
        .rs-cat-dir-card:hover {
          transform: translateY(-2px);
          border-color: #60a5fa;
        }
        .rs-cat-dir-card img {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
          background: #040814;
        }
        .rs-cat-dir-info h3 {
          margin: 0 0 3px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
        }
        .rs-cat-dir-info span {
          font-size: 11.5px;
          font-weight: 600;
          color: #38bdf8;
        }
        .rs-cat-prod-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
          gap: 16px;
        }
        .rs-cat-prod-card {
          background: linear-gradient(160deg, #0e1c40 0%, #070e20 100%);
          border: 1px solid rgba(96, 165, 250, 0.26);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .rs-cat-prod-media {
          position: relative;
          display: block;
          aspect-ratio: 4 / 3;
          background: #040814;
          overflow: hidden;
        }
        .rs-cat-prod-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .rs-cat-stock {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 9px;
          border-radius: 99px;
        }
        .rs-cat-stock.is-ready {
          background: rgba(16, 185, 129, 0.9);
          color: #ffffff;
        }
        .rs-cat-stock.is-sold {
          background: rgba(100, 116, 139, 0.9);
          color: #f8fafc;
        }
        .rs-cat-prod-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .rs-cat-prod-cat {
          font-size: 11px;
          font-weight: 700;
          color: #93c5fd;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .rs-cat-prod-body h3 {
          margin: 0 0 12px;
          font-size: 13.5px;
          line-height: 1.4;
          font-weight: 700;
          flex: 1;
        }
        .rs-cat-prod-body h3 a {
          color: #ffffff;
          text-decoration: none;
        }
        .rs-cat-prod-price-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(96, 165, 250, 0.18);
        }
        .rs-cat-prod-coret {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          text-decoration: line-through;
        }
        .rs-cat-prod-price {
          font-size: 15px;
          font-weight: 900;
          color: #f3d27a;
        }
        .rs-cat-prod-cta {
          padding: 7px 11px;
          border-radius: 9px;
          background: #2563eb;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }
        .rs-cat-empty {
          padding: 20px;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(96, 165, 250, 0.25);
        }
        .rs-cat-empty a {
          color: #38bdf8;
          font-weight: 700;
        }
        .rs-cat-table-wrap {
          overflow-x: auto;
          border-radius: 16px;
          border: 1px solid rgba(96, 165, 250, 0.25);
          background: rgba(7, 13, 30, 0.9);
        }
        .rs-cat-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 640px;
          font-size: 13.5px;
        }
        .rs-cat-table th,
        .rs-cat-table td {
          padding: 13px 15px;
          text-align: left;
          border-bottom: 1px solid rgba(59, 130, 246, 0.16);
          vertical-align: top;
        }
        .rs-cat-table th {
          background: rgba(30, 58, 138, 0.4);
          color: #f8fafc;
          font-weight: 800;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .rs-cat-table td:first-child {
          font-weight: 700;
          color: #fde68a;
        }
        .rs-cat-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .rs-cat-step-card {
          background: rgba(10, 20, 44, 0.88);
          border: 1px solid rgba(96, 165, 250, 0.24);
          border-radius: 16px;
          padding: 18px;
        }
        .rs-cat-step-card h3 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
        }
        .rs-cat-step-card p {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .rs-cat-faq-list {
          display: grid;
          gap: 10px;
        }
        .rs-cat-faq-item {
          background: rgba(10, 20, 44, 0.9);
          border: 1px solid rgba(96, 165, 250, 0.24);
          border-radius: 14px;
          padding: 14px 18px;
        }
        .rs-cat-faq-item summary {
          cursor: pointer;
          font-size: 14.5px;
          font-weight: 700;
          color: #ffffff;
        }
        .rs-cat-faq-item p {
          margin: 10px 0 0;
          font-size: 13.5px;
          line-height: 1.65;
          color: #cbd5e1;
        }
        .rs-cat-guides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .rs-cat-guide-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
          border-radius: 15px;
          background: rgba(11, 21, 48, 0.92);
          border: 1px solid rgba(96, 165, 250, 0.24);
          text-decoration: none;
        }
        .rs-cat-guide-cat {
          font-size: 11px;
          font-weight: 800;
          color: #38bdf8;
          margin-bottom: 6px;
        }
        .rs-cat-guide-card h3 {
          margin: 0 0 12px;
          font-size: 14px;
          line-height: 1.45;
          color: #ffffff;
        }
        .rs-cat-guide-more {
          font-size: 12.5px;
          font-weight: 700;
          color: #f3d27a;
        }
        .rs-cat-crosslinks {
          margin-top: 34px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .rs-cat-cross-pill {
          padding: 10px 15px;
          border-radius: 99px;
          background: rgba(37, 99, 235, 0.2);
          border: 1px solid rgba(96, 165, 250, 0.35);
          color: #dbeafe;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
