import Head from 'next/head';
import PageScripts from '../components/PageScripts';

const pageScripts = ["/site-scripts/kantor-01.js"];

export default function KantorPage() {
  return (
    <>
      <Head>
        {"\n"}
        <meta charSet="UTF-8" />
        {"\n"}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {"\n"}
        <title>{"Kantor — Rockstar.Store"}</title>
        {"\n"}
        <meta name="robots" content="noindex, nofollow" />
        {"\n"}
        <meta name="description" content="Kantor virtual Rockstar.Store (privat)." />
        {"\n"}
        <link rel="icon" type="image/png" href="ROCKSTARLOGO.png" />
        {"\n"}
        <link rel="apple-touch-icon" href="ROCKSTARLOGO.png" />
        {"\n"}
        {"\n"}
        <style dangerouslySetInnerHTML={{ __html: "\n:root { --bg:#060913; --bg2:#0b1120; --card:#0e1628; --line:rgba(120,150,255,.14); --txt:#f2f5ff; --mut:#8b96b3; --blue:#2b4eff; --blue2:#6f8bff; --green:#2ecc71; --red:#ff5d5d; }\n* { box-sizing: border-box; }\nbody { margin:0; font-family:'Poppins',sans-serif; background:var(--bg); color:var(--txt); min-height:100vh; padding:24px 16px 60px; }\n.wrap { max-width: 960px; margin: 0 auto; }\nh1 { font-family:'Oswald',sans-serif; letter-spacing:.5px; }\n.card { background:var(--card); border:1px solid var(--line); border-radius:18px; padding:22px; margin-top:16px; }\nlabel { display:block; font-size:13px; color:var(--mut); margin:14px 0 6px; }\ninput[type=password] { width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--line); background:var(--bg2); color:var(--txt); font-family:'Poppins',sans-serif; font-size:14px; }\nbutton { width:100%; margin-top:16px; padding:13px; border:none; border-radius:12px; background:var(--blue); color:#fff; font-family:'Poppins',sans-serif; font-weight:700; font-size:15px; cursor:pointer; }\nbutton:disabled { background:#232c44; color:var(--mut); cursor:wait; }\n.hint { font-size:12.5px; color:var(--mut); line-height:1.7; }\na { color:var(--blue2); }\n/* ===== ruangan pixel ===== */\n.office {\n  position: relative; width: 100%; aspect-ratio: 16 / 10; border-radius: 18px; overflow: hidden;\n  border: 1px solid var(--line);\n  background:\n    linear-gradient(180deg, rgba(20,32,70,.9) 0%, rgba(20,32,70,.9) 32%, transparent 32%),\n    repeating-linear-gradient(90deg, #8a5a33 0 46px, #7c4f2c 46px 92px),\n    #8a5a33;\n}\n.office::before {\n  content: \"\"; position: absolute; left: 0; right: 0; top: 0; height: 32%;\n  background:\n    linear-gradient(180deg, #0e1a3d 0 55%, #23356b 55% 62%, #0a0f22 62% 100%);\n}\n.win {\n  position: absolute; top: 5%; width: 22%; height: 22%; border-radius: 8px;\n  background: linear-gradient(180deg, #27408b, #3f6fe0 60%, #9db8ff);\n  border: 4px solid #5a4632;\n  box-shadow: inset 0 0 0 2px #2c2318;\n}\n.win::after { content: \"🌃\"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 30px; }\n.board {\n  position: absolute; top: 6%; right: 4%; width: 20%; height: 20%; background: #f2f5ff; border-radius: 6px;\n  border: 5px solid #5a4632; color: #333; font-size: 10px; font-weight: 700; padding: 4px; overflow: hidden;\n}\n.rug { position: absolute; left: 30%; right: 30%; bottom: 8%; height: 16%; background: rgba(180,60,60,.55); border-radius: 50%; }\n.desk { position: absolute; background: #5a4632; border-radius: 6px; box-shadow: 0 6px 0 rgba(0,0,0,.35); }\n.desk::after { content: \"🖥️\"; position: absolute; left: 50%; top: -26px; transform: translateX(-50%); font-size: 24px; }\n.plant { position: absolute; font-size: 34px; }\n.crew { position: absolute; transform: translate(-50%, -100%); text-align: center; cursor: pointer; z-index: 5; }\n.crew .ava { width: 48px; height: 46px; margin: 0 auto; position: relative; }\n.crew .px { width: 1px; height: 1px; transform: scale(4); transform-origin: top left; }\n@media (prefers-reduced-motion: no-preference) {\n  .crew .ava { animation: seatBob 1.1s ease-in-out infinite; }\n  @keyframes seatBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }\n}\n.clock { position: absolute; top: 4%; left: 44%; width: 46px; height: 46px; border-radius: 50%; background: #f2f5ff; border: 4px solid #5a4632; font-size: 24px; display: flex; align-items: center; justify-content: center; }\n.poster { position: absolute; top: 8%; left: 56%; background: #12225e; border: 3px solid #6f8bff; color: #fff; border-radius: 8px; padding: 6px 12px; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 1px; transform: rotate(2deg); }\n.crew .tag { display: inline-block; font-size: 11px; font-weight: 700; background: rgba(0,0,0,.65); border: 1px solid var(--line); border-radius: 999px; padding: 2px 10px; margin-top: 2px; white-space: nowrap; }\n.bubble {\n  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);\n  background: #fff; color: #111; font-size: 12px; font-weight: 600; border-radius: 12px;\n  padding: 7px 11px; white-space: nowrap; box-shadow: 0 6px 18px rgba(0,0,0,.5);\n}\n.bubble::after { content: \"\"; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top-color: #fff; }\n.crewlink { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }\n.crewlink a { flex:1; min-width:150px; text-align:center; background:var(--bg2); border:1px solid var(--line); border-radius:12px; padding:12px; text-decoration:none; color:var(--txt); font-weight:700; font-size:14px; }\n@media (max-width: 640px) {\n  .office { aspect-ratio: 4 / 5; }\n  .crew .ava { font-size: 36px; }\n  .bubble { font-size: 11px; max-width: 150px; white-space: normal; }\n  .board { display: none; }\n}\n" }} />
        {"\n"}
      </Head>
      {"\n"}
      <div className="wrap">
        {"\n  "}
        <h1>
          {"🏢 Kantor Rockstar.Store"}
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
            {"Masuk Kantor"}
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
      <div id="officeWrap" style={{ display: "none" }}>
        {"\n    "}
        <div className="office" id="office">
          {"\n      "}
          <div className="win" style={{ left: "4%" }} />
          {"\n      "}
          <div className="win" style={{ left: "30%" }} />
          {"\n      "}
          <div className="clock">
            {"🕐"}
          </div>
          {"\n      "}
          <div className="poster">
            {"★ SEPUH ★"}
          </div>
          {"\n      "}
          <div className="board">
            {"📌 TODO"}
            <br />
            {"• proses order"}
            <br />
            {"• restock"}
            <br />
            {"• rekap"}
          </div>
          {"\n      "}
          <div className="rug" />
          {"\n      "}
          <div className="desk" style={{ left: "8%", bottom: "22%", width: "24%", height: "7%" }} />
          {"\n      "}
          <div className="desk" style={{ left: "40%", bottom: "22%", width: "24%", height: "7%" }} />
          {"\n      "}
          <div className="desk" style={{ right: "5%", bottom: "22%", width: "20%", height: "7%" }} />
          {"\n      "}
          <div className="plant" style={{ left: "2%", bottom: "10%" }}>
            {"🪴"}
          </div>
          {"\n      "}
          <div className="plant" style={{ right: "2%", bottom: "40%" }}>
            {"🪴"}
          </div>
          {"\n      "}
          <div className="crew" id="crew-cs" style={{ left: "20%", top: "72%" }}>
            <div className="bubble" id="bub-cs">
              {"..."}
            </div>
            <div className="ava" />
            <br />
            <span className="tag">
              {"CS 📞"}
            </span>
          </div>
          {"\n      "}
          <div className="crew" id="crew-gudang" style={{ left: "52%", top: "72%" }}>
            <div className="bubble" id="bub-gudang">
              {"..."}
            </div>
            <div className="ava" />
            <br />
            <span className="tag">
              {"Gudang"}
            </span>
          </div>
          {"\n      "}
          <div className="crew" id="crew-bos" style={{ left: "82%", top: "72%" }}>
            <div className="bubble" id="bub-bos">
              {"..."}
            </div>
            <div className="ava" />
            <br />
            <span className="tag">
              {"Bos 💰"}
            </span>
          </div>
          {"\n    "}
        </div>
        {"\n    "}
        <div className="crewlink">
          {"\n      "}
          <a href="/analisis">
            {"📦 Order (CS) →"}
          </a>
          {"\n      "}
          <a href="/admin">
            {"📦 Stok (Gudang) →"}
          </a>
          {"\n      "}
          <a href="/analisis">
            {"💰 Omzet (Bos) →"}
          </a>
          {"\n    "}
        </div>
        {"\n    "}
      </div>
      <p className="hint" style={{ marginTop: "10px" }}>
        {"Klik kru untuk ke meja kerjanya. Ucapan mereka live dari data tokomu."}
      </p>
      {"\n  "}
      {"\n"}
      {"\n\n"}
      {"\n"}
      <PageScripts sources={pageScripts} />
    </>
  );
}
