-- ========================================
-- ENTERPRISE PROJECT COCKPIT ERWEITERUNG - TEIL 1
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