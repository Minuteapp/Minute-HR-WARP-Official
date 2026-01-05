-- Beispieldaten für die Rechtematrix basierend auf dem Blueprint

-- Module hinzufügen
INSERT INTO public.permission_modules (name, description, sort_order) VALUES
('Mitarbeiter', 'Mitarbeiterverwaltung und Profile', 1),
('Zeiterfassung', 'Arbeitszeit und Überstunden', 2),
('Dokumente', 'Dokumentenverwaltung und Freigaben', 3),
('Budget & Forecast', 'Budgetplanung und Prognosen', 4),
('Projekte', 'Projektmanagement und Roadmaps', 5),
('Abwesenheiten', 'Urlaub und Krankmeldungen', 6),
('Performance', 'Leistungsbeurteilungen und Ziele', 7),
('Benachrichtigungen', 'Push- und E-Mail-Benachrichtigungen', 8),
('Einstellungen', 'Systemeinstellungen und Konfiguration', 9),
('KI & Automationen', 'KI-Features und Workflow-Automationen', 10)
ON CONFLICT (name) DO NOTHING;

-- Basis-Rechtematrix für verschiedene Rollen
INSERT INTO public.role_permission_matrix (role, module_name, is_visible, allowed_actions, visible_fields, editable_fields, allowed_notifications, workflow_triggers) VALUES

-- SUPERADMIN: Vollzugriff auf alles
('superadmin', 'Mitarbeiter', true, 
 ARRAY['view', 'create', 'edit', 'delete', 'export', 'archive'], 
 '{"personalInfo": true, "salary": true, "performance": true, "goals": true, "absences": true}',
 '{"personalInfo": true, "salary": true, "performance": true, "goals": true}',
 ARRAY['push', 'email', 'sms'],
 ARRAY['onNewEmployee', 'onPerformanceUpdate']),

('superadmin', 'Zeiterfassung', true,
 ARRAY['view', 'edit', 'approve', 'export', 'correct'],
 '{"timeEntries": true, "overtime": true, "corrections": true, "reports": true}',
 '{"timeEntries": true, "overtime": true, "corrections": true}',
 ARRAY['push', 'email'],
 ARRAY['onOvertimeExceeded', 'onMissingTime']),

('superadmin', 'Budget & Forecast', true,
 ARRAY['view', 'create', 'edit', 'simulate', 'export'],
 '{"budgets": true, "forecasts": true, "scenarios": true, "analytics": true}',
 '{"budgets": true, "forecasts": true, "scenarios": true}',
 ARRAY['email'],
 ARRAY['onBudgetDeviation']),

-- ADMIN: Erweiterte Rechte ohne Simulation
('admin', 'Mitarbeiter', true,
 ARRAY['view', 'create', 'edit', 'export'],
 '{"personalInfo": true, "performance": true, "goals": true, "absences": true}',
 '{"personalInfo": true, "performance": true, "goals": true}',
 ARRAY['push', 'email'],
 ARRAY['onNewEmployee']),

('admin', 'Zeiterfassung', true,
 ARRAY['view', 'approve', 'export'],
 '{"timeEntries": true, "overtime": true, "reports": true}',
 '{"overtime": true}',
 ARRAY['push', 'email'],
 ARRAY['onOvertimeExceeded']),

('admin', 'Dokumente', true,
 ARRAY['view', 'upload', 'export'],
 '{"allDocuments": true, "signatures": true}',
 '{"allDocuments": true}',
 ARRAY['email'],
 ARRAY['onDocumentSigned']),

-- MANAGER: Team-spezifische Rechte
('manager', 'Mitarbeiter', true,
 ARRAY['view', 'edit'],
 '{"personalInfo": true, "performance": true, "goals": true}',
 '{"performance": true, "goals": true}',
 ARRAY['push', 'email'],
 ARRAY['onPerformanceUpdate']),

('manager', 'Zeiterfassung', true,
 ARRAY['view', 'approve'],
 '{"teamTimeEntries": true, "overtime": true}',
 '{"overtime": false}',
 ARRAY['push'],
 ARRAY['onOvertimeExceeded']),

('manager', 'Performance', true,
 ARRAY['view', 'create', 'edit'],
 '{"teamPerformance": true, "goals": true, "reviews": true}',
 '{"goals": true, "reviews": true}',
 ARRAY['push', 'email'],
 ARRAY['onGoalMissed']),

-- EMPLOYEE: Basis-Rechte für eigene Daten
('employee', 'Mitarbeiter', true,
 ARRAY['view'],
 '{"ownProfile": true, "ownAbsences": true}',
 '{"ownProfile": false}',
 ARRAY['push', 'email'],
 ARRAY[]),

('employee', 'Zeiterfassung', true,
 ARRAY['view'],
 '{"ownTimeEntries": true, "ownOvertime": true}',
 '{"ownTimeEntries": false}',
 ARRAY['push'],
 ARRAY[]),

('employee', 'Dokumente', true,
 ARRAY['view', 'sign'],
 '{"ownDocuments": true, "contracts": true}',
 '{"signatures": true}',
 ARRAY['push', 'email'],
 ARRAY['onDocumentSigned']),

('employee', 'Abwesenheiten', true,
 ARRAY['view', 'create'],
 '{"ownAbsences": true, "balance": true}',
 '{"absenceRequests": true}',
 ARRAY['push', 'email'],
 ARRAY[])

ON CONFLICT (role, module_name) DO NOTHING;