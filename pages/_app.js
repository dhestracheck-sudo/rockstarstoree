import "../styles/announcement.css";
import Script from "next/script";
import { useRouter } from "next/router";

const GOOGLE_ANALYTICS_ID = "G-8CKBS3MNXH";

export default function App({ Component, pageProps }) {
  const { pathname } = useRouter();
  const shouldTrack = !["/admin", "/analisis", "/kantor"].includes(pathname);

  return (
    <>
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
    </>
  );
}
