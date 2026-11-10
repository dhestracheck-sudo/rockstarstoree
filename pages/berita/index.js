import Head from "next/head";
import Link from "next/link";
import { ARTICLES_META } from "../../data/articles-meta";

export async function getStaticProps() {
  return {
    props: {
      articles: ARTICLES_META,
    },
    revalidate: 3600,
  };
}

export default function BeritaPortal({ articles = ARTICLES_META }) {
  const portalJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Berita & Update Roblox Terbaru | Rockstar.Store",
    "description": "Portal berita resmi Roblox, update game terbaru, kode redeem aktif, dan tips trik jadi sepuh Roblox di Rockstar Store.",
    "url": "https://rockstarstore.id/berita",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Rockstar.Store",
      "url": "https://rockstarstore.id"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Beranda",
          "item": "https://rockstarstore.id/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Berita",
          "item": "https://rockstarstore.id/berita"
        }
      ]
    }
  };

  return (
    <>
      <Head>
        <title>Berita & Update Roblox Terbaru Hari Ini | Rockstar.Store</title>
        <meta name="description" content="Kumpulan berita Roblox terbaru hari ini, update game, daftar kode redeem gratis yang masih aktif, dan tips trik cara cepat jadi sepuh di Rockstar Store." />
        <meta name="keywords" content="berita roblox terbaru, tips steal an egg roblox, kode redeem blox fruits, cara jadi sepuh roblox, info update roblox 2026, rockstar store" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://rockstarstore.id/berita" />
        <meta property="og:site_name" content="Rockstar.Store" />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Berita & Update Roblox Terbaru Hari Ini | Rockstar.Store" />
        <meta property="og:description" content="Kumpulan berita Roblox terbaru hari ini, update game, kode redeem gratis, dan tips trik cara cepat jadi sepuh di Rockstar Store." />
        <meta property="og:url" content="https://rockstarstore.id/berita" />
        <meta property="og:image" content="https://rockstarstore.id/STEAL%20A%20EGG%20DISPLAY.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@RockstarStore" />
        <meta name="twitter:title" content="Berita & Update Roblox Terbaru Hari Ini | Rockstar.Store" />
        <meta name="twitter:description" content="Kumpulan berita Roblox terbaru hari ini, update game, kode redeem gratis, dan tips trik jadi sepuh di Rockstar Store." />
        <meta name="twitter:image" content="https://rockstarstore.id/STEAL%20A%20EGG%20DISPLAY.webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portalJsonLd) }} />
      </Head>

      <div className="news-page-wrapper">
        <header className="news-header">
          <div className="news-header-inner">
            <Link href="/" className="news-brand">
              <img src="/optimized/ROCKSTARLOGO-72.webp" alt="Rockstar Store" width="34" height="34" />
              <span>ROCKSTAR.STORE</span>
            </Link>
            <Link href="/" className="btn-back-home">
              ← Kembali ke Toko
            </Link>
          </div>
        </header>

        <main className="news-main-container">
          <section className="news-hero">
            <span className="news-kicker">PORTAL RESMI ROBLOX INDONESIA</span>
            <h1>Berita & Panduan Roblox Terbaru</h1>
            <p>Update game terkini, kode redeem gratis aktif, bocoran event langka, dan tips rahasia cara cepat jadi sepuh Roblox.</p>
          </section>

          <section className="news-grid">
            {articles.map((article, idx) => (
              <article className="news-card" key={article.slug}>
                <Link href={`/berita/${article.slug}`} className="news-card-media">
                  <img
                    src={article.image}
                    alt={article.title}
                    width="340"
                    height="190"
                    loading={idx < 2 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx === 0 ? "high" : "low"}
                  />
                  <span className="news-card-badge" style={{ backgroundColor: article.categoryColor }}>
                    {article.category}
                  </span>
                </Link>
                <div className="news-card-body">
                  <div className="news-meta">
                    <span className="news-date">📅 {article.date}</span>
                    <span className="news-dot">•</span>
                    <span className="news-time">⏱️ {article.readTime}</span>
                  </div>
                  <h2>
                    <Link href={`/berita/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p>{article.excerpt}</p>
                  <div className="news-card-footer">
                    <span className="news-author">✍️ {article.author}</span>
                    <Link href={`/berita/${article.slug}`} className="news-read-link">
                      Baca Artikel ➔
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="news-cta-banner">
            <div className="cta-banner-content">
              <h2>🎮 Cari Akun Sepuh & Item Roblox Terpercaya?</h2>
              <p>Belanja aman 100%, proses kilat hitungan menit, dan CS WhatsApp fast response hanya di Rockstar Store.</p>
              <div className="cta-banner-buttons">
                <Link href="/?tab=akun" className="btn-cta-gold">
                  Lihat Akun Sepuh 👤
                </Link>
                <Link href="/?tab=topup" className="btn-cta-blue">
                  Top Up Robux Murah 💰
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="news-footer">
          <p>© 2026 Rockstar.Store · Solusi Sepuh Roblox #1 Paling Terpercaya</p>
        </footer>
      </div>

      <style jsx global>{`
        html, body {
          background-color: #060913 !important;
          color: #f2f5ff;
          margin: 0;
          padding: 0;
        }
        .news-page-wrapper {
          min-height: 100vh;
          background-color: #060913;
          background-image: 
            radial-gradient(ellipse 90% 480px at 50% 0%, #0d1e4a 0%, transparent 80%),
            radial-gradient(circle at 85% 20%, #0b193d 0%, transparent 55%),
            linear-gradient(180deg, #070d1e 0%, #050811 100%);
          background-attachment: fixed;
          color: #f2f5ff;
          font-family: var(--font-poppins), sans-serif;
        }
        .news-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(6, 10, 22, 0.95);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.25);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        .news-header-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .news-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #ffffff;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.5px;
        }
        .news-brand img {
          border-radius: 50%;
        }
        .btn-back-home {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          border-radius: 99px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: 1px solid #60a5fa;
          text-decoration: none;
          box-shadow: 0 3px 12px rgba(37, 99, 235, 0.4);
          transition: all 0.18s ease;
        }
        .btn-back-home:hover {
          color: #ffffff;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          box-shadow: 0 5px 18px rgba(37, 99, 235, 0.6);
          transform: translateY(-1px);
        }
        .news-main-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 36px 18px 60px;
        }
        .news-hero {
          text-align: center;
          margin-bottom: 44px;
        }
        .news-kicker {
          display: inline-block;
          font-size: 13px;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 2px;
          margin-bottom: 10px;
          text-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
        }
        .news-hero h1 {
          font-size: clamp(26px, 5.5vw, 42px);
          font-weight: 900;
          margin: 0 0 14px;
          color: #ffffff;
          text-shadow: 0 3px 16px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.5);
          letter-spacing: -0.5px;
        }
        .news-hero p {
          max-width: 660px;
          margin: 0 auto;
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.65;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        }
        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 26px;
          margin-bottom: 50px;
        }
        .news-card {
          content-visibility: auto;
          contain-intrinsic-size: 380px;
          background: linear-gradient(150deg, #0e1b3d 0%, #081024 100%);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(96, 165, 250, 0.15);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .news-card:hover {
          transform: translateY(-4px);
          border-color: #60a5fa;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.6), 0 0 20px rgba(37, 99, 235, 0.4);
        }
        .news-card-media {
          position: relative;
          display: block;
          height: 190px;
          overflow: hidden;
          background: #040814;
        }
        .news-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .news-card:hover .news-card-media img {
          transform: scale(1.05);
        }
        .news-card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }
        .news-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          background: linear-gradient(180deg, #0d1836 0%, #070e1f 100%);
        }
        .news-meta {
          font-size: 12px;
          color: #93c5fd;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
        .news-card-body h2 {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.4;
          margin: 0 0 10px;
        }
        .news-card-body h2 a {
          color: #ffffff;
          text-decoration: none;
          transition: color 0.15s;
        }
        .news-card-body h2 a:hover {
          color: #60a5fa;
        }
        .news-card-body p {
          color: #cbd5e1;
          font-size: 13.5px;
          line-height: 1.6;
          margin: 0 0 18px;
          flex: 1;
        }
        .news-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid rgba(59, 130, 246, 0.2);
          font-size: 12.5px;
        }
        .news-author {
          color: #93c5fd;
          font-weight: 600;
        }
        .news-read-link {
          color: #38bdf8;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s ease;
        }
        .news-read-link:hover {
          transform: translateX(3px);
          color: #93c5fd;
        }
        .news-cta-banner {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(16, 28, 64, 0.9) 100%);
          border: 1px solid rgba(59, 130, 246, 0.4);
          border-radius: 20px;
          padding: 34px 24px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .cta-banner-content h2 {
          font-size: clamp(20px, 4.5vw, 28px);
          margin: 0 0 10px;
          color: #ffffff;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
        }
        .cta-banner-content p {
          color: #cbd5e1;
          font-size: 14.5px;
          max-width: 580px;
          margin: 0 auto 22px;
        }
        .cta-banner-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .btn-cta-gold {
          background: linear-gradient(90deg, #f59e0b, #d97706);
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(217, 119, 6, 0.4);
          transition: transform 0.15s;
        }
        .btn-cta-blue {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: 1px solid #60a5fa;
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45);
          transition: transform 0.15s;
        }
        .btn-cta-gold:hover, .btn-cta-blue:hover {
          transform: translateY(-2px);
        }
        .news-footer {
          text-align: center;
          padding: 30px 18px;
          border-top: 1px solid rgba(59, 130, 246, 0.2);
          font-size: 13px;
          color: #94a3b8;
        }
      `}</style>
    </>
  );
}
