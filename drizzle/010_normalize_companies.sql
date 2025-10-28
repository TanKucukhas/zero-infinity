-- Migration: Normalize companies into separate table
-- This migration creates a companies table and migrates existing company data

-- Step 1: Create companies table
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

-- Step 2: Add company_id column to contacts table
ALTER TABLE contacts ADD COLUMN company_id INTEGER REFERENCES companies(id);

-- Step 3: Migrate existing company data
-- Extract unique companies from contacts and insert into companies table
INSERT INTO companies (name, website, linkedin_url, created_at, updated_at)
SELECT DISTINCT
  LOWER(TRIM(company)) as name,
  MAX(website) as website,
  MAX(company_linkedin) as linkedin_url,
  MIN(created_at) as created_at,
  MIN(created_at) as updated_at
FROM contacts 
WHERE company IS NOT NULL 
  AND company != ''
  AND TRIM(company) != ''
GROUP BY LOWER(TRIM(company));

-- Step 4: Update contacts to reference companies
UPDATE contacts 
SET company_id = (
  SELECT c.id 
  FROM companies c 
  WHERE LOWER(c.name) = LOWER(TRIM(contacts.company))
)
WHERE company IS NOT NULL 
  AND company != ''
  AND TRIM(company) != '';

-- Step 5: Drop old company columns from contacts
-- Note: We'll do this in a separate migration to be safe
-- ALTER TABLE contacts DROP COLUMN company;
-- ALTER TABLE contacts DROP COLUMN website;
-- ALTER TABLE contacts DROP COLUMN company_linkedin;

-- Step 6: Update contacts_flat view to include company information
DROP VIEW IF EXISTS contacts_flat;

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
LEFT JOIN cities ci ON ci.id = c.location_city;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_size ON companies(size);
