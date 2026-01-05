-- Extend cost_centers table with additional columns
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS planned_amount numeric DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS actual_amount numeric DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS forecast_amount numeric DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS deviation_amount numeric DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS deviation_percent numeric DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS status text DEFAULT 'normal';
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS employee_count integer DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS team_count integer DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS average_salary numeric DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS total_personnel_cost numeric DEFAULT 0;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS responsible_person text;

-- Create budget_deviations table
CREATE TABLE IF NOT EXISTS budget_deviations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  plan_amount numeric DEFAULT 0,
  actual_ytd_amount numeric DEFAULT 0,
  forecast_amount numeric DEFAULT 0,
  deviation_amount numeric DEFAULT 0,
  deviation_percent numeric DEFAULT 0,
  trend text DEFAULT 'stable',
  fiscal_year integer,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deviation_causes table
CREATE TABLE IF NOT EXISTS deviation_causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deviation_id uuid REFERENCES budget_deviations(id) ON DELETE CASCADE,
  cause_description text NOT NULL,
  impact_amount numeric DEFAULT 0,
  severity text DEFAULT 'warning',
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE budget_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviation_causes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_deviations
CREATE POLICY "Users can view budget_deviations" ON budget_deviations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert budget_deviations" ON budget_deviations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update budget_deviations" ON budget_deviations
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete budget_deviations" ON budget_deviations
  FOR DELETE USING (true);

-- RLS Policies for deviation_causes
CREATE POLICY "Users can view deviation_causes" ON deviation_causes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert deviation_causes" ON deviation_causes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update deviation_causes" ON deviation_causes
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete deviation_causes" ON deviation_causes
  FOR DELETE USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budget_deviations_company ON budget_deviations(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_deviations_category ON budget_deviations(category);
CREATE INDEX IF NOT EXISTS idx_deviation_causes_deviation ON deviation_causes(deviation_id);