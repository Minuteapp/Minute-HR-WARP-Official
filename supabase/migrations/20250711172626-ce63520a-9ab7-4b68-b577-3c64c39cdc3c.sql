-- Erweiterte granulare Rechtematrix mit Submodulen (korrigiert)

-- Erweitere permission_modules für Submodule
ALTER TABLE public.permission_modules 
ADD COLUMN IF NOT EXISTS parent_module_id UUID REFERENCES public.permission_modules(id),
ADD COLUMN IF NOT EXISTS module_type TEXT DEFAULT 'main',
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';

-- Erweitere role_permission_matrix für maximale Granularität
ALTER TABLE public.role_permission_matrix 
ADD COLUMN IF NOT EXISTS field_permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approval_permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS automation_permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS report_permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS audit_permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS special_permissions JSONB DEFAULT '{}';

-- Neue Tabelle für granulare Action-Definitionen
CREATE TABLE IF NOT EXISTS public.permission_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key TEXT NOT NULL UNIQUE,
  action_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'standard',
  requires_approval BOOLEAN DEFAULT false,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Neue Tabelle für Approval-Workflows
CREATE TABLE IF NOT EXISTS public.approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  submodule_name TEXT,
  action_key TEXT NOT NULL,
  required_roles TEXT[] DEFAULT '{}',
  approval_chain JSONB DEFAULT '[]',
  conditions JSONB DEFAULT '{}',
  auto_approve_conditions JSONB DEFAULT '{}',
  escalation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Neue Tabelle für Field-Level Permissions
CREATE TABLE IF NOT EXISTS public.field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  submodule_name TEXT,
  field_name TEXT NOT NULL,
  role TEXT NOT NULL,
  permission_type TEXT NOT NULL, -- 'read', 'write', 'hidden'
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(module_name, submodule_name, field_name, role)
);

-- Aktualisiere bestehende Module
UPDATE public.permission_modules SET 
  module_type = 'main',
  icon = CASE 
    WHEN module_key = 'employees' THEN 'Users'
    WHEN module_key = 'time_tracking' THEN 'Clock'
    WHEN module_key = 'documents' THEN 'FileText'
    WHEN module_key = 'budget_forecast' THEN 'TrendingUp'
    WHEN module_key = 'projects' THEN 'Briefcase'
    WHEN module_key = 'absences' THEN 'Calendar'
    WHEN module_key = 'performance' THEN 'Target'
    WHEN module_key = 'notifications' THEN 'Bell'
    WHEN module_key = 'settings' THEN 'Settings'
    WHEN module_key = 'ai_automation' THEN 'Brain'
    ELSE 'Circle'
  END,
  color = CASE 
    WHEN module_key = 'employees' THEN '#3B82F6'
    WHEN module_key = 'time_tracking' THEN '#10B981'
    WHEN module_key = 'documents' THEN '#F59E0B'
    WHEN module_key = 'budget_forecast' THEN '#06B6D4'
    WHEN module_key = 'projects' THEN '#EF4444'
    WHEN module_key = 'absences' THEN '#059669'
    WHEN module_key = 'performance' THEN '#0EA5E9'
    WHEN module_key = 'notifications' THEN '#6366F1'
    WHEN module_key = 'settings' THEN '#6B7280'
    WHEN module_key = 'ai_automation' THEN '#EC4899'
    ELSE '#3B82F6'
  END;

-- Füge neue Module hinzu
INSERT INTO public.permission_modules (name, module_key, description, module_type, icon, color) VALUES
('Kalender', 'calendar', 'Termine und Planung', 'main', 'Calendar', '#8B5CF6'),
('Roadmap', 'roadmap', 'Strategische Planung und Meilensteine', 'main', 'Map', '#84CC16'),
('Innovation Hub', 'innovation', 'Ideen und Innovationsmanagement', 'main', 'Lightbulb', '#F97316'),
('Umwelt', 'environment', 'ESG und Nachhaltigkeit', 'main', 'Leaf', '#22C55E'),
('Compliance', 'compliance', 'DSGVO und Compliance', 'main', 'Shield', '#DC2626'),
('Workforce Planning', 'workforce_planning', 'Personalplanung und Forecasting', 'main', 'Users', '#7C3AED')
ON CONFLICT (module_key) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  module_type = EXCLUDED.module_type;

-- Submodule für Mitarbeiter
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
  ('Stammdaten', 'employee_master_data', 'Grundlegende Mitarbeiterdaten', 'User', '#3B82F6'),
  ('Verträge', 'employee_contracts', 'Arbeitsverträge und Dokumentation', 'FileText', '#3B82F6'),
  ('Ziele', 'employee_goals', 'Mitarbeiterziele und Performance', 'Target', '#3B82F6'),
  ('Gehaltsdaten', 'employee_salary', 'Lohn- und Gehaltsinformationen', 'DollarSign', '#3B82F6')
) AS submodule(name, module_key, description, icon, color)
JOIN public.permission_modules parent ON parent.module_key = 'employees'
WHERE parent.module_type = 'main'
ON CONFLICT (module_key) DO NOTHING;

-- Submodule für Zeiterfassung
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
  ('Tageserfassung', 'daily_time_tracking', 'Tägliche Zeiterfassung', 'Clock', '#10B981'),
  ('Überstunden', 'overtime_management', 'Überstundenverwaltung', 'Plus', '#10B981'),
  ('Auswertungen', 'time_reports', 'Zeitauswertungen und Reports', 'BarChart', '#10B981')
) AS submodule(name, module_key, description, icon, color)
JOIN public.permission_modules parent ON parent.module_key = 'time_tracking'
WHERE parent.module_type = 'main'
ON CONFLICT (module_key) DO NOTHING;

-- Granulare Aktionen definieren
INSERT INTO public.permission_actions (action_key, action_name, description, category, requires_approval, risk_level) VALUES
-- Standard CRUD
('view', 'Anzeigen', 'Daten anzeigen und lesen', 'standard', false, 'low'),
('create', 'Erstellen', 'Neue Einträge erstellen', 'standard', false, 'medium'),
('edit', 'Bearbeiten', 'Bestehende Daten ändern', 'standard', false, 'medium'),
('delete', 'Löschen', 'Daten löschen', 'standard', true, 'high'),
('export', 'Exportieren', 'Daten exportieren (CSV, PDF, Excel)', 'standard', false, 'medium'),

-- Genehmigungen
('approve', 'Genehmigen', 'Anträge und Änderungen genehmigen', 'approval', false, 'high'),
('reject', 'Ablehnen', 'Anträge ablehnen', 'approval', false, 'medium'),
('escalate', 'Eskalieren', 'An höhere Instanz weiterleiten', 'approval', false, 'medium'),

-- Reports und Analytics
('view_reports', 'Reports anzeigen', 'Berichte und Auswertungen anzeigen', 'reporting', false, 'low'),
('create_reports', 'Reports erstellen', 'Neue Berichte erstellen', 'reporting', false, 'medium'),
('advanced_analytics', 'Erweiterte Analysen', 'Drilldown und erweiterte Analysen', 'reporting', false, 'medium'),

-- Audit und Compliance
('view_audit_log', 'Audit-Log anzeigen', 'Änderungsprotokoll einsehen', 'audit', false, 'medium'),
('gdpr_delete', 'DSGVO-Löschung', 'Daten DSGVO-konform löschen', 'compliance', true, 'high'),
('compliance_export', 'Compliance Export', 'Daten für Compliance exportieren', 'compliance', true, 'high'),

-- Automationen
('create_automation', 'Automation erstellen', 'Neue Workflows und Automationen erstellen', 'automation', false, 'medium'),
('trigger_automation', 'Automation auslösen', 'Workflows manuell starten', 'automation', false, 'medium'),
('manage_automation', 'Automation verwalten', 'Workflows bearbeiten und deaktivieren', 'automation', true, 'high'),

-- Spezielle Aktionen
('bulk_operations', 'Massenoperationen', 'Änderungen an mehreren Datensätzen', 'special', true, 'high'),
('system_admin', 'Systemadministration', 'Systemweite Konfigurationen', 'system', true, 'critical'),
('impersonate', 'Als Benutzer agieren', 'Als anderer Benutzer anmelden', 'system', true, 'critical')
ON CONFLICT (action_key) DO NOTHING;

-- RLS Policies
ALTER TABLE public.permission_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view permission actions" ON public.permission_actions FOR SELECT USING (true);
CREATE POLICY "Admins can manage permission actions" ON public.permission_actions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage approval workflows" ON public.approval_workflows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Admins can manage field permissions" ON public.field_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_permission_modules_parent ON public.permission_modules(parent_module_id);
CREATE INDEX IF NOT EXISTS idx_permission_modules_type ON public.permission_modules(module_type);
CREATE INDEX IF NOT EXISTS idx_field_permissions_module ON public.field_permissions(module_name, submodule_name);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_module ON public.approval_workflows(module_name, submodule_name);