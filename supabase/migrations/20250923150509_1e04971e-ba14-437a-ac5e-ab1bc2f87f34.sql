-- KRITISCHE SICHERHEITSKORREKTUR: Security Definer zu Security Invoker Konvertierung
-- Diese Funktionen sollten RLS-Policies respektieren und nicht umgehen

-- 1. Admin-Funktionen von SECURITY DEFINER zu SECURITY INVOKER konvertieren
CREATE OR REPLACE FUNCTION public.is_admin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = $1 AND role IN ('admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
  -- Primär: Prüfe metadata in auth.users
  -- Sekundär: Explizite User-ID als Fallback  
  -- Tertiär: Prüfe user_roles Tabelle
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'superadmin' FROM auth.users WHERE id = $1),
    ($1::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::text),
    (SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'superadmin')),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_document_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.role IN ('admin', 'superadmin')
  );
END;
$$;

-- 2. User-Kontext-Funktionen sicher machen
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql  
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT role::TEXT
    FROM public.user_roles
    WHERE user_id = $1
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- 3. Gefährliche CRUD-Funktionen sicher machen
-- Diese Funktion ist besonders gefährlich da sie RLS umgeht
CREATE OR REPLACE FUNCTION public.create_employee_bypass_rls(
  p_name text, 
  p_email text, 
  p_department text DEFAULT NULL, 
  p_position text DEFAULT NULL,
  p_company_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER - jetzt respektiert es RLS!
SET search_path TO 'public'
AS $$
DECLARE
  v_employee_id uuid;
  v_effective_company_id uuid;
BEGIN
  -- Bestimme effektive Company ID basierend auf Benutzerkontext
  IF p_company_id IS NOT NULL THEN
    v_effective_company_id := p_company_id;
  ELSE
    -- Verwende Company des aktuellen Benutzers
    SELECT ur.company_id INTO v_effective_company_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    LIMIT 1;
  END IF;

  -- Jetzt respektiert es RLS-Policies!
  INSERT INTO public.employees (
    name, email, department, position, company_id, status
  ) VALUES (
    p_name, p_email, p_department, p_position, v_effective_company_id, 'active'
  ) RETURNING id INTO v_employee_id;
  
  RETURN v_employee_id;
END;
$$;

-- 4. Tenant-Kontext-Funktionen sicher machen
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
AS $$
DECLARE
  tenant_context_id UUID;
BEGIN
  -- Prüfe zuerst aktive Tenant-Session
  SELECT uts.tenant_company_id 
  INTO tenant_context_id
  FROM user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true
  AND uts.tenant_company_id IS NOT NULL;
  
  IF tenant_context_id IS NOT NULL THEN
    RETURN tenant_context_id;
  END IF;
  
  -- Fallback: Verwende die Company des aktuellen Users
  RETURN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- 5. Debugging-Funktionen sicher machen  
CREATE OR REPLACE FUNCTION public.debug_tenant_context()
RETURNS TABLE(current_user_id uuid, is_super_admin boolean, is_in_tenant_mode boolean, tenant_company_id uuid, user_company_id uuid)
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    is_superadmin_safe(auth.uid()) as is_super_admin,
    is_in_tenant_context() as is_in_tenant_mode,
    get_tenant_company_id_safe() as tenant_company_id,
    get_user_company_id(auth.uid()) as user_company_id;
END;
$$;

-- 6. Audit-Log für Sicherheitsverbesserung
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(),
  'security_definer_fix',
  'database_functions',
  'critical_functions_converted',
  jsonb_build_object(
    'action_type', 'security_definer_to_invoker',
    'functions_fixed', ARRAY[
      'is_admin_safe', 'is_superadmin_safe', 'is_document_admin',
      'get_user_role', 'get_user_role_safe', 'create_employee_bypass_rls',
      'get_current_tenant_id', 'debug_tenant_context'
    ],
    'security_improvement', 'Functions now respect RLS policies and user permissions'
  ),
  'high'
);