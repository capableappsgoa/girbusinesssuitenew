-- Add discount_percentage column to projects table
ALTER TABLE projects ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0;

-- Update existing projects to have 0 discount
UPDATE projects SET discount_percentage = 0 WHERE discount_percentage IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN projects.discount_percentage IS 'Discount percentage for invoice generation (0-100)'; 