-- Fix User Confirmation Issue
-- Run this in your Supabase SQL Editor to manually confirm users

-- First, let's check which users are not confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- Manually confirm all users (replace with specific user IDs if needed)
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify the update
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users;

-- Note: This will confirm ALL unconfirmed users
-- If you want to confirm specific users only, use:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW(), updated_at = NOW()
-- WHERE email = 'specific@email.com'; 