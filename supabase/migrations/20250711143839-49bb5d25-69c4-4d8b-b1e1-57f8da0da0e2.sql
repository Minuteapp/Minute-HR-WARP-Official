-- Erweiterte Tabellen für Executive Budget & Forecast Cockpit

-- Budget Upload Batches für Excel Import
CREATE TABLE IF NOT EXISTS public.budget_upload_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_type TEXT NOT NULL DEFAULT 'budget_actuals',
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  mapping_rules JSONB DEFAULT '{}'::jsonb,
  processing_status TEXT DEFAULT 'pending',
  uploaded_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Executive KPI Container für Dashboard Widgets
CREATE TABLE IF NOT EXISTS public.executive_kpi_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_name TEXT NOT NULL,
  kpi_type TEXT NOT NULL, -- ebit, growth, cost_ratio, cashflow
  current_value NUMERIC DEFAULT 0,
  previous_value NUMERIC DEFAULT 0,
  target_value NUMERIC,
  period_type TEXT DEFAULT 'monthly', -- monthly, quarterly, yearly
  calculation_formula JSONB DEFAULT '{}'::jsonb,
  display_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  dashboard_position INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- What-If Szenarien Ergebnisse
CREATE TABLE IF NOT EXISTS public.budget_what_if_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_name TEXT NOT NULL,
  base_forecast_id UUID,
  adjustments JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_results JSONB DEFAULT '{}'::jsonb,
  scenario_status TEXT DEFAULT 'draft',
  is_favorite BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Excel Mapping Templates für flexibles Parsing
CREATE TABLE IF NOT EXISTS public.excel_mapping_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  file_pattern TEXT, -- Regex für Dateinamen
  column_mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vergleichsdaten für Periode-über-Periode Analysen
CREATE TABLE IF NOT EXISTS public.budget_period_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comparison_name TEXT NOT NULL,
  base_period_start DATE NOT NULL,
  base_period_end DATE NOT NULL,
  compare_period_start DATE NOT NULL,
  compare_period_end DATE NOT NULL,
  comparison_type TEXT DEFAULT 'yoy', -- yoy, mom, qoq
  calculation_results JSONB DEFAULT '{}'::jsonb,
  variance_analysis JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_kpi_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_what_if_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_mapping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_period_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Geschäftsführer und Finance Controller
CREATE POLICY "Executives can manage all budget data"
ON public.budget_upload_batches
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'finance_controller')
  )
);

CREATE POLICY "Executives can manage KPI widgets"
ON public.executive_kpi_widgets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'finance_controller')
  )
);

CREATE POLICY "Executives can manage scenarios"
ON public.budget_what_if_scenarios
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'finance_controller')
  )
);

CREATE POLICY "Executives can manage mapping templates"
ON public.excel_mapping_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'finance_controller')
  )
);

CREATE POLICY "Executives can view comparisons"
ON public.budget_period_comparisons
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'finance_controller')
  )
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_budget_upload_batches_created_at ON public.budget_upload_batches(created_at);
CREATE INDEX IF NOT EXISTS idx_executive_kpi_widgets_active ON public.executive_kpi_widgets(is_active, dashboard_position);
CREATE INDEX IF NOT EXISTS idx_budget_scenarios_status ON public.budget_what_if_scenarios(scenario_status);
CREATE INDEX IF NOT EXISTS idx_excel_templates_default ON public.excel_mapping_templates(is_default);