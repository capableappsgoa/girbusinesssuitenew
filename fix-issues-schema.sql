-- Fix issues table schema to match frontend expectations
-- This updates the type and status constraints to support all frontend values

-- First, let's check current issues table structure
SELECT 
  'Current issues table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'issues' 
ORDER BY ordinal_position;

-- Check current data in issues table
SELECT 
  'Current issues data:' as info,
  COUNT(*) as total_issues,
  COUNT(DISTINCT type) as unique_types,
  COUNT(DISTINCT status) as unique_statuses
FROM issues;

-- Show current type and status values
SELECT 
  'Current type values:' as info,
  type,
  COUNT(*) as count
FROM issues 
GROUP BY type;

SELECT 
  'Current status values:' as info,
  status,
  COUNT(*) as count
FROM issues 
GROUP BY status;

-- Update the type constraint to support all frontend values
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_type_check;
ALTER TABLE issues ADD CONSTRAINT issues_type_check 
  CHECK (type IN ('bug', 'feature', 'improvement', 'question', 'general', 'blocker', 'change-request', 'client-feedback'));

-- Update the status constraint to support all frontend values
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE issues ADD CONSTRAINT issues_status_check 
  CHECK (status IN ('open', 'in-progress', 'resolved', 'closed', 'pending-approval', 'approved', 'rejected'));

-- Verify the changes
SELECT 
  'Updated constraints:' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE 'issues_%_check';

-- Test inserting with new values
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
  'Test Issue - General Type',
  'This is a test issue with general type',
  'general',
  'open',
  'medium',
  (SELECT id FROM users LIMIT 1)
) ON CONFLICT DO NOTHING;

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
  'Test Issue - Change Request',
  'This is a test change request',
  'change-request',
  'pending-approval',
  'high',
  (SELECT id FROM users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Show final data
SELECT 
  'Final issues data:' as info,
  COUNT(*) as total_issues,
  COUNT(DISTINCT type) as unique_types,
  COUNT(DISTINCT status) as unique_statuses
FROM issues;

SELECT 
  'Final type values:' as info,
  type,
  COUNT(*) as count
FROM issues 
GROUP BY type
ORDER BY count DESC;

SELECT 
  'Final status values:' as info,
  status,
  COUNT(*) as count
FROM issues 
GROUP BY status
ORDER BY count DESC; 