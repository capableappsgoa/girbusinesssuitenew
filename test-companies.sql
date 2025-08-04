-- Test Companies functionality
-- This script tests the companies table and related functionality

-- Check if companies table exists
SELECT 
  'Companies table check:' as info,
  COUNT(*) as total_companies
FROM companies;

-- Show sample companies
SELECT 
  'Sample companies:' as info,
  id,
  name,
  email,
  phone,
  contact_person,
  industry,
  is_active
FROM companies
ORDER BY created_at DESC
LIMIT 5;

-- Check projects with company links
SELECT 
  'Projects with company links:' as info,
  p.id,
  p.name as project_name,
  p.client,
  c.name as company_name,
  c.industry as company_industry
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Check billing items with company links
SELECT 
  'Billing items with company links:' as info,
  bi.id,
  bi.name as item_name,
  bi.total_price,
  bi.status,
  p.name as project_name,
  c.name as company_name
FROM billing_items bi
LEFT JOIN projects p ON bi.project_id = p.id
LEFT JOIN companies c ON bi.company_id = c.id
ORDER BY bi.created_at DESC
LIMIT 10;

-- Show company statistics
SELECT 
  'Company statistics:' as info,
  c.name as company_name,
  COUNT(p.id) as project_count,
  COUNT(bi.id) as billing_item_count,
  SUM(bi.total_price) as total_billing,
  SUM(CASE WHEN bi.status = 'completed' THEN bi.total_price ELSE 0 END) as completed_billing
FROM companies c
LEFT JOIN projects p ON c.id = p.company_id
LEFT JOIN billing_items bi ON c.id = bi.company_id
GROUP BY c.id, c.name
ORDER BY total_billing DESC;

-- Test inserting a new company
INSERT INTO companies (
  name,
  email,
  phone,
  address,
  contact_person,
  website,
  industry,
  notes,
  created_by
) VALUES (
  'Test Company Inc.',
  'test@testcompany.com',
  '+1-555-9999',
  '123 Test Street, Test City, TC 12345',
  'John Test',
  'https://testcompany.com',
  'Technology',
  'This is a test company for verification',
  (SELECT id FROM users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Verify the new company was added
SELECT 
  'New company added:' as info,
  id,
  name,
  email,
  industry
FROM companies 
WHERE name = 'Test Company Inc.';

-- Test linking a project to a company
UPDATE projects 
SET company_id = (SELECT id FROM companies WHERE name = 'Test Company Inc.')
WHERE company_id IS NULL
LIMIT 1;

-- Verify the project was linked
SELECT 
  'Project linked to company:' as info,
  p.name as project_name,
  c.name as company_name
FROM projects p
JOIN companies c ON p.company_id = c.id
WHERE c.name = 'Test Company Inc.'; 