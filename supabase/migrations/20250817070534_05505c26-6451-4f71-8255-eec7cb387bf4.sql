-- ESG (Environment, Social, Governance) Module Migration

-- Emission Sources
CREATE TABLE IF NOT EXISTS public.emission_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- electricity, natural_gas, diesel, flights, etc.
  unit TEXT NOT NULL, -- kWh, m3, l, km, etc.
  activity_data NUMERIC NOT NULL,
  factor_ref UUID,
  scope INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
  site_id UUID,
  cost_center TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  evidence TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  company_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emission Factors
CREATE TABLE IF NOT EXISTS public.emission_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  region TEXT NOT NULL, -- DE, EU, Global
  year INTEGER NOT NULL,
  unit_in TEXT NOT NULL, -- input unit
  unit_out TEXT NOT NULL, -- output unit (usually kgCO2e or tCO2e)
  value NUMERIC NOT NULL,
  uncertainty NUMERIC, -- percentage
  source_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPIs (Key Performance Indicators)
CREATE TABLE IF NOT EXISTS public.esg_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  esrs_code TEXT NOT NULL, -- E1-6-a, S1-14, etc.
  label TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  period TEXT NOT NULL, -- FY2025, Q1-2025, etc.
  method TEXT, -- activity-based, spend-based, calc
  evidence TEXT[] DEFAULT '{}',
  calc_ref JSONB, -- calculation reference
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 1),
  company_id UUID,
  site_id UUID,
  department TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materiality Assessment
CREATE TABLE IF NOT EXISTS public.materiality_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
  financial_score INTEGER CHECK (financial_score >= 1 AND financial_score <= 5),
  decision TEXT CHECK (decision IN ('material', 'not_material', 'monitor')),
  rationale TEXT,
  evidence TEXT[] DEFAULT '{}',
  stakeholder_feedback JSONB DEFAULT '{}',
  company_id UUID,
  assessment_year INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EU Taxonomy Activities
CREATE TABLE IF NOT EXISTS public.taxonomy_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nace_code TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  aligned_turnover NUMERIC CHECK (aligned_turnover >= 0 AND aligned_turnover <= 1),
  aligned_capex NUMERIC CHECK (aligned_capex >= 0 AND aligned_capex <= 1),
  aligned_opex NUMERIC CHECK (aligned_opex >= 0 AND aligned_opex <= 1),
  dnsh_compliant BOOLEAN DEFAULT false, -- Do No Significant Harm
  minimum_safeguards BOOLEAN DEFAULT false,
  evidence TEXT[] DEFAULT '{}',
  checklist_ref JSONB DEFAULT '{}',
  company_id UUID,
  assessment_year INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Reports
CREATE TABLE IF NOT EXISTS public.esg_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  language TEXT DEFAULT 'de',
  sections JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'frozen', 'submitted')),
  ixbrl_files TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  submission_data JSONB DEFAULT '{}',
  company_id UUID,
  created_by UUID REFERENCES auth.users(id),
  frozen_at TIMESTAMP WITH TIME ZONE,
  frozen_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Workflow Tasks
CREATE TABLE IF NOT EXISTS public.esg_workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignee UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'review', 'completed', 'overdue')),
  entity_type TEXT, -- emission_source, kpi, report_section
  entity_ref UUID,
  raci_role TEXT CHECK (raci_role IN ('responsible', 'accountable', 'consulted', 'informed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  company_id UUID,
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Data Sources (for dashboard widgets)
CREATE TABLE IF NOT EXISTS public.esg_data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  query_config JSONB NOT NULL,
  cache_ttl INTEGER DEFAULT 300, -- seconds
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Dashboard Layouts
CREATE TABLE IF NOT EXISTS public.esg_dashboard_layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  device TEXT DEFAULT 'mobile' CHECK (device IN ('mobile', 'desktop', 'tablet')),
  grid_config JSONB NOT NULL,
  widgets JSONB NOT NULL DEFAULT '[]',
  visibility JSONB NOT NULL DEFAULT '{}', -- roles, departments, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Import Templates
CREATE TABLE IF NOT EXISTS public.esg_import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- csv, xlsx, api, email, ocr
  field_mappings JSONB NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  auto_compute BOOLEAN DEFAULT true,
  schedule_config JSONB, -- for automated imports
  company_id UUID,
  created_by UUID REFERENCES auth.users(id),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Audit Logs
CREATE TABLE IF NOT EXISTS public.esg_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emission_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view emission sources for their company" ON public.emission_sources
  FOR SELECT USING (
    company_id = get_user_company_id(auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Sustainability officers can manage emission sources" ON public.emission_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin') 
      AND company_id = emission_sources.company_id
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view ESG KPIs for their scope" ON public.esg_kpis
  FOR SELECT USING (
    company_id = get_user_company_id(auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "ESG managers can manage KPIs" ON public.esg_kpis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
      AND company_id = esg_kpis.company_id
    )
  );

-- Public access for emission factors (reference data)
CREATE POLICY "Everyone can view emission factors" ON public.emission_factors
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage emission factors" ON public.emission_factors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- Data sources and layouts - public read for active users
CREATE POLICY "Active users can view ESG data sources" ON public.esg_data_sources
  FOR SELECT USING (is_active = true);

CREATE POLICY "Active users can view ESG dashboard layouts" ON public.esg_dashboard_layouts
  FOR SELECT USING (is_active = true);

-- Indexes for performance
CREATE INDEX idx_emission_sources_company_period ON public.emission_sources(company_id, period_start, period_end);
CREATE INDEX idx_emission_sources_scope ON public.emission_sources(scope);
CREATE INDEX idx_esg_kpis_esrs_code ON public.esg_kpis(esrs_code);
CREATE INDEX idx_esg_kpis_period ON public.esg_kpis(period);
CREATE INDEX idx_esg_workflow_tasks_assignee ON public.esg_workflow_tasks(assignee);
CREATE INDEX idx_esg_audit_logs_created_at ON public.esg_audit_logs(created_at);

-- Triggers
CREATE TRIGGER emission_sources_updated_at_trigger
  BEFORE UPDATE ON public.emission_sources
  FOR EACH ROW EXECUTE FUNCTION update_channel_updated_at();

CREATE TRIGGER esg_kpis_updated_at_trigger
  BEFORE UPDATE ON public.esg_kpis
  FOR EACH ROW EXECUTE FUNCTION update_channel_updated_at();