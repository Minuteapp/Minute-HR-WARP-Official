
-- Erstelle zunächst die grundlegende forecast_templates Tabelle
CREATE TABLE IF NOT EXISTS public.forecast_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('budget', 'personnel', 'project', 'growth', 'crisis', 'custom')),
  forecast_type text NOT NULL CHECK (forecast_type IN ('monthly', 'quarterly', 'yearly')),
  department text,
  template_data jsonb NOT NULL DEFAULT '{}',
  is_default boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_active boolean DEFAULT true,
  access_level text DEFAULT 'superadmin' CHECK (access_level IN ('superadmin', 'admin')),
  version integer DEFAULT 1,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  usage_count integer DEFAULT 0
);

-- Forecast Instanzen erweitert um Dimensionen und Genehmigungsworkflow
CREATE TABLE IF NOT EXISTS public.forecast_instances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.forecast_templates(id),
  name text NOT NULL,
  forecast_type text NOT NULL CHECK (forecast_type IN ('location', 'project', 'branch', 'department', 'revenue', 'cost', 'hr', 'energy', 'sustainability')),
  forecast_period_start date NOT NULL,
  forecast_period_end date NOT NULL,
  scenario_applied text CHECK (scenario_applied IN ('worst_case', 'real_case', 'best_case', 'custom')),
  parameter_overrides jsonb DEFAULT '{}',
  calculated_data jsonb DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'pending_approval', 'approved', 'rejected', 'active', 'archived')),
  approval_stage text DEFAULT 'department' CHECK (approval_stage IN ('department', 'team_lead', 'controlling', 'management', 'escalated')),
  dimension_type text CHECK (dimension_type IN ('location', 'project', 'branch')),
  dimension_id uuid,
  dimension_name text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  rejected_at timestamp with time zone,
  rejected_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  escalation_date timestamp with time zone,
  escalation_reason text,
  version integer DEFAULT 1,
  is_active boolean DEFAULT true
);

-- Weitere Template-bezogene Tabellen
CREATE TABLE IF NOT EXISTS public.forecast_template_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.forecast_templates(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  changes_summary text NOT NULL,
  template_snapshot jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forecast_template_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.forecast_templates(id) ON DELETE CASCADE,
  used_by uuid REFERENCES auth.users(id),
  forecast_instance_id uuid REFERENCES public.forecast_instances(id),
  used_at timestamp with time zone DEFAULT now(),
  scenario_used text,
  parameters_modified jsonb DEFAULT '{}'
);

-- Genehmigungsworkflow
CREATE TABLE IF NOT EXISTS public.forecast_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_instance_id uuid REFERENCES public.forecast_instances(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES auth.users(id),
  approval_level integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
  comments text,
  approval_conditions jsonb DEFAULT '{}',
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  rejection_reason text,
  delegated_to uuid REFERENCES auth.users(id),
  signature_token text,
  escalation_threshold_days integer DEFAULT 7,
  created_at timestamp with time zone DEFAULT now()
);

-- KI-Empfehlungen erweitert
CREATE TABLE IF NOT EXISTS public.forecast_ai_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_instance_id uuid REFERENCES public.forecast_instances(id),
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('cost_reduction', 'revenue_increase', 'risk_mitigation', 'efficiency_improvement', 'resource_optimization')),
  title text NOT NULL,
  description text NOT NULL,
  impact_analysis jsonb DEFAULT '{}',
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 100),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented')),
  ai_reasoning text,
  data_sources text[] DEFAULT '{}',
  estimated_impact numeric,
  implementation_effort text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Risikobewertung
CREATE TABLE IF NOT EXISTS public.forecast_risk_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_instance_id uuid REFERENCES public.forecast_instances(id),
  risk_type text NOT NULL CHECK (risk_type IN ('budget_deviation', 'cashflow_risk', 'market_volatility', 'resource_shortage', 'deadline_risk')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  probability numeric CHECK (probability >= 0 AND probability <= 100),
  impact_description text NOT NULL,
  mitigation_strategy text,
  trigger_conditions jsonb DEFAULT '{}',
  early_warning_threshold numeric,
  status text DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'realized', 'dismissed')),
  assigned_to uuid REFERENCES auth.users(id),
  due_date date,
  resolved_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Daten-Konnektoren für Modulintegration
CREATE TABLE IF NOT EXISTS public.forecast_data_connectors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  connector_type text NOT NULL CHECK (connector_type IN ('projects', 'payroll', 'recruiting', 'time_tracking', 'sustainability', 'goals')),
  config jsonb DEFAULT '{}',
  sync_frequency text DEFAULT 'daily' CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  last_sync_at timestamp with time zone,
  sync_status text DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'disabled')),
  error_log jsonb DEFAULT '[]',
  data_mapping jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Dashboard Widgets
CREATE TABLE IF NOT EXISTS public.forecast_dashboard_widgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  widget_type text NOT NULL CHECK (widget_type IN ('kpi_box', 'chart', 'table', 'alert_panel', 'approval_status')),
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 4,
  height integer DEFAULT 3,
  config jsonb DEFAULT '{}',
  data_source text,
  refresh_interval integer DEFAULT 300,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- KI-Einstellungen
CREATE TABLE IF NOT EXISTS public.forecast_ai_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  ai_recommendations_enabled boolean DEFAULT true,
  auto_scenario_generation boolean DEFAULT false,
  risk_analysis_sensitivity text DEFAULT 'medium' CHECK (risk_analysis_sensitivity IN ('low', 'medium', 'high')),
  early_warning_threshold numeric DEFAULT 80,
  preferred_forecast_horizon text DEFAULT '12_months' CHECK (preferred_forecast_horizon IN ('3_months', '6_months', '12_months', '24_months')),
  notification_preferences jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Berechtigungen
CREATE TABLE IF NOT EXISTS public.forecast_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  permission_type text NOT NULL CHECK (permission_type IN ('view', 'create', 'edit', 'approve', 'export', 'admin')),
  resource_type text NOT NULL CHECK (resource_type IN ('template', 'instance', 'scenario', 'report', 'dashboard')),
  resource_id uuid,
  granted_by uuid REFERENCES auth.users(id),
  expires_at timestamp with time zone,
  conditions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Audit-Log für Revisionssicherheit
CREATE TABLE IF NOT EXISTS public.forecast_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_instance_id uuid REFERENCES public.forecast_instances(id),
  action text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Eskalationsregeln
CREATE TABLE IF NOT EXISTS public.forecast_escalation_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name text NOT NULL,
  trigger_condition text NOT NULL,
  escalation_level integer NOT NULL,
  escalate_to_role text,
  escalate_to_user uuid REFERENCES auth.users(id),
  notification_template text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Szenario-Management für erweiterte Forecast-Funktionen
CREATE TABLE IF NOT EXISTS public.forecast_scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  scenario_type text NOT NULL CHECK (scenario_type IN ('best_case', 'real_case', 'worst_case', 'custom')),
  base_template_id uuid REFERENCES public.forecast_templates(id),
  multipliers jsonb DEFAULT '{}',
  adjustments jsonb DEFAULT '[]',
  risk_assessment jsonb DEFAULT '{}',
  confidence_level numeric CHECK (confidence_level >= 0 AND confidence_level <= 100),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Templates erweitert (nur wenn Spalten noch nicht existieren)
ALTER TABLE public.forecast_templates 
ADD COLUMN IF NOT EXISTS dimension_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS auto_approval_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_workflow jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_enabled boolean DEFAULT true;

-- Trigger für automatische Eskalation
CREATE OR REPLACE FUNCTION handle_forecast_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prüfe auf überfällige Genehmigungen
  IF NEW.status = 'pending_approval' AND 
     OLD.status != 'pending_approval' THEN
    -- Setze Eskalationszeit
    NEW.escalation_date = NEW.created_at + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forecast_escalation_trigger
  BEFORE UPDATE ON public.forecast_instances
  FOR EACH ROW EXECUTE FUNCTION handle_forecast_escalation();

-- RLS Policies aktivieren
ALTER TABLE public.forecast_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_data_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_template_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies für forecast_templates
CREATE POLICY "Superadmins können alle Templates verwalten" ON public.forecast_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins können Templates ihrer Berechtigung verwalten" ON public.forecast_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ) OR created_by = auth.uid()
  );

-- RLS Policies für forecast_instances
CREATE POLICY "Users can view own forecast instances" ON public.forecast_instances
  FOR SELECT USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.forecast_permissions fp 
      WHERE fp.user_id = auth.uid() 
      AND fp.resource_type = 'instance' 
      AND fp.permission_type IN ('view', 'admin')
      AND fp.is_active = true
    )
  );

CREATE POLICY "Users can create forecast instances" ON public.forecast_instances
  FOR INSERT WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.forecast_permissions fp 
      WHERE fp.user_id = auth.uid() 
      AND fp.resource_type = 'instance' 
      AND fp.permission_type IN ('create', 'admin')
      AND fp.is_active = true
    )
  );

CREATE POLICY "Users can update own forecast instances" ON public.forecast_instances
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.forecast_permissions fp 
      WHERE fp.user_id = auth.uid() 
      AND fp.resource_type = 'instance' 
      AND fp.permission_type IN ('edit', 'admin')
      AND fp.is_active = true
    )
  );

-- RLS Policies für Szenarien
CREATE POLICY "Users can view scenarios" ON public.forecast_scenarios
  FOR SELECT USING (
    created_by = auth.uid() OR is_active = true
  );

CREATE POLICY "Users can create scenarios" ON public.forecast_scenarios
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own scenarios" ON public.forecast_scenarios
  FOR UPDATE USING (created_by = auth.uid());

-- Weitere RLS Policies für andere Tabellen
CREATE POLICY "Users can view relevant approvals" ON public.forecast_approvals
  FOR SELECT USING (
    approver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.forecast_instances fi 
      WHERE fi.id = forecast_instance_id 
      AND fi.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own dashboard widgets" ON public.forecast_dashboard_widgets
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own AI settings" ON public.forecast_ai_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view AI recommendations for their instances" ON public.forecast_ai_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forecast_instances fi 
      WHERE fi.id = forecast_instance_id 
      AND fi.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view risk assessments for their instances" ON public.forecast_risk_assessments
  FOR SELECT USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.forecast_instances fi 
      WHERE fi.id = forecast_instance_id 
      AND fi.created_by = auth.uid()
    )
  );

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_forecast_templates_category ON public.forecast_templates(category, is_active);
CREATE INDEX IF NOT EXISTS idx_forecast_instances_dimension ON public.forecast_instances(dimension_type, dimension_id);
CREATE INDEX IF NOT EXISTS idx_forecast_instances_status ON public.forecast_instances(status, approval_stage);
CREATE INDEX IF NOT EXISTS idx_forecast_approvals_approver ON public.forecast_approvals(approver_id, status);
CREATE INDEX IF NOT EXISTS idx_forecast_escalation ON public.forecast_instances(escalation_date) WHERE escalation_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_forecast_scenarios_template ON public.forecast_scenarios(base_template_id, is_active);

-- Erstelle Stored Functions für häufige Operationen
CREATE OR REPLACE FUNCTION increment_template_usage(template_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.forecast_templates 
  SET usage_count = usage_count + 1, last_used_at = now()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
