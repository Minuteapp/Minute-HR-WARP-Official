-- Erweiterte Workforce Planning Collections

-- WF_Demand: Bedarfsdefinition
CREATE TABLE public.wf_demand (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  role_name TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  required_certifications TEXT[] DEFAULT '{}',
  hours_needed NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  location_id TEXT,
  department TEXT,
  cost_center TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'fulfilled', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- WF_Supply: Verfügbare Kapazitäten
CREATE TABLE public.wf_supply (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  available_hours NUMERIC NOT NULL DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]',
  cost_rate NUMERIC DEFAULT 0,
  location_id TEXT,
  department TEXT,
  availability_start DATE NOT NULL,
  availability_end DATE NOT NULL,
  preferences JSONB DEFAULT '{}',
  constraints JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'partial', 'unavailable', 'on_leave')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- WF_Gap: Identifizierte Lücken
CREATE TABLE public.wf_gap (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demand_id UUID REFERENCES wf_demand(id),
  gap_hours NUMERIC NOT NULL DEFAULT 0,
  gap_fte NUMERIC NOT NULL DEFAULT 0,
  missing_skills TEXT[] DEFAULT '{}',
  missing_certifications TEXT[] DEFAULT '{}',
  location TEXT,
  department TEXT,
  week_start DATE NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolution_suggestions JSONB DEFAULT '[]',
  cost_impact NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- WF_Scenario: Planungsszenarien
CREATE TABLE public.wf_scenario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL DEFAULT 'custom' CHECK (scenario_type IN ('base', 'best', 'worst', 'custom')),
  assumptions JSONB NOT NULL DEFAULT '{}',
  forecast_data JSONB DEFAULT '{}',
  cost_projection NUMERIC DEFAULT 0,
  headcount_projection INTEGER DEFAULT 0,
  overtime_projection NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- WF_Assignment: Zuweisungen
CREATE TABLE public.wf_assignment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demand_id UUID REFERENCES wf_demand(id),
  user_id UUID NOT NULL,
  assigned_hours NUMERIC NOT NULL DEFAULT 0,
  assignment_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  conflict_level TEXT DEFAULT 'none' CHECK (conflict_level IN ('none', 'low', 'medium', 'high')),
  compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'warning', 'violation')),
  compliance_notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- WF_Constraint: Compliance-Regeln
CREATE TABLE public.wf_constraint (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  constraint_type TEXT NOT NULL CHECK (constraint_type IN ('arbeitszeit', 'ruhezeit', 'nachtarbeit', 'tarif', 'betriebsvereinbarung', 'legal')),
  rule_expression JSONB NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  auto_fix_suggestion TEXT,
  scope TEXT DEFAULT 'global' CHECK (scope IN ('global', 'department', 'location', 'role')),
  scope_value TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- WF_Forecast: Prognosen
CREATE TABLE public.wf_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_type TEXT NOT NULL CHECK (forecast_type IN ('demand', 'supply', 'cost', 'headcount')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  forecast_data JSONB NOT NULL DEFAULT '{}',
  confidence_level NUMERIC DEFAULT 0.8,
  methodology TEXT,
  assumptions JSONB DEFAULT '{}',
  actuals JSONB DEFAULT '{}',
  variance_analysis JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- WF_Request: Anfragen (Hiring, Training, etc.)
CREATE TABLE public.wf_request (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type TEXT NOT NULL CHECK (request_type IN ('hiring', 'training', 'contract_change', 'certification', 'equipment')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'approved', 'rejected', 'completed')),
  requested_by UUID,
  assigned_to UUID,
  department TEXT,
  cost_estimate NUMERIC DEFAULT 0,
  roi_estimate NUMERIC DEFAULT 0,
  time_to_fill_days INTEGER,
  request_data JSONB DEFAULT '{}',
  approval_chain JSONB DEFAULT '[]',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- Workforce Planning Audit Log
CREATE TABLE public.wf_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- Skills und Certifications Management
CREATE TABLE public.wf_skills_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  skill_level INTEGER DEFAULT 1 CHECK (skill_level BETWEEN 1 AND 5),
  certification_name TEXT,
  certification_level TEXT,
  acquired_date DATE,
  expiry_date DATE,
  verified_by UUID,
  verification_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- RLS Policies für Company Isolation
ALTER TABLE wf_demand ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_supply ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_gap ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_scenario ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_constraint ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wf_skills_matrix ENABLE ROW LEVEL SECURITY;

-- RLS Policies für alle Tabellen
DO $$ 
DECLARE 
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['wf_demand', 'wf_supply', 'wf_gap', 'wf_scenario', 'wf_assignment', 'wf_constraint', 'wf_forecast', 'wf_request', 'wf_audit_log', 'wf_skills_matrix'])
    LOOP
        -- Company Isolation Policy
        EXECUTE format('
            CREATE POLICY "Company Isolation" ON public.%I
            FOR ALL USING (
                CASE 
                    WHEN is_in_tenant_context() THEN 
                        company_id = get_tenant_company_id_safe()
                    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
                        true
                    ELSE 
                        company_id = get_user_company_id(auth.uid())
                END
            )
            WITH CHECK (
                CASE 
                    WHEN is_in_tenant_context() THEN 
                        company_id = get_tenant_company_id_safe()
                    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
                        true
                    ELSE 
                        company_id = get_user_company_id(auth.uid())
                END
            )', tbl_name);
    END LOOP;
END $$;

-- Trigger für Auto-Update
CREATE OR REPLACE FUNCTION public.update_wf_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DO $$
DECLARE 
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['wf_demand', 'wf_supply', 'wf_scenario', 'wf_assignment', 'wf_constraint', 'wf_forecast', 'wf_request', 'wf_skills_matrix'])
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.update_wf_updated_at()', tbl_name, tbl_name);
    END LOOP;
END $$;

-- Auto-assign company_id trigger
DO $$
DECLARE 
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN SELECT unnest(ARRAY['wf_demand', 'wf_supply', 'wf_gap', 'wf_scenario', 'wf_assignment', 'wf_constraint', 'wf_forecast', 'wf_request', 'wf_audit_log', 'wf_skills_matrix'])
    LOOP
        EXECUTE format('
            CREATE TRIGGER auto_assign_%I_company_id
            BEFORE INSERT ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.auto_assign_company_id()', tbl_name, tbl_name);
    END LOOP;
END $$;