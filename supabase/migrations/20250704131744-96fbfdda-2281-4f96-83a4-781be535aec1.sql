-- Granulares Berechtigungssystem für Enterprise-Level
CREATE TYPE permission_action AS ENUM (
  'view', 'create', 'edit', 'delete', 'export', 'approve', 'sign', 'archive', 'audit', 'manage'
);

CREATE TYPE permission_scope AS ENUM (
  'own', 'team', 'department', 'location', 'global'
);

-- Basis-Berechtigungssystem
CREATE TABLE IF NOT EXISTS permission_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  module_key TEXT UNIQUE NOT NULL,
  parent_module_id UUID REFERENCES permission_modules(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- UI-Elemente die gesteuert werden können
CREATE TABLE IF NOT EXISTS permission_ui_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES permission_modules(id) ON DELETE CASCADE,
  element_key TEXT NOT NULL,
  element_type TEXT NOT NULL, -- 'tab', 'button', 'field', 'section', 'widget'
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Granulare Berechtigungen pro Rolle
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module_id UUID REFERENCES permission_modules(id) ON DELETE CASCADE,
  action permission_action NOT NULL,
  scope permission_scope DEFAULT 'own',
  is_granted BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}', -- Dynamische Bedingungen
  field_restrictions JSONB DEFAULT '{}', -- Feld-Level Beschränkungen
  ui_restrictions JSONB DEFAULT '{}', -- UI-Element Beschränkungen
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, module_id, action, scope)
);

-- Benutzer-spezifische Überschreibungen
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID REFERENCES permission_modules(id) ON DELETE CASCADE,
  action permission_action NOT NULL,
  scope permission_scope DEFAULT 'own',
  is_granted BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '{}',
  field_restrictions JSONB DEFAULT '{}',
  ui_restrictions JSONB DEFAULT '{}',
  granted_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id, action, scope)
);

-- Berechtigungs-Templates
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_system_template BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit-Log für Berechtigungsänderungen
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'role', 'user', 'template'
  target_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Basis-Module einfügen
INSERT INTO permission_modules (name, module_key, description) VALUES
('Dashboard', 'dashboard', 'Hauptübersicht und Widgets'),
('Zeiterfassung', 'time_tracking', 'Arbeitszeiterfassung und -verwaltung'),
('Abwesenheit', 'absence', 'Urlaub und Abwesenheitsmanagement'),
('Krankmeldung', 'sick_leave', 'Krankmeldungen und Gesundheitsmanagement'),
('Aufgaben', 'tasks', 'Aufgaben- und Projektmanagement'),
('Projekte', 'projects', 'Projektmanagement und Planung'),
('Dokumente', 'documents', 'Dokumentenmanagement und DSGVO'),
('Lohn & Gehalt', 'payroll', 'Lohn- und Gehaltsabrechnung'),
('Recruiting', 'recruiting', 'Personalgewinnung und Bewerbermanagement'),
('Performance', 'performance', 'Leistungsbeurteilung und Entwicklung'),
('Mitarbeiter', 'employees', 'Mitarbeiterverwaltung'),
('Berichte', 'reports', 'Reporting und Analytics'),
('Einstellungen', 'settings', 'System- und Benutzereinstellungen'),
('Admin', 'admin', 'Systemadministration');

-- Untermodule hinzufügen
INSERT INTO permission_modules (name, module_key, parent_module_id, description) VALUES
('Schichtplanung', 'shift_planning', (SELECT id FROM permission_modules WHERE module_key = 'time_tracking'), 'Schichtplanung und -verwaltung'),
('Personalakte', 'employee_files', (SELECT id FROM permission_modules WHERE module_key = 'employees'), 'Personalakten und Dokumente'),
('Gehaltsbänder', 'salary_bands', (SELECT id FROM permission_modules WHERE module_key = 'payroll'), 'Gehaltsbänder und Bonusmodelle'),
('Bewerbermanagement', 'candidate_management', (SELECT id FROM permission_modules WHERE module_key = 'recruiting'), 'Bewerbungen und Kandidaten'),
('OKRs', 'okrs', (SELECT id FROM permission_modules WHERE module_key = 'performance'), 'Objectives & Key Results'),
('Budgetplanung', 'budget_planning', (SELECT id FROM permission_modules WHERE module_key = 'projects'), 'Projektbudget und Finanzplanung');

-- UI-Elemente für kritische Module
INSERT INTO permission_ui_elements (module_id, element_key, element_type, name, description) VALUES
((SELECT id FROM permission_modules WHERE module_key = 'payroll'), 'salary_tab', 'tab', 'Gehalt-Tab', 'Gehaltsinformationen in Mitarbeiterprofil'),
((SELECT id FROM permission_modules WHERE module_key = 'payroll'), 'bonus_button', 'button', 'Bonus-Button', 'Button für Bonusberechnungen'),
((SELECT id FROM permission_modules WHERE module_key = 'payroll'), 'salary_field', 'field', 'Gehaltsfeld', 'Bruttogehalt-Anzeige'),
((SELECT id FROM permission_modules WHERE module_key = 'employees'), 'personal_data_section', 'section', 'Personaldaten', 'Persönliche Mitarbeiterdaten'),
((SELECT id FROM permission_modules WHERE module_key = 'employees'), 'emergency_contact_field', 'field', 'Notfallkontakt', 'Notfallkontakt-Informationen'),
((SELECT id FROM permission_modules WHERE module_key = 'performance'), 'performance_review_tab', 'tab', 'Bewertungen-Tab', 'Leistungsbeurteilungen'),
((SELECT id FROM permission_modules WHERE module_key = 'projects'), 'budget_widget', 'widget', 'Budget-Widget', 'Projektbudget-Übersicht'),
((SELECT id FROM permission_modules WHERE module_key = 'admin'), 'user_management_section', 'section', 'Benutzerverwaltung', 'Benutzer- und Rollenverwaltung');

-- Standard-Berechtigungen für Rollen definieren
INSERT INTO role_permissions (role, module_id, action, scope, is_granted) VALUES
-- Employee (Mitarbeiter) - Grundrechte
('employee', (SELECT id FROM permission_modules WHERE module_key = 'dashboard'), 'view', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'time_tracking'), 'view', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'time_tracking'), 'create', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'time_tracking'), 'edit', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'absence'), 'view', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'absence'), 'create', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'tasks'), 'view', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'tasks'), 'create', 'own', true),
('employee', (SELECT id FROM permission_modules WHERE module_key = 'tasks'), 'edit', 'own', true),

-- Manager - Erweiterte Team-Rechte
('manager', (SELECT id FROM permission_modules WHERE module_key = 'dashboard'), 'view', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'time_tracking'), 'view', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'time_tracking'), 'approve', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'absence'), 'view', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'absence'), 'approve', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'projects'), 'view', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'projects'), 'create', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'projects'), 'edit', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'performance'), 'view', 'team', true),
('manager', (SELECT id FROM permission_modules WHERE module_key = 'performance'), 'create', 'team', true),

-- HR - Personal-spezifische Rechte
('hr', (SELECT id FROM permission_modules WHERE module_key = 'employees'), 'view', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'employees'), 'create', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'employees'), 'edit', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'recruiting'), 'view', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'recruiting'), 'create', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'recruiting'), 'edit', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'performance'), 'view', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'absence'), 'view', 'global', true),
('hr', (SELECT id FROM permission_modules WHERE module_key = 'absence'), 'approve', 'global', true),

-- Admin - Fast alle Rechte
('admin', (SELECT id FROM permission_modules WHERE module_key = 'dashboard'), 'view', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'time_tracking'), 'manage', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'absence'), 'manage', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'employees'), 'manage', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'projects'), 'manage', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'documents'), 'manage', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'reports'), 'view', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'settings'), 'view', 'global', true),
('admin', (SELECT id FROM permission_modules WHERE module_key = 'settings'), 'edit', 'global', true),

-- Superadmin - Vollzugriff
('superadmin', (SELECT id FROM permission_modules WHERE module_key = 'dashboard'), 'manage', 'global', true),
('superadmin', (SELECT id FROM permission_modules WHERE module_key = 'admin'), 'manage', 'global', true),
('superadmin', (SELECT id FROM permission_modules WHERE module_key = 'settings'), 'manage', 'global', true);

-- Standard-Templates erstellen
INSERT INTO permission_templates (name, description, template_data, is_system_template) VALUES
('HRBP Global', 'HR Business Partner mit globalen Rechten', 
 '{"modules": {"employees": {"view": "global", "edit": "global"}, "recruiting": {"manage": "global"}, "performance": {"view": "global", "create": "team"}}}', 
 true),
('Manager Germany', 'Führungskraft Deutschland mit erweiterten Team-Rechten',
 '{"modules": {"projects": {"manage": "team"}, "absence": {"approve": "team"}, "performance": {"manage": "team"}}, "conditions": {"location": "DE"}}',
 true),
('Payroll Specialist', 'Lohn- und Gehaltsabrechnung Spezialist',
 '{"modules": {"payroll": {"manage": "global"}, "employees": {"view": "global"}}, "ui_elements": {"salary_tab": true, "bonus_button": true}}',
 true);

-- RLS Policies
ALTER TABLE permission_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_ui_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies für Berechtigungen - Admins können alles verwalten
CREATE POLICY "Admins can manage all permissions" ON permission_modules
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "All users can view permission modules" ON permission_modules
FOR SELECT USING (true);

CREATE POLICY "Admins can manage UI elements" ON permission_ui_elements
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "All users can view UI elements" ON permission_ui_elements
FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON role_permissions
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Users can view role permissions" ON role_permissions
FOR SELECT USING (true);

CREATE POLICY "Admins can manage user overrides" ON user_permission_overrides
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Users can view their own overrides" ON user_permission_overrides
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage templates" ON permission_templates
FOR ALL USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "All users can view templates" ON permission_templates
FOR SELECT USING (true);

CREATE POLICY "Admins can view audit logs" ON permission_audit_log
FOR SELECT USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Funktion zum Auditieren von Änderungen
CREATE OR REPLACE FUNCTION log_permission_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO permission_audit_log (
    action, target_type, target_id, old_values, new_values, changed_by
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Audit-Logging
CREATE TRIGGER role_permissions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION log_permission_change();

CREATE TRIGGER user_permission_overrides_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_permission_overrides
  FOR EACH ROW EXECUTE FUNCTION log_permission_change();