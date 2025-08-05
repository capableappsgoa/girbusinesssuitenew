-- Fix billing items RLS policies to allow proper deletion
-- This addresses the issue where billing items cannot be deleted

-- First, drop ALL existing policies for billing_items
DROP POLICY IF EXISTS "Users can view billing items in their projects" ON billing_items;
DROP POLICY IF EXISTS "Project admins can manage billing items" ON billing_items;
DROP POLICY IF EXISTS "Allow authenticated users to view billing items" ON billing_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert billing items" ON billing_items;
DROP POLICY IF EXISTS "Allow authenticated users to update billing items" ON billing_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete billing items" ON billing_items;
DROP POLICY IF EXISTS "Allow admins to manage all billing items" ON billing_items;

-- Create comprehensive policies for billing items
-- Policy 1: Allow project creators to manage billing items in their projects
CREATE POLICY "Project creators can manage billing items" ON billing_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = billing_items.project_id 
      AND projects.created_by = auth.uid()
    )
  );

-- Policy 2: Allow team members with owner/admin role to manage billing items
CREATE POLICY "Team admins can manage billing items" ON billing_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE project_id = billing_items.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Policy 3: Allow system admins to manage all billing items
CREATE POLICY "System admins can manage all billing items" ON billing_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 4: Allow team members to view billing items in their projects
CREATE POLICY "Team members can view billing items" ON billing_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE project_id = billing_items.project_id 
      AND user_id = auth.uid()
    )
  );

-- Verify the policies were created successfully
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
WHERE tablename = 'billing_items'
ORDER BY policyname; 