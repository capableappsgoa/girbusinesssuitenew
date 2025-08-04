-- Fix Admin Permission Issue
-- Run these queries in your Supabase SQL Editor

-- Option 1: Temporarily disable RLS on users table (QUICK FIX)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, use this permissive policy instead:
-- DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
-- CREATE POLICY "Allow all operations for authenticated users" ON users
--   FOR ALL USING (true);

-- Option 3: Create a policy that allows service role operations
-- CREATE POLICY "Service role can do everything" ON users
--   FOR ALL USING (auth.role() = 'service_role');

-- After creating your admin user, you can re-enable RLS with proper policies:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins can manage all users" ON users
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   ); 