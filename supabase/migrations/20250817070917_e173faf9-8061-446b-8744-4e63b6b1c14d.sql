-- Complete ESG Module Migration without problematic triggers

-- Create generic update function first
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Emission Sources
CREATE TABLE IF NOT EXISTS public.emission_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  unit TEXT NOT NULL,
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
  region TEXT NOT NULL,
  year INTEGER NOT NULL,
  unit_in TEXT NOT NULL,
  unit_out TEXT NOT NULL,
  value NUMERIC NOT NULL,
  uncertainty NUMERIC,
  source_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPIs (Key Performance Indicators)
CREATE TABLE IF NOT EXISTS public.esg_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  esrs_code TEXT NOT NULL,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  period TEXT NOT NULL,
  method TEXT,
  evidence TEXT[] DEFAULT '{}',
  calc_ref JSONB,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 1),
  company_id UUID,
  site_id UUID,
  department TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Data Sources (for dashboard widgets)
CREATE TABLE IF NOT EXISTS public.esg_data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  query_config JSONB NOT NULL,
  cache_ttl INTEGER DEFAULT 300,
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
  visibility JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
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
  entity_type TEXT,
  entity_ref UUID,
  raci_role TEXT CHECK (raci_role IN ('responsible', 'accountable', 'consulted', 'informed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  company_id UUID,
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG Import Templates
CREATE TABLE IF NOT EXISTS public.esg_import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  field_mappings JSONB NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  auto_compute BOOLEAN DEFAULT true,
  schedule_config JSONB,
  company_id UUID,
  created_by UUID REFERENCES auth.users(id),
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emission_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_import_templates ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Active users can view ESG data sources" ON public.esg_data_sources
  FOR SELECT USING (is_active = true);

CREATE POLICY "Active users can view ESG dashboard layouts" ON public.esg_dashboard_layouts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can view emission factors" ON public.emission_factors
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emission_sources_company_period ON public.emission_sources(company_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_esg_kpis_esrs_code ON public.esg_kpis(esrs_code);
CREATE INDEX IF NOT EXISTS idx_esg_workflow_tasks_assignee ON public.esg_workflow_tasks(assignee);