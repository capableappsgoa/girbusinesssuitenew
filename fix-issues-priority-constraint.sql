-- Fix issues priority constraint to include 'critical'
-- Execute this in your Supabase SQL Editor

-- Drop the existing priority constraint
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_priority_check;

-- Add the updated constraint with 'critical' included
ALTER TABLE issues ADD CONSTRAINT issues_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical'));

-- Verify the constraint was updated
SELECT 
  'Updated priority constraint:' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'issues_priority_check';

-- Test inserting with 'critical' priority
INSERT INTO issues (
  project_id, 
  title, 
  description, 
  type, 
  status, 
  priority, 
  reported_by
) VALUES (
  (SELECT id FROM projects LIMIT 1),
  'Test Critical Issue',
  'This is a test issue with critical priority',
  'bug',
  'open',
  'critical',
  (SELECT id FROM users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Show the test result
SELECT 
  'Test result:' as info,
  title,
  priority
FROM issues 
WHERE title = 'Test Critical Issue';

-- Clean up test data
DELETE FROM issues WHERE title = 'Test Critical Issue';

-- Success message
SELECT 'Priority constraint updated successfully! Critical priority is now supported.' as result;
