-- Initial Schema for ZeroInfinity People Intel
-- This creates all necessary tables based on drizzle schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  access_token TEXT,
  id_token TEXT,
  expires_at INTEGER,
  UNIQUE(provider, providerAccountId)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sessionToken TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expires INTEGER NOT NULL
);

-- People table (full schema with all columns)
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name_norm TEXT NOT NULL,
  
  -- Emails
  primary_email TEXT,
  secondary_email TEXT,
  other_email TEXT,
  assistant_name TEXT,
  assistant_email TEXT,
  
  -- Company & Location
  company TEXT,
  company_website TEXT,
  company_linkedin TEXT,
  title TEXT,
  location_text TEXT,
  country_code TEXT,
  
  -- Status & Assignment
  priority TEXT DEFAULT 'low',
  assigned_to TEXT REFERENCES users(id),
  contacted INTEGER DEFAULT 0,
  seen_film INTEGER DEFAULT 0,
  doc_branch_member INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  
  -- Metadata
  confidence REAL DEFAULT 0,
  last_refreshed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER,
  
  UNIQUE(full_name_norm, primary_email)
);

-- Contact methods table
CREATE TABLE IF NOT EXISTS contact_methods (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id),
  type TEXT,
  value TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  source TEXT,
  last_verified_at INTEGER
);

-- Social profiles table (updated structure)
CREATE TABLE IF NOT EXISTS social_profiles (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES people(id),
  kind TEXT NOT NULL,
  url TEXT,
  handle TEXT,
  verified INTEGER DEFAULT 0,
  source TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  linkedin_url TEXT
);

-- Employment table
CREATE TABLE IF NOT EXISTS employment (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES people(id),
  org_id TEXT REFERENCES orgs(id),
  title TEXT,
  start_year INTEGER,
  end_year INTEGER,
  current INTEGER DEFAULT 0,
  source TEXT
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  person_id TEXT REFERENCES people(id),
  author TEXT,
  body TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Outreach table
CREATE TABLE IF NOT EXISTS outreach (
  id TEXT PRIMARY KEY,
  person_id TEXT REFERENCES people(id),
  campaign TEXT,
  sent_at INTEGER,
  responded_at INTEGER,
  status TEXT
);

-- Raw ingest table
CREATE TABLE IF NOT EXISTS raw_ingest (
  id TEXT PRIMARY KEY,
  person_id TEXT REFERENCES people(id),
  source TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  fetched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  hash TEXT NOT NULL UNIQUE
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  meta_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_people_name ON people(full_name_norm);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(primary_email);
CREATE INDEX IF NOT EXISTS idx_people_refreshed ON people(last_refreshed_at);
CREATE INDEX IF NOT EXISTS idx_people_priority ON people(priority);
CREATE INDEX IF NOT EXISTS idx_people_assigned ON people(assigned_to);
CREATE INDEX IF NOT EXISTS idx_people_company ON people(company);
CREATE INDEX IF NOT EXISTS idx_people_status ON people(status);

CREATE INDEX IF NOT EXISTS idx_social_contact ON social_profiles(contact_id);
CREATE INDEX IF NOT EXISTS idx_social_kind ON social_profiles(kind);
CREATE INDEX IF NOT EXISTS idx_contact_person ON contact_methods(person_id);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);



