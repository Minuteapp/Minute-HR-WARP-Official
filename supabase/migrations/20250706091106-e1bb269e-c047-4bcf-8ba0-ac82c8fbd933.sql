-- Module mit module_key hinzufügen
INSERT INTO public.permission_modules (name, module_key, description) VALUES
('Mitarbeiter', 'employees', 'Mitarbeiterverwaltung und Profile'),
('Zeiterfassung', 'time_tracking', 'Arbeitszeit und Überstunden'),
('Dokumente', 'documents', 'Dokumentenverwaltung und Freigaben'),
('Budget & Forecast', 'budget_forecast', 'Budgetplanung und Prognosen'),
('Projekte', 'projects', 'Projektmanagement und Roadmaps'),
('Abwesenheiten', 'absences', 'Urlaub und Krankmeldungen'),
('Performance', 'performance', 'Leistungsbeurteilungen und Ziele'),
('Benachrichtigungen', 'notifications', 'Push- und E-Mail-Benachrichtigungen'),
('Einstellungen', 'settings', 'Systemeinstellungen und Konfiguration'),
('KI & Automationen', 'ai_automation', 'KI-Features und Workflow-Automationen')
ON CONFLICT (module_key) DO NOTHING;

-- Rechtematrix für verschiedene Rollen
INSERT INTO public.role_permission_matrix (role, module_name, is_visible, allowed_actions, visible_fields, editable_fields, allowed_notifications) VALUES

-- SUPERADMIN
('superadmin', 'Mitarbeiter', true, 
 ARRAY['view', 'create', 'edit', 'delete', 'export'], 
 '{"all": true}', '{"all": true}', ARRAY['push', 'email']),
('superadmin', 'Zeiterfassung', true,
 ARRAY['view', 'edit', 'approve', 'export'], 
 '{"all": true}', '{"all": true}', ARRAY['push', 'email']),
('superadmin', 'Dokumente', true,
 ARRAY['view', 'upload', 'export', 'delete'], 
 '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Budget & Forecast', true,
 ARRAY['view', 'create', 'edit', 'simulate'], 
 '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Projekte', true,
 ARRAY['view', 'create', 'edit', 'delete'], 
 '{"all": true}', '{"all": true}', ARRAY['push']),
('superadmin', 'Einstellungen', true,
 ARRAY['view', 'create', 'edit', 'delete'], 
 '{"all": true}', '{"all": true}', ARRAY[]),

-- ADMIN
('admin', 'Mitarbeiter', true, 
 ARRAY['view', 'create', 'edit'], 
 '{"basic": true, "performance": true}', '{"basic": true}', ARRAY['push', 'email']),
('admin', 'Zeiterfassung', true,
 ARRAY['view', 'approve'], 
 '{"team": true, "reports": true}', '{"approvals": true}', ARRAY['push']),
('admin', 'Dokumente', true,
 ARRAY['view', 'upload', 'export'], 
 '{"all": true}', '{"upload": true}', ARRAY['email']),

-- MANAGER  
('manager', 'Mitarbeiter', true, 
 ARRAY['view', 'edit'], 
 '{"team": true, "performance": true}', '{"performance": true}', ARRAY['push']),
('manager', 'Zeiterfassung', true,
 ARRAY['view', 'approve'], 
 '{"team": true}', '{"approvals": true}', ARRAY['push']),
('manager', 'Performance', true,
 ARRAY['view', 'create', 'edit'], 
 '{"team": true}', '{"reviews": true}', ARRAY['email']),

-- EMPLOYEE
('employee', 'Mitarbeiter', true, 
 ARRAY['view'], 
 '{"own": true}', '{}', ARRAY['push', 'email']),
('employee', 'Zeiterfassung', true,
 ARRAY['view'], 
 '{"own": true}', '{}', ARRAY['push']),
('employee', 'Dokumente', true,
 ARRAY['view', 'sign'], 
 '{"own": true}', '{"sign": true}', ARRAY['email']),
('employee', 'Abwesenheiten', true,
 ARRAY['view', 'create'], 
 '{"own": true}', '{"requests": true}', ARRAY['push', 'email'])

ON CONFLICT (role, module_name) DO NOTHING;