import React from "react";
import { ARTICLES_META } from "../data/articles-meta";

export default function HomeArticles() {
  // Ambil 6 artikel terbaru untuk slider horizontal yang kaya informasi
  const articles = ARTICLES_META.slice(0, 6);

  return (
    <section className="home-articles-section" aria-labelledby="homeArticlesTitle">
      <div className="home-articles-header">
        <div className="home-articles-title-wrap">
          <h2 className="home-articles-title" id="homeArticlesTitle">
            ARTIKEL TERBARU &amp; BERITA GAME
          </h2>
          <span className="home-articles-swipe-hint">
            {"👉 Geser untuk lihat artikel lainnya"}
          </span>
        </div>
        <p className="home-articles-sub">
          Dapatkan informasi terbaru seputar dunia game! Temukan panduan lengkap untuk meningkatkan pengalaman bermain, serta berita terkini mengenai promo, update top-up, dan komunitas gamer.
        </p>
      </div>

      <div className="home-articles-scroll" role="region" aria-label="Slider Berita Roblox">
        {articles.map((article) => (
          <a
            key={article.slug}
            href={`/berita/${article.slug}`}
            className="home-article-card"
          >
            <div className="home-article-thumb">
              <img
                src={article.image}
                alt={article.title}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width="280"
                height="160"
              />
              <span
                className="home-article-badge"
                style={{ background: article.categoryColor || "#3b82f6" }}
              >
                {article.category}
              </span>
            </div>

            <div className="home-article-body">
              <span className="home-article-author">
                {article.author || "Rockstar Store"}
              </span>
              <h3 className="home-article-name">{article.title}</h3>
            </div>
          </a>
        ))}
      </div>

      <div className="home-articles-footer">
        <a href="/berita" className="home-articles-btn">
          Lihat Semua Artikel
        </a>
      </div>

      <style jsx>{`
        .home-articles-section {
          max-width: 1040px;
          margin: 32px auto 24px;
          padding: 0 16px;
          box-sizing: border-box;
          content-visibility: auto;
          contain-intrinsic-size: 290px;
        }
        .home-articles-header {
          margin-bottom: 16px;
          text-align: left;
        }
        .home-articles-title-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 6px;
        }
        .home-articles-title {
          font-size: clamp(1.1rem, 2.4vw, 1.35rem);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .home-articles-swipe-hint {
          font-size: 0.74rem;
          color: #38bdf8;
          font-weight: 600;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 3px 9px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
        }
        .home-articles-sub {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.5;
          max-width: 760px;
          margin: 0;
        }
        
        /* ===== Horizontal Slider Layout (Mirip Flash Sale) ===== */
        .home-articles-scroll {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 4px 2px 14px 2px;
          margin-bottom: 14px;
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.45) transparent;
        }
        .home-articles-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .home-articles-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 6px;
        }
        .home-articles-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 6px;
        }
        .home-articles-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }

        .home-article-card {
          flex: 0 0 260px;
          width: 260px;
          scroll-snap-align: start;
          background: rgba(13, 20, 36, 0.9);
          border: 1px solid rgba(59, 130, 246, 0.18);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
          contain: content;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        @media (min-width: 768px) {
          .home-article-card {
            flex: 0 0 290px;
            width: 290px;
          }
        }
        .home-article-card:hover {
          transform: translateY(-3px);
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
        }
        .home-article-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9.5;
          overflow: hidden;
          background: #060913;
        }
        .home-article-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.25s ease;
        }
        .home-article-card:hover .home-article-thumb img {
          transform: scale(1.04);
        }
        .home-article-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #ffffff;
          padding: 2px 7px;
          border-radius: 5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
        .home-article-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(8, 14, 26, 0.95);
        }
        .home-article-author {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .home-article-name {
          font-size: 0.86rem;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1.38;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .home-articles-footer {
          margin-top: 2px;
        }
        .home-articles-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }
        .home-articles-btn:hover {
          background: #111827;
          border-color: #3b82f6;
          color: #38bdf8;
        }
      `}</style>
    </section>
  );
}
