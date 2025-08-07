-- Run Task Groups Migration
-- Execute this in your Supabase SQL Editor

-- Create task_groups table
CREATE TABLE IF NOT EXISTS task_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  billing_item_id UUID REFERENCES billing_items(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add group_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES task_groups(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_groups_project_id ON task_groups(project_id);
CREATE INDEX IF NOT EXISTS idx_task_groups_billing_item_id ON task_groups(billing_item_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(group_id);

-- Enable Row Level Security on task_groups
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_groups
CREATE POLICY "Users can view task groups in their projects" ON task_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE project_id = task_groups.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can create task groups" ON task_groups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE project_id = task_groups.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project admins can update task groups" ON task_groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE project_id = task_groups.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project admins can delete task groups" ON task_groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE project_id = task_groups.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Success message
SELECT 'Task groups migration completed successfully!' as status; 