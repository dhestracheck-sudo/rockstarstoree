import Head from 'next/head';
import PageScripts from '../components/PageScripts';

const pageScripts = ["/site-scripts/analisis-01.js"];

export default function AnalisisPage() {
  return (
    <>
      <Head>
        {"\n"}
        <meta charSet="UTF-8" />
        {"\n"}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {"\n"}
        <title>{"Analisis — Rockstar.Store"}</title>
        {"\n"}
        <meta name="robots" content="noindex, nofollow" />
        {"\n"}
        <meta name="description" content="Panel analisis Rockstar.Store (privat)." />
        {"\n"}
        <link rel="icon" type="image/png" href="/ROCKSTARICON.png" sizes="192x192" />
        {"\n"}
        <link rel="apple-touch-icon" href="/ROCKSTARICON.png" />
        {"\n"}
        {"\n"}
        <style dangerouslySetInnerHTML={{ __html: "\n:root { --bg:#060913; --bg2:#0b1120; --card:#0e1628; --line:rgba(120,150,255,.14); --txt:#f2f5ff; --mut:#8b96b3; --blue:#2b4eff; --blue2:#6f8bff; --green:#2ecc71; --red:#ff5d5d; }\n* { box-sizing: border-box; }\nbody { margin:0; font-family: var(--font-poppins),sans-serif; background:var(--bg); color:var(--txt); min-height:100vh; padding:24px 16px 60px; }\n.wrap { max-width: 640px; margin: 0 auto; }\nh1 { font-family: var(--font-oswald),sans-serif; letter-spacing:.5px; }\n.card { background:var(--card); border:1px solid var(--line); border-radius:18px; padding:22px; margin-top:16px; }\nlabel { display:block; font-size:13px; color:var(--mut); margin:14px 0 6px; }\ninput[type=password] {\n  width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--line);\n  background:var(--bg2); color:var(--txt); font-family: var(--font-poppins),sans-serif; font-size:14px;\n}\nbutton {\n  width:100%; margin-top:16px; padding:13px; border:none; border-radius:12px;\n  background:var(--blue); color:#fff; font-family: var(--font-poppins),sans-serif; font-weight:700; font-size:15px; cursor:pointer;\n}\nbutton:disabled { background:#232c44; color:var(--mut); cursor:wait; }\n.ok { color:var(--green); } .err { color:var(--red); }\n.hint { font-size:12.5px; color:var(--mut); line-height:1.7; }\na { color:var(--blue2); }\n#analBox { margin-top:14px; font-size:13.5px; line-height:1.7; }\n" }} />
        {"\n"}
      </Head>
      {"\n"}
      <div className="wrap">
        {"\n  "}
        <h1>
          {"📊 Analisis Rockstar.Store"}
        </h1>
        {"\n\n  "}
        <div className="card" id="pinCard">
          {"\n    "}
          <label>
            {"PIN Admin"}
          </label>
          {"\n    "}
          <input type="password" id="pinInput" placeholder="••••••" autoComplete="off" />
          {"\n    "}
          <button onClick={(event) => { unlock() }}>
            {"Buka Analisis"}
          </button>
          {"\n    "}
        </div>
        <p className="hint" style={{ marginTop: "12px" }}>
          <a href="/admin">
            {"← Kembali ke Admin"}
          </a>
        </p>
        {"\n  "}
      </div>
      {"\n\n  "}
      <div className="card" id="mainCard" style={{ display: "none" }}>
        {"\n    "}
        <div style={{ display: "flex", gap: "8px" }}>
          {"\n      "}
          <button id="analBtn" onClick={(event) => { loadAnalisis() }} style={{ flex: "1" }}>
            {"🔄 Muat Ulang"}
          </button>
          {"\n      "}
          <a href="/admin" style={{ flex: "1", textDecoration: "none" }}>
            <button type="button" style={{ background: "#232c44" }}>
              {"← Admin"}
            </button>
          </a>
          {"\n    "}
        </div>
        {"\n    "}
        <div id="asistenBox" style={{ marginTop: "16px" }} />
        {"\n    "}
        <div id="orderBox" style={{ marginTop: "16px" }} />
        {"\n    "}
        <div id="rekapBox" style={{ marginTop: "16px" }} />
        {"\n    "}
        <div id="analBox" />
        {"\n    "}
      </div>
      <p className="hint" style={{ marginTop: "10px" }}>
        {"Dihitung live dari Supabase. Counter naik tiap produk terlihat di layar pengunjung."}
      </p>
      {"\n  "}
      {"\n"}
      {"\n\n"}
      {"\n"}
      <PageScripts sources={pageScripts} />
    </>
  );
}
