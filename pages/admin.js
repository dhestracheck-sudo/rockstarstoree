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
  '/site-scripts/admin-01.js?v=admin-v20261031-1',
  '/site-scripts/admin-02.js?v=admin-quick-switch-20261031-final',
];

const productEditorStyles = `
  .wrap > #productEditorCard { grid-column: 1 / -1; }
  #productEditorCard { display:none; border-color:rgba(114,151,255,.34); }
  #productEditorCard .product-editor-heading { margin-bottom:14px; }
  #productEditorCard .product-editor-heading h2 { margin:0; color:#dce5ff; font-size:19px; }
  #productEditorCard .product-editor-heading p { margin:4px 0 0; color:var(--mut); font-size:12.5px; }
  #productEditorCard .product-editor-panel { margin:0; padding:0; border:0; border-radius:0; background:transparent; box-shadow:none; }
  #productEditorCard .product-editor-panel + .product-editor-panel { margin-top:18px; padding-top:17px; border-top:1px solid rgba(153,178,255,.18); }
  #productEditorCard .product-editor-panel h3 { margin:0 0 8px; color:#aebfff; font-size:14px; letter-spacing:.02em; }
  #productEditorCard #editCard .curprod,
  #productEditorCard #renameCard .curprod { display:none; }
  #productEditorCard #mainCard label { margin-top:0; }
  #productEditorCard #prevCard {
    position: sticky;
    top: var(--stickh, 108px);
    z-index: 40;
    margin: 14px 0;
    padding: 14px 16px;
    border: 1px solid rgba(153,178,255,.28);
    border-radius: 16px;
    background: linear-gradient(155deg, rgba(16,28,54,.98), rgba(11,20,37,.98));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 12px 30px rgba(0,0,0,.52);
    cursor: pointer;
    transition: transform 0.12s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    user-select: none;
  }
  #productEditorCard #prevCard:hover {
    border-color: rgba(160,195,255,.5);
    box-shadow: 0 14px 34px rgba(0,0,0,.62);
  }
  #productEditorCard #prevCard:active {
    transform: scale(0.99);
  }
  #productEditorCard #prevCard:focus-visible {
    outline: 2px solid #b7c7ff;
    outline-offset: 3px;
  }
  #productEditorCard #prevCard + .product-editor-panel {
    border-top: none;
    margin-top: 14px;
    padding-top: 0;
  }
  #productEditorCard #prevCard > div { gap:14px; }
  #productEditorCard #prevImg { width:82px; height:82px; object-fit:cover; border-radius:12px; background:#080f1d; }
  #productEditorCard #prevCard .hint { display: none !important; }
  #productEditorCard #statusAll { grid-column:1 / -1; }
  #productEditorCard .product-editor-actions { display:grid; grid-template-columns:minmax(0,1fr); gap:10px; margin-top:18px; padding-top:16px; border-top:1px solid rgba(153,178,255,.18); }
  #productEditorCard .product-editor-actions #saveAllBtn { margin:0; min-height:50px; }
  #productEditorCard .product-editor-actions #delBtn { width:100%; margin:0; }
  #productEditorCard .product-editor-actions #statusAll { margin:0; }
  #productEditorCard #slideList { display:grid; gap:8px; }
  #serverConfigCard #serverConfigToggle { width:100%; margin:0; text-align:left; }
  #serverConfigCard .server-config-toggle-note { margin:9px 2px 0; }
  #serverConfigCard #serverConfigContent { margin-top:14px; }
  @media (max-width:560px) {
    #productEditorCard { padding:16px 14px; }
    #productEditorCard .product-editor-heading h2 { font-size:17px; }
    #productEditorCard #prevCard {
      top: var(--stickh, 96px);
      padding: 12px 13px;
      margin: 10px 0;
      border-radius: 14px;
    }
    #productEditorCard #prevImg { width:68px; height:68px; }
    #productEditorCard #prevCard h3 { font-size: 13px; margin-bottom: 6px; }
    #productEditorCard #prevCard .hint { font-size: 11.5px; line-height: 1.45; margin-top: 6px; }
    #productEditorCard .product-editor-actions { grid-template-columns:1fr; }
    #productEditorCard .product-editor-actions #delBtn { width:100%; }
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
