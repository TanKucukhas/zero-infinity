-- Seed Users
-- Insert default users for development

INSERT INTO users (id, name, email, role, created_at) VALUES 
  ('usr_hemal', 'Hemal', 'hemal@zeroinfinity.ai', 'viewer', strftime('%s', 'now') * 1000),
  ('usr_yetkin', 'Yetkin Yuce', 'yetkin@zeroinfinity.ai', 'admin', strftime('%s', 'now') * 1000),
  ('usr_cynthia', 'Cynthia Kane', 'cynthia@zeroinfinity.ai', 'viewer', strftime('%s', 'now') * 1000),
  ('usr_tan', 'Tan Kucukhas', 'tankucukhas@gmail.com', 'viewer', strftime('%s', 'now') * 1000),
  ('usr_bina', 'Bina', 'bina@zeroinfinity.ai', 'viewer', strftime('%s', 'now') * 1000)
ON CONFLICT(email) DO NOTHING;
