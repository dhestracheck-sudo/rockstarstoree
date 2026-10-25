import Head from 'next/head';
import PageScripts from '../components/PageScripts';
import { adminMarkup, adminStyles } from '../content/adminLatest';

const pageScripts = [
  '/site-scripts/admin-01.js?v=product-editor-20261026-1',
  '/site-scripts/admin-02.js?v=product-editor-20261026-1',
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
  #productEditorCard #prevCard > div { gap:14px; }
  #productEditorCard #prevImg { width:82px; height:82px; object-fit:cover; border-radius:12px; background:#080f1d; }
  #productEditorCard #prevCard .hint { margin:8px 0 0; }
  #productEditorCard #statusAll { grid-column:1 / -1; }
  #productEditorCard .product-editor-actions { display:grid; grid-template-columns:minmax(0,1fr); gap:10px; margin-top:18px; padding-top:16px; border-top:1px solid rgba(153,178,255,.18); }
  #productEditorCard .product-editor-actions #saveAllBtn { margin:0; min-height:50px; }
  #productEditorCard .product-editor-actions #delBtn { width:100%; margin:0; }
  #productEditorCard .product-editor-actions #statusAll { margin:0; }
  #productEditorCard #slideList { display:grid; gap:8px; }
  @media (max-width:560px) {
    #productEditorCard { padding:16px 14px; }
    #productEditorCard .product-editor-heading h2 { font-size:17px; }
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
        <link rel="icon" type="image/png" href="/ROCKSTARLOGO.png" />
        <link rel="apple-touch-icon" href="/ROCKSTARLOGO.png" />
        <style dangerouslySetInnerHTML={{ __html: adminStyles + productEditorStyles }} />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: adminMarkup }} />
      <PageScripts sources={pageScripts} />
    </>
  );
}
