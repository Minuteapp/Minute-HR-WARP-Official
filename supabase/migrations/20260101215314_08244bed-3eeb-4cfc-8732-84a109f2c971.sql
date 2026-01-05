-- Fix critical multi-tenant security vulnerability
-- Superadmins WITHOUT active tenant context should NOT see any company data

CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_super_admin boolean;
  v_current_tenant uuid;
  v_user_company_id uuid;
BEGIN
  -- NULL company_id: never allow
  IF p_company_id IS NULL THEN
    RETURN false;
  END IF;

  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  v_is_super_admin := public.is_superadmin(v_user_id);
  v_current_tenant := public.current_tenant_id();

  -- Superadmin WITH active tenant context: only that company
  IF v_is_super_admin = true AND v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- CRITICAL FIX: Superadmin WITHOUT tenant context
  -- sees NO company-specific data anymore!
  IF v_is_super_admin = true AND v_current_tenant IS NULL THEN
    RETURN false;  -- No data without active company selection!
  END IF;

  -- Regular user: only their own company
  SELECT company_id INTO v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;