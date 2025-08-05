-- Add logo column to companies table
ALTER TABLE companies 
ADD COLUMN logo_url TEXT,
ADD COLUMN logo_alt_text TEXT;

-- Add comment for documentation
COMMENT ON COLUMN companies.logo_url IS 'URL or path to company logo image';
COMMENT ON COLUMN companies.logo_alt_text IS 'Alt text for company logo accessibility'; 