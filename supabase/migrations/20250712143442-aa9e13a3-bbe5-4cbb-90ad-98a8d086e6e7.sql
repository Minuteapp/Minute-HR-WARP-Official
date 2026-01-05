-- Enterprise Benutzerverwaltung: Tabellen für Rollen-Templates, Berechtigungen und Feature Flags

-- 1. Permission Modules (Berechtigungsmodule)
CREATE TABLE IF NOT EXISTS public.permission_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  module_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  parent_module_id uuid REFERENCES public.permission_modules(id),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Role Permission Matrix (Rechtematrix)
CREATE TABLE IF NOT EXISTS public.role_permission_matrix (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role user_role NOT NULL,
  module_name text NOT NULL,
  is_visible boolean DEFAULT true,
  allowed_actions text[] DEFAULT '{}',
  visible_fields jsonb DEFAULT '{}',
  editable_fields jsonb DEFAULT '{}',
  allowed_notifications text[] DEFAULT '{}',
  workflow_triggers text[] DEFAULT '{}',
  conditions jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, module_name)
);

-- 3. Role Templates (Rollen-Vorlagen)
CREATE TABLE IF NOT EXISTS public.role_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  base_template text NOT NULL DEFAULT 'employee',
  is_system_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  permission_overrides jsonb DEFAULT '{}',
  hierarchy_level integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. User Permission Overrides (Individuelle Berechtigungen)
CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  module_name text NOT NULL,
  submodule_name text,
  action_key text NOT NULL,
  permission_type text NOT NULL CHECK (permission_type IN ('grant', 'deny', 'conditional')),
  override_reason text,
  conditions jsonb DEFAULT '{}',
  expires_at timestamp with time zone,
  granted_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key text NOT NULL UNIQUE,
  flag_name text NOT NULL,
  description text,
  module_name text,
  required_role_level integer DEFAULT 1,
  is_active boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS Policies aktivieren
ALTER TABLE public.permission_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permission_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Permission Modules
CREATE POLICY "Everyone can view permission modules"
ON public.permission_modules
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage permission modules"
ON public.permission_modules
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für Role Permission Matrix
CREATE POLICY "Everyone can view role permissions"
ON public.role_permission_matrix
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage role permissions"
ON public.role_permission_matrix
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für Role Templates
CREATE POLICY "Everyone can view role templates"
ON public.role_templates
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage role templates"
ON public.role_templates
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für User Permission Overrides
CREATE POLICY "Users can view their own overrides"
ON public.user_permission_overrides
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all overrides"
ON public.user_permission_overrides
FOR SELECT
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can manage overrides"
ON public.user_permission_overrides
FOR INSERT, UPDATE, DELETE
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- RLS Policies für Feature Flags
CREATE POLICY "Everyone can view active feature flags"
ON public.feature_flags
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (is_admin(auth.uid()) OR is_superadmin(auth.uid()));

-- Beispieldaten einfügen
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