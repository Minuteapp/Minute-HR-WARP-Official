-- ========================================
-- ENTERPRISE PROJECT COCKPIT ERWEITERUNG
-- ========================================

-- Erweitere bestehende projects Tabelle um Enterprise-Features
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS 
  -- Budget & Forecast
  budget_breakdown JSONB DEFAULT '[]'::jsonb,
  forecast_files JSONB DEFAULT '[]'::jsonb,
  actual_cost NUMERIC DEFAULT 0,
  cost_overrun_risk NUMERIC DEFAULT 0,
  
  -- OKRs & Performance
  objectives JSONB DEFAULT '[]'::jsonb,
  key_results JSONB DEFAULT '[]'::jsonb,
  okr_progress NUMERIC DEFAULT 0,
  
  -- Predictive Analytics
  delay_probability NUMERIC DEFAULT 0,
  cost_overrun_probability NUMERIC DEFAULT 0,
  success_prediction NUMERIC DEFAULT 0,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Skills & Workforce
  required_skills JSONB DEFAULT '[]'::jsonb,
  skill_gaps JSONB DEFAULT '[]'::jsonb,
  workload_heatmap JSONB DEFAULT '{}'::jsonb,
  
  -- Compliance & Risk
  compliance_checks JSONB DEFAULT '[]'::jsonb,
  risk_matrix JSONB DEFAULT '[]'::jsonb,
  audit_trail JSONB DEFAULT '[]'::jsonb,
  
  -- Bonus & Incentives
  bonus_triggers JSONB DEFAULT '[]'::jsonb,
  incentive_status TEXT DEFAULT 'pending',
  
  -- Enterprise Metadata
  enterprise_level TEXT DEFAULT 'standard' CHECK (enterprise_level IN ('standard', 'advanced', 'enterprise')),
  strategic_importance TEXT DEFAULT 'medium' CHECK (strategic_importance IN ('low', 'medium', 'high', 'critical')),
  program_id UUID REFERENCES public.programs(id),
  
  -- Performance Metrics
  roi_target NUMERIC DEFAULT 0,
  roi_actual NUMERIC DEFAULT 0,
  productivity_score NUMERIC DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  
  -- Time Tracking Integration
  estimated_hours NUMERIC DEFAULT 0,
  logged_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  
  -- Forecasting
  forecast_accuracy NUMERIC DEFAULT 0,
  next_milestone_prediction DATE,
  completion_prediction DATE;

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
-- PROJECT FORECAST FILES
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_forecast_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
  forecast_data JSONB DEFAULT '{}'::jsonb,
  validation_errors JSONB DEFAULT '[]'::jsonb
);

-- ========================================
-- PROJECT PREDICTIVE ANALYTICS
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('delay', 'cost_overrun', 'success', 'resource_shortage')),
  probability NUMERIC NOT NULL CHECK (probability >= 0 AND probability <= 1),
  confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 1),
  factors JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- ========================================
-- PROJECT SKILL REQUIREMENTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_skill_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  required_level INTEGER DEFAULT 1 CHECK (required_level >= 1 AND required_level <= 5),
  required_hours NUMERIC DEFAULT 0,
  allocated_hours NUMERIC DEFAULT 0,
  gap_hours NUMERIC GENERATED ALWAYS AS (required_hours - allocated_hours) STORED,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- PROJECT BONUS TRIGGERS
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_bonus_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('completion', 'budget_under', 'quality_score', 'time_bonus', 'okr_achievement')),
  condition_data JSONB NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('monetary', 'time_off', 'recognition', 'promotion_points')),
  reward_value NUMERIC,
  reward_description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'paid', 'expired', 'cancelled')),
  triggered_at TIMESTAMP WITH TIME ZONE,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- PROJECT COMPLIANCE CHECKS
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'warning')),
  checked_at TIMESTAMP WITH TIME ZONE,
  checked_by UUID REFERENCES auth.users(id),
  findings TEXT,
  remediation_required BOOLEAN DEFAULT false,
  remediation_notes TEXT,
  next_check_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- INDEXES FÜR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_project_budget_details_project_id ON public.project_budget_details(project_id);
CREATE INDEX IF NOT EXISTS idx_project_objectives_project_id ON public.project_objectives(project_id);
CREATE INDEX IF NOT EXISTS idx_project_key_results_objective_id ON public.project_key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_project_forecast_files_project_id ON public.project_forecast_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_predictions_project_id ON public.project_predictions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skill_requirements_project_id ON public.project_skill_requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_project_bonus_triggers_project_id ON public.project_bonus_triggers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_compliance_checks_project_id ON public.project_compliance_checks(project_id);

-- ========================================
-- RLS POLICIES
-- ========================================

-- Budget Details
ALTER TABLE public.project_budget_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget details for their projects" ON public.project_budget_details
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR auth.uid() = ANY(team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage budget details for their projects" ON public.project_budget_details
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Objectives
ALTER TABLE public.project_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view objectives for their projects" ON public.project_objectives
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid() OR auth.uid() = ANY(team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage objectives for their projects" ON public.project_objectives
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE owner_id = auth.uid()
    )
  );

-- Key Results
ALTER TABLE public.project_key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view key results for their objectives" ON public.project_key_results
  FOR SELECT USING (
    objective_id IN (
      SELECT po.id FROM public.project_objectives po
      JOIN public.projects p ON p.id = po.project_id
      WHERE p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members::UUID[])
    )
  );

CREATE POLICY "Users can manage key results for their objectives" ON public.project_key_results
  FOR ALL USING (
    objective_id IN (
      SELECT po.id FROM public.project_objectives po
      JOIN public.projects p ON p.id = po.project_id
      WHERE p.owner_id = auth.uid()
    )
  );

-- Weitere RLS Policies für andere Tabellen...
ALTER TABLE public.project_forecast_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_bonus_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_compliance_checks ENABLE ROW LEVEL SECURITY;

-- Basis RLS für alle neuen Tabellen
DO $$ 
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY[
        'project_forecast_files',
        'project_predictions', 
        'project_skill_requirements',
        'project_bonus_triggers',
        'project_compliance_checks'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        EXECUTE format('
            CREATE POLICY "Users can view %I for their projects" ON public.%I
              FOR SELECT USING (
                project_id IN (
                  SELECT id FROM public.projects 
                  WHERE owner_id = auth.uid() OR auth.uid() = ANY(team_members::UUID[])
                )
              );
              
            CREATE POLICY "Users can manage %I for their projects" ON public.%I
              FOR ALL USING (
                project_id IN (
                  SELECT id FROM public.projects 
                  WHERE owner_id = auth.uid()
                )
              );
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- ========================================
-- TRIGGER FÜR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_budget_details_updated_at 
    BEFORE UPDATE ON public.project_budget_details 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_objectives_updated_at 
    BEFORE UPDATE ON public.project_objectives 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_key_results_updated_at 
    BEFORE UPDATE ON public.project_key_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();