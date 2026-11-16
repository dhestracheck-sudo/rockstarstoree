import Head from 'next/head';
import PageScripts from '../components/PageScripts';
import { Oswald } from "next/font/google";
import { adminMarkup, adminStyles } from '../content/adminLatest';

const oswald = Oswald({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

const pageScripts = [
  '/site-scripts/admin-01.js?v=admin-simple-20261117',
  '/site-scripts/admin-02.js?v=admin-simple-20261117',
];

const productEditorStyles = `
  /* ===== Header & Workspace Bar Terpadu ===== */
  .admin-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 12px 16px;
    background: linear-gradient(120deg, rgba(20, 34, 65, 0.96), rgba(12, 20, 38, 0.94));
    border: 1px solid rgba(153, 178, 255, 0.24);
    border-radius: 16px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  }
  .admin-topbar-title {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .admin-topbar-title h1 {
    margin: 0;
    padding: 0;
    min-height: 0;
    border: 0;
    background: none;
    box-shadow: none;
    font-size: 20px;
  }
  .admin-topbar-title img { height: 36px; border-radius: 9px; }
  .admin-topbar-links {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .admin-link-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    min-height: 36px;
    border-radius: 10px;
    background: #14213d;
    border: 1px solid rgba(153, 178, 255, 0.22);
    color: #dbe4ff;
    font-size: 12.5px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    width: auto;
    margin: 0;
    box-shadow: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .admin-link-pill:hover {
    border-color: #8eaaff;
    background: #1c2e54;
    color: #fff;
    transform: none;
    filter: none;
  }
  .admin-link-pill.lock-btn {
    color: #ffb4b9;
    border-color: rgba(255, 93, 93, 0.28);
  }
  .admin-link-pill.lock-btn:hover {
    background: rgba(255, 93, 93, 0.16);
    border-color: rgba(255, 93, 93, 0.55);
  }

  /* ===== Single Sticky Control & Tabs Bar ===== */
  .sheetbar {
    display: none;
    position: sticky;
    top: 8px;
    z-index: 60;
    flex-direction: column;
    gap: 10px;
    height: auto;
    min-height: 0;
    padding: 12px 14px;
    margin-top: 12px;
    background: rgba(8, 15, 29, 0.96);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(153, 178, 255, 0.24);
    border-radius: 16px;
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.42);
  }
  .sheetbar-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    width: 100%;
  }
  .sheetbar-row select {
    flex: 1 1 180px;
    min-width: 140px;
    height: 40px;
    min-height: 40px;
    margin: 0;
    padding: 8px 34px 8px 12px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 600;
  }
  .sheetbar-reload {
    width: auto !important;
    min-height: 40px !important;
    margin: 0 !important;
    padding: 8px 14px !important;
    font-size: 12.5px !important;
    white-space: nowrap;
  }
  .status-pill-inline {
    font-size: 12px;
    color: var(--mut);
    white-space: nowrap;
  }
  .admin-tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    width: 100%;
    padding-bottom: 2px;
  }
  .admin-tabs::-webkit-scrollbar { display: none; }
  .admin-tab-btn {
    flex: 1 0 auto;
    width: auto;
    min-height: 40px;
    margin: 0;
    padding: 8px 14px;
    border-radius: 11px;
    background: #111b33;
    border: 1px solid rgba(153, 178, 255, 0.16);
    color: #b4c0dc;
    font-size: 13px;
    font-weight: 600;
    box-shadow: none;
    white-space: nowrap;
  }
  .admin-tab-btn:hover {
    color: #fff;
    border-color: rgba(153, 178, 255, 0.45);
    background: #172546;
    transform: none;
    filter: none;
  }
  .admin-tab-btn.active {
    background: linear-gradient(135deg, #2b4eff, #4d6eff);
    border-color: rgba(183, 199, 255, 0.5);
    color: #fff;
    box-shadow: 0 6px 16px rgba(43, 78, 255, 0.34);
  }

  /* ===== Tab Panels ===== */
  .admin-tab-panel {
    display: none;
    margin-top: 14px;
  }
  .admin-tab-panel.active {
    display: block;
  }
  @media (min-width: 1000px) {
    .wrap {
      display: block !important;
      max-width: 1220px !important;
    }
  }

  /* ===== Single Product Picker (.product-catalog-*) ===== */
  .product-toolbar {
    display: flex;
    align-items: stretch;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .product-toolbar .product-catalog-anchor {
    flex: 1 1 320px;
    min-width: 0;
    position: relative;
  }
  .add-prod-toggle-btn {
    width: auto !important;
    min-height: 58px !important;
    margin: 0 !important;
    padding: 12px 18px !important;
    white-space: nowrap;
    border-radius: 14px !important;
  }
  .product-catalog-toggle {
    width: 100%;
    min-height: 58px;
    margin: 0;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    border-radius: 14px;
    background: linear-gradient(155deg, rgba(18, 31, 57, 0.98), rgba(11, 20, 37, 0.98));
    border: 1px solid rgba(153, 178, 255, 0.28);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.24);
  }
  .product-catalog-toggle:hover {
    border-color: #7c9bff;
    filter: none;
    transform: none;
  }
  .product-catalog-selected-media {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    overflow: hidden;
    background: #080f1d;
    border: 1px solid rgba(153, 178, 255, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .product-catalog-selected-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .product-catalog-placeholder { font-size: 20px; }
  .product-catalog-selected-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .product-catalog-kicker {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #9bb2ff;
  }
  .product-catalog-selected-copy strong {
    font-size: 13.5px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .product-catalog-selected-meta {
    font-size: 11.5px;
    color: var(--mut);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .product-catalog-selected-price {
    font-family: var(--font-oswald), sans-serif;
    font-size: 16px;
    color: #f3d27a;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .product-catalog-chevron {
    color: #9bb2ff;
    font-size: 14px;
    flex-shrink: 0;
  }
  .product-catalog-popover {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 95;
    background: #0b1427;
    border: 1px solid rgba(153, 178, 255, 0.38);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 22px 54px rgba(0, 0, 0, 0.72);
  }
  .product-catalog-tools {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .product-catalog-tools input {
    flex: 1;
    min-height: 40px;
    padding: 8px 12px;
    font-size: 13.5px;
  }
  .product-catalog-tools button {
    width: auto;
    min-height: 40px;
    margin: 0;
    padding: 8px 14px;
    font-size: 12.5px;
  }
  .product-filter-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .product-filter-pills {
    display: flex;
    gap: 6px;
  }
  .filter-pill-btn {
    width: auto !important;
    min-height: 30px !important;
    margin: 0 !important;
    padding: 4px 10px !important;
    font-size: 11.5px !important;
    border-radius: 999px !important;
    background: #14213d !important;
    border: 1px solid rgba(153, 178, 255, 0.2) !important;
    color: #b4c0dc !important;
    box-shadow: none !important;
  }
  .filter-pill-btn.active {
    background: #2b4eff !important;
    color: #fff !important;
    border-color: #8eaaff !important;
  }
  .product-catalog-count {
    font-size: 11.5px;
    color: var(--mut);
  }
  .product-catalog-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
    margin-top: 8px;
    max-height: min(360px, 52vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: 4px;
    scrollbar-width: thin;
  }
  .product-catalog-item {
    width: 100%;
    min-height: 0;
    margin: 0;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    border-radius: 11px;
    background: rgba(18, 30, 56, 0.72);
    border: 1px solid rgba(153, 178, 255, 0.14);
    box-shadow: none;
  }
  .product-catalog-item:hover {
    background: rgba(43, 78, 255, 0.22);
    border-color: rgba(153, 178, 255, 0.45);
    transform: none;
    filter: none;
  }
  .product-catalog-item[aria-pressed="true"] {
    background: rgba(43, 78, 255, 0.34);
    border-color: #6f8bff;
  }
  .product-catalog-image-wrap {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    background: #080f1d;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .product-catalog-image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .product-catalog-item-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .product-catalog-item-name {
    font-size: 12.5px;
    font-weight: 600;
    color: #f2f5ff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .product-catalog-item-meta {
    font-size: 11px;
    color: var(--mut);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .product-catalog-item-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
  }
  .product-catalog-item-price {
    font-family: var(--font-oswald), sans-serif;
    font-size: 13px;
    color: #f3d27a;
  }
  .stock-pill {
    font-size: 9.5px;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 999px;
    letter-spacing: 0.04em;
  }
  .stock-pill.ok {
    background: rgba(46, 204, 113, 0.16);
    color: #5fe39b;
    border: 1px solid rgba(46, 204, 113, 0.32);
  }
  .stock-pill.sold {
    background: rgba(255, 93, 93, 0.16);
    color: #ff9a9a;
    border: 1px solid rgba(255, 93, 93, 0.35);
  }
  .product-catalog-empty {
    font-size: 12.5px;
    color: var(--mut);
    text-align: center;
    padding: 18px 8px;
  }

  /* ===== Editor Produk 2 Kolom & Preview Non-Sticky ===== */
  .add-drawer-card {
    margin-bottom: 14px;
    border-color: rgba(46, 204, 113, 0.35) !important;
  }
  .editor-layout-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: start;
  }
  @media (min-width: 960px) {
    .editor-layout-grid {
      grid-template-columns: 1.15fr 0.85fr;
      gap: 20px;
    }
  }
  .editor-preview-box {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(8, 15, 29, 0.72);
    border: 1px solid rgba(153, 178, 255, 0.2);
    margin-bottom: 14px;
  }
  #prevImg {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 11px;
    background: #080f1d;
    border: 1px solid rgba(153, 178, 255, 0.22);
    flex-shrink: 0;
  }
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 12px;
  }
  @media (max-width: 480px) {
    .form-grid-2 { grid-template-columns: 1fr; }
  }
  .editor-panel-box {
    padding: 16px;
    border-radius: 16px;
    background: rgba(12, 21, 41, 0.68);
    border: 1px solid rgba(153, 178, 255, 0.16);
  }
  .editor-panel-box h3 {
    margin: 0 0 10px;
    font-size: 13.5px;
    color: #aebfff;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .product-editor-actions {
    position: sticky;
    bottom: 10px;
    z-index: 45;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(8, 15, 29, 0.96);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(153, 178, 255, 0.28);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
  }
  .product-editor-actions #saveAllBtn {
    flex: 1 1 200px;
    margin: 0;
    min-height: 46px;
  }
  .product-editor-actions #delBtn {
    width: auto;
    margin: 0;
    min-height: 46px;
    padding: 12px 16px;
  }
  .product-editor-actions #statusAll {
    flex: 1 0 100%;
    margin: 0;
  }

  /* ===== Tab Kategori & Akun Grid ===== */
  .two-col-desktop {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: start;
  }
  @media (min-width: 900px) {
    .two-col-desktop { grid-template-columns: 1fr 1fr; }
  }

  /* ===== Accordions di Tab Toko & Event ===== */
  .admin-acc {
    background: linear-gradient(155deg, rgba(18, 31, 57, 0.98), rgba(11, 20, 37, 0.98));
    border: 1px solid rgba(153, 178, 255, 0.22);
    border-radius: 16px;
    margin-bottom: 12px;
    overflow: hidden;
  }
  .admin-acc > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 15px 18px;
    font-size: 14.5px;
    font-weight: 700;
    color: #eef3ff;
    cursor: pointer;
    list-style: none;
    user-select: none;
  }
  .admin-acc > summary::-webkit-details-marker { display: none; }
  .admin-acc > summary::after {
    content: "▾";
    color: #9bb2ff;
    font-size: 14px;
    transition: transform 0.15s ease;
  }
  .admin-acc[open] > summary::after {
    transform: rotate(180deg);
  }
  .admin-acc[open] > summary {
    border-bottom: 1px solid rgba(153, 178, 255, 0.14);
  }
  .admin-acc-body {
    padding: 16px 18px 18px;
  }
  .admin-acc-body .card {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    box-shadow: none;
  }
`;

export default function AdminPage() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin — Rockstar.Store</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Panel admin Rockstar.Store (privat)." />
        <link rel="icon" type="image/png" href="/ROCKSTARICON.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/ROCKSTARICON.png" />
        <style dangerouslySetInnerHTML={{ __html: adminStyles + productEditorStyles }} />
      </Head>
      <div className={oswald.variable} dangerouslySetInnerHTML={{ __html: adminMarkup }} />
      <PageScripts sources={pageScripts} />
    </>
  );
}
