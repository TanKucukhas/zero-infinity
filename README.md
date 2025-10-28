ZeroInfinity People Intel (Cloudflare + Next.js + OpenNext)

## Database Development & Deployment Workflow

### Local Development (SQLite + Mock Data)
- **Database**: Local SQLite file (`.data/dev.sqlite`)
- **Data**: Mock seed data for development and testing
- **Purpose**: Safe schema development and business logic testing

### Production (Cloudflare D1)
- **Database**: Cloudflare D1 binding (`DB`)
- **Data**: Real production data
- **Purpose**: Live application serving real users

### Commands

#### Migration Management
```bash
# Generate migration from schema changes
npm run db:migrate:generate

# Apply migrations to local SQLite
npm run db:migrate:apply:local

# Apply migrations to production D1 (with safety checks)
npm run db:migrate:apply:prod
```

#### Backup & Restore
```bash
# Create production backup (before any prod changes)
npm run db:backup:prod

# Create local backup (before breaking changes)
npm run db:backup:local

# Restore local from backup
npm run db:restore:local sqlite  # From SQLite backup
npm run db:restore:local sql     # From production SQL backup

# Push production backup to local database
npm run db:push:prod-to-local [backup-file]
```

#### Development Setup
```bash
# Seed local database with mock data
npm run db:seed:mock

# Open Drizzle Studio for database inspection
npm run db:studio
```

#### Production Deployment
```bash
# Deploy to production (includes backup + migration + app deploy)
npm run deploy:prod --yes
```

### Safety Features

#### Production Migration Guards
- ✅ Must run from `master`/`main` branch
- ✅ Working tree must be clean (no uncommitted changes)
- ✅ Requires fresh backup (≤10 minutes old)
- ✅ Requires `--yes` flag for confirmation

#### Backup Strategy
- **Production**: Automatic full backup before any migration
- **Local**: Manual backup before breaking changes
- **Restore**: Easy rollback from timestamped backups

### Development Workflow

1. **Schema Changes**: Modify `src/server/db/schema.ts`
2. **Generate Migration**: `npm run db:migrate:generate`
3. **Review Migration**: Check generated SQL in `drizzle/` directory
4. **Test Locally**: `npm run db:migrate:apply:local`
5. **Verify**: Test with mock data, run application locally
6. **Deploy**: `npm run deploy:prod --yes` (includes backup + migration)

### Data Migration (Production Only)
- Schema migrations ≠ Data migrations
- Data changes (bulk inserts/updates) use separate scripts
- Only apply data migrations to production, never local

### Environment Configuration

#### Local Development
```bash
# .env.local (not tracked in git)
## Choose DB source for local dev
# Use mock JSON (no persistence)
DB_SOURCE=mock
# Mock JSON served from public: /public/mock/*.json

# Or use local SQLite file
# DB_SOURCE=sqlite
DEV_SQLITE_PATH=./.data/dev.sqlite
NODE_ENV=development
```

#### Production
- Uses Cloudflare D1 binding (`DB`) from `wrangler.jsonc`
- Set `DB_SOURCE=prod` (effective only on Workers where `env.DB` exists)
- No other local environment variables needed

#### Health & UI
- `GET /api/health/db` returns `{ ok, source: 'mock'|'sqlite'|'prod' }`
- Header’da DB rozeti (Mock/SQLite/Prod) otomatik görünür
- Mock modda veriler `public/mock/*.json` üzerinden okunur (edge-safe)

### Troubleshooting

#### Local Database Issues
```bash
# Reset local database
rm .data/dev.sqlite
npm run db:migrate:apply:local
npm run db:seed:mock
```

#### Production Issues
```bash
# Check latest backup
ls -la backups/backup_remote_*.sql

# Restore from backup (manual process)
# 1. Download backup SQL file
# 2. Apply to D1 using wrangler
```

---

## Original Setup Instructions

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

Build/Preview/Deploy (OpenNext)
- Dev: `npm run dev`
- Preview: `npm run preview`
- Deploy: `npm run deploy`

CSV Import & Enrich
- Import: `/import` page with CSV uploader (200'lük batch)
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
