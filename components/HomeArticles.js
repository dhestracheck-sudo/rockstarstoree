import React from "react";
import { HOME_ARTICLES } from "../data/articles-meta";

export default function HomeArticles() {
  // Ambil artikel terbaru untuk slider horizontal yang kaya informasi (hanya 8 artikel = ultra-ringan <2KB)
  const articles = HOME_ARTICLES;

  return (
    <section className="home-articles-section" aria-labelledby="homeArticlesTitle">
      <div className="home-articles-header">
        <div className="home-articles-title-wrap">
          <h2 className="home-articles-title" id="homeArticlesTitle">
            {"ARTIKEL TERBARU & BERITA GAME"}
          </h2>
          <span className="home-articles-swipe-hint">
            {"👉 Geser untuk lihat artikel"}
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
                style={{ background: article.categoryColor || "#2563eb" }}
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
          <span>{"Lihat Semua Artikel"}</span>
          <span className="home-articles-btn-arrow">{"→"}</span>
        </a>
      </div>

      <style jsx>{`
        .home-articles-section {
          max-width: 1040px;
          margin: 36px auto 24px;
          padding: 0 16px;
          box-sizing: border-box;
          content-visibility: auto;
          contain-intrinsic-size: 300px;
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
          text-shadow: 0 0 18px rgba(59, 130, 246, 0.4);
        }
        .home-articles-swipe-hint {
          font-size: 0.74rem;
          color: #60a5fa;
          font-weight: 700;
          background: rgba(37, 99, 235, 0.16);
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 3px 10px;
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
        
        /* ===== Horizontal Slider Layout (Tanpa Grid Kotak Luar) ===== */
        .home-articles-scroll {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 6px 2px 14px 2px;
          margin-bottom: 14px;
          scrollbar-width: thin;
          scrollbar-color: #2563eb rgba(255, 255, 255, 0.05);
        }
        .home-articles-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .home-articles-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
        .home-articles-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #1d4ed8, #3b82f6);
          border-radius: 6px;
          box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
        }

        /* ===== Kartu Berita Biru Rockstar ===== */
        .home-article-card {
          flex: 0 0 260px;
          width: 260px;
          scroll-snap-align: start;
          background: linear-gradient(150deg, #111f42 0%, #0a1329 100%);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(96, 165, 250, 0.2);
          contain: content;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        @media (min-width: 768px) {
          .home-article-card {
            flex: 0 0 290px;
            width: 290px;
          }
        }
        .home-article-card:hover {
          transform: translateY(-4px);
          border-color: #60a5fa;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5), 0 0 18px rgba(37, 99, 235, 0.4);
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
          font-size: 0.66rem;
          font-weight: 700;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
        .home-article-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          border-top: 1px solid rgba(59, 130, 246, 0.25);
          background: linear-gradient(180deg, #0e1936 0%, #091024 100%);
        }
        .home-article-author {
          font-size: 0.73rem;
          color: #60a5fa;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .home-article-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ===== Tombol "Lihat Semua Artikel" Biru Ala Rockstar Store ===== */
        .home-articles-footer {
          margin-top: 4px;
        }
        .home-articles-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
          border: 1px solid #60a5fa;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 800;
          padding: 10px 20px;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25);
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
        }
        .home-articles-btn:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-color: #93c5fd;
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.65), 0 0 14px rgba(59, 130, 246, 0.5);
          transform: translateY(-2px);
          color: #ffffff;
        }
        .home-articles-btn-arrow {
          font-size: 1rem;
          transition: transform 0.2s ease;
        }
        .home-articles-btn:hover .home-articles-btn-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}
