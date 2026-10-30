import "../styles/announcement.css";
import "../styles/petals.css";
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
        <div className="petals" aria-hidden="true">
          <i style={{ "--x": "4%", "--s": "11px", "--d": "12s", "--dl": "0s", "--sw": "30px" }} />
          <i style={{ "--x": "13%", "--s": "14px", "--d": "10s", "--dl": "1.6s", "--sw": "-26px" }} />
          <i style={{ "--x": "24%", "--s": "10px", "--d": "13s", "--dl": "3.1s", "--sw": "38px" }} />
          <i style={{ "--x": "33%", "--s": "13px", "--d": "11s", "--dl": "0.7s", "--sw": "-32px" }} />
          <i style={{ "--x": "44%", "--s": "11px", "--d": "12.5s", "--dl": "2.3s", "--sw": "28px" }} />
          <i style={{ "--x": "55%", "--s": "14px", "--d": "10.5s", "--dl": "4s", "--sw": "-30px" }} />
          <i style={{ "--x": "64%", "--s": "10px", "--d": "13.5s", "--dl": "1.1s", "--sw": "36px" }} />
          <i style={{ "--x": "74%", "--s": "12px", "--d": "11.5s", "--dl": "2.9s", "--sw": "-28px" }} />
          <i style={{ "--x": "84%", "--s": "13px", "--d": "12.8s", "--dl": "0.4s", "--sw": "32px" }} />
          <i style={{ "--x": "93%", "--s": "11px", "--d": "10.8s", "--dl": "3.6s", "--sw": "-34px" }} />
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
