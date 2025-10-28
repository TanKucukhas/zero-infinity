-- Create tables based on current schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','editor','viewer','external')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at INTEGER NOT NULL
);

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

CREATE TABLE IF NOT EXISTS sessions (
  sessionToken TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expires INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS states (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code)
);

CREATE TABLE IF NOT EXISTS cities (
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

CREATE TABLE IF NOT EXISTS companies (
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

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT,
  last_name TEXT,
  email_primary TEXT,
  email_secondary TEXT,
  phone_number TEXT,
  company_id INTEGER REFERENCES companies(id),
  imdb TEXT,
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
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

CREATE TABLE IF NOT EXISTS contact_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_owner_user_id INTEGER REFERENCES users(id),
  introduced_by_user_id INTEGER REFERENCES users(id),
  relationship_strength INTEGER,
  last_contact_at INTEGER,
  relationship_type TEXT DEFAULT 'custom' CHECK (relationship_type IN ('surface_level','mentor','supporter','colleague','friend','exec','custom')),
  label TEXT
);

CREATE TABLE IF NOT EXISTS contact_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(contact_id, user_id)
);

CREATE TABLE IF NOT EXISTS contact_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created','updated','activated','deactivated','archived','deleted','assigned','unassigned')),
  changes_json TEXT,
  reason TEXT,
  performed_by_user_id INTEGER REFERENCES users(id),
  occurred_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'general' CHECK (scope IN ('general','hemal','yetkin','private')),
  body TEXT NOT NULL,
  author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_edited INTEGER NOT NULL DEFAULT 0,
  edited_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS outreach_events (
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

