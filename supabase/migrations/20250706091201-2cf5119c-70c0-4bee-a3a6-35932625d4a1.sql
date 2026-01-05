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

-- Rechtematrix für Superadmin
INSERT INTO public.role_permission_matrix (role, module_name, is_visible, allowed_actions, visible_fields, editable_fields, allowed_notifications) VALUES
('superadmin', 'Mitarbeiter', true, 
 ARRAY['view', 'create', 'edit', 'delete', 'export'], 
 '{"all": true}', '{"all": true}', ARRAY['push', 'email']),
('superadmin', 'Zeiterfassung', true,
 ARRAY['view', 'edit', 'approve', 'export'], 
 '{"all": true}', '{"all": true}', ARRAY['push', 'email']),
('superadmin', 'Dokumente', true,
 ARRAY['view', 'upload', 'export', 'delete'], 
 '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Einstellungen', true,
 ARRAY['view', 'create', 'edit', 'delete'], 
 '{"all": true}', '{"all": true}', ARRAY[]::TEXT[])
ON CONFLICT (role, module_name) DO NOTHING;