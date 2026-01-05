-- ========================================
-- ENTERPRISE PROJECT COCKPIT ERWEITERUNG
-- ========================================

-- Erweitere bestehende projects Tabelle um Enterprise-Features (einzeln)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS budget_breakdown JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS forecast_files JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS actual_cost NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cost_overrun_risk NUMERIC DEFAULT 0;

-- OKRs & Performance
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS key_results JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS okr_progress NUMERIC DEFAULT 0;

-- Predictive Analytics
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS delay_probability NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cost_overrun_probability NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS success_prediction NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS ai_recommendations JSONB DEFAULT '[]'::jsonb;

-- Skills & Workforce
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS required_skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS skill_gaps JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS workload_heatmap JSONB DEFAULT '{}'::jsonb;

-- Compliance & Risk
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS compliance_checks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS risk_matrix JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS audit_trail JSONB DEFAULT '[]'::jsonb;

-- Bonus & Incentives
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS bonus_triggers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS incentive_status TEXT DEFAULT 'pending';

-- Enterprise Metadata
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS enterprise_level TEXT DEFAULT 'standard';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS strategic_importance TEXT DEFAULT 'medium';

-- Performance Metrics
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS roi_target NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS roi_actual NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS productivity_score NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS quality_score NUMERIC DEFAULT 0;

-- Time Tracking Integration
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logged_hours NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS overtime_hours NUMERIC DEFAULT 0;

-- Forecasting
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS forecast_accuracy NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS next_milestone_prediction DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS completion_prediction DATE;

-- Constraints hinzufügen
ALTER TABLE public.projects ADD CONSTRAINT IF NOT EXISTS check_enterprise_level 
  CHECK (enterprise_level IN ('standard', 'advanced', 'enterprise'));
  
ALTER TABLE public.projects ADD CONSTRAINT IF NOT EXISTS check_strategic_importance 
  CHECK (strategic_importance IN ('low', 'medium', 'high', 'critical'));

-- ========================================
-- PROJECT BUDGET DETAILS
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_budget_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  reserved_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- PROJECT OBJECTIVES (OKRs)
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  weight NUMERIC DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- PROJECT KEY RESULTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_key_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID REFERENCES public.project_objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  measurement_type TEXT DEFAULT 'numeric' CHECK (measurement_type IN ('numeric', 'percentage', 'boolean')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'at_risk', 'behind')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- INDEXES FÜR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_project_budget_details_project_id ON public.project_budget_details(project_id);
CREATE INDEX IF NOT EXISTS idx_project_objectives_project_id ON public.project_objectives(project_id);
CREATE INDEX IF NOT EXISTS idx_project_key_results_objective_id ON public.project_key_results(objective_id);