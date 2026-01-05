CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_tenant_company_id UUID;
  v_user_company_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- User-Rolle und Company aus user_roles holen
  SELECT role::TEXT, company_id INTO v_user_role, v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- WICHTIG: Fallback auf Development-Company wenn kein user_role existiert
  IF v_user_company_id IS NULL THEN
    v_user_company_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
  
  -- Wenn SuperAdmin, prüfen ob Tenant-Modus aktiv ist
  IF v_user_role = 'superadmin' THEN
    SELECT tenant_company_id INTO v_tenant_company_id
    FROM public.user_tenant_sessions
    WHERE user_id = v_user_id
      AND is_tenant_mode = true;
    
    IF v_tenant_company_id IS NOT NULL THEN
      RETURN v_tenant_company_id;
    END IF;
  END IF;
  
  -- Standard: eigene company_id zurückgeben
  RETURN v_user_company_id;
END;
$$;