-- Update Task Groups to add status column
-- Execute this in your Supabase SQL Editor

-- Add status column to task_groups table
ALTER TABLE task_groups ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed'));

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_task_groups_status ON task_groups(status);

-- Success message
SELECT 'Task groups status migration completed successfully!' as status; 