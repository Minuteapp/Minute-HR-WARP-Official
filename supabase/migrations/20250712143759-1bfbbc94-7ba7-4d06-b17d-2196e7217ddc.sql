-- Beispieldaten für Enterprise Benutzerverwaltung

-- Beispieldaten für Permission Modules
INSERT INTO public.permission_modules (name, module_key, display_name, description) VALUES
('users', 'users', 'Benutzerverwaltung', 'Verwaltung von Benutzern und Rollen'),
('employees', 'employees', 'Mitarbeiterverwaltung', 'Verwaltung von Mitarbeiterdaten'),
('documents', 'documents', 'Dokumentenverwaltung', 'Upload und Verwaltung von Dokumenten'),
('projects', 'projects', 'Projektverwaltung', 'Verwaltung von Projekten und Aufgaben'),
('calendar', 'calendar', 'Kalender', 'Terminverwaltung und Kalender'),
('settings', 'settings', 'Einstellungen', 'Systemeinstellungen und Konfiguration')
ON CONFLICT (module_key) DO NOTHING;

-- Rechtematrix für verschiedene Rollen
INSERT INTO public.role_permission_matrix (role, module_name, is_visible, allowed_actions) VALUES
('superadmin', 'users', true, ARRAY['view', 'create', 'edit', 'delete', 'manage_roles']),
('superadmin', 'employees', true, ARRAY['view', 'create', 'edit', 'delete', 'export']),
('superadmin', 'documents', true, ARRAY['view', 'upload', 'edit', 'delete', 'manage']),
('superadmin', 'projects', true, ARRAY['view', 'create', 'edit', 'delete', 'assign']),
('superadmin', 'calendar', true, ARRAY['view', 'create', 'edit', 'delete']),
('superadmin', 'settings', true, ARRAY['view', 'edit', 'system_config']),

('admin', 'users', true, ARRAY['view', 'create', 'edit']),
('admin', 'employees', true, ARRAY['view', 'create', 'edit', 'export']),
('admin', 'documents', true, ARRAY['view', 'upload', 'edit', 'delete']),
('admin', 'projects', true, ARRAY['view', 'create', 'edit', 'assign']),
('admin', 'calendar', true, ARRAY['view', 'create', 'edit']),
('admin', 'settings', true, ARRAY['view', 'edit']),

('manager', 'users', true, ARRAY['view']),
('manager', 'employees', true, ARRAY['view', 'edit']),
('manager', 'documents', true, ARRAY['view', 'upload', 'edit']),
('manager', 'projects', true, ARRAY['view', 'create', 'edit', 'assign']),
('manager', 'calendar', true, ARRAY['view', 'create', 'edit']),
('manager', 'settings', true, ARRAY['view']),

('employee', 'users', false, ARRAY[]::text[]),
('employee', 'employees', true, ARRAY['view']),
('employee', 'documents', true, ARRAY['view', 'upload']),
('employee', 'projects', true, ARRAY['view', 'edit']),
('employee', 'calendar', true, ARRAY['view', 'create']),
('employee', 'settings', true, ARRAY['view'])
ON CONFLICT (role, module_name) DO NOTHING;

-- Rollen-Templates
INSERT INTO public.role_templates (role_name, display_name, description, base_template, is_system_role, hierarchy_level) VALUES
('superadmin', 'Super Administrator', 'Vollzugriff auf alle Systembereiche', 'superadmin', true, 10),
('admin', 'Administrator', 'Erweiterte Verwaltungsrechte', 'admin', true, 8),
('ceo', 'Chief Executive Officer', 'Geschäftsführung mit Vollzugriff', 'admin', false, 9),
('cfo', 'Chief Financial Officer', 'Finanzvorstand mit erweiterten Rechten', 'manager', false, 7),
('cto', 'Chief Technology Officer', 'Technischer Leiter', 'manager', false, 7),
('manager', 'Manager', 'Team- und Projektleitung', 'manager', true, 5),
('employee', 'Mitarbeiter', 'Standard-Mitarbeiterrechte', 'employee', true, 1)
ON CONFLICT (role_name) DO NOTHING;

-- Feature Flags
INSERT INTO public.feature_flags (flag_key, flag_name, description, module_name, required_role_level, is_active, rollout_percentage) VALUES
('advanced_reporting', 'Erweiterte Berichte', 'Zugriff auf erweiterte Berichtsfunktionen', 'reports', 5, true, 100),
('beta_features', 'Beta-Features', 'Zugriff auf experimentelle Funktionen', 'system', 8, false, 10),
('api_access', 'API-Zugriff', 'Verwendung der REST-API', 'system', 5, true, 50),
('bulk_operations', 'Massenoperationen', 'Bulk-Import und -Export', 'data', 5, true, 100),
('advanced_security', 'Erweiterte Sicherheit', '2FA und erweiterte Sicherheitsfeatures', 'security', 8, true, 100)
ON CONFLICT (flag_key) DO NOTHING;