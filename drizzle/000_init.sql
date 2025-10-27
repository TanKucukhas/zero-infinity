-- Recommended D1 indexes for basic filters/pagination
CREATE INDEX IF NOT EXISTS idx_people_name ON people(full_name_norm);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(primary_email);
CREATE INDEX IF NOT EXISTS idx_people_refreshed ON people(last_refreshed_at);
CREATE INDEX IF NOT EXISTS idx_social_person ON social_profiles(person_id);
CREATE INDEX IF NOT EXISTS idx_contact_person ON contact_methods(person_id);




