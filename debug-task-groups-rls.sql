-- Debug: Temporarily disable RLS for task_groups to test creation
-- Execute this in your Supabase SQL Editor

-- Temporarily disable RLS to test task group creation
ALTER TABLE task_groups DISABLE ROW LEVEL SECURITY;

-- Test if task groups can be created now
-- You can re-enable RLS later with: ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for task_groups table. You can now test task group creation.' as status; 