-- Create Task Groups Table and Related Schema
-- Execute this in your Supabase SQL Editor

-- Create task_groups table
CREATE TABLE IF NOT EXISTS task_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    billing_item_id UUID REFERENCES billing_items(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_groups_project_id ON task_groups(project_id);
CREATE INDEX IF NOT EXISTS idx_task_groups_created_by ON task_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_task_groups_status ON task_groups(status);
CREATE INDEX IF NOT EXISTS idx_task_groups_billing_item_id ON task_groups(billing_item_id);

-- Add group_id column to tasks table if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES task_groups(id) ON DELETE SET NULL;

-- Create index for tasks group_id
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(group_id);

-- Enable Row Level Security
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view task groups for accessible projects" ON task_groups;
DROP POLICY IF EXISTS "Project creators and team members can create task groups" ON task_groups;
DROP POLICY IF EXISTS "Project creators and team members can update task groups" ON task_groups;
DROP POLICY IF EXISTS "Project creators and team members can delete task groups" ON task_groups;

-- Simplified RLS Policies for task_groups

-- Policy: Allow authenticated users to view task groups for projects they have access to
CREATE POLICY "Allow authenticated users to view task groups" ON task_groups
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM projects p
                WHERE p.id = task_groups.project_id
                AND (
                    p.created_by = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM team_members tm
                        WHERE tm.project_id = p.id
                        AND tm.user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Policy: Allow authenticated users to create task groups for projects they have access to
CREATE POLICY "Allow authenticated users to create task groups" ON task_groups
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = task_groups.project_id
            AND (
                p.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM team_members tm
                    WHERE tm.project_id = p.id
                    AND tm.user_id = auth.uid()
                )
            )
        )
    );

-- Policy: Allow authenticated users to update task groups for projects they have access to
CREATE POLICY "Allow authenticated users to update task groups" ON task_groups
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = task_groups.project_id
            AND (
                p.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM team_members tm
                    WHERE tm.project_id = p.id
                    AND tm.user_id = auth.uid()
                )
            )
        )
    );

-- Policy: Allow authenticated users to delete task groups for projects they have access to
CREATE POLICY "Allow authenticated users to delete task groups" ON task_groups
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = task_groups.project_id
            AND (
                p.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM team_members tm
                    WHERE tm.project_id = p.id
                    AND tm.user_id = auth.uid()
                )
            )
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS update_task_groups_updated_at_trigger ON task_groups;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_task_groups_updated_at_trigger
    BEFORE UPDATE ON task_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_task_groups_updated_at();

-- Success message
SELECT 'Task groups table and related schema created successfully!' as status; 