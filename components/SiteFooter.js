const sitemap = [
  { label: "Beranda", href: "/", icon: "⌂" },
  { label: "Brainrot", href: "/brainrot", icon: "🧠" },
  { label: "Akun Sepuh", href: "/akun-sepuh", icon: "👤" },
  { label: "Joki Sepuh", href: "/joki-roblox", icon: "🏆" },
  { label: "Top Up Robux", href: "/topup-robux", icon: "💎" },
  { label: "Berita & Guide", href: "/berita", icon: "📰" },
  { label: "Lucky Spin", href: "/spin", icon: "🎡" },
  { label: "FAQ & Cara Beli", href: "/faq", icon: "?" },
  { label: "llms.txt (AI)", href: "/llms.txt", icon: "🤖" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="site-footer-brand" href="/" aria-label="Rockstar.Store beranda">
        <img src="/ROCKSTARLOGO.webp" srcSet="/optimized/ROCKSTARLOGO-72.webp 72w, /optimized/ROCKSTARLOGO-220.webp 220w, /ROCKSTARLOGO.webp 500w" sizes="52px" alt="Logo Rockstar.Store" width="52" height="52" loading="lazy" />
        <span>ROCKSTAR.STORE</span>
      </a>

      <nav className="site-footer-column" aria-label="Peta situs">
        <h2>PETA SITUS</h2>
        <div className="site-footer-links">
          {sitemap.map((item) => (
            <a href={item.href} key={item.label}>
              <span className="site-footer-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="site-footer-column">
        <h2>FOLLOW US</h2>
        <div className="site-footer-links">
          <a href="https://www.tiktok.com/@rockstarstoree" target="_blank" rel="noreferrer">
            <span className="site-footer-icon" aria-hidden="true">♪</span>
            <span>TikTok <small>@rockstarstoree</small></span>
          </a>
          <a href="https://whatsapp.com/channel/0029VbC0kyR0wajl0r4MVa1Q" target="_blank" rel="noreferrer">
            <span className="site-footer-icon" aria-hidden="true">◉</span>
            <span>Saluran WhatsApp</span>
          </a>
        </div>
      </div>

      <p className="site-footer-copy">
        Copyright © 2026 <strong>ROCKSTAR.STORE</strong>. All rights reserved.
      </p>
    </footer>
  );
}
