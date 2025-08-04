-- Fix billing items RLS policies to allow authenticated users to manage billing items
-- This addresses the issue where billing items are added but not visible

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view billing items in their projects" ON billing_items;
DROP POLICY IF EXISTS "Project admins can manage billing items" ON billing_items;

-- Create new policies that allow authenticated users to manage billing items
CREATE POLICY "Allow authenticated users to view billing items" ON billing_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert billing items" ON billing_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update billing items" ON billing_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete billing items" ON billing_items
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Also allow admins to manage all billing items
CREATE POLICY "Allow admins to manage all billing items" ON billing_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verify the policies were created
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