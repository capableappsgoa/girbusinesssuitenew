-- Fix RLS Infinite Recursion Issue
-- Run these queries in your Supabase SQL Editor

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

DROP POLICY IF EXISTS "Users can view projects they're members of" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Project owners can manage their projects" ON projects;

DROP POLICY IF EXISTS "Users can view tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Users can manage tasks they're assigned to" ON tasks;
DROP POLICY IF EXISTS "Project admins can manage all tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view billing items in their projects" ON billing_items;
DROP POLICY IF EXISTS "Project admins can manage billing items" ON billing_items;

DROP POLICY IF EXISTS "Users can view issues in their projects" ON issues;
DROP POLICY IF EXISTS "Users can create issues" ON issues;
DROP POLICY IF EXISTS "Users can update issues they're assigned to" ON issues;
DROP POLICY IF EXISTS "Project admins can manage all issues" ON issues;

DROP POLICY IF EXISTS "Users can view team members of their projects" ON team_members;
DROP POLICY IF EXISTS "Project owners can manage team members" ON team_members;

-- Create simplified policies that avoid circular references

-- Users policies (simplified)
CREATE POLICY "Allow authenticated users to view users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admins to insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Projects policies (simplified)
CREATE POLICY "Allow authenticated users to view projects" ON projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow project creators to update projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Allow admins to manage all projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks policies (simplified)
CREATE POLICY "Allow authenticated users to view tasks" ON tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow task assignees to update tasks" ON tasks
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Allow admins to manage all tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Billing items policies (simplified)
CREATE POLICY "Allow authenticated users to view billing items" ON billing_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert billing items" ON billing_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admins to manage all billing items" ON billing_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Issues policies (simplified)
CREATE POLICY "Allow authenticated users to view issues" ON issues
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert issues" ON issues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow issue assignees to update issues" ON issues
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Allow admins to manage all issues" ON issues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Team members policies (simplified - this was causing the recursion)
CREATE POLICY "Allow authenticated users to view team members" ON team_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert team members" ON team_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admins to manage all team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Note: These simplified policies allow basic functionality while avoiding
-- the circular references that were causing infinite recursion.
-- For production, you may want to add more specific policies based on your needs. 