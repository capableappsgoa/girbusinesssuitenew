-- Create companies table
-- Run this in Supabase SQL Editor to create the companies table

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_person TEXT,
  website TEXT,
  industry TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add company_id column to projects table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add company_id column to billing_items table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'billing_items' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE billing_items ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to manage companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to view companies" ON companies;

-- Create RLS policies for companies table
CREATE POLICY "Allow admins to manage companies" ON companies
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow authenticated users to view companies" ON companies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create trigger for companies updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_companies_updated_at();

-- Insert some sample companies for testing
INSERT INTO companies (name, email, phone, address, contact_person, industry)
VALUES
  ('TechCorp Solutions', 'contact@techcorp.com', '+1-555-0101', '123 Tech Street, Silicon Valley, CA', 'John Smith', 'Technology'),
  ('Design Studio Pro', 'hello@designstudiopro.com', '+1-555-0102', '456 Creative Ave, New York, NY', 'Sarah Johnson', 'Design'),
  ('Global Enterprises', 'info@globalenterprises.com', '+1-555-0103', '789 Business Blvd, Chicago, IL', 'Mike Wilson', 'Consulting')
ON CONFLICT DO NOTHING;

-- Verify the table was created successfully
SELECT 
  'Companies table created successfully' as status,
  COUNT(*) as company_count 
FROM companies; 