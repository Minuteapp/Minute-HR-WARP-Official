-- Erweitere reward_settings mit neuen Feldern für Benachrichtigungen, Automatisierung und Lokalisierung
ALTER TABLE reward_settings 
ADD COLUMN IF NOT EXISTS notify_new_reward BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_approval_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_budget_warning BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_monthly_reports BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ai_recommendations_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_approval_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_approval_threshold NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS ai_confidence_threshold INTEGER DEFAULT 85,
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'de',
ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS tax_region TEXT DEFAULT 'DE',
ADD COLUMN IF NOT EXISTS gdpr_compliance_enabled BOOLEAN DEFAULT true;

-- Erstelle reward_integrations Tabelle
CREATE TABLE IF NOT EXISTS reward_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  integration_description TEXT,
  is_connected BOOLEAN DEFAULT false,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS für reward_integrations
ALTER TABLE reward_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reward integrations" ON reward_integrations
  FOR SELECT USING (true);

CREATE POLICY "Users can manage reward integrations" ON reward_integrations
  FOR ALL USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_reward_integrations_company ON reward_integrations(company_id);