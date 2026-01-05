-- Add additional columns to employee_certificates table
ALTER TABLE employee_certificates
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS certificate_number TEXT,
ADD COLUMN IF NOT EXISTS score TEXT;

-- Add comment to describe category values
COMMENT ON COLUMN employee_certificates.category IS 'Category: license, professional, compliance, safety';