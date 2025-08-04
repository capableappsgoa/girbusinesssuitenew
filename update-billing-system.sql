-- Update billing system to focus on item pricing rather than budget management
-- This removes budget dependency and simplifies the billing workflow

-- First, let's check current projects with budget
SELECT 
  'Projects with budget:' as info,
  COUNT(*) as count
FROM projects 
WHERE budget IS NOT NULL AND budget > 0;

-- Update all projects to remove budget (set to NULL)
UPDATE projects 
SET budget = NULL 
WHERE budget IS NOT NULL;

-- Verify the update
SELECT 
  'Projects after budget removal:' as info,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN budget IS NULL THEN 1 END) as null_budget,
  COUNT(CASE WHEN budget IS NOT NULL THEN 1 END) as with_budget
FROM projects;

-- Check billing items status distribution
SELECT 
  'Billing items by status:' as info,
  status,
  COUNT(*) as count,
  SUM(total_price) as total_value
FROM billing_items 
GROUP BY status
ORDER BY status;

-- Show sample billing items for reference
SELECT 
  'Sample billing items:' as info,
  bi.id,
  bi.name,
  bi.status,
  bi.total_price,
  p.name as project_name
FROM billing_items bi
LEFT JOIN projects p ON bi.project_id = p.id
ORDER BY bi.created_at DESC
LIMIT 5; 