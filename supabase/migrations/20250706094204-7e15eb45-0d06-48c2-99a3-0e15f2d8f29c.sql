-- Erweitere das Einstellungsmodul um Sub-Module
INSERT INTO public.permission_modules (name, module_key, description, parent_module_id) VALUES
('Benutzereinstellungen', 'user_settings', 'Persönliche Profileinstellungen', 
 (SELECT id FROM permission_modules WHERE module_key = 'settings')),
('Systemeinstellungen', 'system_settings', 'Globale Systemkonfiguration', 
 (SELECT id FROM permission_modules WHERE module_key = 'settings')),
('Sicherheitseinstellungen', 'security_settings', 'Passwort- und Sicherheitsrichtlinien', 
 (SELECT id FROM permission_modules WHERE module_key = 'settings')),
('Firmeneinstellungen', 'company_settings', 'Firmeninformationen und Branding', 
 (SELECT id FROM permission_modules WHERE module_key = 'settings')),
('Benachrichtigungseinstellungen', 'notification_settings', 'E-Mail und Push-Benachrichtigungen', 
 (SELECT id FROM permission_modules WHERE module_key = 'settings')),
('Integrationseinstellungen', 'integration_settings', 'API-Schlüssel und externe Integrationen', 
 (SELECT id FROM permission_modules WHERE module_key = 'settings')),
('Backup & Export', 'backup_export', 'Datensicherung und Datenexport', 
 (SELECT id FROM permission_modules WHERE module_key = 'settings'))
ON CONFLICT (module_key) DO NOTHING;

-- Füge granulare Berechtigungen für Sub-Module hinzu
INSERT INTO public.role_permission_matrix (role, module_name, is_visible, allowed_actions, visible_fields, editable_fields, allowed_notifications) VALUES

-- SUPERADMIN - Vollzugriff auf alle Einstellungen
('superadmin', 'Benutzereinstellungen', true, ARRAY['view', 'create', 'edit', 'delete', 'reset'], '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Systemeinstellungen', true, ARRAY['view', 'edit', 'backup', 'restore'], '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Sicherheitseinstellungen', true, ARRAY['view', 'edit', 'audit'], '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Firmeneinstellungen', true, ARRAY['view', 'edit', 'upload'], '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Benachrichtigungseinstellungen', true, ARRAY['view', 'edit', 'test'], '{"all": true}', '{"all": true}', ARRAY[]::TEXT[]),
('superadmin', 'Integrationseinstellungen', true, ARRAY['view', 'create', 'edit', 'delete', 'test'], '{"all": true}', '{"all": true}', ARRAY['email']),
('superadmin', 'Backup & Export', true, ARRAY['view', 'backup', 'restore', 'export'], '{"all": true}', '{"all": true}', ARRAY['email']),

-- ADMIN - Eingeschränkter Zugriff
('admin', 'Benutzereinstellungen', true, ARRAY['view', 'edit'], '{"limited": true}', '{"limited": true}', ARRAY['email']),
('admin', 'Systemeinstellungen', false, ARRAY[]::TEXT[], '{}', '{}', ARRAY[]::TEXT[]),
('admin', 'Sicherheitseinstellungen', true, ARRAY['view'], '{"limited": true}', '{}', ARRAY[]::TEXT[]),
('admin', 'Firmeneinstellungen', true, ARRAY['view', 'edit'], '{"all": true}', '{"limited": true}', ARRAY['email']),
('admin', 'Benachrichtigungseinstellungen', true, ARRAY['view', 'edit'], '{"all": true}', '{"all": true}', ARRAY[]::TEXT[]),
('admin', 'Integrationseinstellungen', false, ARRAY[]::TEXT[], '{}', '{}', ARRAY[]::TEXT[]),
('admin', 'Backup & Export', true, ARRAY['view', 'export'], '{"limited": true}', '{}', ARRAY[]::TEXT[]),

-- EMPLOYEE - Nur persönliche Einstellungen
('employee', 'Benutzereinstellungen', true, ARRAY['view', 'edit'], '{"own": true}', '{"own": true}', ARRAY[]::TEXT[]),
('employee', 'Systemeinstellungen', false, ARRAY[]::TEXT[], '{}', '{}', ARRAY[]::TEXT[]),
('employee', 'Sicherheitseinstellungen', true, ARRAY['view'], '{"own": true}', '{"own": true}', ARRAY[]::TEXT[]),
('employee', 'Firmeneinstellungen', true, ARRAY['view'], '{"public": true}', '{}', ARRAY[]::TEXT[]),
('employee', 'Benachrichtigungseinstellungen', true, ARRAY['view', 'edit'], '{"own": true}', '{"own": true}', ARRAY[]::TEXT[]),
('employee', 'Integrationseinstellungen', false, ARRAY[]::TEXT[], '{}', '{}', ARRAY[]::TEXT[]),
('employee', 'Backup & Export', true, ARRAY['export'], '{"own": true}', '{}', ARRAY[]::TEXT[])

ON CONFLICT (role, module_name) DO NOTHING;