-- Update projects table to add "both" as a project type option
-- This script updates the existing projects table schema

-- First, drop the existing check constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_type_check;

-- Add the new check constraint that includes "both"
ALTER TABLE projects ADD CONSTRAINT projects_type_check 
CHECK (type IN ('3D', '2D', 'both'));

-- Update existing projects that have NULL type to have "both" as default
UPDATE projects SET type = 'both' WHERE type IS NULL;

-- Set a default value for the type column (this will apply to new rows)
ALTER TABLE projects ALTER COLUMN type SET DEFAULT 'both';

-- Update the deadline column to have a default value of current date
-- First, update existing projects with NULL deadline to have current date
UPDATE projects SET deadline = CURRENT_DATE WHERE deadline IS NULL;

-- Set a default value for the deadline column (this will apply to new rows)
ALTER TABLE projects ALTER COLUMN deadline SET DEFAULT CURRENT_DATE;

-- Add a comment to document the changes
COMMENT ON COLUMN projects.type IS 'Project type: 3D, 2D, or both (default)';
COMMENT ON COLUMN projects.deadline IS 'Project deadline with default current date'; 