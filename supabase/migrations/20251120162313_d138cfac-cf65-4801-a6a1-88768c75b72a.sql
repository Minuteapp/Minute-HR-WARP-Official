-- Create employee_ai_insights table for storing AI-generated employee analysis
CREATE TABLE IF NOT EXISTS employee_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  has_insights BOOLEAN DEFAULT FALSE,
  leadership_potential INTEGER CHECK (leadership_potential BETWEEN 0 AND 100),
  technical_skills INTEGER CHECK (technical_skills BETWEEN 0 AND 100),
  collaboration INTEGER CHECK (collaboration BETWEEN 0 AND 100),
  summary TEXT,
  recommendations JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(employee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_ai_insights_employee ON employee_ai_insights(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_ai_insights_expires ON employee_ai_insights(expires_at);
CREATE INDEX IF NOT EXISTS idx_employee_ai_insights_company ON employee_ai_insights(company_id);

-- Enable RLS
ALTER TABLE employee_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view insights in their company
CREATE POLICY "Users can view insights in their company"
  ON employee_ai_insights FOR SELECT
  USING (company_id IN (SELECT company_id FROM user_roles WHERE user_id = auth.uid()));

-- RLS Policy: Service role can manage all insights (for Edge Function)
CREATE POLICY "Service role can manage insights"
  ON employee_ai_insights FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');