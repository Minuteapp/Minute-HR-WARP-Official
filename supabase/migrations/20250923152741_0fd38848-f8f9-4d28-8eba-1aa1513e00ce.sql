-- KRITISCHE SICHERHEITSFUNKTION REPARATUR (korrigiert)
-- Problem: is_superadmin_safe versucht auf auth.users zuzugreifen (nicht erlaubt)

-- 1. Bestehende Funktionen löschen und neu erstellen
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);
DROP FUNCTION IF EXISTS public.is_in_tenant_context();
DROP FUNCTION IF EXISTS public.get_tenant_company_id_safe();

-- 2. Sicherheitsfunktion is_superadmin_safe korrigieren
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- OHNE auth.users Zugriff - nur sichere Fallbacks verwenden
  
  -- Fallback 1: Direkte SuperAdmin User-ID (Ihr Account)
  IF user_id::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2' THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback 2: Prüfe user_roles Tabelle für superadmin Rolle
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = user_id 
    AND ur.role = 'superadmin'::user_role
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Standard: Kein SuperAdmin
  RETURN FALSE;
END;
$$;

-- 3. Zusätzliche sichere Funktionen für bessere Performance
CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  company_id uuid;
BEGIN
  -- Versuche zuerst über user_roles
  SELECT ur.company_id INTO company_id
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
  LIMIT 1;
  
  -- Falls nicht gefunden, versuche über employees
  IF company_id IS NULL THEN
    SELECT e.company_id INTO company_id
    FROM public.employees e
    WHERE e.id = p_user_id
    LIMIT 1;
  END IF;
  
  RETURN company_id;
END;
$$;

-- 4. Tenant-Context Funktionen absichern
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_tenant_sessions uts
    WHERE uts.user_id = auth.uid()
    AND uts.is_tenant_mode = true
    AND uts.created_at > (now() - interval '24 hours')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  tenant_company_id uuid;
BEGIN
  SELECT uts.tenant_company_id INTO tenant_company_id
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid()
  AND uts.is_tenant_mode = true
  AND uts.created_at > (now() - interval '24 hours')
  ORDER BY uts.created_at DESC
  LIMIT 1;
  
  RETURN tenant_company_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- 5. Log der Reparatur
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details
) VALUES (
  auth.uid(), 
  'security_function_repair', 
  'system', 
  'is_superadmin_safe',
  jsonb_build_object(
    'description', 'Kritische Sicherheitsfunktion repariert - auth.users Zugriff entfernt',
    'functions_repaired', ARRAY['is_superadmin_safe', 'get_user_company_id', 'is_in_tenant_context', 'get_tenant_company_id_safe'],
    'auth_users_access_removed', true,
    'fallback_mechanisms_active', true,
    'timestamp', now()
  )
);