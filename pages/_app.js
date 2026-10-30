import "../styles/announcement.css";
import "../styles/sakura.css";
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Baloo_2, Oswald, Poppins } from "next/font/google";

const GOOGLE_ANALYTICS_ID = "G-8CKBS3MNXH";
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});
const baloo = Baloo_2({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-baloo-2",
});
const oswald = Oswald({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

export default function App({ Component, pageProps }) {
  const { pathname } = useRouter();
  const shouldTrack = !["/admin", "/analisis", "/kantor"].includes(pathname);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.querySelector(".sakura-bubbles");
    if (!box) return;
    const onTap = (e) => {
      const b = e.target.closest(".bubble");
      if (!b || b.classList.contains("pop")) return;
      b.classList.add("pop");
      window.setTimeout(() => {
        b.classList.remove("pop");
        b.style.left = `${4 + Math.random() * 92}%`;
        b.style.animation = "none";
        void b.offsetWidth;
        b.style.animation = "";
      }, 320);
    };
    box.addEventListener("pointerdown", onTap);
    return () => box.removeEventListener("pointerdown", onTap);
  }, []);

  return (
    <>
      <div className={`${poppins.className} ${poppins.variable} ${baloo.variable} ${oswald.variable}`}>
        <div className="sakura-tree" aria-hidden="true">
          <svg viewBox="0 0 200 250" width="100%" height="auto" role="presentation">
            <path d="M96 250 C94 205 92 175 74 148 C64 134 52 126 40 122" fill="none" stroke="#4a2c1a" strokeWidth="11" strokeLinecap="round" />
            <path d="M104 250 C106 205 108 172 128 146 C138 132 150 124 162 120" fill="none" stroke="#4a2c1a" strokeWidth="11" strokeLinecap="round" />
            <path d="M100 250 C100 210 100 180 100 150" fill="none" stroke="#5a3620" strokeWidth="14" strokeLinecap="round" />
            <path d="M100 185 C86 172 74 168 60 166 M100 170 C114 158 126 154 140 152" fill="none" stroke="#4a2c1a" strokeWidth="7" strokeLinecap="round" />
            <g opacity="0.95">
              <ellipse cx="52" cy="118" rx="34" ry="26" fill="#f7a8c4" />
              <ellipse cx="150" cy="116" rx="36" ry="27" fill="#f7a8c4" />
              <ellipse cx="100" cy="92" rx="46" ry="34" fill="#f9bcd2" />
              <ellipse cx="72" cy="76" rx="28" ry="22" fill="#fbd0e0" />
              <ellipse cx="130" cy="74" rx="30" ry="23" fill="#fbd0e0" />
              <ellipse cx="100" cy="60" rx="26" ry="20" fill="#fce3ee" />
              <ellipse cx="38" cy="98" rx="18" ry="15" fill="#f78fb3" />
              <ellipse cx="164" cy="96" rx="19" ry="15" fill="#f78fb3" />
            </g>
            <g fill="#fff0f6" opacity="0.85">
              <circle cx="80" cy="80" r="3" /><circle cx="110" cy="70" r="3.4" /><circle cx="95" cy="100" r="2.6" />
              <circle cx="125" cy="95" r="2.8" /><circle cx="60" cy="110" r="2.6" /><circle cx="145" cy="108" r="3" />
            </g>
          </svg>
        </div>
        <div className="sakura-petals" aria-hidden="true">
          <i style={{ "--x": "6%", "--s": "11px", "--d": "12s", "--dl": "0s", "--sw": "30px" }} />
          <i style={{ "--x": "18%", "--s": "14px", "--d": "10s", "--dl": "1.6s", "--sw": "-26px" }} />
          <i style={{ "--x": "30%", "--s": "10px", "--d": "13s", "--dl": "3.1s", "--sw": "38px" }} />
          <i style={{ "--x": "42%", "--s": "13px", "--d": "11s", "--dl": "0.7s", "--sw": "-32px" }} />
          <i style={{ "--x": "58%", "--s": "11px", "--d": "12.5s", "--dl": "2.3s", "--sw": "28px" }} />
          <i style={{ "--x": "70%", "--s": "14px", "--d": "10.5s", "--dl": "4s", "--sw": "-30px" }} />
          <i style={{ "--x": "80%", "--s": "10px", "--d": "13.5s", "--dl": "1.1s", "--sw": "36px" }} />
          <i style={{ "--x": "90%", "--s": "12px", "--d": "11.5s", "--dl": "2.9s", "--sw": "-28px" }} />
        </div>
        <div className="sakura-bubbles" aria-hidden="true">
          <i className="bubble" style={{ "--x": "12%", "--s": "30px", "--d": "13s", "--dl": "0s", "--sw": "22px" }} />
          <i className="bubble" style={{ "--x": "30%", "--s": "40px", "--d": "11s", "--dl": "2.5s", "--sw": "-26px" }} />
          <i className="bubble" style={{ "--x": "52%", "--s": "26px", "--d": "14s", "--dl": "1.2s", "--sw": "28px" }} />
          <i className="bubble" style={{ "--x": "70%", "--s": "36px", "--d": "12s", "--dl": "3.8s", "--sw": "-24px" }} />
          <i className="bubble" style={{ "--x": "88%", "--s": "30px", "--d": "13.5s", "--dl": "5s", "--sw": "20px" }} />
        </div>
        {shouldTrack && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
              strategy="lazyOnload"
            />
            <Script id="rockstar-google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ANALYTICS_ID}');`}
            </Script>
          </>
        )}
        <Component {...pageProps} />
      </div>
    </>
  );
}
