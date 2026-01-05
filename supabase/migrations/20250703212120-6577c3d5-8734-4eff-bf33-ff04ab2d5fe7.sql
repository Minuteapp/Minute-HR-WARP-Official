-- ========================================
-- ENTERPRISE PROJECT COCKPIT ERWEITERUNG - TEIL 2
-- ========================================

-- PROJECT BUDGET DETAILS
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

-- PROJECT OBJECTIVES (OKRs)
CREATE TABLE IF NOT EXISTS public.project_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  weight NUMERIC DEFAULT 1.0,
  status TEXT DEFAULT 'active',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_weight CHECK (weight >= 0 AND weight <= 1),
  CONSTRAINT check_objective_status CHECK (status IN ('active', 'completed', 'paused', 'cancelled'))
);

-- PROJECT KEY RESULTS
CREATE TABLE IF NOT EXISTS public.project_key_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID REFERENCES public.project_objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  measurement_type TEXT DEFAULT 'numeric',
  status TEXT DEFAULT 'active',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_measurement_type CHECK (measurement_type IN ('numeric', 'percentage', 'boolean')),
  CONSTRAINT check_kr_status CHECK (status IN ('active', 'completed', 'at_risk', 'behind'))
);

-- PROJECT FORECAST FILES
CREATE TABLE IF NOT EXISTS public.project_forecast_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processing_status TEXT DEFAULT 'pending',
  forecast_data JSONB DEFAULT '{}'::jsonb,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  CONSTRAINT check_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'error'))
);

-- PROJECT PREDICTIVE ANALYTICS
CREATE TABLE IF NOT EXISTS public.project_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  probability NUMERIC NOT NULL,
  confidence_level NUMERIC,
  factors JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  CONSTRAINT check_prediction_type CHECK (prediction_type IN ('delay', 'cost_overrun', 'success', 'resource_shortage')),
  CONSTRAINT check_probability CHECK (probability >= 0 AND probability <= 1),
  CONSTRAINT check_confidence CHECK (confidence_level >= 0 AND confidence_level <= 1)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_project_budget_details_project_id ON public.project_budget_details(project_id);
CREATE INDEX IF NOT EXISTS idx_project_objectives_project_id ON public.project_objectives(project_id);
CREATE INDEX IF NOT EXISTS idx_project_key_results_objective_id ON public.project_key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_project_forecast_files_project_id ON public.project_forecast_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_predictions_project_id ON public.project_predictions(project_id);