-- Erweitere employee_peer_kudos
ALTER TABLE employee_peer_kudos 
ADD COLUMN IF NOT EXISTS kudos_amount INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Erstelle reward_budgets Tabelle
CREATE TABLE IF NOT EXISTS reward_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  department TEXT NOT NULL,
  total_budget NUMERIC NOT NULL DEFAULT 0,
  used_budget NUMERIC NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, department, company_id)
);

-- Erstelle reward_transactions Tabelle
CREATE TABLE IF NOT EXISTS reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id),
  employee_name TEXT,
  reward_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  department TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Erstelle reward_analytics Tabelle
CREATE TABLE IF NOT EXISTS reward_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_date DATE NOT NULL,
  period_type TEXT DEFAULT 'monthly',
  rewards_count INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  satisfaction_score NUMERIC DEFAULT 0,
  retention_rate NUMERIC DEFAULT 0,
  participation_rate NUMERIC DEFAULT 0,
  department TEXT,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_date, period_type, department, company_id)
);

-- RLS aktivieren
ALTER TABLE reward_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_analytics ENABLE ROW LEVEL SECURITY;

-- Policies für reward_budgets
CREATE POLICY "Allow read access to reward_budgets" ON reward_budgets
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to reward_budgets" ON reward_budgets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to reward_budgets" ON reward_budgets
  FOR UPDATE USING (true);

-- Policies für reward_transactions
CREATE POLICY "Allow read access to reward_transactions" ON reward_transactions
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to reward_transactions" ON reward_transactions
  FOR INSERT WITH CHECK (true);

-- Policies für reward_analytics
CREATE POLICY "Allow read access to reward_analytics" ON reward_analytics
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to reward_analytics" ON reward_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to reward_analytics" ON reward_analytics
  FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reward_budgets_year ON reward_budgets(year);
CREATE INDEX IF NOT EXISTS idx_reward_budgets_department ON reward_budgets(department);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_date ON reward_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_employee ON reward_transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_reward_analytics_period ON reward_analytics(period_date);

-- Trigger für updated_at
CREATE OR REPLACE TRIGGER update_reward_budgets_updated_at
  BEFORE UPDATE ON reward_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();