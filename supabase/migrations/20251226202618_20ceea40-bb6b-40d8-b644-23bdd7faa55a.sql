-- Budget Module Connections Table
CREATE TABLE IF NOT EXISTS public.budget_module_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name text NOT NULL,
  module_type text NOT NULL,
  description text,
  status text DEFAULT 'active',
  linked_amount numeric DEFAULT 0,
  last_sync_at timestamptz,
  automation_type text DEFAULT 'automatic',
  impact_monthly numeric DEFAULT 0,
  impact_yearly numeric DEFAULT 0,
  impact_category text,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budget Update Chains Table
CREATE TABLE IF NOT EXISTS public.budget_update_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_source text NOT NULL,
  trigger_description text,
  result_action text NOT NULL,
  result_description text,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Budget Risk Scores Table
CREATE TABLE IF NOT EXISTS public.budget_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_center_name text NOT NULL,
  risk_score integer DEFAULT 0,
  risk_level text DEFAULT 'low',
  risk_description text,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budget Optimization Suggestions Table
CREATE TABLE IF NOT EXISTS public.budget_optimization_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  savings_amount numeric DEFAULT 0,
  savings_type text,
  status text DEFAULT 'pending',
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Archived Budgets Table
CREATE TABLE IF NOT EXISTS public.archived_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year integer NOT NULL,
  budget_name text NOT NULL,
  initial_amount numeric DEFAULT 0,
  final_amount numeric DEFAULT 0,
  deviation_percent numeric DEFAULT 0,
  closed_date date,
  status text DEFAULT 'completed',
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Budget Audit Logs Table
CREATE TABLE IF NOT EXISTS public.budget_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  action_description text,
  target_name text,
  target_type text,
  performed_by text,
  performed_by_role text,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Budget Reports Table
CREATE TABLE IF NOT EXISTS public.budget_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name text NOT NULL,
  report_type text NOT NULL,
  description text,
  file_type text DEFAULT 'pdf',
  file_size text,
  file_path text,
  created_date date,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Extend ai_budget_insights table
ALTER TABLE public.ai_budget_insights 
ADD COLUMN IF NOT EXISTS impact_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS recommendation text,
ADD COLUMN IF NOT EXISTS category text;

-- Enable RLS for all new tables
ALTER TABLE public.budget_module_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_update_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_optimization_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_module_connections
CREATE POLICY "Users can view budget_module_connections" ON public.budget_module_connections FOR SELECT USING (true);
CREATE POLICY "Users can insert budget_module_connections" ON public.budget_module_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budget_module_connections" ON public.budget_module_connections FOR UPDATE USING (true);
CREATE POLICY "Users can delete budget_module_connections" ON public.budget_module_connections FOR DELETE USING (true);

-- RLS Policies for budget_update_chains
CREATE POLICY "Users can view budget_update_chains" ON public.budget_update_chains FOR SELECT USING (true);
CREATE POLICY "Users can insert budget_update_chains" ON public.budget_update_chains FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budget_update_chains" ON public.budget_update_chains FOR UPDATE USING (true);
CREATE POLICY "Users can delete budget_update_chains" ON public.budget_update_chains FOR DELETE USING (true);

-- RLS Policies for budget_risk_scores
CREATE POLICY "Users can view budget_risk_scores" ON public.budget_risk_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert budget_risk_scores" ON public.budget_risk_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budget_risk_scores" ON public.budget_risk_scores FOR UPDATE USING (true);
CREATE POLICY "Users can delete budget_risk_scores" ON public.budget_risk_scores FOR DELETE USING (true);

-- RLS Policies for budget_optimization_suggestions
CREATE POLICY "Users can view budget_optimization_suggestions" ON public.budget_optimization_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can insert budget_optimization_suggestions" ON public.budget_optimization_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budget_optimization_suggestions" ON public.budget_optimization_suggestions FOR UPDATE USING (true);
CREATE POLICY "Users can delete budget_optimization_suggestions" ON public.budget_optimization_suggestions FOR DELETE USING (true);

-- RLS Policies for archived_budgets
CREATE POLICY "Users can view archived_budgets" ON public.archived_budgets FOR SELECT USING (true);
CREATE POLICY "Users can insert archived_budgets" ON public.archived_budgets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update archived_budgets" ON public.archived_budgets FOR UPDATE USING (true);
CREATE POLICY "Users can delete archived_budgets" ON public.archived_budgets FOR DELETE USING (true);

-- RLS Policies for budget_audit_logs
CREATE POLICY "Users can view budget_audit_logs" ON public.budget_audit_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert budget_audit_logs" ON public.budget_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budget_audit_logs" ON public.budget_audit_logs FOR UPDATE USING (true);
CREATE POLICY "Users can delete budget_audit_logs" ON public.budget_audit_logs FOR DELETE USING (true);

-- RLS Policies for budget_reports
CREATE POLICY "Users can view budget_reports" ON public.budget_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert budget_reports" ON public.budget_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update budget_reports" ON public.budget_reports FOR UPDATE USING (true);
CREATE POLICY "Users can delete budget_reports" ON public.budget_reports FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_module_connections_company ON public.budget_module_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_update_chains_company ON public.budget_update_chains(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_risk_scores_company ON public.budget_risk_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_optimization_suggestions_company ON public.budget_optimization_suggestions(company_id);
CREATE INDEX IF NOT EXISTS idx_archived_budgets_company ON public.archived_budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_archived_budgets_year ON public.archived_budgets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_budget_audit_logs_company ON public.budget_audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_reports_company ON public.budget_reports(company_id);