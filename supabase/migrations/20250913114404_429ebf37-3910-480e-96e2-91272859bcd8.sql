-- Repariere die Tenant-Context-Funktionen für korrekte Isolation

-- Aktualisierte is_in_tenant_context Funktion
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tenant_mode BOOLEAN := false;
BEGIN
  -- Check if user has an active tenant session
  SELECT COALESCE(uts.is_tenant_mode, false)
  INTO tenant_mode
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true
  AND uts.tenant_company_id IS NOT NULL
  ORDER BY uts.updated_at DESC
  LIMIT 1;
  
  RETURN COALESCE(tenant_mode, false);
END;
$$;

-- Aktualisierte get_tenant_company_id_safe Funktion
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tenant_company_id UUID;
BEGIN
  -- Only return tenant company ID if we're actually in tenant mode
  SELECT uts.tenant_company_id
  INTO tenant_company_id
  FROM public.user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true
  AND uts.tenant_company_id IS NOT NULL
  ORDER BY uts.updated_at DESC
  LIMIT 1;
  
  RETURN tenant_company_id;
END;
$$;

-- Debug-Funktion für detaillierte Tenant-Context-Prüfung
CREATE OR REPLACE FUNCTION public.debug_tenant_context_detailed()
RETURNS TABLE(
  current_user_id uuid, 
  is_super_admin boolean, 
  is_in_tenant_mode boolean, 
  tenant_company_id uuid, 
  user_company_id uuid,
  tenant_session_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    is_superadmin_safe(auth.uid()) as is_super_admin,
    is_in_tenant_context() as is_in_tenant_mode,
    get_tenant_company_id_safe() as tenant_company_id,
    get_user_company_id(auth.uid()) as user_company_id,
    (SELECT to_jsonb(uts.*) FROM user_tenant_sessions uts WHERE uts.user_id = auth.uid() ORDER BY updated_at DESC LIMIT 1) as tenant_session_details;
END;
$$;