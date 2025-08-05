-- Update billing_items table for Excel-like interface and new status options

-- Update the status enum to include the new statuses
ALTER TABLE billing_items 
DROP CONSTRAINT IF EXISTS billing_items_status_check;

ALTER TABLE billing_items 
ADD CONSTRAINT billing_items_status_check 
CHECK (status IN ('in-progress', 'submitted', 'paid'));

-- Set default status to 'in-progress' for new items
ALTER TABLE billing_items 
ALTER COLUMN status SET DEFAULT 'in-progress';

-- Add any additional columns that might be useful for the Excel interface
ALTER TABLE billing_items 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS partial_payment BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN billing_items.notes IS 'Additional notes for the billing item';
COMMENT ON COLUMN billing_items.payment_date IS 'Date when payment was received';
COMMENT ON COLUMN billing_items.payment_amount IS 'Amount actually paid (can be partial)';
COMMENT ON COLUMN billing_items.partial_payment IS 'Whether this item has partial payment';

-- Update existing items to have 'in-progress' status if they are 'pending'
UPDATE billing_items 
SET status = 'in-progress' 
WHERE status = 'pending';

-- Create an index for better performance on status filtering
CREATE INDEX IF NOT EXISTS idx_billing_items_status ON billing_items(status);
CREATE INDEX IF NOT EXISTS idx_billing_items_project_status ON billing_items(project_id, status); 