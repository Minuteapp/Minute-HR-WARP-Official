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