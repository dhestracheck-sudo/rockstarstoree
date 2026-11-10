import React from "react";
import { ARTICLES } from "../data/articles";

export default function HomeArticles() {
  const latestArticles = ARTICLES.slice(0, 3);

  return (
    <section className="home-articles-section" aria-labelledby="homeArticlesTitle">
      <div className="home-articles-header">
        <h2 className="home-articles-title" id="homeArticlesTitle">
          ARTIKEL TERBARU & BERITA GAME
        </h2>
        <p className="home-articles-sub">
          Dapatkan informasi terbaru seputar dunia game! Temukan panduan lengkap untuk meningkatkan pengalaman bermain, serta berita terkini mengenai promo, update top-up, dan komunitas gamer.
        </p>
      </div>

      <div className="home-articles-grid">
        {latestArticles.map((article) => (
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
          margin: 36px auto 28px;
          padding: 0 16px;
          box-sizing: border-box;
        }
        .home-articles-header {
          margin-bottom: 22px;
          text-align: left;
        }
        .home-articles-title {
          font-size: clamp(1.15rem, 2.5vw, 1.45rem);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
          margin: 0 0 8px;
          font-family: inherit;
        }
        .home-articles-sub {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.55;
          max-width: 780px;
          margin: 0;
        }
        .home-articles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        @media (max-width: 860px) {
          .home-articles-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
        .home-article-card {
          background: rgba(13, 20, 36, 0.85);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .home-article-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.55);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.5), 0 0 16px rgba(59, 130, 246, 0.2);
        }
        .home-article-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #060913;
        }
        .home-article-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .home-article-card:hover .home-article-thumb img {
          transform: scale(1.05);
        }
        .home-article-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 6px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .home-article-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(8, 14, 26, 0.95);
        }
        .home-article-author {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .home-article-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1.42;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .home-articles-footer {
          margin-top: 4px;
        }
        .home-articles-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 9px 18px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
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
