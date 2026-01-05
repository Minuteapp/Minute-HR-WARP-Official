-- Tabelle für KI-Insights im Payroll-Modul
CREATE TABLE public.payroll_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  insight_type TEXT,
  affected_department TEXT,
  affected_count INTEGER DEFAULT 0,
  potential_savings DECIMAL(12,2),
  action_label TEXT,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_by UUID,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabelle für offene Punkte vor Lohnabrechnung
CREATE TABLE public.payroll_open_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  payroll_period TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabelle für Abteilungskosten-Übersicht
CREATE TABLE public.payroll_department_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  payroll_period TEXT NOT NULL,
  employee_count INTEGER DEFAULT 0,
  total_costs DECIMAL(12,2) DEFAULT 0,
  average_cost_per_employee DECIMAL(12,2) DEFAULT 0,
  trend_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, department, payroll_period)
);

-- Tabelle für Lohnlauf-Historie
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL DEFAULT 'monthly',
  payroll_period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
  employee_count INTEGER DEFAULT 0,
  total_gross DECIMAL(14,2) DEFAULT 0,
  total_net DECIMAL(14,2) DEFAULT 0,
  total_employer_costs DECIMAL(14,2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  started_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.payroll_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_open_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_department_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Authentifizierte Benutzer können lesen
CREATE POLICY "Authenticated users can view payroll insights"
ON public.payroll_ai_insights FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payroll insights"
ON public.payroll_ai_insights FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view payroll issues"
ON public.payroll_open_issues FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payroll issues"
ON public.payroll_open_issues FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view department costs"
ON public.payroll_department_costs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage department costs"
ON public.payroll_department_costs FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view payroll runs"
ON public.payroll_runs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payroll runs"
ON public.payroll_runs FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Indizes für Performance
CREATE INDEX idx_payroll_ai_insights_company ON public.payroll_ai_insights(company_id);
CREATE INDEX idx_payroll_ai_insights_priority ON public.payroll_ai_insights(priority);
CREATE INDEX idx_payroll_open_issues_company ON public.payroll_open_issues(company_id);
CREATE INDEX idx_payroll_open_issues_employee ON public.payroll_open_issues(employee_id);
CREATE INDEX idx_payroll_open_issues_resolved ON public.payroll_open_issues(is_resolved);
CREATE INDEX idx_payroll_department_costs_period ON public.payroll_department_costs(payroll_period);
CREATE INDEX idx_payroll_runs_period ON public.payroll_runs(payroll_period);
CREATE INDEX idx_payroll_runs_status ON public.payroll_runs(status);