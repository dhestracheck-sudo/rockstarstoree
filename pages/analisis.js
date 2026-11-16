import Head from 'next/head';
import PageScripts from '../components/PageScripts';
import { Oswald } from "next/font/google";

const oswald = Oswald({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

const pageScripts = ["/site-scripts/analisis-01.js?v=analisis-simple-20261117"];

const analisisStyles = `
:root {
  color-scheme: dark;
  --bg: #0b1220;
  --surface: #111a2e;
  --surface2: #16223b;
  --line: rgba(148, 163, 184, 0.16);
  --txt: #e2e8f0;
  --mut: #94a3b8;
  --blue: #3b82f6;
  --blue-soft: rgba(59, 130, 246, 0.14);
  --green: #22c55e;
  --green-soft: rgba(34, 197, 94, 0.14);
  --red: #ef4444;
  --red-soft: rgba(239, 68, 68, 0.14);
  --gold: #eab308;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--font-poppins), sans-serif;
  background: var(--bg);
  color: var(--txt);
  min-height: 100vh;
  padding: 18px 14px 56px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.wrap {
  max-width: 960px;
  margin: 0 auto;
}
a { color: #7dd3fc; text-decoration: none; }
a:hover { text-decoration: underline; }

/* ===== Header Bar ===== */
.an-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
}
.an-topbar h1 {
  margin: 0;
  font-family: var(--font-oswald), sans-serif;
  font-size: 20px;
  letter-spacing: 0.4px;
  color: #f1f5f9;
}
.an-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.an-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  min-height: 36px;
  width: auto;
  margin: 0;
  border-radius: 10px;
  background: var(--surface2);
  border: 1px solid var(--line);
  color: var(--txt);
  font-size: 12.5px;
  font-weight: 600;
  font-family: var(--font-poppins), sans-serif;
  cursor: pointer;
  text-decoration: none !important;
}
.an-pill-btn:hover { border-color: rgba(148, 163, 184, 0.38); background: #1c2b4a; }
.an-pill-btn.lock { color: #fca5a5; border-color: rgba(239, 68, 68, 0.28); }
.an-pill-btn.lock:hover { background: var(--red-soft); }

/* ===== Cards & Forms ===== */
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 18px;
  margin-top: 14px;
}
#pinCard {
  max-width: 420px;
  margin: 28px auto 0;
  text-align: center;
  padding: 26px 22px;
}
label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--mut);
  margin: 12px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
input[type=password] {
  width: 100%;
  min-height: 46px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--txt);
  font-family: var(--font-poppins), sans-serif;
  font-size: 16px;
  text-align: center;
  letter-spacing: 0.35em;
  outline: none;
}
input[type=password]:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22);
}
button {
  width: 100%;
  min-height: 44px;
  margin-top: 12px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 11px;
  background: var(--blue);
  color: #fff;
  font-family: var(--font-poppins), sans-serif;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
}
button:hover:not(:disabled) { filter: brightness(1.08); }
button:disabled { opacity: 0.55; cursor: wait; }
.hint { font-size: 12.5px; color: var(--mut); line-height: 1.6; margin: 6px 0 0; }
.ok { color: #86efac; }
.err { color: #fca5a5; }

/* ===== Sticky Navigation & Tab Bar ===== */
.an-sticky-nav {
  position: sticky;
  top: 8px;
  z-index: 40;
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(17, 26, 46, 0.96);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32);
}
.an-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}
.an-tabs::-webkit-scrollbar { display: none; }
.an-tab-btn {
  flex: 1 0 auto;
  width: auto;
  min-height: 40px;
  margin: 0;
  padding: 8px 14px;
  background: var(--surface2);
  border: 1px solid var(--line);
  color: var(--mut);
  font-size: 13px;
  white-space: nowrap;
}
.an-tab-btn.active {
  background: var(--blue);
  border-color: rgba(147, 197, 253, 0.45);
  color: #fff;
}
.an-tab-panel { display: none; margin-top: 14px; }
.an-tab-panel.active { display: block; }

/* ===== Summary Strip ===== */
.an-brief {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  font-size: 13px;
}
.an-brief-stats {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.an-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: var(--surface2);
  border: 1px solid var(--line);
  color: var(--txt);
}
.an-chip.warn { background: var(--blue-soft); border-color: rgba(59, 130, 246, 0.35); color: #93c5fd; }
.an-chip.good { background: var(--green-soft); border-color: rgba(34, 197, 94, 0.3); color: #86efac; }

/* ===== Order List ===== */
.an-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.an-filter-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.an-filter-btn {
  width: auto;
  min-height: 34px;
  margin: 0;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--surface2);
  border: 1px solid var(--line);
  color: var(--mut);
  font-size: 12px;
}
.an-filter-btn.active {
  background: var(--blue);
  color: #fff;
  border-color: rgba(147, 197, 253, 0.45);
}
.an-order-card {
  background: var(--surface2);
  border: 1px solid var(--line);
  border-left-width: 4px;
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 10px;
}
.an-order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.an-order-id { font-weight: 700; font-size: 14px; color: #f8fafc; }
.an-order-price { font-family: var(--font-oswald), sans-serif; font-size: 18px; color: #fde047; }
.an-order-buyer {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--blue-soft);
  border: 1px solid rgba(59, 130, 246, 0.28);
  font-size: 12.5px;
  color: #bfdbfe;
}
.an-order-items {
  margin-top: 8px;
  font-size: 13px;
  color: var(--txt);
  line-height: 1.65;
}
.an-order-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.an-order-actions button {
  flex: 1;
  min-height: 40px;
  margin: 0;
  font-size: 13px;
}
.btn-lunas { background: #16a34a; }
.btn-batal { background: #dc2626; }
.an-cred-box {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
  font-size: 13px;
}
.an-cred-box button {
  width: auto;
  min-height: 30px;
  margin: 6px 0 0;
  padding: 4px 10px;
  font-size: 12px;
  background: var(--surface2);
  border: 1px solid var(--line);
}

/* ===== KPI Grid & Analytics Columns ===== */
.an-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}
.an-kpi-card {
  background: var(--surface2);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px;
  text-align: center;
}
.an-kpi-val {
  font-family: var(--font-oswald), sans-serif;
  font-size: 22px;
  color: #f8fafc;
}
.an-kpi-val.money { color: #86efac; }
.an-kpi-lbl { font-size: 12px; color: var(--mut); margin-top: 2px; }
.an-kpi-sub { font-size: 12px; color: #cbd5e1; margin-top: 2px; }

.an-two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;
}
@media (min-width: 780px) {
  .an-two-col { grid-template-columns: 1fr 1fr; }
}
.an-panel-box {
  background: var(--surface2);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 13px;
}
.an-panel-box h3 {
  margin: 0 0 10px;
  font-size: 13.5px;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.an-bar-track {
  height: 6px;
  background: rgba(148, 163, 184, 0.14);
  border-radius: 99px;
  margin: 5px 0 10px;
  overflow: hidden;
}
.an-bar-fill {
  display: block;
  height: 100%;
  background: #60a5fa;
  border-radius: 99px;
}
@media (max-width: 520px) {
  body { padding: 12px 10px 44px; }
  .card { padding: 14px; }
}
`;

export default function AnalisisPage() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{"Analisis — Rockstar.Store"}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Panel analisis Rockstar.Store (privat)." />
        <link rel="icon" type="image/png" href="/ROCKSTARICON.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/ROCKSTARICON.png" />
        <style dangerouslySetInnerHTML={{ __html: analisisStyles }} />
      </Head>

      <div className={`wrap ${oswald.variable}`}>
        <header className="an-topbar">
          <h1>{"📊 Analisis Rockstar.Store"}</h1>
          <div className="an-nav">
            <a href="/admin" className="an-pill-btn">{"← Admin"}</a>
            <a href="/" className="an-pill-btn" target="_blank" rel="noopener">{"🌐 Toko"}</a>
            <button id="analBtn" type="button" className="an-pill-btn" onClick={() => { if (typeof window !== "undefined" && window.refreshAllAnalisis) window.refreshAllAnalisis(); }} style={{ display: "none" }}>
              {"🔄 Muat Ulang"}
            </button>
            <button id="lockAnalisisBtn" type="button" className="an-pill-btn lock" onClick={() => { if (typeof window !== "undefined" && window.lockAnalisis) window.lockAnalisis(); }} style={{ display: "none" }}>
              {"🔒 Kunci"}
            </button>
          </div>
        </header>

        <div className="card" id="pinCard">
          <div style={{ fontSize: "30px" }}>{"🔐"}</div>
          <label htmlFor="pinInput">{"PIN Admin"}</label>
          <input
            type="password"
            id="pinInput"
            placeholder="••••••"
            autoComplete="off"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (typeof window !== "undefined" && window.unlock) window.unlock(); } }}
          />
          <div id="pinError" className="err" style={{ fontSize: "12.5px", marginTop: "8px", minHeight: "18px" }} />
          <button type="button" onClick={() => { if (typeof window !== "undefined" && window.unlock) window.unlock(); }}>
            {"Buka Analisis"}
          </button>
        </div>

        <main id="mainCard" style={{ display: "none" }}>
          <div className="an-brief" id="asistenBox">
            <span className="hint" style={{ margin: 0 }}>{"Memuat ringkasan..."}</span>
          </div>

          <div className="an-sticky-nav">
            <nav className="an-tabs" role="tablist" aria-label="Menu Analisis">
              <button type="button" role="tab" className="an-tab-btn active" data-antab="orders" aria-selected="true" onClick={() => { if (typeof window !== "undefined" && window.openAnalisisTab) window.openAnalisisTab("orders"); }}>
                {"📦 Order Masuk"}
              </button>
              <button type="button" role="tab" className="an-tab-btn" data-antab="omzet" aria-selected="false" onClick={() => { if (typeof window !== "undefined" && window.openAnalisisTab) window.openAnalisisTab("omzet"); }}>
                {"💰 Omzet"}
              </button>
              <button type="button" role="tab" className="an-tab-btn" data-antab="produk" aria-selected="false" onClick={() => { if (typeof window !== "undefined" && window.openAnalisisTab) window.openAnalisisTab("produk"); }}>
                {"📈 Produk & Aktivitas"}
              </button>
            </nav>
          </div>

          <section id="antab-orders" className="an-tab-panel active" role="tabpanel">
            <div className="card" id="orderBox">
              <p className="hint">{"Memuat order..."}</p>
            </div>
          </section>

          <section id="antab-omzet" className="an-tab-panel" role="tabpanel">
            <div className="card" id="rekapBox">
              <p className="hint">{"Memuat omzet..."}</p>
            </div>
          </section>

          <section id="antab-produk" className="an-tab-panel" role="tabpanel">
            <div className="card" id="analBox">
              <p className="hint">{"Memuat statistik produk..."}</p>
            </div>
          </section>
        </main>
      </div>

      <PageScripts sources={pageScripts} />
    </>
  );
}
