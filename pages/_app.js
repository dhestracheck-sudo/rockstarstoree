import "../styles/announcement.css";
import "../styles/hd.css";
import "../styles/sky.css";
import "../styles/catalog-title.css";
import "../styles/banner-art.css";
import "../styles/flashrow.css";
import Script from "next/script";
import { useRouter } from "next/router";
import { Baloo_2, Poppins } from "next/font/google";

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
export default function App({ Component, pageProps }) {
  const { pathname } = useRouter();
  const shouldTrack = !["/admin", "/analisis", "/kantor"].includes(pathname);

  return (
    <>
      <div className={`${poppins.className} ${poppins.variable} ${baloo.variable}`}>
        <div className="snow-flakes" aria-hidden="true">
          <i style={{ "--x": "4%", "--s": "20px", "--d": "10.5s", "--dl": "-2.5s", "--sw": "24px", "--op": "0.92" }} />
          <i style={{ "--x": "12%", "--s": "26px", "--d": "8.8s", "--dl": "-6.2s", "--sw": "-22px", "--op": "0.98" }} />
          <i style={{ "--x": "21%", "--s": "18px", "--d": "12s", "--dl": "-8.8s", "--sw": "26px", "--op": "0.88" }} />
          <i style={{ "--x": "29%", "--s": "28px", "--d": "8.2s", "--dl": "-1.5s", "--sw": "-26px", "--op": "0.98" }} />
          <i style={{ "--x": "38%", "--s": "22px", "--d": "10.2s", "--dl": "-4.8s", "--sw": "20px", "--op": "0.92" }} />
          <i style={{ "--x": "47%", "--s": "24px", "--d": "9.2s", "--dl": "-7.4s", "--sw": "-24px", "--op": "0.96" }} />
          <i style={{ "--x": "55%", "--s": "18px", "--d": "11.5s", "--dl": "-3.1s", "--sw": "28px", "--op": "0.88" }} />
          <i style={{ "--x": "64%", "--s": "28px", "--d": "8.5s", "--dl": "-5.5s", "--sw": "-22px", "--op": "0.98" }} />
          <i style={{ "--x": "72%", "--s": "20px", "--d": "10.8s", "--dl": "-8.2s", "--sw": "24px", "--op": "0.92" }} />
          <i style={{ "--x": "81%", "--s": "26px", "--d": "9s", "--dl": "-2.2s", "--sw": "-25px", "--op": "0.98" }} />
          <i style={{ "--x": "89%", "--s": "18px", "--d": "11.8s", "--dl": "-6.8s", "--sw": "22px", "--op": "0.88" }} />
          <i style={{ "--x": "96%", "--s": "26px", "--d": "8.2s", "--dl": "-4.0s", "--sw": "-20px", "--op": "0.98" }} />
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
