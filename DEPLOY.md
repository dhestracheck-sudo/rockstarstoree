# Deploy RockstarStore Next.js ke Cloudflare

Tampilan web tidak diubah. Yang dibetulkan hanya struktur deploy.

## Struktur yang benar

- Source: branch `cloudflare-nextjs`
  `pages/`, `components/`, `site-scripts/`, `styles/`, `scripts/prepare-public.mjs`,
  `next.config.mjs`, `open-next.config.ts`, `wrangler.jsonc`
- Jangan commit ke source:
  `.next/`, `.open-next/`, `.wrangler/`, `out/`, `public/` (generated),
  `_next/`, `404.html`, `/admin/`, `/analisis/`, `/faq/`, `/kantor/`, `/functions/` (output static lama)
- Branch `main` sebelumnya berisi output static export + `_next/static`.
  Jangan deploy dari situ lagi. `main` harus = source.

## Build lokal (sudah diverifikasi)

```bash
npm install --no-audit --no-fund
npm run build    # prepare-public + next build
npm run cf:build # prepare-public + opennextjs-cloudflare build
```

Hasil:
- `Route (pages)` 7 route: `/`, `/404`, `/admin`, `/analisis`, `/faq`, `/kantor`, `/sitemap.xml`
- `Worker saved in .open-next/worker.js`

## Deploy ke Cloudflare Workers

Worker name: `rockstarstore-ssr` (lihat `wrangler.jsonc`).
Custom domain `rockstarstore.id` di-set di dashboard Cloudflare, bukan via file CNAME.

```bash
npx wrangler login
npm run deploy
# = prepare-public + opennext build + opennext deploy
```

Alternatif dashboard:
- Build command: `npm run cf:build`
- Deploy command: `npx wrangler deploy`

## Auto-deploy via GitHub Actions

Workflow: `.github/workflows/deploy.yml`.
Trigger: push ke `cloudflare-nextjs` atau `main`.

Secrets yang harus diisi di GitHub repo Settings > Secrets:
- `CLOUDFLARE_API_TOKEN` (Workers deploy token)
- `CLOUDFLARE_ACCOUNT_ID`

Setelah secrets ada, tiap push otomatis build + deploy.

## Mengganti main yang lama (hati-hati)

`origin/main` saat ini = output build lama. Setelah `cloudflare-nextjs` stabil:

```bash
git checkout main
git pull origin main
git rm -r --cached _next 404.html admin analisis faq kantor functions || true
git checkout cloudflare-nextjs -- pages components site-scripts styles scripts next.config.mjs open-next.config.ts wrangler.jsonc package.json package-lock.json .gitignore _headers manifest.json sw.js
git status --short
npm run cf:build
git push origin main
```

Jangan push sebelum `cf:build` hijau lokal.
