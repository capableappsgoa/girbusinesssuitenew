-- Add paid column to projects table
-- Run this in Supabase SQL Editor to add the paid functionality

-- Add paid column to projects table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'paid'
  ) THEN
    ALTER TABLE projects ADD COLUMN paid BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create a function to mark project as paid
CREATE OR REPLACE FUNCTION mark_project_as_paid(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE projects 
  SET paid = true, updated_at = NOW()
  WHERE id = project_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a function to mark project as unpaid
CREATE OR REPLACE FUNCTION mark_project_as_unpaid(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE projects 
  SET paid = false, updated_at = NOW()
  WHERE id = project_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION mark_project_as_paid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_project_as_unpaid(UUID) TO authenticated;

-- Verify the column was added successfully
SELECT 
  'Paid column added successfully' as status,
  COUNT(*) as projects_count,
  COUNT(CASE WHEN paid = true THEN 1 END) as paid_projects_count
FROM projects; 