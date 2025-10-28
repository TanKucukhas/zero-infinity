# Database Documentation

## Overview

Bu dokümantasyon ZeroInfinity People Intel projesinin veritabanı mimarisi, geliştirme süreçleri ve operasyonel prosedürleri hakkında detaylı bilgi içerir.

## Architecture

### Database Environments

#### Local Development (SQLite)
- **Database**: SQLite file (`.data/dev.sqlite`)
- **Purpose**: Schema development, business logic testing
- **Data**: Mock seed data only
- **Isolation**: Completely separate from production
- **Performance**: Fast, no network latency

#### Production (Cloudflare D1)
- **Database**: Cloudflare D1 binding (`DB`)
- **Purpose**: Live application serving real users
- **Data**: Real production data
- **Location**: Cloudflare Edge network
- **Performance**: Optimized for global distribution

### Database Client Architecture

```typescript
// src/server/db/client.ts
export function getDb(env: any) {
  // Production/Cloudflare Workers environment
  if (env.DB) {
    return drizzle(env.DB); // D1 driver
  }
  
  // Local development environment
  const sqlitePath = process.env.DEV_SQLITE_PATH || "./.data/dev.sqlite";
  const sqlite = new Database(sqlitePath);
  return drizzleSqlite(sqlite); // SQLite driver
}
```

## Schema Design

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','editor','viewer','external')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at INTEGER NOT NULL
);
```

#### Contacts
```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT,
  last_name TEXT,
  email_primary TEXT,
  email_secondary TEXT,
  phone_number TEXT,
  company_id INTEGER REFERENCES companies(id),
  linkedin TEXT,
  facebook TEXT,
  instagram TEXT,
  imdb TEXT,
  wikipedia TEXT,
  biography TEXT,
  priority TEXT NOT NULL DEFAULT 'NONE' CHECK (priority IN ('HIGH','MEDIUM','LOW','NONE')),
  seen_film INTEGER NOT NULL DEFAULT 0,
  doc_branch_member INTEGER NOT NULL DEFAULT 0,
  location_country TEXT REFERENCES countries(code),
  location_state TEXT REFERENCES states(code),
  location_city INTEGER REFERENCES cities(id),
  location_state_text TEXT,
  location_city_text TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  inactive_reason TEXT,
  inactive_reason_user_id INTEGER REFERENCES users(id),
  inactive_at INTEGER,
  created_by_user_id INTEGER REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  created_at INTEGER NOT NULL,
  UNIQUE(first_name, last_name, email_primary)
);
```

#### Companies
```sql
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  linkedin_url TEXT,
  industry TEXT,
  size TEXT,
  description TEXT,
  logo_url TEXT,
  headquarters_country TEXT REFERENCES countries(code),
  headquarters_state TEXT REFERENCES states(code),
  headquarters_city INTEGER REFERENCES cities(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Location Tables

#### Countries
```sql
CREATE TABLE countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
```

#### States
```sql
CREATE TABLE states (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code)
);
```

#### Cities
```sql
CREATE TABLE cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  city_ascii TEXT NOT NULL,
  state_code TEXT NOT NULL REFERENCES states(code),
  county_fips TEXT,
  county_name TEXT,
  lat REAL,
  lng REAL,
  population INTEGER,
  density REAL,
  timezone TEXT,
  zips TEXT,
  UNIQUE(city_ascii, state_code)
);
```

### Relationship Tables

#### Contact Relationships
```sql
CREATE TABLE contact_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_owner_user_id INTEGER REFERENCES users(id),
  introduced_by_user_id INTEGER REFERENCES users(id),
  relationship_strength INTEGER,
  last_contact_at INTEGER,
  relationship_type TEXT DEFAULT 'custom' CHECK (relationship_type IN ('surface_level','mentor','supporter','colleague','friend','exec','custom')),
  label TEXT
);
```

#### Contact Assignments
```sql
CREATE TABLE contact_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(contact_id, user_id)
);
```

#### Contact History
```sql
CREATE TABLE contact_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created','updated','activated','deactivated','archived','deleted','assigned','unassigned')),
  changes_json TEXT,
  reason TEXT,
  performed_by_user_id INTEGER REFERENCES users(id),
  occurred_at INTEGER NOT NULL
);
```

#### Notes
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'general' CHECK (scope IN ('general','hemal','yetkin','private')),
  body TEXT NOT NULL,
  author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_edited INTEGER NOT NULL DEFAULT 0,
  edited_at INTEGER,
  created_at INTEGER NOT NULL
);
```

#### Outreach Events
```sql
CREATE TABLE outreach_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_key TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','phone','linkedin','whatsapp','in_person','other')),
  message TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','opened','replied','bounced','failed')),
  performed_by_user_id INTEGER REFERENCES users(id),
  occurred_at INTEGER NOT NULL
);
```

## Migration System

### Migration Workflow

1. **Schema Changes**: Modify `src/server/db/schema.ts`
2. **Generate Migration**: `npm run db:migrate:generate`
3. **Review Migration**: Check generated SQL in `drizzle/` directory
4. **Test Locally**: `npm run db:migrate:apply:local`
5. **Verify**: Test with mock data, run application locally
6. **Deploy**: `npm run deploy:prod --yes` (includes backup + migration)

### Migration Commands

```bash
# Generate migration from schema changes
npm run db:migrate:generate

# Apply migrations to local SQLite
npm run db:migrate:apply:local

# Apply migrations to production D1 (with safety checks)
npm run db:migrate:apply:prod
```

### Migration Safety Checks

Production migrations include these safety checks:
- ✅ Must run from `master`/`main` branch
- ✅ Working tree must be clean (no uncommitted changes)
- ✅ Requires fresh backup (≤10 minutes old)
- ✅ Requires `--yes` flag for confirmation

## Backup & Restore

### Backup Strategy

#### Production Backups
- **Automatic**: Before every migration/deployment
- **Manual**: `npm run db:backup:prod`
- **Location**: `backups/backup_remote_YYYY-MM-DD_HH-MM-SSZ.sql`
- **Clean Copy**: `backups/backup_remote_clean.sql`

#### Local Backups
- **Manual**: `npm run db:backup:local`
- **Location**: `backups/backup_local_YYYY-MM-DD_HH-MM-SSZ.sqlite`
- **Clean Copy**: `backups/backup_local_clean.sqlite`

### Restore Commands

```bash
# Restore local from SQLite backup
npm run db:restore:local sqlite

# Restore local from production SQL backup
npm run db:restore:local sql
```

### Backup Commands

```bash
# Create production backup
npm run db:backup:prod

# Create local backup
npm run db:backup:local
```

### Backup File Organization

#### Production Backups
- `backup_remote_clean.sql` - Latest clean production backup
- `backup_remote_YYYY-MM-DD_HH-MM-SSZ.sql` - Timestamped production backups

#### Local Backups
- `backup_local_clean.sqlite` - Latest clean local backup
- `backup_local_YYYY-MM-DD_HH-MM-SSZ.sqlite` - Timestamped local backups

#### Reference Data Files
- `users_inserts_fixed.sql` - Corrected user data
- `companies_inserts_fixed.sql` - Corrected company data
- `contacts_inserts_fixed.sql` - Corrected contact data
- `countries_inserts.sql` - Country reference data
- `states_inserts.sql` - State reference data

#### Cleanup Policy
- Keep only the latest "fixed" versions of data files
- Remove duplicate/outdated files regularly
- Maintain timestamped backups for rollback purposes
- Archive old backups to external storage if needed

## Data Management

### Mock Data (Local Development)

Mock data is seeded using `scripts/seed_mock_data.ts`:

```bash
# Seed local database with mock data
npm run db:seed:mock
```

#### Mock Data Includes:
- 5 countries (US, CA, GB, DE, FR)
- 5 states (CA, NY, TX, ON, BC)
- 5 cities (San Francisco, Los Angeles, New York, Toronto, Vancouver)
- 3 users (Admin, John Doe, Jane Smith)
- 3 companies (TechCorp Inc, Innovation Labs, Global Solutions)
- 4 contacts (Alice Johnson, Bob Wilson, Carol Davis, David Brown)

### Production Data

Production data is managed separately:
- **Schema migrations**: Use Drizzle Kit migrations
- **Data migrations**: Use custom scripts in `scripts/` directory
- **Bulk operations**: Use dedicated data migration scripts
- **Never mix**: Schema and data migrations are separate processes

## Development Workflow

### Local Development Setup

1. **Initialize Local Database**:
   ```bash
   npm run db:seed:mock
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Make Schema Changes**:
   - Edit `src/server/db/schema.ts`
   - Generate migration: `npm run db:migrate:generate`
   - Apply locally: `npm run db:migrate:apply:local`

4. **Test Changes**:
   - Verify with mock data
   - Run application locally
   - Check API responses

### Production Deployment

1. **Pre-deployment Backup**:
   ```bash
   npm run db:backup:prod
   ```

2. **Deploy with Safety Checks**:
   ```bash
   npm run deploy:prod --yes
   ```

3. **Monitor Deployment**:
   - Check application logs
   - Verify database connectivity
   - Test critical functionality

## Performance Considerations

### SQLite (Local Development)
- **Pros**: Fast, no network latency, easy to backup/restore
- **Cons**: Single-threaded, limited concurrent connections
- **Use Case**: Development, testing, prototyping

### Cloudflare D1 (Production)
- **Pros**: Global distribution, automatic scaling, edge-optimized
- **Cons**: Network latency, eventual consistency
- **Use Case**: Production workloads, global user base

### Query Optimization

#### Indexes
- Primary keys: Auto-incrementing integers
- Foreign keys: Referenced table primary keys
- Unique constraints: Email addresses, contact names
- Search indexes: Contact names, company names

#### Query Patterns
- Use prepared statements for repeated queries
- Limit result sets with pagination
- Use joins instead of multiple queries
- Cache frequently accessed data

## Security

### Data Protection
- **Local**: SQLite files are not committed to git
- **Production**: D1 uses Cloudflare's security infrastructure
- **Backups**: Encrypted in transit and at rest

### Access Control
- **Users**: Role-based access (admin, editor, viewer, external)
- **API**: Authentication required for all database operations
- **Migrations**: Only from authorized branches with clean working tree

### Data Privacy
- **PII**: Contact information is encrypted
- **Audit Trail**: All changes logged in contact_history
- **Retention**: Inactive contacts can be archived, not deleted

## Monitoring & Maintenance

### Health Checks
- Database connectivity tests
- Migration status verification
- Backup integrity checks
- Performance monitoring

### Maintenance Tasks
- Regular backup verification
- Index optimization
- Data cleanup (archived records)
- Performance analysis

### Troubleshooting

#### Common Issues

**Local Database Issues**:
```bash
# Reset local database
rm .data/dev.sqlite
npm run db:migrate:apply:local
npm run db:seed:mock
```

**Production Issues**:
```bash
# Check latest backup
ls -la backups/backup_remote_*.sql

# Restore from backup (manual process)
# 1. Download backup SQL file
# 2. Apply to D1 using wrangler
```

**Migration Failures**:
1. Check migration SQL syntax
2. Verify foreign key constraints
3. Ensure data compatibility
4. Rollback if necessary

## API Integration

### Database Client Usage

```typescript
// In API routes
import { getDb } from "@/server/db/client";
import { getCloudflareContext } from "@/server/cloudflare";

export async function GET(req: Request) {
  // Development: Returns mock data
  if (process.env.NODE_ENV === 'development') {
    return Response.json({ success: true, data: mockData });
  }
  
  // Production: Uses real database
  const { env } = await getCloudflareContext();
  const db = getDb(env);
  
  const contacts = await db.select().from(contacts);
  return Response.json({ success: true, data: contacts });
}
```

### Query Examples

#### Basic Queries
```typescript
// Select all contacts
const allContacts = await db.select().from(contacts);

// Select with conditions
const activeContacts = await db
  .select()
  .from(contacts)
  .where(eq(contacts.isActive, true));

// Select with joins
const contactsWithCompanies = await db
  .select({
    contact: contacts,
    company: companies
  })
  .from(contacts)
  .leftJoin(companies, eq(companies.id, contacts.companyId));
```

#### Complex Queries
```typescript
// Search contacts
const searchResults = await db
  .select()
  .from(contacts)
  .where(
    or(
      like(contacts.firstName, `%${searchTerm}%`),
      like(contacts.lastName, `%${searchTerm}%`),
      like(contacts.emailPrimary, `%${searchTerm}%`)
    )
  );

// Paginated results
const paginatedContacts = await db
  .select()
  .from(contacts)
  .limit(limit)
  .offset((page - 1) * limit)
  .orderBy(desc(contacts.createdAt));
```

## Best Practices

### Schema Design
- Use descriptive table and column names
- Include proper foreign key constraints
- Add appropriate indexes for query performance
- Use enums for limited value sets
- Include audit fields (created_at, updated_at)

### Migration Management
- Always review generated migrations
- Test migrations locally before production
- Use transactions for complex migrations
- Include rollback procedures
- Document breaking changes

### Data Management
- Separate schema and data migrations
- Use mock data for development
- Implement proper backup strategies
- Monitor data growth and performance
- Plan for data archival

### Security
- Validate all input data
- Use parameterized queries
- Implement proper access controls
- Encrypt sensitive data
- Maintain audit trails

## Environment Configuration

### Local Development
```bash
# .env.local (not tracked in git)
DEV_SQLITE_PATH=./.data/dev.sqlite
NODE_ENV=development
```

### Production
- Uses Cloudflare D1 binding (`DB`) from `wrangler.jsonc`
- No local environment variables needed
- Configuration managed through Cloudflare dashboard

## Tools & Utilities

### Drizzle Studio
```bash
# Open database inspection tool
npm run db:studio
```

### Wrangler CLI
```bash
# Execute SQL directly on D1
wrangler d1 execute people_intel --command "SELECT * FROM contacts LIMIT 5"

# Export database
wrangler d1 export people_intel --output="backup.sql"

# Import database
wrangler d1 execute people_intel --file="backup.sql"
```

### Custom Scripts
- `scripts/seed_mock_data.ts` - Mock data seeding
- `scripts/prod_backup.ts` - Production backup
- `scripts/local_backup.ts` - Local backup
- `scripts/apply_prod_migrations.ts` - Production migrations
- `scripts/deploy_prod.ts` - Production deployment

## Conclusion

Bu dokümantasyon, ZeroInfinity People Intel projesinin veritabanı mimarisi ve operasyonel süreçleri hakkında kapsamlı bilgi sağlar. Geliştirme süreçleri, güvenlik önlemleri ve en iyi uygulamalar dahil olmak üzere tüm önemli konuları kapsar.

Daha fazla bilgi için README.md dosyasına bakın veya proje ekibiyle iletişime geçin.
