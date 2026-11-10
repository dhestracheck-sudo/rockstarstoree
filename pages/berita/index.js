import Head from "next/head";
import Link from "next/link";
import { ARTICLES } from "../../data/articles";

export default function BeritaPortal() {
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
        <link rel="canonical" href="https://rockstarstore.id/berita" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Berita & Update Roblox Terbaru Hari Ini | Rockstar.Store" />
        <meta property="og:description" content="Kumpulan berita Roblox terbaru hari ini, update game, kode redeem gratis, dan tips trik cara cepat jadi sepuh di Rockstar Store." />
        <meta property="og:url" content="https://rockstarstore.id/berita" />
        <meta property="og:image" content="https://rockstarstore.id/STEAL%20A%20EGG%20DISPLAY.webp" />
        <meta name="twitter:card" content="summary_large_image" />
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
            {ARTICLES.map((article, idx) => (
              <article className="news-card" key={article.slug}>
                <Link href={`/berita/${article.slug}`} className="news-card-media">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
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
        .news-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.2) 0%, rgba(13, 22, 48, 0.95) 45%, #060b17 100%);
          color: #f2f5ff;
          font-family: var(--font-poppins), sans-serif;
        }
        .news-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(4, 8, 20, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(110, 140, 255, 0.16);
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
          color: #fff;
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
          font-weight: 600;
          color: #8b96b3;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .btn-back-home:hover {
          color: #fff;
          background: rgba(43, 78, 255, 0.25);
          border-color: #2b4eff;
        }
        .news-main-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 32px 18px 60px;
        }
        .news-hero {
          text-align: center;
          margin-bottom: 40px;
        }
        .news-kicker {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          color: #6fa0ff;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }
        .news-hero h1 {
          font-size: clamp(26px, 5.5vw, 42px);
          font-weight: 900;
          margin: 0 0 12px;
          background: linear-gradient(90deg, #fff, #9ddcff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .news-hero p {
          max-width: 640px;
          margin: 0 auto;
          color: #8b96b3;
          font-size: 14.5px;
          line-height: 1.6;
        }
        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 26px;
          margin-bottom: 50px;
        }
        .news-card {
          background: #0b1120;
          border: 1px solid rgba(120, 150, 255, 0.16);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .news-card:hover {
          transform: translateY(-4px);
          border-color: rgba(43, 78, 255, 0.55);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
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
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        }
        .news-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .news-meta {
          font-size: 12px;
          color: #8b96b3;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .news-card-body h2 {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.4;
          margin: 0 0 10px;
        }
        .news-card-body h2 a {
          color: #f2f5ff;
          text-decoration: none;
          transition: color 0.15s;
        }
        .news-card-body h2 a:hover {
          color: #6fa0ff;
        }
        .news-card-body p {
          color: #8b96b3;
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
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 12.5px;
        }
        .news-author {
          color: #8b96b3;
        }
        .news-read-link {
          color: #6fa0ff;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s ease;
        }
        .news-read-link:hover {
          transform: translateX(3px);
          color: #9ddcff;
        }
        .news-cta-banner {
          background: linear-gradient(135deg, rgba(43, 78, 255, 0.22), rgba(18, 34, 94, 0.35));
          border: 1px solid rgba(110, 140, 255, 0.28);
          border-radius: 20px;
          padding: 34px 24px;
          text-align: center;
        }
        .cta-banner-content h2 {
          font-size: clamp(20px, 4.5vw, 28px);
          margin: 0 0 10px;
          color: #fff;
        }
        .cta-banner-content p {
          color: #d7dced;
          font-size: 14px;
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
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(217, 119, 6, 0.4);
          transition: transform 0.15s;
        }
        .btn-cta-blue {
          background: #2b4eff;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(43, 78, 255, 0.4);
          transition: transform 0.15s;
        }
        .btn-cta-gold:hover, .btn-cta-blue:hover {
          transform: translateY(-2px);
        }
        .news-footer {
          text-align: center;
          padding: 30px 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 13px;
          color: #64748b;
        }
      `}</style>
    </>
  );
}
