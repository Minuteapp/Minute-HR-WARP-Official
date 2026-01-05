-- =====================================================
-- PHASE 1: TENANT-KONTEXT-FUNKTIONEN (Security Definer)
-- Multi-Tenant Isolation Blueprint
-- =====================================================

-- 1.1 Zentrale Funktion: current_tenant_id()
-- Ermittelt den aktuellen Tenant-Kontext für die Session
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- 1. Prüfe Impersonation-Session (Superadmin Support)
  SELECT target_tenant_id INTO v_tenant_id
  FROM impersonation_sessions
  WHERE superadmin_id = auth.uid()
    AND status = 'active'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- 2. Prüfe aktive Tenant-Session (manueller Tenant-Wechsel)
  SELECT tenant_company_id INTO v_tenant_id
  FROM user_tenant_sessions
  WHERE user_id = auth.uid()
    AND is_tenant_mode = true
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- 3. Fallback: company_id aus user_roles (primäre Zuordnung)
  SELECT company_id INTO v_tenant_id
  FROM user_roles
  WHERE user_id = auth.uid()
    AND company_id IS NOT NULL
    AND role != 'superadmin'
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- 4. Fallback: company_id aus employees
  SELECT company_id INTO v_tenant_id
  FROM employees
  WHERE user_id = auth.uid()
    AND company_id IS NOT NULL
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;

-- 1.2 Membership-Prüfung: is_member_of_tenant()
-- Prüft ob der aktuelle User Mitglied eines bestimmten Tenants ist
CREATE OR REPLACE FUNCTION public.is_member_of_tenant(p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- NULL tenant_id ist nie erlaubt
  IF p_tenant_id IS NULL THEN
    RETURN false;
  END IF;

  -- Prüfe Impersonation-Session
  IF EXISTS (
    SELECT 1 FROM impersonation_sessions
    WHERE superadmin_id = auth.uid()
      AND target_tenant_id = p_tenant_id
      AND status = 'active'
      AND expires_at > now()
  ) THEN
    RETURN true;
  END IF;

  -- Prüfe aktive Tenant-Session
  IF EXISTS (
    SELECT 1 FROM user_tenant_sessions
    WHERE user_id = auth.uid()
      AND tenant_company_id = p_tenant_id
      AND is_tenant_mode = true
  ) THEN
    RETURN true;
  END IF;

  -- Prüfe user_roles Membership
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND company_id = p_tenant_id
  ) THEN
    RETURN true;
  END IF;

  -- Prüfe employees Membership
  IF EXISTS (
    SELECT 1 FROM employees
    WHERE user_id = auth.uid()
      AND company_id = p_tenant_id
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_member_of_tenant(uuid) TO authenticated;

-- 1.3 Rollen-Prüfung: has_tenant_role()
-- Prüft ob der User eine bestimmte Rolle im Tenant hat
CREATE OR REPLACE FUNCTION public.has_tenant_role(
  p_tenant_id uuid, 
  p_roles text[]
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- NULL tenant_id oder leere Rollen-Liste ist nie erlaubt
  IF p_tenant_id IS NULL OR p_roles IS NULL OR array_length(p_roles, 1) IS NULL THEN
    RETURN false;
  END IF;

  -- Prüfe ob User eine der angegebenen Rollen im Tenant hat
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND company_id = p_tenant_id
      AND role::text = ANY(p_roles)
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.has_tenant_role(uuid, text[]) TO authenticated;

-- 1.4 Hilfsfunktion: get_user_tenant_role()
-- Gibt die primäre Rolle des Users im aktuellen Tenant zurück
CREATE OR REPLACE FUNCTION public.get_user_tenant_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_role TEXT;
BEGIN
  v_tenant_id := current_tenant_id();
  
  IF v_tenant_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role::text INTO v_role
  FROM user_roles
  WHERE user_id = auth.uid()
    AND company_id = v_tenant_id
  ORDER BY 
    CASE role 
      WHEN 'superadmin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'hr' THEN 3
      WHEN 'manager' THEN 4
      WHEN 'teamlead' THEN 5
      WHEN 'employee' THEN 6
      ELSE 7
    END
  LIMIT 1;
  
  RETURN v_role;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_tenant_role() TO authenticated;

-- 1.5 Audit-Log Tabelle für Impersonation-Aktionen
CREATE TABLE IF NOT EXISTS public.impersonation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES impersonation_sessions(id) ON DELETE SET NULL,
  superadmin_id UUID NOT NULL,
  target_tenant_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index für schnelle Session-Suche
CREATE INDEX IF NOT EXISTS idx_impersonation_audit_session 
  ON impersonation_audit_log(session_id);

CREATE INDEX IF NOT EXISTS idx_impersonation_audit_superadmin 
  ON impersonation_audit_log(superadmin_id);

CREATE INDEX IF NOT EXISTS idx_impersonation_audit_tenant 
  ON impersonation_audit_log(target_tenant_id);

CREATE INDEX IF NOT EXISTS idx_impersonation_audit_created 
  ON impersonation_audit_log(created_at DESC);

-- RLS für impersonation_audit_log (nur Superadmins)
ALTER TABLE public.impersonation_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_audit_log FORCE ROW LEVEL SECURITY;

CREATE POLICY "impersonation_audit_superadmin_select"
ON public.impersonation_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'superadmin'
  )
);

CREATE POLICY "impersonation_audit_superadmin_insert"
ON public.impersonation_audit_log
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'superadmin'
  )
);