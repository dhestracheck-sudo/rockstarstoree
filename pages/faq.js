import Head from 'next/head';
import PageScripts from '../components/PageScripts';

const pageScripts = [];
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Bagaimana cara memesan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pilih produk, masukkan ke keranjang, periksa pesanan, lalu tekan Checkout dan teruskan pesanan ke admin melalui WhatsApp.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bagaimana cara membayar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pembayaran dilakukan melalui QRIS. Setelah membayar, kirim bukti pembayaran kepada admin agar pesanan dapat diproses.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kapan item dikirim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Setelah pembayaran dikonfirmasi, admin mengirim item di dalam game. Untuk bantuan pesanan, hubungi admin melalui WhatsApp.',
      },
    },
  ],
};

export async function getServerSideProps() {
  return { props: { ssrGeneratedAt: new Date().toISOString() } };
}

export default function FaqPage({ ssrGeneratedAt }) {
  return (
    <>
      <Head>
        {"\n"}
        <meta charSet="UTF-8" />
        {"\n"}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {"\n"}
        <meta name="theme-color" content="#060913" />
        {"\n"}
        <meta name="description" content="Panduan cara membeli di Rockstar.Store dan jawaban atas pertanyaan umum tentang pemesanan, pembayaran, dan pengiriman item." />
        <meta name="rs:ssr-rendered-at" content={ssrGeneratedAt} />
        {"\n"}
        <meta name="robots" content="index,follow" />
        {"\n"}
        <title>{"FAQ & Cara Beli | Rockstar.Store"}</title>
        {"\n"}
        <link rel="canonical" href="https://rockstarstore.id/faq" />
        {"\n"}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Rockstar.Store" />
        <meta property="og:title" content="FAQ & Cara Beli | Rockstar.Store" />
        <meta property="og:description" content="Panduan cara memesan, membayar, dan menerima item di Rockstar.Store." />
        <meta property="og:url" content="https://rockstarstore.id/faq" />
        <meta property="og:image" content="https://rockstarstore.id/ROCKSTARLOGO.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAQ & Cara Beli | Rockstar.Store" />
        <meta name="twitter:description" content="Panduan cara memesan, membayar, dan menerima item di Rockstar.Store." />
        <meta name="twitter:image" content="https://rockstarstore.id/ROCKSTARLOGO.png" />
        <link rel="icon" type="image/png" href="ROCKSTARLOGO.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {"\n"}
        <style dangerouslySetInnerHTML={{ __html: "\n:root{color-scheme:dark;--bg:#060913;--card:#0e1628;--line:rgba(111,139,255,.22);--txt:#f5f7ff;--mut:#aab4ce;--blue:#2b4eff;--blue2:#6f8bff;--gold:#f3d27a}\n*{box-sizing:border-box}\nhtml{scroll-behavior:smooth}\nbody{margin:0;min-height:100vh;padding:0 0 40px;color:var(--txt);font-family:Poppins,sans-serif;background:radial-gradient(900px 360px at 85% 0,rgba(43,78,255,.2),transparent 65%),radial-gradient(700px 300px at 5% 0,rgba(43,78,255,.12),transparent 60%),var(--bg)}\na{color:inherit}\nheader{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px max(20px,calc((100vw - 1180px)/2));background:rgba(0,4,40,.88);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.09)}\n.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:700;letter-spacing:.4px}.brand img{height:36px;border-radius:9px}\n.back{color:#dbe4ff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 14px;border:1px solid var(--line);border-radius:12px}.back:hover{border-color:var(--blue2);background:rgba(255,255,255,.06)}\nmain{width:min(1120px,calc(100% - 36px));margin:48px auto 0}\n.intro{text-align:center;margin:0 auto 30px;max-width:760px}.eyebrow{display:inline-block;padding:7px 13px;border:1px solid rgba(111,139,255,.35);border-radius:999px;background:rgba(43,78,255,.12);font-size:12px;font-weight:700;letter-spacing:.08em;color:#dbe4ff}.intro h1{font:800 clamp(36px,6vw,58px)/1.05 'Baloo 2',sans-serif;margin:16px 0 8px}.intro p{color:var(--mut);font-size:15px;line-height:1.7;margin:0}\n.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:16px}\n.step{overflow:hidden;background:linear-gradient(160deg,rgba(18,29,54,.98),rgba(9,14,28,.98));border:1px solid var(--line);border-radius:18px;box-shadow:0 16px 42px rgba(0,0,0,.28)}\n.step img{display:block;width:100%;aspect-ratio:16/10;object-fit:contain;background:#05080f}\n.step-body{padding:18px 20px 20px}.step-no{color:var(--blue2);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.step h2{font:700 24px/1.2 'Baloo 2',sans-serif;margin:6px 0}.step p{color:var(--mut);font-size:14px;line-height:1.7;margin:0}.step strong{color:#fff}\n.faq{margin-top:48px}.faq h2{font:700 32px 'Baloo 2',sans-serif;margin:0 0 14px}.faq-list{display:grid;gap:10px}details{background:rgba(14,22,40,.86);border:1px solid var(--line);border-radius:14px;padding:0 18px}summary{cursor:pointer;list-style:none;padding:17px 28px 17px 0;font-weight:600;position:relative}summary::-webkit-details-marker{display:none}summary:after{content:'+';position:absolute;right:0;top:12px;color:var(--blue2);font-size:24px}details[open] summary:after{content:'−'}details p{color:var(--mut);font-size:14px;line-height:1.75;margin:0;padding:0 0 18px}.contact{margin:30px 0 0;padding:22px;border:1px solid rgba(43,78,255,.35);border-radius:18px;background:linear-gradient(110deg,rgba(43,78,255,.18),rgba(14,22,40,.88));text-align:center}.contact p{color:#d9e1f5;margin:0 0 14px}.contact a{display:inline-block;padding:11px 18px;border-radius:11px;background:#25d366;color:#062b16;text-decoration:none;font-weight:700}\nfooter{text-align:center;color:var(--mut);font-size:12px;margin:42px auto 0;padding:0 18px}\n@media(max-width:560px){header{padding:10px 14px}.brand span{font-size:14px}.back{font-size:12px;padding:9px 10px;white-space:nowrap}main{margin-top:32px}.step-body{padding:16px}.faq h2{font-size:28px}}\n" }} />
        {"\n"}
      </Head>
      {"\n"}
      <header>
        {"\n  "}
        <a className="brand" href="/" aria-label="Rockstar.Store beranda">
          <img src="ROCKSTARLOGO.webp" alt="" />
          <span>
            {"ROCKSTAR.STORE"}
          </span>
        </a>
        {"\n  "}
        <a className="back" href="/">
          {"← Kembali ke Beranda"}
        </a>
        {"\n"}
      </header>
      {"\n"}
      <main>
        {"\n  "}
        <div className="intro">
          {"\n    "}
          <span className="eyebrow">
            {"PUSAT BANTUAN ROCKSTAR.STORE"}
          </span>
          {"\n    "}
          <h1>
            {"FAQ & Cara Beli 🎮"}
          </h1>
          {"\n    "}
        </div>
      </main>
      <p>
        {"Ikuti lima langkah berikut untuk memesan item di Rockstar.Store. Kalau masih ada yang ingin ditanyakan, hubungi admin melalui WhatsApp."}
      </p>
      {"\n  "}
      {"\n  "}
      <section className="steps" aria-label="Langkah cara membeli">
        {"\n    "}
        <article className="step">
          <img src="CARA%20ORDER%201.webp" alt="Langkah 1: pilih item" />
          <div className="step-body">
            <span className="step-no">
              {"Langkah 1"}
            </span>
            <h2>
              {"Pilih item"}
            </h2>
          </div>
          <p>
            {"Lihat-lihat produk, lalu klik "}
            <strong>
              {"Tambah ke Keranjang"}
            </strong>
            {" 🛒"}
          </p>
        </article>
        {"\n    "}
        <article className="step">
          <img src="CARA%20ORDER%202.webp" alt="Langkah 2: cek keranjang" />
          <div className="step-body">
            <span className="step-no">
              {"Langkah 2"}
            </span>
            <h2>
              {"Cek keranjang"}
            </h2>
          </div>
          <p>
            {"Buka keranjang, periksa pesananmu, lalu tekan "}
            <strong>
              {"Checkout"}
            </strong>
            {"."}
          </p>
        </article>
        {"\n    "}
        <article className="step">
          <img src="CARA%20ORDER%203.webp" alt="Langkah 3: kirim pesanan ke admin" />
          <div className="step-body">
            <span className="step-no">
              {"Langkah 3"}
            </span>
            <h2>
              {"Hubungi admin"}
            </h2>
          </div>
          <p>
            {"Klik "}
            <strong>
              {"Kirim ke Admin"}
            </strong>
            {". WhatsApp akan terbuka untuk meneruskan pesanan."}
          </p>
        </article>
        {"\n    "}
        <article className="step">
          <img src="CARA%20ORDER%204.webp" alt="Langkah 4: lakukan pembayaran" />
          <div className="step-body">
            <span className="step-no">
              {"Langkah 4"}
            </span>
            <h2>
              {"Lakukan pembayaran"}
            </h2>
          </div>
          <p>
            {"Bayar melalui QRIS, lalu kirim bukti pembayaran kepada admin."}
          </p>
        </article>
        {"\n    "}
        <article className="step">
          <img src="CARA%20ORDER%205.webp" alt="Langkah 5: item dikirim dalam game" />
          <div className="step-body">
            <span className="step-no">
              {"Langkah 5"}
            </span>
            <h2>
              {"Item dikirim"}
            </h2>
          </div>
          <p>
            {"Admin akan mengirim item di dalam game. Selamat bermain! 🚀"}
          </p>
        </article>
        {"\n  "}
      </section>
      {"\n  "}
      <section className="faq" aria-labelledby="faq-title">
        {"\n    "}
        <h2 id="faq-title">
          {"Pertanyaan yang sering ditanyakan"}
        </h2>
        {"\n    "}
        <div className="faq-list">
          {"\n      "}
          <details>
            <summary>
              {"Bagaimana cara memesan?"}
            </summary>
            <p>
              {"Pilih produk, masukkan ke keranjang, periksa pesanan, lalu tekan Checkout dan teruskan pesanan ke admin melalui WhatsApp."}
            </p>
          </details>
          {"\n      "}
          <details>
            <summary>
              {"Bagaimana cara membayar?"}
            </summary>
            <p>
              {"Pembayaran dilakukan melalui QRIS. Setelah membayar, kirim bukti pembayaran kepada admin agar pesanan dapat diproses."}
            </p>
          </details>
          {"\n      "}
          <details>
            <summary>
              {"Kapan item dikirim?"}
            </summary>
            <p>
              {"Setelah pembayaran dikonfirmasi, admin mengirim item di dalam game. Untuk bantuan pesanan, hubungi admin melalui WhatsApp."}
            </p>
          </details>
          {"\n    "}
        </div>
        {"\n    "}
        <div className="contact" />
      </section>
      <p>
        {"Masih butuh bantuan terkait pesanan?"}
      </p>
      <a href="https://wa.me/6289664299571" target="_blank" rel="noopener">
        {"Chat Admin WhatsApp"}
      </a>
      {"\n  "}
      {"\n"}
      {"\n"}
      <footer>
        {"Rockstar.Store · Panduan pemesanan dan bantuan"}
      </footer>
      {"\n"}
      <PageScripts sources={pageScripts} />
    </>
  );
}
