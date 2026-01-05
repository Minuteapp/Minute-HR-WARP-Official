-- Extend budget_plans table with new columns
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS level text DEFAULT 'department';
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS budget_type text DEFAULT 'annual';
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS period text;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS forecast_year_end numeric DEFAULT 0;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS budget_deviation numeric DEFAULT 0;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS personnel_cost_ratio numeric DEFAULT 0;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS cost_center text;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS approver text;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS auto_update boolean DEFAULT false;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS distribution jsonb DEFAULT '{}';
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE budget_plans ADD COLUMN IF NOT EXISTS responsible_person text;

-- Create budget_transactions table
CREATE TABLE IF NOT EXISTS budget_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budget_plans(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text NOT NULL,
  amount numeric NOT NULL,
  employee_name text,
  cost_center text,
  reference_number text,
  approved_by text,
  company_id uuid REFERENCES companies(id),
  created_at timestamptz DEFAULT now()
);

-- Create cost_centers table
CREATE TABLE IF NOT EXISTS cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  responsible_person text,
  planned_amount numeric DEFAULT 0,
  actual_amount numeric DEFAULT 0,
  deviation_amount numeric DEFAULT 0,
  deviation_percent numeric DEFAULT 0,
  status text DEFAULT 'normal',
  company_id uuid REFERENCES companies(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;

-- RLS policies for budget_transactions
CREATE POLICY "Users can view budget transactions" ON budget_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert budget transactions" ON budget_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update budget transactions" ON budget_transactions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete budget transactions" ON budget_transactions
  FOR DELETE USING (true);

-- RLS policies for cost_centers
CREATE POLICY "Users can view cost centers" ON cost_centers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert cost centers" ON cost_centers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update cost centers" ON cost_centers
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete cost centers" ON cost_centers
  FOR DELETE USING (true);