-- Extend candidates table for Talentpool and GDPR
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS gdpr_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gdpr_consent_date timestamptz,
ADD COLUMN IF NOT EXISTS gdpr_retention_until date,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS tags text[];

-- Extend interviews table
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS round integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS interviewers text[];

-- Create job_offers table
CREATE TABLE IF NOT EXISTS job_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES job_applications(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  salary numeric,
  currency text DEFAULT 'EUR',
  start_date date,
  contract_type text,
  benefits text[],
  status text DEFAULT 'draft',
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE
);

-- Create gdpr_country_settings table
CREATE TABLE IF NOT EXISTS gdpr_country_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  retention_days integer DEFAULT 180,
  consent_required boolean DEFAULT true,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(country_code, company_id)
);

-- Enable RLS
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_country_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_offers
CREATE POLICY "Users can view job offers from their company" 
ON job_offers FOR SELECT 
USING (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert job offers for their company" 
ON job_offers FOR INSERT 
WITH CHECK (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can update job offers from their company" 
ON job_offers FOR UPDATE 
USING (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete job offers from their company" 
ON job_offers FOR DELETE 
USING (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));

-- RLS Policies for gdpr_country_settings
CREATE POLICY "Users can view GDPR settings from their company" 
ON gdpr_country_settings FOR SELECT 
USING (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert GDPR settings for their company" 
ON gdpr_country_settings FOR INSERT 
WITH CHECK (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can update GDPR settings from their company" 
ON gdpr_country_settings FOR UPDATE 
USING (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete GDPR settings from their company" 
ON gdpr_country_settings FOR DELETE 
USING (company_id IN (SELECT company_id FROM employees WHERE user_id = auth.uid()));