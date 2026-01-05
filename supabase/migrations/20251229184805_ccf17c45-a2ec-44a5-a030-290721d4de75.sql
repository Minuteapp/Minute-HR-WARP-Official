-- company_id nullable machen für globale Berechtigungseinträge
ALTER TABLE permission_modules ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE role_permission_matrix ALTER COLUMN company_id DROP NOT NULL;

-- Globale Berechtigungsdaten einfügen (company_id = NULL = gilt für alle)

-- Erst alte Daten löschen (falls vorhanden)
DELETE FROM role_permission_matrix WHERE company_id IS NULL;
DELETE FROM permission_modules WHERE company_id IS NULL;

-- permission_modules mit allen Mitarbeiter-Tab-Modulen befüllen
INSERT INTO permission_modules (module_key, name, description, is_active, module_type, company_id) VALUES
('employees', 'Mitarbeiter', 'Mitarbeiterverwaltung', true, 'main', NULL),
('employee_profile', 'Mitarbeiterprofil', 'Persönliche Daten und Stammdaten', true, 'tab', NULL),
('employee_documents', 'Dokumente', 'Mitarbeiterdokumente verwalten', true, 'tab', NULL),
('employee_payroll', 'Lohnabrechnung', 'Gehalts- und Lohndaten', true, 'tab', NULL),
('employee_time_tracking', 'Zeiterfassung', 'Arbeitszeiten und Stunden', true, 'tab', NULL),
('employee_absence', 'Abwesenheit', 'Urlaub, Krankheit, etc.', true, 'tab', NULL),
('employee_planning', 'Planung', 'Schicht- und Einsatzplanung', true, 'tab', NULL),
('employee_training', 'Schulungen', 'Weiterbildung und Trainings', true, 'tab', NULL),
('employee_goals', 'Ziele', 'Zielvereinbarungen', true, 'tab', NULL),
('employee_tasks', 'Aufgaben', 'Aufgabenverwaltung', true, 'tab', NULL),
('employee_projects', 'Projekte', 'Projektzuordnungen', true, 'tab', NULL),
('employee_expenses', 'Spesen', 'Spesenabrechnung', true, 'tab', NULL),
('employee_communication', 'Kommunikation', 'Nachrichten und Ankündigungen', true, 'tab', NULL),
('employee_compliance', 'Compliance', 'Richtlinien und Bestätigungen', true, 'tab', NULL),
('employee_skills', 'Qualifikationen', 'Fähigkeiten und Skills', true, 'tab', NULL),
('employee_fleet', 'Fuhrpark', 'Fahrzeugzuordnungen', true, 'tab', NULL),
('employee_travel', 'Geschäftsreisen', 'Reisemanagement', true, 'tab', NULL),
('employee_admin', 'Admin', 'Administrative Einstellungen', true, 'tab', NULL),
('employee_career', 'Karriere', 'Karriereentwicklung', true, 'tab', NULL),
('employee_onboarding', 'Onboarding', 'Einarbeitung', true, 'tab', NULL),
('employee_feedback', 'Feedback', '360-Grad-Feedback', true, 'tab', NULL),
('employee_certificates', 'Zertifikate', 'Zertifikatsverwaltung', true, 'tab', NULL),
('employee_hr_notes', 'HR-Notizen', 'Vertrauliche HR-Notizen', true, 'tab', NULL),
('employee_recognition', 'Anerkennung', 'Auszeichnungen und Lob', true, 'tab', NULL),
('employee_benefits', 'Benefits', 'Zusatzleistungen', true, 'tab', NULL),
('employee_health', 'Gesundheit', 'Gesundheitsmanagement', true, 'tab', NULL),
('employee_remote', 'Remote Work', 'Homeoffice-Regelungen', true, 'tab', NULL),
('employee_surveys', 'Umfragen', 'Mitarbeiterumfragen', true, 'tab', NULL),
('employee_notes', 'Notizen', 'Allgemeine Notizen', true, 'tab', NULL),
('employee_misc', 'Sonstiges', 'Weitere Informationen', true, 'tab', NULL),
('employee_performance', 'Leistung', 'Leistungsbewertung', true, 'tab', NULL),
('employee_equipment', 'Ausstattung', 'Arbeitsmittel', true, 'tab', NULL),
('employee_contracts', 'Verträge', 'Arbeitsverträge', true, 'tab', NULL),
('employee_banking', 'Bankdaten', 'Zahlungsinformationen', true, 'tab', NULL);

-- SuperAdmin: Alle Rechte auf allen Modulen
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 'superadmin', module_key, true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export'], NULL
FROM permission_modules WHERE company_id IS NULL;

-- Admin: Alle Standardrechte
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 'admin', module_key, true, ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export'], NULL
FROM permission_modules WHERE company_id IS NULL;

-- HR Manager: Erweiterte HR-Rechte
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 'hr_manager', module_key, true, 
  CASE 
    WHEN module_key IN ('employee_payroll', 'employee_banking', 'employee_contracts') THEN ARRAY['view', 'export']
    WHEN module_key IN ('employee_absence', 'employee_training', 'employee_expenses', 'employee_travel') THEN ARRAY['view', 'create', 'edit', 'delete', 'approve', 'export']
    ELSE ARRAY['view', 'create', 'edit', 'delete', 'export']
  END, NULL
FROM permission_modules WHERE company_id IS NULL;

-- Manager: Team-relevante Rechte
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 'manager', module_key, 
  CASE WHEN module_key IN ('employee_payroll', 'employee_banking', 'employee_hr_notes', 'employee_health') THEN false ELSE true END,
  CASE 
    WHEN module_key IN ('employee_payroll', 'employee_banking', 'employee_hr_notes', 'employee_health') THEN ARRAY[]::text[]
    WHEN module_key IN ('employee_absence', 'employee_expenses', 'employee_travel') THEN ARRAY['view', 'approve', 'export']
    WHEN module_key IN ('employee_tasks', 'employee_goals', 'employee_notes', 'employee_planning') THEN ARRAY['view', 'create', 'edit', 'export']
    ELSE ARRAY['view', 'export']
  END, NULL
FROM permission_modules WHERE company_id IS NULL;

-- Employee: Nur eigene Daten, eingeschränkte Rechte
INSERT INTO role_permission_matrix (role, module_name, is_visible, allowed_actions, company_id)
SELECT 'employee', module_key,
  CASE WHEN module_key IN ('employee_hr_notes', 'employee_admin') THEN false ELSE true END,
  CASE 
    WHEN module_key IN ('employee_hr_notes', 'employee_admin') THEN ARRAY[]::text[]
    WHEN module_key IN ('employee_absence', 'employee_expenses', 'employee_travel') THEN ARRAY['view', 'create', 'export']
    WHEN module_key IN ('employee_profile') THEN ARRAY['view', 'edit']
    WHEN module_key IN ('employee_notes', 'employee_tasks') THEN ARRAY['view', 'create', 'edit', 'delete']
    ELSE ARRAY['view']
  END, NULL
FROM permission_modules WHERE company_id IS NULL;