-- Fix Missing Columns for Tasks and Issues Tables
-- Run this in your Supabase SQL Editor

-- ========================================
-- TASKS TABLE FIXES
-- ========================================

-- Add missing columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]';

-- Fix status constraint (change 'pending' to 'todo')
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('todo', 'in-progress', 'review', 'completed'));

-- Fix priority constraint (add 'urgent' option)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add progress constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_progress_check' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_progress_check 
      CHECK (progress >= 0 AND progress <= 100);
  END IF;
END $$;

-- ========================================
-- ISSUES TABLE FIXES
-- ========================================

-- Fix task_id constraint (change ON DELETE CASCADE to SET NULL)
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_task_id_fkey;
ALTER TABLE issues ADD CONSTRAINT issues_task_id_fkey 
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if all columns exist in tasks table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Check if all columns exist in issues table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'issues' 
ORDER BY ordinal_position;

-- Check constraints on tasks table
SELECT 
  tc.constraint_name, 
  tc.constraint_type, 
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'tasks' AND tc.constraint_type = 'CHECK';

-- Check constraints on issues table
SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'issues';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- If you see this message, the script ran successfully!
-- All missing columns have been added to tasks and issues tables. 