-- Add group_id column to issues table
-- Execute this in your Supabase SQL Editor

-- Add group_id column to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES task_groups(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_issues_group_id ON issues(group_id);

-- Update the issues table to include group_id in the mapping
-- This will be handled by the application code
