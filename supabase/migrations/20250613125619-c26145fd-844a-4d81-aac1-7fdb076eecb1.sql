
-- Erweiterte Forecast-Funktionen: Forecast-Szenarien
CREATE TABLE public.forecast_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT NOT NULL DEFAULT 'custom', -- 'best_case', 'real_case', 'worst_case', 'custom'
  base_template_id UUID,
  multipliers JSONB DEFAULT '{}',
  adjustments JSONB DEFAULT '[]',
  risk_assessment JSONB DEFAULT '{}',
  confidence_level NUMERIC DEFAULT 75,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- KI-basierte Forecast-Empfehlungen
CREATE TABLE public.forecast_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_instance_id UUID,
  recommendation_type TEXT NOT NULL, -- 'cost_reduction', 'revenue_increase', 'risk_mitigation'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_analysis JSONB DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'implemented'
  ai_reasoning TEXT,
  data_sources JSONB DEFAULT '[]',
  estimated_impact NUMERIC,
  implementation_effort TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Forecast-Datenquellen-Konnektoren
CREATE TABLE public.forecast_data_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  connector_type TEXT NOT NULL, -- 'crm', 'erp', 'hr', 'project', 'finance'
  config JSONB DEFAULT '{}',
  sync_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'manual'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'active', -- 'active', 'error', 'disabled'
  error_log JSONB DEFAULT '[]',
  data_mapping JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Forecast-Risikobewertungen und Warnungen
CREATE TABLE public.forecast_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_instance_id UUID,
  risk_type TEXT NOT NULL, -- 'budget_deviation', 'cashflow_risk', 'market_volatility'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  probability NUMERIC DEFAULT 50, -- 0-100%
  impact_description TEXT NOT NULL,
  mitigation_strategy TEXT,
  trigger_conditions JSONB DEFAULT '{}',
  early_warning_threshold NUMERIC,
  status TEXT DEFAULT 'active', -- 'active', 'mitigated', 'realized', 'dismissed'
  assigned_to UUID,
  due_date DATE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Forecast-Freigabe-Workflows
CREATE TABLE public.forecast_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_instance_id UUID,
  approver_id UUID NOT NULL,
  approval_level INTEGER DEFAULT 1, -- 1=Team Lead, 2=Department Head, 3=C-Level
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'delegated'
  comments TEXT,
  approval_conditions JSONB DEFAULT '{}',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  delegated_to UUID,
  signature_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Forecast-Export und Berichte
CREATE TABLE public.forecast_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_instance_id UUID,
  report_type TEXT NOT NULL, -- 'executive_summary', 'detailed_analysis', 'risk_assessment'
  report_format TEXT DEFAULT 'pdf', -- 'pdf', 'excel', 'csv', 'json'
  report_data JSONB DEFAULT '{}',
  file_path TEXT,
  access_level TEXT DEFAULT 'restricted', -- 'public', 'restricted', 'confidential'
  valid_until DATE,
  download_count INTEGER DEFAULT 0,
  generated_by UUID,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Forecast-Audit-Trail
CREATE TABLE public.forecast_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_instance_id UUID,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'approved', 'exported', 'shared'
  user_id UUID,
  changes_summary TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erweiterte Berechtigungen für Forecast-Module
CREATE TABLE public.forecast_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL, -- 'view', 'create', 'edit', 'approve', 'export', 'admin'
  resource_type TEXT NOT NULL, -- 'template', 'instance', 'scenario', 'report'
  resource_id UUID,
  granted_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  conditions JSONB DEFAULT '{}', -- z.B. nur bestimmte Abteilungen
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Live-Dashboard Konfiguration
CREATE TABLE public.forecast_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  widget_type TEXT NOT NULL, -- 'kpi_box', 'chart', 'table', 'alert_panel'
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 3,
  config JSONB DEFAULT '{}',
  data_source TEXT, -- Verweis auf Forecast-Instance oder Template
  refresh_interval INTEGER DEFAULT 300, -- Sekunden
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- KI-Einstellungen pro Benutzer
CREATE TABLE public.forecast_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  ai_recommendations_enabled BOOLEAN DEFAULT true,
  auto_scenario_generation BOOLEAN DEFAULT false,
  risk_analysis_sensitivity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  early_warning_threshold NUMERIC DEFAULT 15, -- Prozent Abweichung
  preferred_forecast_horizon TEXT DEFAULT '12_months', -- '3_months', '6_months', '12_months', '24_months'
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indizes für Performance
CREATE INDEX idx_forecast_scenarios_template ON forecast_scenarios(base_template_id);
CREATE INDEX idx_forecast_ai_recommendations_instance ON forecast_ai_recommendations(forecast_instance_id);
CREATE INDEX idx_forecast_risk_assessments_instance ON forecast_risk_assessments(forecast_instance_id);
CREATE INDEX idx_forecast_approvals_instance ON forecast_approvals(forecast_instance_id);
CREATE INDEX idx_forecast_reports_instance ON forecast_reports(forecast_instance_id);
CREATE INDEX idx_forecast_audit_logs_instance ON forecast_audit_logs(forecast_instance_id);
CREATE INDEX idx_forecast_permissions_user ON forecast_permissions(user_id);
CREATE INDEX idx_forecast_dashboard_widgets_user ON forecast_dashboard_widgets(user_id);

-- Trigger für automatische Aktualisierung der updated_at Spalten
CREATE OR REPLACE FUNCTION update_forecast_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forecast_scenarios_updated_at 
  BEFORE UPDATE ON forecast_scenarios 
  FOR EACH ROW EXECUTE FUNCTION update_forecast_updated_at();

CREATE TRIGGER forecast_data_connectors_updated_at 
  BEFORE UPDATE ON forecast_data_connectors 
  FOR EACH ROW EXECUTE FUNCTION update_forecast_updated_at();

CREATE TRIGGER forecast_risk_assessments_updated_at 
  BEFORE UPDATE ON forecast_risk_assessments 
  FOR EACH ROW EXECUTE FUNCTION update_forecast_updated_at();

CREATE TRIGGER forecast_dashboard_widgets_updated_at 
  BEFORE UPDATE ON forecast_dashboard_widgets 
  FOR EACH ROW EXECUTE FUNCTION update_forecast_updated_at();

CREATE TRIGGER forecast_ai_settings_updated_at 
  BEFORE UPDATE ON forecast_ai_settings 
  FOR EACH ROW EXECUTE FUNCTION update_forecast_updated_at();

-- RLS Policies für erweiterte Forecast-Funktionen
ALTER TABLE forecast_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_data_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_ai_settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (werden in Code weiter verfeinert)
CREATE POLICY "Users can view their own forecast data" ON forecast_scenarios
  FOR SELECT USING (created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM forecast_permissions fp 
            WHERE fp.user_id = auth.uid() 
            AND fp.resource_type = 'scenario' 
            AND fp.resource_id = id 
            AND fp.is_active = true));

CREATE POLICY "Users can view their own AI recommendations" ON forecast_ai_recommendations
  FOR SELECT USING (EXISTS (SELECT 1 FROM forecast_permissions fp 
                            WHERE fp.user_id = auth.uid() 
                            AND fp.permission_type IN ('view', 'admin')
                            AND fp.is_active = true));

CREATE POLICY "Users can view their own dashboard widgets" ON forecast_dashboard_widgets
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own AI settings" ON forecast_ai_settings
  FOR ALL USING (user_id = auth.uid());

-- Funktionen für KI-Empfehlungen
CREATE OR REPLACE FUNCTION generate_forecast_ai_recommendations(p_forecast_instance_id UUID)
RETURNS TABLE(recommendation_id UUID, title TEXT, description TEXT, impact NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  forecast_data RECORD;
  recommendation_count INTEGER := 0;
BEGIN
  -- Hole Forecast-Daten
  SELECT * INTO forecast_data
  FROM forecast_instances 
  WHERE id = p_forecast_instance_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Beispiel-Empfehlungen basierend auf Forecast-Daten generieren
  -- (In der Realität würde hier eine echte KI-Analyse stattfinden)
  
  -- Kosteneinsparungs-Empfehlung
  INSERT INTO forecast_ai_recommendations (
    forecast_instance_id, recommendation_type, title, description,
    impact_analysis, confidence_score, priority, ai_reasoning,
    estimated_impact
  ) VALUES (
    p_forecast_instance_id,
    'cost_reduction',
    'Optimierung der Betriebskosten',
    'Basierend auf historischen Daten können die Betriebskosten um 8-12% reduziert werden.',
    '{"potential_savings": 50000, "implementation_time": "3_months"}',
    78,
    'medium',
    'Analyse zeigt Ineffizienzen in wiederkehrenden Ausgaben',
    50000
  ) RETURNING id, title, description, estimated_impact;
  
  recommendation_count := recommendation_count + 1;
  
  RETURN QUERY SELECT id, title, description, estimated_impact::NUMERIC
    FROM forecast_ai_recommendations 
    WHERE forecast_instance_id = p_forecast_instance_id 
    ORDER BY created_at DESC 
    LIMIT 5;
END;
$$;

-- Funktion für Risikobewertung
CREATE OR REPLACE FUNCTION assess_forecast_risks(p_forecast_instance_id UUID)
RETURNS TABLE(risk_id UUID, risk_type TEXT, severity TEXT, description TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Automatische Risikobewertung basierend auf Forecast-Daten
  INSERT INTO forecast_risk_assessments (
    forecast_instance_id, risk_type, severity, impact_description,
    probability, mitigation_strategy, created_by
  ) VALUES (
    p_forecast_instance_id,
    'budget_deviation',
    'medium',
    'Potenzielle Budgetabweichung von 15% aufgrund Marktvolatilität',
    35,
    'Monatliche Überprüfung und Anpassung der Forecast-Parameter',
    auth.uid()
  );
  
  RETURN QUERY SELECT id, risk_type, severity, impact_description
    FROM forecast_risk_assessments 
    WHERE forecast_instance_id = p_forecast_instance_id 
    AND status = 'active'
    ORDER BY severity DESC, probability DESC;
END;
$$;
