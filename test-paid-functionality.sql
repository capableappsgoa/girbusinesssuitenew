-- Test paid functionality
-- Run this in Supabase SQL Editor to test the paid functionality

-- First, check if the paid column exists
SELECT 
  'Checking paid column' as test_step,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'paid'
    ) THEN 'PASSED - Paid column exists'
    ELSE 'FAILED - Paid column does not exist'
  END as result;

-- Check current projects and their paid status
SELECT 
  'Current projects paid status' as test_step,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN paid = true THEN 1 END) as paid_projects,
  COUNT(CASE WHEN paid = false OR paid IS NULL THEN 1 END) as unpaid_projects
FROM projects;

-- Test the mark_project_as_paid function
-- First, let's get a project ID to test with
DO $$
DECLARE
  test_project_id UUID;
BEGIN
  -- Get the first project ID
  SELECT id INTO test_project_id FROM projects LIMIT 1;
  
  IF test_project_id IS NOT NULL THEN
    -- Test marking as paid
    PERFORM mark_project_as_paid(test_project_id);
    RAISE NOTICE 'Test project % marked as paid', test_project_id;
    
    -- Verify the change
    IF EXISTS (SELECT 1 FROM projects WHERE id = test_project_id AND paid = true) THEN
      RAISE NOTICE 'PASSED - Project successfully marked as paid';
    ELSE
      RAISE NOTICE 'FAILED - Project was not marked as paid';
    END IF;
    
    -- Test marking as unpaid
    PERFORM mark_project_as_unpaid(test_project_id);
    RAISE NOTICE 'Test project % marked as unpaid', test_project_id;
    
    -- Verify the change
    IF EXISTS (SELECT 1 FROM projects WHERE id = test_project_id AND paid = false) THEN
      RAISE NOTICE 'PASSED - Project successfully marked as unpaid';
    ELSE
      RAISE NOTICE 'FAILED - Project was not marked as unpaid';
    END IF;
  ELSE
    RAISE NOTICE 'No projects found to test with';
  END IF;
END $$;

-- Show final status
SELECT 
  'Final test results' as test_step,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN paid = true THEN 1 END) as paid_projects,
  COUNT(CASE WHEN paid = false OR paid IS NULL THEN 1 END) as unpaid_projects
FROM projects; 