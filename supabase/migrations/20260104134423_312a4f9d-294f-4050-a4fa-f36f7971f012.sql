-- ==================================================
-- 1. Tabelle expense_claims erstellen
-- ==================================================
CREATE TABLE IF NOT EXISTS public.expense_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  category VARCHAR(50) DEFAULT 'other',
  description TEXT,
  receipt_url TEXT,
  project_id UUID,
  status VARCHAR(20) DEFAULT 'draft',
  submitted_date TIMESTAMPTZ,
  approved_by UUID,
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "expense_claims_select" ON public.expense_claims
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

CREATE POLICY "expense_claims_insert" ON public.expense_claims
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

CREATE POLICY "expense_claims_update" ON public.expense_claims
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

CREATE POLICY "expense_claims_delete" ON public.expense_claims
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_expense_claims_employee ON public.expense_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_company ON public.expense_claims(company_id);

-- ==================================================
-- 2. Tabelle employee_goals erstellen
-- ==================================================
CREATE TABLE IF NOT EXISTS public.employee_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  goal_title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'personal',
  type VARCHAR(20) DEFAULT 'general',
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit VARCHAR(20),
  target_date DATE,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  priority VARCHAR(10) DEFAULT 'medium',
  created_by UUID,
  reviewed_by UUID,
  review_date TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.employee_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "employee_goals_select" ON public.employee_goals
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

CREATE POLICY "employee_goals_insert" ON public.employee_goals
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

CREATE POLICY "employee_goals_update" ON public.employee_goals
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

CREATE POLICY "employee_goals_delete" ON public.employee_goals
  FOR DELETE USING (
    company_id IN (SELECT id FROM companies WHERE id = company_id)
  );

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_employee_goals_employee ON public.employee_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_goals_company ON public.employee_goals(company_id);

-- ==================================================
-- 3. Tabelle goal_milestones erstellen
-- ==================================================
CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.employee_goals(id) ON DELETE CASCADE,
  milestone_title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies (über goal_id / employee_goals.company_id)
CREATE POLICY "goal_milestones_select" ON public.goal_milestones
  FOR SELECT USING (
    goal_id IN (SELECT id FROM employee_goals)
  );

CREATE POLICY "goal_milestones_insert" ON public.goal_milestones
  FOR INSERT WITH CHECK (
    goal_id IN (SELECT id FROM employee_goals)
  );

CREATE POLICY "goal_milestones_update" ON public.goal_milestones
  FOR UPDATE USING (
    goal_id IN (SELECT id FROM employee_goals)
  );

CREATE POLICY "goal_milestones_delete" ON public.goal_milestones
  FOR DELETE USING (
    goal_id IN (SELECT id FROM employee_goals)
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal ON public.goal_milestones(goal_id);

-- ==================================================
-- 4. Storage Bucket für expense-receipts
-- ==================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "expense_receipts_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'expense-receipts');

CREATE POLICY "expense_receipts_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'expense-receipts');

CREATE POLICY "expense_receipts_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'expense-receipts');

CREATE POLICY "expense_receipts_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'expense-receipts');