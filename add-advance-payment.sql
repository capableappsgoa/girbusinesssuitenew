-- Add advance payment functionality to projects table
-- Execute this in your Supabase SQL Editor

-- Add advance_amount column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS advance_amount DECIMAL(12,2) DEFAULT 0;

-- Add advance_payment_date column to track when advance was received
ALTER TABLE projects ADD COLUMN IF NOT EXISTS advance_payment_date TIMESTAMP WITH TIME ZONE;

-- Add advance_payment_method column to track how advance was paid
ALTER TABLE projects ADD COLUMN IF NOT EXISTS advance_payment_method TEXT DEFAULT 'cash' CHECK (advance_payment_method IN ('cash', 'bank_transfer', 'cheque', 'online', 'other'));

-- Add advance_notes column for additional information
ALTER TABLE projects ADD COLUMN IF NOT EXISTS advance_notes TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_advance_amount ON projects(advance_amount);

-- Update the projects table to include advance payment in the mapping
-- This will be handled by the application code
