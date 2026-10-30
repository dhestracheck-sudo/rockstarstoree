import "../styles/announcement.css";
import "../styles/hd.css";
import "../styles/sky.css";
import "../styles/catalog-title.css";
import Script from "next/script";
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

  return (
    <>
      <div className={`${poppins.className} ${poppins.variable} ${baloo.variable} ${oswald.variable}`}>
        <div className="bubbles-back" aria-hidden="true">
          <i className="bubble" style={{ "--x": "8%", "--s": "34px", "--d": "14s", "--dl": "1.4s", "--sw": "-20px" }} />
          <i className="bubble" style={{ "--x": "27%", "--s": "26px", "--d": "11s", "--dl": "4.1s", "--sw": "30px" }} />
          <i className="bubble" style={{ "--x": "49%", "--s": "42px", "--d": "12.5s", "--dl": "0.3s", "--sw": "-28px" }} />
          <i className="bubble" style={{ "--x": "68%", "--s": "30px", "--d": "13.2s", "--dl": "5.6s", "--sw": "24px" }} />
          <i className="bubble" style={{ "--x": "91%", "--s": "36px", "--d": "11.6s", "--dl": "2.9s", "--sw": "-22px" }} />
        </div>
        <div className="sakura-petals" aria-hidden="true">
          <i style={{ "--x": "3%", "--s": "10px", "--d": "12.6s", "--dl": "2.2s", "--sw": "-34px" }} />
          <i style={{ "--x": "17%", "--s": "13px", "--d": "10.2s", "--dl": "5s", "--sw": "28px" }} />
          <i style={{ "--x": "29%", "--s": "9px", "--d": "13.1s", "--dl": "0.7s", "--sw": "-40px" }} />
          <i style={{ "--x": "38%", "--s": "12px", "--d": "11.3s", "--dl": "3.8s", "--sw": "30px" }} />
          <i style={{ "--x": "51%", "--s": "10px", "--d": "12.1s", "--dl": "1.5s", "--sw": "-28px" }} />
          <i style={{ "--x": "63%", "--s": "14px", "--d": "10.7s", "--dl": "4.6s", "--sw": "36px" }} />
          <i style={{ "--x": "72%", "--s": "9px", "--d": "13.4s", "--dl": "0.2s", "--sw": "-36px" }} />
          <i style={{ "--x": "86%", "--s": "12px", "--d": "11.8s", "--dl": "3.1s", "--sw": "26px" }} />
        </div>
        <div className="stars-back" aria-hidden="true">
          <i style={{ "--x": "4%", "--y": "10%", "--s": "2px", "--d": "3.2s", "--dl": "0s" }} />
          <i style={{ "--x": "11%", "--y": "32%", "--s": "3px", "--d": "4.1s", "--dl": "0.8s" }} />
          <i style={{ "--x": "18%", "--y": "18%", "--s": "2px", "--d": "2.8s", "--dl": "1.6s" }} />
          <i style={{ "--x": "26%", "--y": "44%", "--s": "3px", "--d": "3.9s", "--dl": "0.4s" }} />
          <i style={{ "--x": "33%", "--y": "8%", "--s": "2px", "--d": "3.4s", "--dl": "2.1s" }} />
          <i style={{ "--x": "41%", "--y": "26%", "--s": "2px", "--d": "4.4s", "--dl": "1.1s" }} />
          <i style={{ "--x": "48%", "--y": "52%", "--s": "3px", "--d": "3s", "--dl": "2.6s" }} />
          <i style={{ "--x": "55%", "--y": "14%", "--s": "2px", "--d": "3.7s", "--dl": "0.2s" }} />
          <i style={{ "--x": "63%", "--y": "36%", "--s": "3px", "--d": "4.2s", "--dl": "1.9s" }} />
          <i style={{ "--x": "70%", "--y": "6%", "--s": "2px", "--d": "3.1s", "--dl": "2.9s" }} />
          <i style={{ "--x": "77%", "--y": "48%", "--s": "2px", "--d": "3.8s", "--dl": "0.6s" }} />
          <i style={{ "--x": "84%", "--y": "22%", "--s": "3px", "--d": "4.6s", "--dl": "1.4s" }} />
          <i style={{ "--x": "90%", "--y": "58%", "--s": "2px", "--d": "3.3s", "--dl": "2.4s" }} />
          <i style={{ "--x": "95%", "--y": "12%", "--s": "2px", "--d": "4s", "--dl": "0.9s" }} />
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
