import "../styles/announcement.css";
import "../styles/hd.css";
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
        {shouldTrack && (
          <div className="sakura-bubbles" aria-hidden="true">
          <i className="bubble" style={{ "--x": "12%", "--s": "30px", "--d": "13s", "--dl": "0s", "--sw": "22px" }} />
          <i className="bubble" style={{ "--x": "30%", "--s": "40px", "--d": "11s", "--dl": "2.5s", "--sw": "-26px" }} />
          <i className="bubble" style={{ "--x": "52%", "--s": "26px", "--d": "14s", "--dl": "1.2s", "--sw": "28px" }} />
          <i className="bubble" style={{ "--x": "70%", "--s": "36px", "--d": "12s", "--dl": "3.8s", "--sw": "-24px" }} />
          <i className="bubble" style={{ "--x": "88%", "--s": "30px", "--d": "13.5s", "--dl": "5s", "--sw": "20px" }} />
          </div>
        )}
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
