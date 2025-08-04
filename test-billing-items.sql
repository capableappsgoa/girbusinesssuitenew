-- Test billing items functionality
-- This will help verify if the billing items are working correctly

-- First, let's check if we have any existing billing items
SELECT 
  'Current billing items count:' as info,
  COUNT(*) as count
FROM billing_items;

-- Check if we can insert a test billing item
INSERT INTO billing_items (
  project_id,
  name,
  description,
  quantity,
  unit_price,
  total_price,
  status
) VALUES (
  (SELECT id FROM projects LIMIT 1), -- Use the first project
  'Test Billing Item',
  'This is a test billing item to verify functionality',
  1,
  100.00,
  100.00,
  'pending'
) ON CONFLICT DO NOTHING;

-- Check if the test item was inserted
SELECT 
  'Test billing item inserted:' as info,
  COUNT(*) as count
FROM billing_items 
WHERE name = 'Test Billing Item';

-- Show all billing items with their project info
SELECT 
  bi.id,
  bi.name,
  bi.description,
  bi.quantity,
  bi.unit_price,
  bi.total_price,
  bi.status,
  p.name as project_name,
  bi.created_at
FROM billing_items bi
LEFT JOIN projects p ON bi.project_id = p.id
ORDER BY bi.created_at DESC;

-- Clean up test data (optional)
-- DELETE FROM billing_items WHERE name = 'Test Billing Item'; 