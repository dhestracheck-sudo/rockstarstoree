import { ENHANCEMENTS_PART_1 } from "./enhancements/part1.js";
import { ENHANCEMENTS_PART_2 } from "./enhancements/part2.js";

function encodeAssetPath(rawPath) {
  const s = String(rawPath || "").trim();
  if (!s) return "/ROCKSTARLOGO.webp";
  if (/^https?:\/\//i.test(s)) return s;
  return (
    "/" +
    s
      .replace(/^\/+/, "")
      .split("/")
      .map((seg) => {
        try {
          return encodeURIComponent(decodeURIComponent(seg));
        } catch {
          return encodeURIComponent(seg);
        }
      })
      .join("/")
  );
}

export const ARTICLE_ENHANCEMENTS = {
  ...ENHANCEMENTS_PART_1,
  ...ENHANCEMENTS_PART_2,
};

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function upgradeLegacyInternalLinks(html) {
  return String(html || "")
    .replace(/href="\/\?tab=brainrot"/gi, 'href="/brainrot"')
    .replace(/href="\/\?tab=akun"/gi, 'href="/akun-sepuh"')
    .replace(/href="\/\?tab=joki"/gi, 'href="/joki-roblox"')
    .replace(/href="\/\?tab=topup"/gi, 'href="/topup-robux"');
}

function buildExpansionHtml(meta) {
  if (!meta) return "";
  const headers = (meta.tableHeaders || [])
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("");
  const rows = (meta.tableRows || [])
    .map(
      (cols) =>
        `<tr>${cols
          .map((cell, i) => (i === 0 ? `<td><strong>${escapeHtml(cell)}</strong></td>` : `<td>${escapeHtml(cell)}</td>`))
          .join("")}</tr>`
    )
    .join("");

  const tipsHtml = (meta.tips || [])
    .map((tip) => `<li>${escapeHtml(tip)}</li>`)
    .join("");

  const cta = meta.cta || {
    label: "Jelajahi Katalog Brainrot",
    href: "/brainrot",
    altLabel: "Cek Akun Sepuh Data Polos",
    altHref: "/akun-sepuh",
  };

  return `
    <h2>${escapeHtml(meta.sectionTitle || "Strategi Praktis & Checklist Terbaru")}</h2>
    <p>${escapeHtml(meta.sectionIntro || "")}</p>
    ${
      headers && rows
        ? `<div class="code-table-wrap">
            <table class="code-table">
              ${meta.tableTitle ? `<caption>${escapeHtml(meta.tableTitle)}</caption>` : ""}
              <thead><tr>${headers}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`
        : ""
    }
    ${
      tipsHtml
        ? `<div class="tip-box">
            <h4>✅ Poin Eksekusi Sepuh di Rockstar.Store</h4>
            <ul>${tipsHtml}</ul>
          </div>`
        : ""
    }
    <div class="cta-card">
      <h3>⚡ Butuh Solusi Cepat Dari Rockstar.Store?</h3>
      <p>Semua item Brainrot, akun Roblox sepuh Data Polos, jasa joki 100% manual, dan top up Robux tersedia dengan konfirmasi resmi Admin Rock (+62-896-6429-9571).</p>
      <div class="cta-actions">
        <a href="${escapeHtml(cta.href)}" class="cta-btn primary">${escapeHtml(cta.label)} →</a>
        <a href="${escapeHtml(cta.altHref || "/faq")}" class="cta-btn secondary">${escapeHtml(cta.altLabel || "Lihat FAQ & Testimoni")}</a>
      </div>
    </div>
  `;
}

export function getArticleUpdatedIso(slug, fallbackIso) {
  return ARTICLE_ENHANCEMENTS[slug]?.updatedAt || fallbackIso;
}

export function enhanceArticle(article) {
  if (!article) return null;
  const meta = ARTICLE_ENHANCEMENTS[article.slug];
  const baseHtml = upgradeLegacyInternalLinks(article.contentHtml);
  const safeImage = encodeAssetPath(article.image);
  if (!meta) {
    return {
      ...article,
      image: safeImage,
      contentHtml: baseHtml,
      updatedAt: article.isoDate,
      updatedLabel: article.date,
      quickAnswer: article.excerpt,
      faqs: [],
    };
  }

  return {
    ...article,
    image: safeImage,
    contentHtml: `${baseHtml}\n${buildExpansionHtml(meta)}`,
    updatedAt: meta.updatedAt || article.isoDate,
    updatedLabel: meta.updatedLabel || article.date,
    quickAnswer: meta.quickAnswer || article.excerpt,
    faqs: Array.isArray(meta.faqs) ? meta.faqs : [],
  };
}
