CREATE TABLE accounts (
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  access_token TEXT,
  id_token TEXT,
  expires_at INTEGER,
  UNIQUE(provider, providerAccountId)
);
CREATE TABLE sessions (
  sessionToken TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE social_profiles_new (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES people(id),
  kind TEXT NOT NULL,
  url TEXT,
  handle TEXT,
  verified INTEGER DEFAULT 0,
  source TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','editor','viewer','external')),
  created_at INTEGER NOT NULL
, status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')));
CREATE TABLE countries (
  code TEXT PRIMARY KEY, -- ISO 3166-1 alpha-2
  name TEXT NOT NULL
);
CREATE TABLE states (
  code TEXT PRIMARY KEY, -- US state code (CA, NY, ...)
  name TEXT NOT NULL,
  country_code TEXT NOT NULL REFERENCES countries(code)
);
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
  zips TEXT
);
CREATE UNIQUE INDEX u_cities_name_state ON cities(city_ascii, state_code);
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  first_name TEXT,
  last_name TEXT,

  email_primary TEXT,
  email_secondary TEXT,

  company TEXT,
  website TEXT,
  company_linkedin TEXT,

  imdb TEXT,
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
  wikipedia TEXT,

  biography TEXT,

  priority TEXT NOT NULL DEFAULT 'NONE' CHECK (priority IN ('HIGH','MEDIUM','LOW','NONE')),
  seen_film INTEGER NOT NULL DEFAULT 0,
  doc_branch_member INTEGER NOT NULL DEFAULT 0,

  -- Location normalization (3-tier)
  location_country TEXT REFERENCES countries(code),

  -- US normalized location
  location_state TEXT REFERENCES states(code),
  location_city INTEGER REFERENCES cities(id),

  -- Non-US free-text location
  location_state_text TEXT,
  location_city_text TEXT,

  -- Status & inactive tracking
  is_active INTEGER NOT NULL DEFAULT 1,
  inactive_reason TEXT,
  inactive_reason_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  inactive_at INTEGER,

  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
, company_id INTEGER REFERENCES companies(id), phone_number TEXT, assigned_to INTEGER);
CREATE UNIQUE INDEX u_contacts_name_email ON contacts(first_name, last_name, email_primary);
CREATE TABLE contact_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  introduced_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  relationship_strength INTEGER,
  last_contact_at INTEGER,
  relationship_type TEXT DEFAULT 'custom' CHECK (relationship_type IN ('surface_level','mentor','supporter','colleague','friend','exec','custom')),
  label TEXT
);
CREATE TABLE contact_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX u_contact_assignment ON contact_assignments(contact_id, user_id);
CREATE TABLE contact_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created','updated','activated','deactivated','archived','deleted','assigned','unassigned')),
  changes_json TEXT,
  reason TEXT,
  performed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  occurred_at INTEGER NOT NULL
);
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
CREATE TABLE outreach_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_key TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','phone','linkedin','whatsapp','in_person','other')),
  message TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','opened','replied','bounced','failed')),
  performed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  occurred_at INTEGER NOT NULL
);
CREATE INDEX idx_contacts_email ON contacts(email_primary);
CREATE INDEX idx_contacts_country ON contacts(location_country);
CREATE INDEX idx_contacts_state ON contacts(location_state);
CREATE INDEX idx_contacts_city ON contacts(location_city);
CREATE INDEX idx_outreach_contact ON outreach_events(contact_id);
CREATE INDEX idx_rel_contact ON contact_relationships(contact_id);
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
CREATE VIEW contacts_flat AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email_primary,
  c.email_secondary,
  c.company_id,
  comp.name AS company_name,
  comp.website AS company_website,
  comp.linkedin_url AS company_linkedin,
  comp.industry AS company_industry,
  comp.size AS company_size,
  comp.description AS company_description,
  comp.logo_url AS company_logo_url,
  c.imdb,
  c.facebook,
  c.instagram,
  c.linkedin,
  c.wikipedia,
  c.biography,
  c.priority,
  c.seen_film,
  c.doc_branch_member,
  c.location_country,
  c.location_state,
  c.location_city,
  c.location_state_text,
  c.location_city_text,
  c.is_active,
  c.inactive_reason,
  c.inactive_reason_user_id,
  c.inactive_at,
  c.created_by_user_id,
  c.created_at,
  co.name AS country_name,
  st.name AS state_name,
  ci.city AS city_name,
  ci.state_code AS city_state_code,
  -- Aggregates via subqueries
  (SELECT GROUP_CONCAT(user_id)
     FROM contact_assignments ca
    WHERE ca.contact_id = c.id) AS assigned_user_ids,
  (SELECT GROUP_CONCAT(DISTINCT u.name)
     FROM contact_assignments ca
     JOIN users u ON u.id = ca.user_id
    WHERE ca.contact_id = c.id) AS assigned_user_names,
  (SELECT GROUP_CONCAT(label)
     FROM contact_relationships cr
    WHERE cr.contact_id = c.id AND cr.label IS NOT NULL) AS relationship_labels,
  (SELECT GROUP_CONCAT(DISTINCT relationship_owner_user_id)
     FROM contact_relationships cr
    WHERE cr.contact_id = c.id AND cr.relationship_owner_user_id IS NOT NULL) AS relationship_owner_user_ids,
  (SELECT MAX(occurred_at)
     FROM outreach_events oe
    WHERE oe.contact_id = c.id) AS last_outreach_at
FROM contacts c
LEFT JOIN companies comp ON comp.id = c.company_id
LEFT JOIN countries co ON co.code = c.location_country
LEFT JOIN states st ON st.code = c.location_state
LEFT JOIN cities ci ON ci.id = c.location_city
/* contacts_flat(id,first_name,last_name,email_primary,email_secondary,company_id,company_name,company_website,company_linkedin,company_industry,company_size,company_description,company_logo_url,imdb,facebook,instagram,linkedin,wikipedia,biography,priority,seen_film,doc_branch_member,location_country,location_state,location_city,location_state_text,location_city_text,is_active,inactive_reason,inactive_reason_user_id,inactive_at,created_by_user_id,created_at,country_name,state_name,city_name,city_state_code,assigned_user_ids,assigned_user_names,relationship_labels,relationship_owner_user_ids,last_outreach_at) */;
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_size ON companies(size);
