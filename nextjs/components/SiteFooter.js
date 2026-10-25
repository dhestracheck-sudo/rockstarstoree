const sitemap = [
  { label: "Beranda", href: "/", icon: "⌂" },
  { label: "FAQ & Cara Beli", href: "/faq", icon: "?" },
  { label: "Akun Sepuh", href: "/?tab=akun", icon: "👤" },
  { label: "Top Up Robux", href: "/?tab=topup", icon: "💎" },
  { label: "Brainrot", href: "/?tab=brainrot", icon: "🧠" },
  { label: "Joki Sepuh", href: "/?tab=joki", icon: "🏆" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="site-footer-brand" href="/" aria-label="Rockstar.Store beranda">
        <img src="/ROCKSTARLOGO.webp" alt="" width="52" height="52" loading="lazy" />
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
