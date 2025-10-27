-- Seed default users aligned with new users schema
DELETE FROM users;
INSERT INTO users (id, name, last_name, email, role, created_at) VALUES
(0, 'Tan', 'Kucukhas', 'tan@zeroinfinity.ai', 'admin', CAST(strftime('%s','now') AS INTEGER) * 1000),
(1, 'Yetkin', 'Yuce', 'yetkin@zeroinfinity.ai', 'admin', CAST(strftime('%s','now') AS INTEGER) * 1000),
(2, 'Hemal', 'Trivedi', 'hemal@zeroinfinity.ai', 'editor', CAST(strftime('%s','now') AS INTEGER) * 1000),
(3, 'Cynthia', 'Kane', 'cynthia@zeroinfinity.ai', 'editor', CAST(strftime('%s','now') AS INTEGER) * 1000),
(4, 'Prerana', '', 'prerana@zeroinfinity.ai', 'viewer', CAST(strftime('%s','now') AS INTEGER) * 1000),
(5, 'Matt', 'A.', 'matt.a+external@zeroinfinity.ai', 'external', CAST(strftime('%s','now') AS INTEGER) * 1000),
(6, 'Prerana', '', 'prerana+external@zeroinfinity.ai', 'external', CAST(strftime('%s','now') AS INTEGER) * 1000);
