-- Migration: 001_contacts_core_migration
-- Add new columns to people table
-- Create audit_log table
-- Update social_profiles structure

-- Add new columns to people table
ALTER TABLE people ADD COLUMN secondary_email TEXT;
ALTER TABLE people ADD COLUMN other_email TEXT;
ALTER TABLE people ADD COLUMN assistant_name TEXT;
ALTER TABLE people ADD COLUMN assistant_email TEXT;
ALTER TABLE people ADD COLUMN company TEXT;
ALTER TABLE people ADD COLUMN company_website TEXT;
ALTER TABLE people ADD COLUMN company_linkedin TEXT;
ALTER TABLE people ADD COLUMN title TEXT;
ALTER TABLE people ADD COLUMN country_code TEXT;
ALTER TABLE people ADD COLUMN contacted INTEGER DEFAULT 0;
ALTER TABLE people ADD COLUMN seen_film INTEGER DEFAULT 0;
ALTER TABLE people ADD COLUMN doc_branch_member INTEGER DEFAULT 0;
ALTER TABLE people ADD COLUMN status TEXT DEFAULT 'new';
ALTER TABLE people ADD COLUMN updated_at INTEGER;

-- Migrate priority from integer to text
UPDATE people SET priority = CASE
  WHEN priority = 0 THEN 'low'
  WHEN priority = 1 THEN 'medium'
  WHEN priority = 2 THEN 'high'
  ELSE 'low'
END;

-- Note: D1 doesn't support ALTER TABLE to change column type, so we need to handle this in application code
-- For now, we'll treat priority as text in the schema and application will handle conversion

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  meta_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_people_priority ON people(priority);
CREATE INDEX IF NOT EXISTS idx_people_assigned ON people(assigned_to);
CREATE INDEX IF NOT EXISTS idx_people_company ON people(company);
CREATE INDEX IF NOT EXISTS idx_people_status ON people(status);

-- Update social_profiles table structure
-- Note: This requires creating a new table and migrating data
-- For MVP, we'll handle this in application code
CREATE TABLE IF NOT EXISTS social_profiles_new (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES people(id),
  kind TEXT NOT NULL,
  url TEXT,
  handle TEXT,
  verified INTEGER DEFAULT 0,
  source TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_social_contact ON social_profiles_new(contact_id);
CREATE INDEX IF NOT EXISTS idx_social_kind ON social_profiles_new(kind);
