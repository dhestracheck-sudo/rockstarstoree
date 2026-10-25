import Head from 'next/head';
import PageScripts from '../components/PageScripts';
import { adminMarkup, adminStyles } from '../content/adminLatest';

const pageScripts = ['/site-scripts/admin-01.js'];

export default function AdminPage() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin — Rockstar.Store</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Panel admin Rockstar.Store (privat)." />
        <link rel="icon" type="image/png" href="/ROCKSTARLOGO.png" />
        <link rel="apple-touch-icon" href="/ROCKSTARLOGO.png" />
        <style dangerouslySetInnerHTML={{ __html: adminStyles }} />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: adminMarkup }} />
      <PageScripts sources={pageScripts} />
    </>
  );
}
