# Rockstar.Store — Next.js

Situs memakai route React/JSX di folder `pages`. Tampilan halaman ditulis sebagai komponen JSX; interaksi halaman berada di berkas JavaScript pada `site-scripts/` dan dimuat oleh komponen React.

## Menjalankan lokal

Jalankan `npm install`, lalu `npm run dev`. Buka http://localhost:3000. Halaman tersedia di `/`, `/admin`, `/analisis`, `/faq`, dan `/kantor`.

## Build untuk hosting statis

Jalankan `npm run build`. Next.js menghasilkan situs statis di folder `out/`, termasuk `index.html` sebagai keluaran hosting untuk halaman utama. Source proyek tidak memakai berkas HTML sebagai template.
