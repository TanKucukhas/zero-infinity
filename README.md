ZeroInfinity People Intel (Cloudflare + Next.js + OpenNext)

Setup
- Bootstrap (done): `npm create cloudflare@latest -- my-next-app --framework=next`
- Install deps: `npm install`
- Env: use `.env.local` (dev) and `.env.production` (prod)
  - `NEXTAUTH_URL=https://app.zeroinfinity.ai`
  - `NEXTAUTH_SECRET=...`
  - `GITHUB_ID=...`, `GITHUB_SECRET=...`
  - `APOLLO_API_KEY=...`
  - `BOOTSTRAP_ADMIN_EMAILS=tan@zeroinfinity.ai`

Cloudflare
- Typegen: `npm run cf:typegen` (generates `cloudflare-env.d.ts`)
- Wrangler config: `wrangler.jsonc` includes D1 binding and routes

Database (Drizzle + D1)
- Generate: `npm run db:generate`
- Push: `npm run db:push`
- Studio (optional): `npm run db:studio`

Build/Preview/Deploy (OpenNext)
- Dev: `npm run dev`
- Preview: `npm run preview`
- Deploy: `npm run deploy`

CSV Import & Enrich
- Import: `/import` page with CSV uploader (200’lük batch)
- API limits: payload ≤ 5MB, batch ≤ 5000 satır
- Enrich: cool-down 5dk, 429/5xx → 503

Security & Robots
- Middleware adds security headers
- `public/robots.txt` blocks indexing by default

Analytics
- Add GA public envs as `NEXT_PUBLIC_*` in `.env.production` if needed

UI
- Materio (MUI + Tailwind helpers), MUI DataGrid for people list
- Favicon and logo under `public/favicon` and `public/logo`
