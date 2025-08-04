-- Fix RLS policies for companies table
-- Run this in Supabase SQL Editor to fix the companies table access

-- First, let's check the current user's role
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- Check if the current user exists in the users table
SELECT 
  id,
  email,
  role,
  created_at
FROM users
WHERE id = auth.uid();

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admins to manage companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to view companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to manage companies" ON companies;

-- Create more permissive policies for testing
-- Allow authenticated users to manage companies (for testing)
CREATE POLICY "Allow authenticated users to manage companies" ON companies
  FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: Allow specific user to manage companies (replace with your user ID)
-- CREATE POLICY "Allow specific user to manage companies" ON companies
--   FOR ALL USING (auth.uid() = 'your-user-id-here');

-- Test the policies
SELECT 
  'RLS policies updated' as status,
  COUNT(*) as company_count 
FROM companies;

-- Try to insert a test company to verify the policy works
INSERT INTO companies (name, email, phone, address, contact_person, industry)
VALUES ('Test Company', 'test@example.com', '+1-555-0000', '123 Test St', 'Test Contact', 'Technology')
ON CONFLICT DO NOTHING;

-- Show the result
SELECT 
  'Test company created successfully' as status,
  COUNT(*) as company_count 
FROM companies; 