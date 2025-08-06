-- Update billing_items table to allow new status values
-- This migration adds 'submitted' and 'paid' to the allowed status values

-- First, drop the existing constraint
ALTER TABLE billing_items DROP CONSTRAINT IF EXISTS billing_items_status_check;

-- Add the new constraint with updated status values
ALTER TABLE billing_items ADD CONSTRAINT billing_items_status_check 
  CHECK (status IN ('pending', 'in-progress', 'submitted', 'paid', 'completed'));

-- Update any existing items that might have invalid status values
UPDATE billing_items SET status = 'pending' WHERE status NOT IN ('pending', 'in-progress', 'submitted', 'paid', 'completed');

-- Verify the constraint is working
SELECT status, COUNT(*) FROM billing_items GROUP BY status; 