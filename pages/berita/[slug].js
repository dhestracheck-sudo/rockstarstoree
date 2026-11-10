import Head from "next/head";
import Link from "next/link";
import { ARTICLES, getArticleBySlug, getAllArticleSlugs } from "../../data/articles";

export async function getStaticPaths() {
  const slugs = getAllArticleSlugs();
  const paths = slugs.map((slug) => ({ params: { slug } }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return { notFound: true };
  }
  const relatedArticles = ARTICLES.filter((a) => a.slug !== params.slug).slice(0, 2);
  return {
    props: {
      article,
      relatedArticles,
    },
    revalidate: 3600,
  };
}

export default function BeritaDetail({ article, relatedArticles }) {
  const canonicalUrl = `https://rockstarstore.id/berita/${article.slug}`;
  const fullImageUrl = `https://rockstarstore.id${article.image}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt,
    "image": [fullImageUrl],
    "datePublished": article.isoDate,
    "dateModified": article.isoDate,
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": "https://rockstarstore.id"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rockstar.Store",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rockstarstore.id/ROCKSTARLOGO.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": canonicalUrl
      }
    ]
  };

  const shareWaUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `🔥 Baca berita Roblox terbaru: *${article.title}*\n\nBaca selengkapnya di: ${canonicalUrl}`
  )}`;

  return (
    <>
      <Head>
        <title>{`${article.title} | Rockstar.Store`}</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${article.title} | Rockstar.Store`} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={fullImageUrl} />
        <meta property="article:published_time" content={article.isoDate} />
        <meta property="article:author" content={article.author} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${article.title} | Rockstar.Store`} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={fullImageUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </Head>

      <div className="article-page-wrapper">
        <header className="article-header">
          <div className="article-header-inner">
            <Link href="/" className="article-brand">
              <img src="/optimized/ROCKSTARLOGO-72.webp" alt="Rockstar Store" width="34" height="34" />
              <span>ROCKSTAR.STORE</span>
            </Link>
            <div className="header-nav-actions">
              <Link href="/berita" className="btn-nav-link">
                Semua Berita
              </Link>
              <Link href="/" className="btn-back-store">
                ← Ke Toko
              </Link>
            </div>
          </div>
        </header>

        <main className="article-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/berita">Berita</Link>
            <span>/</span>
            <span className="current">{article.category}</span>
          </nav>

          <article className="article-content-wrapper">
            <header className="article-post-header">
              <span className="article-category-badge" style={{ backgroundColor: article.categoryColor }}>
                {article.category}
              </span>
              <h1>{article.title}</h1>
              <div className="article-meta-row">
                <span>✍️ {article.author}</span>
                <span className="dot">•</span>
                <span>📅 {article.date}</span>
                <span className="dot">•</span>
                <span>⏱️ {article.readTime}</span>
                <span className="dot">•</span>
                <span>👁 {article.views} pembaca</span>
              </div>
            </header>

            <div className="article-cover-media">
              <img
                src={article.image}
                alt={article.title}
                loading="eager"
                decoding="async"
              />
            </div>

            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />

            <footer className="article-post-footer">
              <div className="article-tags">
                <span className="tags-label">Tag:</span>
                {article.tags.map((tag) => (
                  <span className="tag-pill" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="article-share">
                <span>Bagikan ke teman:</span>
                <a href={shareWaUrl} target="_blank" rel="noopener noreferrer" className="btn-share-wa">
                  💬 Share WhatsApp
                </a>
              </div>
            </footer>
          </article>

          {relatedArticles.length > 0 && (
            <section className="related-section">
              <h3>Artikel Roblox Lainnya</h3>
              <div className="related-grid">
                {relatedArticles.map((rel) => (
                  <Link href={`/berita/${rel.slug}`} className="related-card" key={rel.slug}>
                    <img src={rel.image} alt={rel.title} loading="lazy" />
                    <div className="related-card-info">
                      <span className="related-badge" style={{ color: rel.categoryColor }}>
                        {rel.category}
                      </span>
                      <h4>{rel.title}</h4>
                      <span className="related-date">{rel.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="article-site-footer">
          <p>© 2026 Rockstar.Store · Solusi Sepuh Roblox #1 Paling Terpercaya</p>
        </footer>
      </div>

      <style jsx global>{`
        .article-page-wrapper {
          min-height: 100vh;
          background: #060913;
          color: #f2f5ff;
          font-family: var(--font-poppins), sans-serif;
        }
        .article-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(4, 8, 20, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(110, 140, 255, 0.16);
        }
        .article-header-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .article-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #fff;
          font-weight: 800;
          font-size: 16px;
        }
        .article-brand img {
          border-radius: 50%;
        }
        .header-nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-nav-link {
          font-size: 13px;
          color: #a1b0d0;
          text-decoration: none;
          font-weight: 600;
          padding: 6px 12px;
        }
        .btn-nav-link:hover {
          color: #fff;
        }
        .btn-back-store {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          border-radius: 99px;
          background: #2b4eff;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-back-store:hover {
          background: #4667ff;
        }
        .article-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 24px 18px 60px;
        }
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #64748b;
          margin-bottom: 24px;
        }
        .breadcrumbs a {
          color: #8b96b3;
          text-decoration: none;
        }
        .breadcrumbs a:hover {
          color: #2b4eff;
        }
        .breadcrumbs .current {
          color: #cbd5e1;
          font-weight: 600;
        }
        .article-post-header {
          margin-bottom: 24px;
        }
        .article-category-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 8px;
          color: #fff;
          margin-bottom: 14px;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }
        .article-post-header h1 {
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 900;
          line-height: 1.25;
          margin: 0 0 16px;
          color: #f8fafc;
        }
        .article-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #8b96b3;
          flex-wrap: wrap;
        }
        .article-cover-media {
          width: 100%;
          height: auto;
          max-height: 420px;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 32px;
          border: 1px solid rgba(120, 150, 255, 0.16);
          background: #080f1d;
        }
        .article-cover-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .article-body {
          font-size: 16px;
          line-height: 1.8;
          color: #d1d9ec;
        }
        .article-body p {
          margin: 0 0 20px;
        }
        .article-body p.lead {
          font-size: 18px;
          line-height: 1.7;
          color: #e2e8f0;
          font-weight: 500;
        }
        .article-body h2 {
          font-size: clamp(20px, 3.8vw, 26px);
          font-weight: 800;
          color: #fff;
          margin: 36px 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(110, 140, 255, 0.18);
        }
        .article-body h3 {
          font-size: 20px;
          font-weight: 700;
          color: #93c5fd;
          margin: 28px 0 14px;
        }
        .article-body ul, .article-body ol {
          margin: 0 0 24px;
          padding-left: 24px;
        }
        .article-body li {
          margin-bottom: 8px;
        }
        .article-body code {
          background: rgba(43, 78, 255, 0.18);
          color: #93c5fd;
          padding: 3px 8px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14.5px;
          font-weight: 700;
          border: 1px solid rgba(110, 140, 255, 0.25);
        }
        .tip-box {
          background: rgba(43, 78, 255, 0.12);
          border-left: 4px solid #2b4eff;
          border-radius: 12px;
          padding: 18px 20px;
          margin: 28px 0;
        }
        .tip-box.alert-danger {
          background: rgba(239, 68, 68, 0.12);
          border-left-color: #ef4444;
        }
        .tip-box h4 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #fff;
        }
        .tip-box p, .tip-box ul, .tip-box ol {
          margin: 0;
          font-size: 14.5px;
          color: #cbd5e1;
        }
        .code-table-wrap {
          overflow-x: auto;
          margin: 24px 0;
          border-radius: 14px;
          border: 1px solid rgba(120, 150, 255, 0.18);
        }
        .code-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          background: #090e1c;
        }
        .code-table th {
          background: #111a33;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 700;
          color: #9ddcff;
        }
        .code-table td {
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 14px;
        }
        .badge-active {
          display: inline-block;
          background: #22c55e;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .cta-card {
          background: linear-gradient(135deg, rgba(43, 78, 255, 0.28), rgba(16, 28, 70, 0.45));
          border: 1px solid rgba(110, 140, 255, 0.35);
          border-radius: 18px;
          padding: 28px 24px;
          margin: 36px 0;
          text-align: center;
        }
        .cta-card.safe-theme {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(12, 34, 48, 0.45));
          border-color: rgba(16, 185, 129, 0.35);
        }
        .cta-card h3 {
          margin: 0 0 10px;
          color: #fff;
          font-size: 21px;
        }
        .cta-card p {
          color: #d1d9ec;
          font-size: 14px;
          max-width: 580px;
          margin: 0 auto 20px;
        }
        .cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cta-btn {
          padding: 11px 22px;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 10px;
          text-decoration: none;
          transition: transform 0.15s;
        }
        .cta-btn.primary {
          background: #2b4eff;
          color: #fff;
          box-shadow: 0 4px 14px rgba(43, 78, 255, 0.4);
        }
        .cta-btn.secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .cta-btn:hover {
          transform: translateY(-2px);
        }
        .article-post-footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .article-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tags-label {
          font-size: 12px;
          color: #64748b;
        }
        .tag-pill {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 12px;
          color: #94a3b8;
        }
        .article-share {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }
        .btn-share-wa {
          background: #25d366;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 99px;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);
          transition: transform 0.15s;
        }
        .btn-share-wa:hover {
          transform: translateY(-2px);
        }
        .related-section {
          margin-top: 50px;
          padding-top: 32px;
          border-top: 1px solid rgba(110, 140, 255, 0.15);
        }
        .related-section h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 20px;
          color: #fff;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }
        .related-card {
          background: #0b1120;
          border: 1px solid rgba(120, 150, 255, 0.14);
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          gap: 14px;
          padding: 12px;
          transition: border-color 0.15s, transform 0.15s;
        }
        .related-card:hover {
          border-color: #2b4eff;
          transform: translateY(-2px);
        }
        .related-card img {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .related-card-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .related-badge {
          font-size: 10.5px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .related-card-info h4 {
          font-size: 13.5px;
          font-weight: 700;
          color: #f2f5ff;
          margin: 0 0 6px;
          line-height: 1.35;
        }
        .related-date {
          font-size: 11.5px;
          color: #64748b;
        }
        .article-site-footer {
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
