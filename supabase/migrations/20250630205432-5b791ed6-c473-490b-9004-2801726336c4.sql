
-- Budget Enterprise Tabellen für vollständiges Budget & Forecast System

-- 1. Erweiterte Budget-Dimensionen (für Enterprise-Strukturen)
CREATE TABLE public.budget_dimension_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension_type TEXT NOT NULL, -- 'department', 'project', 'cost_center', 'product_line'
  dimension_name TEXT NOT NULL,
  dimension_code TEXT,
  parent_dimension_id UUID REFERENCES public.budget_dimension_configs(id),
  hierarchy_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enterprise Forecast Engine
CREATE TABLE public.enterprise_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_name TEXT NOT NULL,
  forecast_type TEXT NOT NULL, -- 'linear', 'seasonal', 'ml_trend', 'custom'
  dimension_type TEXT, -- 'department', 'project', 'cost_center'
  dimension_id UUID,
  base_period_start DATE NOT NULL,
  base_period_end DATE NOT NULL,
  forecast_period_start DATE NOT NULL,
  forecast_period_end DATE NOT NULL,
  forecast_algorithm JSONB DEFAULT '{}', -- ML parameters, seasonal factors
  historical_data JSONB DEFAULT '[]', -- Basis-Daten für Forecast
  predicted_values JSONB DEFAULT '[]', -- Forecast-Ergebnisse
  confidence_score NUMERIC(5,2) DEFAULT 0.75,
  scenario_type TEXT DEFAULT 'realistic', -- 'optimistic', 'realistic', 'pessimistic'
  manual_adjustments JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Budget Actual Data (IST-Werte aus Excel/CSV/API)
CREATE TABLE public.budget_actual_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  dimension_type TEXT NOT NULL, -- 'department', 'project', 'cost_center'
  dimension_id UUID,
  category TEXT, -- 'income', 'expense', 'investment'
  subcategory TEXT,
  cost_center TEXT,
  description TEXT,
  reference_number TEXT, -- Belegnummer, Rechnungsnummer
  source_type TEXT NOT NULL, -- 'excel_upload', 'csv_import', 'api_sync', 'manual'
  source_file_name TEXT,
  source_row_number INTEGER,
  upload_batch_id UUID,
  mapping_status TEXT DEFAULT 'mapped', -- 'mapped', 'unmapped', 'needs_review'
  mapping_confidence NUMERIC(3,2) DEFAULT 1.0,
  approval_status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Upload Batches (für Excel/CSV Imports)
CREATE TABLE public.budget_upload_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT, -- 'xlsx', 'csv', 'json'
  upload_type TEXT NOT NULL, -- 'budget_actuals', 'budget_plan', 'forecast_data'
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  mapping_rules JSONB DEFAULT '{}', -- Column mapping configuration
  validation_errors JSONB DEFAULT '[]',
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_log JSONB DEFAULT '[]',
  uploaded_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. What-If Szenarien
CREATE TABLE public.budget_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  scenario_description TEXT,
  base_forecast_id UUID REFERENCES public.enterprise_forecasts(id),
  scenario_variables JSONB NOT NULL, -- {"salary_increase": 0.05, "marketing_reduction": -0.10}
  calculated_impact JSONB DEFAULT '{}', -- Berechnete Auswirkungen
  impact_summary TEXT,
  total_budget_change NUMERIC(15,2) DEFAULT 0,
  affected_dimensions JSONB DEFAULT '[]',
  scenario_status TEXT DEFAULT 'draft', -- 'draft', 'active', 'archived'
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Budget Approval Workflows
CREATE TABLE public.budget_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_plan_id UUID REFERENCES public.budget_plans(id),
  workflow_type TEXT NOT NULL, -- 'budget_creation', 'budget_change', 'forecast_approval'
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  workflow_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approval_steps JSONB NOT NULL, -- [{"step": 1, "approver_id": "...", "status": "pending"}]
  approval_deadline TIMESTAMP WITH TIME ZONE,
  escalation_rules JSONB DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. AI Budget Insights & Anomalien
CREATE TABLE public.ai_budget_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL, -- 'anomaly_detected', 'trend_change', 'forecast_warning', 'optimization_suggestion'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_budget_id UUID,
  affected_dimension_type TEXT,
  affected_dimension_id UUID,
  insight_data JSONB DEFAULT '{}', -- Detaildaten der Anomalie/Insight
  recommended_actions JSONB DEFAULT '[]', -- Empfohlene Maßnahmen
  confidence_score NUMERIC(3,2) DEFAULT 0.8,
  status TEXT DEFAULT 'new', -- 'new', 'acknowledged', 'resolved', 'dismissed'
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Budget Data Exports
CREATE TABLE public.budget_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL, -- 'pdf', 'excel', 'datev'
  export_format TEXT NOT NULL, -- 'PDF', 'XLSX', 'CSV', 'DATEV_XML'
  data_filters JSONB DEFAULT '{}', -- Filter für Export
  file_path TEXT,
  file_size BIGINT,
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  exported_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Budget Module Integrations
CREATE TABLE public.budget_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_module TEXT NOT NULL, -- 'time_tracking', 'payroll', 'projects', 'expenses'
  source_reference_id UUID NOT NULL,
  budget_plan_id UUID REFERENCES public.budget_plans(id),
  integration_type TEXT DEFAULT 'manual', -- 'automatic', 'manual', 'scheduled'
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  integration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'synced', -- 'synced', 'pending', 'failed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Indizes für Performance
CREATE INDEX idx_budget_actual_entries_date ON public.budget_actual_entries(entry_date);
CREATE INDEX idx_budget_actual_entries_dimension ON public.budget_actual_entries(dimension_type, dimension_id);
CREATE INDEX idx_budget_actual_entries_upload_batch ON public.budget_actual_entries(upload_batch_id);
CREATE INDEX idx_enterprise_forecasts_dimension ON public.enterprise_forecasts(dimension_type, dimension_id);
CREATE INDEX idx_ai_budget_insights_status ON public.ai_budget_insights(status, severity);
CREATE INDEX idx_budget_integrations_source ON public.budget_integrations(source_module, source_reference_id);

-- 11. RLS Policies
ALTER TABLE public.budget_dimension_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_actual_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_budget_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_integrations ENABLE ROW LEVEL SECURITY;

-- Basis-Policies (Admin & Superadmin haben vollen Zugriff)
CREATE POLICY "Admins can manage all budget data" ON public.budget_dimension_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage forecasts" ON public.enterprise_forecasts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage actual entries" ON public.budget_actual_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can view their uploads" ON public.budget_upload_batches FOR SELECT USING (
  uploaded_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage scenarios" ON public.budget_scenarios FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage workflows" ON public.budget_approval_workflows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Users can view insights" ON public.ai_budget_insights FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin', 'employee'))
);

CREATE POLICY "Users can view their exports" ON public.budget_exports FOR SELECT USING (
  exported_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage integrations" ON public.budget_integrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);
