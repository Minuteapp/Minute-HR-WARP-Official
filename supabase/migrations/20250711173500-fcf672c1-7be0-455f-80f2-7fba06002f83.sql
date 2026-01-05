-- Ultra-granulare Erweiterung der Berechtigungsmatrix

-- Neue Tabelle für Individual User Overrides
CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  submodule_name TEXT,
  action_key TEXT NOT NULL,
  permission_type TEXT NOT NULL, -- 'grant', 'deny', 'conditional'
  conditions JSONB DEFAULT '{}',
  override_reason TEXT,
  granted_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_name, submodule_name, action_key)
);

-- Neue Tabelle für dynamische Rollen-Templates
CREATE TABLE IF NOT EXISTS public.role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  base_template TEXT, -- 'admin', 'manager', 'employee' etc.
  permission_overrides JSONB DEFAULT '{}',
  auto_assign_conditions JSONB DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Neue Tabelle für Feature Flags basierend auf Berechtigungen
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL UNIQUE,
  flag_name TEXT NOT NULL,
  description TEXT,
  module_name TEXT,
  required_actions TEXT[] DEFAULT '{}',
  required_role_level INTEGER DEFAULT 0, -- 0=employee, 1=manager, 2=admin, 3=superadmin
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  rollout_percentage INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Erweiterte Aktionen für ultra-granulare Berechtigung
INSERT INTO public.permission_actions (action_key, action_name, description, category, requires_approval, risk_level) VALUES
-- Dashboard Aktionen
('dashboard_view', 'Dashboard anzeigen', 'Haupt-Dashboard anzeigen', 'dashboard', false, 'low'),
('dashboard_edit_widgets', 'Widgets anpassen', 'Dashboard-Widgets konfigurieren', 'dashboard', false, 'low'),
('dashboard_save_filters', 'Filter speichern', 'Eigene Filter-Presets speichern', 'dashboard', false, 'low'),
('dashboard_share_views', 'Ansichten teilen', 'Dashboard-Ansichten mit anderen teilen', 'dashboard', false, 'medium'),

-- Mitarbeiter Ultra-Granular
('employee_list_view', 'Mitarbeiterliste', 'Liste aller Mitarbeiter anzeigen', 'employees', false, 'medium'),
('employee_detail_view', 'Mitarbeiterdetails', 'Detaillierte Mitarbeiteransicht', 'employees', false, 'medium'),
('employee_edit_master_data', 'Stammdaten bearbeiten', 'Grundlegende Mitarbeiterdaten ändern', 'employees', false, 'high'),
('employee_view_salary', 'Gehaltsdaten einsehen', 'Lohn- und Gehaltsinformationen anzeigen', 'employees', false, 'critical'),
('employee_edit_salary', 'Gehaltsdaten bearbeiten', 'Lohn- und Gehaltsinformationen ändern', 'employees', true, 'critical'),
('employee_ai_assistant', 'KI-Assistent starten', 'KI-Unterstützung für Mitarbeiter aktivieren', 'employees', false, 'medium'),
('employee_birthday_notifications', 'Geburtstagserinnerungen', 'Benachrichtigungen für Geburtstage erhalten', 'employees', false, 'low'),
('employee_anniversary_notifications', 'Jubiläumserinnerungen', 'Benachrichtigungen für Firmenjubiläen', 'employees', false, 'low'),

-- Dokumente Ultra-Granular
('document_view_salary_docs', 'Gehaltsdokumente', 'Gehalts- und Lohndokumente einsehen', 'documents', false, 'critical'),
('document_view_sick_leave', 'Krankmeldungen', 'Krankmeldungen und AU-Bescheinigungen', 'documents', false, 'high'),
('document_view_nda', 'NDA/DSGVO Dokumente', 'Vertraulichkeits- und Datenschutzerklärungen', 'documents', false, 'medium'),
('document_digital_signature', 'Digitale Unterschrift', 'Dokumente digital signieren', 'documents', false, 'high'),

-- Zeiterfassung Ultra-Granular  
('time_view_own', 'Eigene Zeiten', 'Eigene Zeiterfassung anzeigen', 'time_tracking', false, 'low'),
('time_view_team', 'Teamzeiten', 'Zeiterfassung des Teams anzeigen', 'time_tracking', false, 'medium'),
('time_corrections', 'Zeitkorrekturen', 'Nachträgliche Zeitänderungen vornehmen', 'time_tracking', true, 'high'),
('time_overtime_view', 'Überstunden anzeigen', 'Überstunden-Saldo einsehen', 'time_tracking', false, 'medium'),
('time_overtime_payout', 'Überstunden auszahlen', 'Überstunden zur Auszahlung freigeben', 'time_tracking', true, 'high'),
('time_overtime_compensate', 'Überstunden ausgleichen', 'Überstunden als Freizeit gewähren', 'time_tracking', true, 'medium'),
('time_reminder_config', 'Erinnerungen konfigurieren', 'Zeiterfassungs-Erinnerungen einstellen', 'time_tracking', false, 'low'),

-- Projekte Ultra-Granular
('project_budget_view', 'Projektbudget einsehen', 'Budget-Details von Projekten anzeigen', 'projects', false, 'medium'),
('project_forecast_view', 'Projekt-Forecast', 'Projektprognosen und Trends anzeigen', 'projects', false, 'medium'),
('project_milestone_edit', 'Meilensteine bearbeiten', 'Projekt-Meilensteine verwalten', 'projects', false, 'medium'),
('project_team_assign', 'Team zuweisen', 'Mitarbeiter zu Projekten zuweisen', 'projects', false, 'medium'),

-- Budget & Forecast Ultra-Granular
('budget_heatmap_view', 'Budget-Heatmap', 'Visuelle Budget-Übersichten anzeigen', 'budget_forecast', false, 'medium'),
('budget_csv_upload', 'CSV Upload', 'Budgetdaten per CSV importieren', 'budget_forecast', true, 'high'),
('budget_simulation_run', 'Simulationen starten', 'Budget-Simulationen durchführen', 'budget_forecast', false, 'medium'),
('budget_variance_analysis', 'Abweichungsanalyse', 'Budget-Ist-Vergleiche durchführen', 'budget_forecast', false, 'medium'),

-- KI & Automation Ultra-Granular
('ai_model_configure', 'KI-Modelle konfigurieren', 'KI-Services einrichten und verwalten', 'ai_hub', true, 'high'),
('ai_risk_scores_view', 'Risiko-Scores einsehen', 'KI-Risikobewertungen anzeigen', 'ai_hub', false, 'medium'),
('ai_automation_create', 'Automationen erstellen', 'Neue KI-Workflows definieren', 'ai_hub', true, 'high'),
('ai_logs_view', 'KI-Logs prüfen', 'KI-Nutzungsprotokolle einsehen', 'ai_hub', false, 'medium'),
('ai_cost_tracking', 'KI-Kosten verfolgen', 'KI-Nutzungskosten überwachen', 'ai_hub', false, 'high'),

-- Compliance Ultra-Granular
('compliance_heatmap_view', 'Compliance-Heatmap', 'Compliance-Status-Übersicht', 'compliance', false, 'medium'),
('compliance_audit_trails', 'Audit-Trails', 'Vollständige Änderungsprotokolle einsehen', 'compliance', false, 'high'),
('compliance_policy_upload', 'Policy hochladen', 'Neue Compliance-Richtlinien hinzufügen', 'compliance', true, 'high'),
('compliance_expiry_config', 'Verfallswarnungen', 'Ablauferinnerungen konfigurieren', 'compliance', false, 'medium'),
('compliance_gdpr_delete', 'DSGVO-Löschung', 'Personendaten DSGVO-konform löschen', 'compliance', true, 'critical'),

-- Settings Ultra-Granular
('settings_company_info', 'Unternehmensdaten', 'Firmeninformationen verwalten', 'settings', true, 'high'),
('settings_branches', 'Standorte verwalten', 'Filialen und Standorte konfigurieren', 'settings', true, 'high'),
('settings_currency', 'Währungen einstellen', 'Währungseinstellungen verwalten', 'settings', true, 'medium'),
('settings_languages', 'Sprachen konfigurieren', 'Systemsprachen einstellen', 'settings', false, 'medium'),
('settings_security_2fa', '2FA konfigurieren', 'Zwei-Faktor-Authentifizierung einrichten', 'settings', true, 'high'),
('settings_security_sso', 'SSO einrichten', 'Single Sign-On konfigurieren', 'settings', true, 'critical'),
('settings_security_ip_lock', 'IP-Beschränkungen', 'IP-basierte Zugriffsbeschränkungen', 'settings', true, 'critical'),
('settings_notification_templates', 'Benachrichtigungs-Templates', 'E-Mail/Push-Vorlagen erstellen', 'settings', false, 'medium'),
('settings_signatures', 'Signaturen konfigurieren', 'Digitale Signaturen einrichten', 'settings', true, 'high'),
('settings_roles_permissions', 'Rollen & Rechte', 'Benutzerberechtigungen verwalten', 'settings', true, 'critical'),
('settings_lowcode_workflows', 'Low-Code Workflows', 'Workflow-Automatisierungen erstellen', 'settings', true, 'high')

ON CONFLICT (action_key) DO NOTHING;

-- Mehr Submodule hinzufügen
INSERT INTO public.permission_modules (name, module_key, description, module_type, parent_module_id, icon, color)
SELECT 
  submodule.name,
  submodule.module_key,
  submodule.description,
  'submodule',
  parent.id,
  submodule.icon,
  submodule.color
FROM (VALUES
  -- Dashboard Submodule
  ('Widgets', 'dashboard_widgets', 'Dashboard-Widget-Verwaltung', 'Layout', '#3B82F6'),
  ('Filter', 'dashboard_filters', 'Dashboard-Filter und Ansichten', 'Filter', '#3B82F6'),
  
  -- Mitarbeiter erweiterte Submodule  
  ('Gehaltsdaten', 'employee_salary_detailed', 'Detaillierte Gehaltsstrukturen', 'DollarSign', '#3B82F6'),
  ('Dokumente', 'employee_documents', 'Mitarbeiterdokumente und Verträge', 'FileText', '#3B82F6'),
  ('KI-Assistent', 'employee_ai', 'KI-Unterstützung für Mitarbeiter', 'Brain', '#3B82F6'),
  
  -- Projekte Submodule
  ('Budget', 'project_budget', 'Projektbudget-Verwaltung', 'DollarSign', '#EF4444'),
  ('Forecast', 'project_forecast', 'Projektprognosen', 'TrendingUp', '#EF4444'),
  ('Team', 'project_team', 'Projekt-Teamverwaltung', 'Users', '#EF4444'),
  
  -- Settings Submodule
  ('Sicherheit', 'settings_security', 'Sicherheitseinstellungen', 'Shield', '#6B7280'),
  ('Benachrichtigungen', 'settings_notifications', 'Notification-Management', 'Bell', '#6B7280'),
  ('Workflows', 'settings_workflows', 'Low-Code Workflow-Builder', 'Workflow', '#6B7280'),
  
  -- Compliance Submodule
  ('DSGVO', 'compliance_gdpr', 'DSGVO-Compliance-Management', 'Shield', '#DC2626'),
  ('Audit', 'compliance_audit', 'Audit-Trail-Verwaltung', 'Search', '#DC2626'),
  ('Policies', 'compliance_policies', 'Richtlinien-Management', 'FileText', '#DC2626')
) AS submodule(name, module_key, description, icon, color)
JOIN public.permission_modules parent ON (
  (submodule.module_key LIKE 'dashboard_%' AND parent.module_key = 'employees') OR
  (submodule.module_key LIKE 'employee_%' AND parent.module_key = 'employees') OR
  (submodule.module_key LIKE 'project_%' AND parent.module_key = 'projects') OR
  (submodule.module_key LIKE 'settings_%' AND parent.module_key = 'settings') OR
  (submodule.module_key LIKE 'compliance_%' AND parent.module_key = 'compliance')
)
WHERE parent.module_type = 'main'
ON CONFLICT (module_key) DO NOTHING;

-- Standard Rollen-Templates
INSERT INTO public.role_templates (role_name, display_name, description, base_template, is_system_role, permission_overrides) VALUES
('ceo', 'CEO', 'Chief Executive Officer', 'superadmin', true, '{"special_access": {"all_financial_data": true, "board_reports": true}}'),
('cfo', 'CFO', 'Chief Financial Officer', 'admin', true, '{"enhanced_access": {"budget_forecast": "full", "financial_reports": "all"}}'),
('cto', 'CTO', 'Chief Technology Officer', 'admin', true, '{"enhanced_access": {"ai_hub": "full", "system_settings": "all"}}'),
('hrbp', 'HR Business Partner', 'HR Business Partner', 'admin', true, '{"enhanced_access": {"employees": "full", "compliance": "hr_level"}}'),
('regional_manager', 'Regionalleiter', 'Regionaler Standortleiter', 'manager', false, '{"scope": {"region_limited": true, "multi_location": true}}'),
('department_head', 'Abteilungsleiter', 'Abteilungsleiter', 'manager', false, '{"scope": {"department_limited": true, "budget_approval": "department"}}'),
('team_lead', 'Teamleiter', 'Teamleiter', 'manager', false, '{"scope": {"team_limited": true, "basic_approvals": true}}'),
('senior_employee', 'Senior Mitarbeiter', 'Erfahrener Mitarbeiter', 'employee', false, '{"enhanced_access": {"project_lead": true, "mentor_access": true}}'),
('consultant', 'Berater', 'Externer Berater', 'employee', false, '{"restrictions": {"limited_time_access": true, "no_salary_data": true}}'),
('intern', 'Praktikant', 'Praktikant/Auszubildender', 'employee', false, '{"restrictions": {"read_only_most": true, "supervised_access": true}}')
ON CONFLICT (role_name) DO NOTHING;

-- Feature Flags für granulare Features
INSERT INTO public.feature_flags (flag_key, flag_name, description, module_name, required_actions, required_role_level) VALUES
('advanced_dashboard', 'Erweiterte Dashboard-Features', 'Zusätzliche Dashboard-Widgets und Analytik', 'dashboard', ARRAY['dashboard_edit_widgets'], 1),
('ai_assistant', 'KI-Assistent', 'KI-unterstützte Features in der gesamten Anwendung', 'ai_hub', ARRAY['ai_model_configure'], 2),
('advanced_reporting', 'Erweiterte Berichte', 'Komplexe Berichte und Datenexporte', 'reporting', ARRAY['create_reports', 'advanced_analytics'], 1),
('budget_simulations', 'Budget-Simulationen', 'Erweiterte Budget-Modellierung', 'budget_forecast', ARRAY['budget_simulation_run'], 2),
('compliance_automation', 'Compliance-Automatisierung', 'Automatisierte Compliance-Prüfungen', 'compliance', ARRAY['compliance_audit_trails'], 2),
('mobile_app_premium', 'Premium Mobile Features', 'Erweiterte Mobile-App-Funktionen', 'mobile', ARRAY['export'], 1),
('api_access', 'API-Zugriff', 'Zugriff auf REST-API und Webhooks', 'api', ARRAY['system_admin'], 3),
('white_labeling', 'White Labeling', 'Anpassung von Branding und Design', 'branding', ARRAY['system_admin'], 3),
('sso_integration', 'SSO Integration', 'Single Sign-On Integration', 'auth', ARRAY['settings_security_sso'], 3),
('advanced_workflows', 'Erweiterte Workflows', 'Komplexe Automatisierungsworkflows', 'automation', ARRAY['settings_lowcode_workflows'], 2)
ON CONFLICT (flag_key) DO NOTHING;

-- RLS Policies für neue Tabellen
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- User Permission Overrides Policies
CREATE POLICY "Users can view their own permission overrides" ON public.user_permission_overrides 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permission overrides" ON public.user_permission_overrides 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Role Templates Policies  
CREATE POLICY "Everyone can view active role templates" ON public.role_templates 
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage role templates" ON public.role_templates 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Feature Flags Policies
CREATE POLICY "Everyone can view active feature flags" ON public.feature_flags 
FOR SELECT USING (is_active = true);

CREATE POLICY "Superadmins can manage feature flags" ON public.feature_flags 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'superadmin')
);

-- Funktion für dynamische Berechtigungsprüfung mit Overrides
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions_with_overrides(p_user_id uuid)
RETURNS TABLE(
  module_name text, 
  submodule_name text,
  action_key text,
  permission_granted boolean,
  permission_source text,
  conditions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Hole die Rolle des Benutzers
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Falls keine Rolle gefunden, verwende 'employee' als Standard
  IF user_role IS NULL THEN
    user_role := 'employee';
  END IF;
  
  -- Kombiniere Basis-Berechtigungen mit User-Overrides
  RETURN QUERY
  WITH base_permissions AS (
    SELECT 
      rpm.module_name,
      NULL::text as submodule_name,
      unnest(rpm.allowed_actions) as action_key,
      true as permission_granted,
      'role_matrix' as permission_source,
      '{}'::jsonb as conditions
    FROM public.role_permission_matrix rpm
    WHERE rpm.role = user_role::user_role
      AND rpm.is_visible = true
  ),
  user_overrides AS (
    SELECT 
      upo.module_name,
      upo.submodule_name,
      upo.action_key,
      CASE WHEN upo.permission_type = 'grant' THEN true ELSE false END as permission_granted,
      'user_override' as permission_source,
      upo.conditions
    FROM public.user_permission_overrides upo
    WHERE upo.user_id = p_user_id
      AND upo.is_active = true
      AND (upo.expires_at IS NULL OR upo.expires_at > now())
  )
  -- Basis-Berechtigungen
  SELECT bp.* FROM base_permissions bp
  WHERE NOT EXISTS (
    SELECT 1 FROM user_overrides uo 
    WHERE uo.module_name = bp.module_name 
    AND uo.action_key = bp.action_key
    AND uo.submodule_name IS NOT DISTINCT FROM bp.submodule_name
  )
  UNION ALL
  -- User-Overrides (überschreiben Basis-Berechtigungen)
  SELECT uo.* FROM user_overrides uo;
END;
$$;