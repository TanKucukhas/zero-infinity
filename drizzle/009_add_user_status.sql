-- Add status field to users table
-- Migration: 009_add_user_status.sql

-- Add status column to users table
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended'));

-- Update existing users to have active status
UPDATE users SET status = 'active' WHERE status IS NULL;
