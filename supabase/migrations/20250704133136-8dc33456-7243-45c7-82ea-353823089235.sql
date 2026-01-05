-- Basis-Module für das Berechtigungssystem initialisieren
INSERT INTO permission_modules (name, module_key, description, is_active) VALUES
  ('Dashboard', 'dashboard', 'Übersichtsseite und zentrale Navigation', true),
  ('Zeiterfassung', 'time_tracking', 'Arbeitszeiten erfassen und verwalten', true),  
  ('Abwesenheit', 'absence', 'Abwesenheitsanträge und Urlaubsverwaltung', true),
  ('Aufgaben', 'tasks', 'Aufgabenverwaltung und To-Do-Listen', true),
  ('Projekte', 'projects', 'Projektmanagement und Projektplanung', true),
  ('Dokumente', 'documents', 'Dokumentenverwaltung und Dateispeicher', true),
  ('Lohn & Gehalt', 'payroll', 'Gehaltsabrechnung und Lohnverwaltung', true),
  ('Recruiting', 'recruiting', 'Bewerbermanagement und Stellenausschreibungen', true),
  ('Performance', 'performance', 'Leistungsbewertung und Zielmanagement', true),
  ('Einstellungen', 'settings', 'Systemeinstellungen und Konfiguration', true),
  ('Mitarbeiter', 'employees', 'Mitarbeiterverwaltung und Profile', true),
  ('Berichte', 'reports', 'Berichte und Statistiken', true)
ON CONFLICT (module_key) DO NOTHING;

-- Standard-Berechtigungen für die Rolle 'employee' erstellen
WITH modules AS (
  SELECT id, module_key FROM permission_modules 
  WHERE module_key IN ('dashboard', 'time_tracking', 'absence', 'tasks', 'documents', 'employees')
)
INSERT INTO role_permissions (role, module_id, action, scope, is_granted)
SELECT 
  'employee' as role,
  modules.id as module_id,
  actions.action,
  'own' as scope,
  CASE 
    WHEN modules.module_key = 'dashboard' AND actions.action = 'view' THEN true
    WHEN modules.module_key = 'time_tracking' AND actions.action IN ('view', 'create', 'edit') THEN true
    WHEN modules.module_key = 'absence' AND actions.action IN ('view', 'create', 'edit') THEN true
    WHEN modules.module_key = 'tasks' AND actions.action IN ('view', 'create', 'edit') THEN true
    WHEN modules.module_key = 'documents' AND actions.action IN ('view', 'create') THEN true
    WHEN modules.module_key = 'employees' AND actions.action = 'view' THEN true
    ELSE false
  END as is_granted
FROM modules
CROSS JOIN (
  VALUES ('view'), ('create'), ('edit'), ('delete'), ('export'), ('approve')
) AS actions(action)
ON CONFLICT (role, module_id, action, scope) DO NOTHING;

-- Standard-Berechtigungen für die Rolle 'admin' erstellen
WITH modules AS (
  SELECT id, module_key FROM permission_modules WHERE is_active = true
)
INSERT INTO role_permissions (role, module_id, action, scope, is_granted)
SELECT 
  'admin' as role,
  modules.id as module_id,
  actions.action,
  'global' as scope,
  true as is_granted
FROM modules
CROSS JOIN (
  VALUES ('view'), ('create'), ('edit'), ('delete'), ('export'), ('approve'), ('manage')
) AS actions(action)
ON CONFLICT (role, module_id, action, scope) DO NOTHING;

-- Standard-Berechtigungen für die Rolle 'superadmin' erstellen  
WITH modules AS (
  SELECT id, module_key FROM permission_modules WHERE is_active = true
)
INSERT INTO role_permissions (role, module_id, action, scope, is_granted)
SELECT 
  'superadmin' as role,
  modules.id as module_id,
  actions.action,
  'global' as scope,
  true as is_granted
FROM modules
CROSS JOIN (
  VALUES ('view'), ('create'), ('edit'), ('delete'), ('export'), ('approve'), ('manage', 'audit')
) AS actions(action)
ON CONFLICT (role, module_id, action, scope) DO NOTHING;