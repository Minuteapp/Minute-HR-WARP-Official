-- Korrigierte get_effective_company_id() Funktion
-- Liest jetzt aus user_roles statt profiles

CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS UUID
LANGUAGE plpgsql
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
  
  -- User-Rolle und Company aus user_roles holen (KORRIGIERT!)
  SELECT role::TEXT, company_id INTO v_user_role, v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- Wenn SuperAdmin, prüfen ob Tenant-Modus aktiv ist
  IF v_user_role = 'superadmin' THEN
    v_tenant_company_id := (
      SELECT (raw_user_meta_data->>'tenant_company_id')::UUID
      FROM auth.users
      WHERE id = v_user_id
    );
    
    IF v_tenant_company_id IS NOT NULL THEN
      RETURN v_tenant_company_id;
    END IF;
  END IF;
  
  RETURN v_user_company_id;
END;
$$;