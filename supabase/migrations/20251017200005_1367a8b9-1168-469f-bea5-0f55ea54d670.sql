-- Phase 1a: Tabellen erstellen (ohne RLS)

-- 1. Neue Tabelle für firmenspezifische Berechtigungen
CREATE TABLE IF NOT EXISTS public.company_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  permission_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  action_key TEXT NOT NULL,
  granted BOOLEAN DEFAULT true,
  inherits_from_global BOOLEAN DEFAULT true,
  override_global BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, role_name, permission_name, action_key)
);

CREATE INDEX IF NOT EXISTS idx_company_role_perms ON company_role_permissions(company_id, role_name);

-- 2. Erweitere user_role_preview_sessions
ALTER TABLE public.user_role_preview_sessions
  ADD COLUMN IF NOT EXISTS preview_company_id UUID REFERENCES public.companies(id);

-- 3. Audit-Log für Berechtigungs-Änderungen
CREATE TABLE IF NOT EXISTS public.permission_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  role_name TEXT,
  permission_name TEXT,
  action_key TEXT,
  old_value BOOLEAN,
  new_value BOOLEAN,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);