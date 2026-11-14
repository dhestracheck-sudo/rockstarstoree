import Head from 'next/head';
import PageScripts from '../components/PageScripts';
import { Oswald } from "next/font/google";
import { adminMarkup, adminStyles } from '../content/adminLatest';

const oswald = Oswald({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
});

const pageScripts = [
  '/site-scripts/admin-01.js?v=1794664285873"UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin — Rockstar.Store</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Panel admin Rockstar.Store (privat)." />
        <link rel="icon" type="image/png" href="/ROCKSTARICON.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/ROCKSTARICON.png" />
        <style dangerouslySetInnerHTML={{ __html: adminStyles + productEditorStyles }} />
      </Head>
      <div className={oswald.variable} dangerouslySetInnerHTML={{ __html: adminMarkup }} />
      <PageScripts sources={pageScripts} />
    </>
  );
}
