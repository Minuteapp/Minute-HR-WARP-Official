-- Spalte hinzufügen und Beispieldaten einfügen
ALTER TABLE public.permission_modules ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Module hinzufügen (ohne sort_order falls es Probleme gibt)
INSERT INTO public.permission_modules (name, description) VALUES
('Mitarbeiter', 'Mitarbeiterverwaltung und Profile'),
('Zeiterfassung', 'Arbeitszeit und Überstunden'),
('Dokumente', 'Dokumentenverwaltung und Freigaben'),
('Budget & Forecast', 'Budgetplanung und Prognosen'),
('Projekte', 'Projektmanagement und Roadmaps'),
('Abwesenheiten', 'Urlaub und Krankmeldungen'),
('Performance', 'Leistungsbeurteilungen und Ziele'),
('Benachrichtigungen', 'Push- und E-Mail-Benachrichtigungen'),
('Einstellungen', 'Systemeinstellungen und Konfiguration'),
('KI & Automationen', 'KI-Features und Workflow-Automationen')
ON CONFLICT DO NOTHING;

-- Einfache Rechtematrix für Superadmin
INSERT INTO public.role_permission_matrix (role, module_name, is_visible, allowed_actions) VALUES
('superadmin', 'Mitarbeiter', true, ARRAY['view', 'create', 'edit', 'delete', 'export']),
('superadmin', 'Zeiterfassung', true, ARRAY['view', 'edit', 'approve', 'export']),
('superadmin', 'Dokumente', true, ARRAY['view', 'upload', 'export', 'delete']),
('superadmin', 'Budget & Forecast', true, ARRAY['view', 'create', 'edit', 'simulate']),
('superadmin', 'Projekte', true, ARRAY['view', 'create', 'edit', 'delete']),
('admin', 'Mitarbeiter', true, ARRAY['view', 'create', 'edit']),
('admin', 'Zeiterfassung', true, ARRAY['view', 'approve']),
('manager', 'Mitarbeiter', true, ARRAY['view', 'edit']),
('manager', 'Zeiterfassung', true, ARRAY['view', 'approve']),
('employee', 'Mitarbeiter', true, ARRAY['view']),
('employee', 'Zeiterfassung', true, ARRAY['view'])
ON CONFLICT (role, module_name) DO NOTHING;