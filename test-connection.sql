-- Test database connection and companies table
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Test basic connection
SELECT 'Connection test successful' as status;

-- 2. Check if companies table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'companies';

-- 3. Check companies table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'companies'
ORDER BY ordinal_position;

-- 4. Check RLS policies for companies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'companies';

-- 5. Check if there are any existing companies
SELECT COUNT(*) as company_count FROM companies;

-- 6. Test inserting a sample company (this will fail if RLS is blocking)
-- Uncomment the lines below to test insertion
/*
INSERT INTO companies (name, email, phone, address, contact_person, industry, created_by)
VALUES (
  'Test Company',
  'test@example.com',
  '+1-555-0000',
  '123 Test Street',
  'Test Contact',
  'Technology'
)
RETURNING id, name;
*/

-- 7. Check user authentication status
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 8. Check if current user is admin
SELECT 
  id,
  email,
  role,
  created_at
FROM users 
WHERE id = auth.uid(); 