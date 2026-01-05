-- Fix can_access_tenant superadmin detection by using existing is_superadmin()
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

  -- Use existing helper (matches role naming like 'superadmin')
  v_is_super_admin := public.is_superadmin(v_user_id);

  -- Tenant context (impersonation / tenant mode)
  v_current_tenant := public.current_tenant_id();

  -- Superadmin with active tenant context: restrict to that tenant
  IF v_is_super_admin = true AND v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- Superadmin without tenant context: allow access to all tenants (development mode)
  IF v_is_super_admin = true THEN
    RETURN true;
  END IF;

  -- Regular user: only their company
  SELECT company_id INTO v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;