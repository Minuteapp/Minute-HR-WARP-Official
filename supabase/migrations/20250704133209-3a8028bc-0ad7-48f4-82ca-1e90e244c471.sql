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
  ('Einstellungen', 'settings', 'Systemeinstellungen und Konfiguration', true)
ON CONFLICT (module_key) DO NOTHING;

-- Standard-Berechtigungen für 'employee' erstellen
WITH modules AS (SELECT id, module_key FROM permission_modules WHERE module_key IN ('dashboard', 'projects'))
INSERT INTO role_permissions (role, module_id, action, scope, is_granted)
SELECT 
  'employee',
  modules.id,
  'view'::permission_action,
  'own'::permission_scope,
  CASE WHEN modules.module_key = 'dashboard' THEN true ELSE false END
FROM modules
ON CONFLICT (role, module_id, action, scope) DO NOTHING;