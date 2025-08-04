-- Add password column to users table for admin password storage
-- Run this in your Supabase SQL Editor

-- Add password column to users table
ALTER TABLE users ADD COLUMN password TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN users.password IS 'Stored password for admin reference (not used for authentication)';

-- Update existing users to have a placeholder password if needed
-- UPDATE users SET password = 'temp_password' WHERE password IS NULL;

-- Note: This column is for admin reference only
-- Actual authentication is handled by Supabase Auth
-- The password field allows admins to view/remember user passwords 