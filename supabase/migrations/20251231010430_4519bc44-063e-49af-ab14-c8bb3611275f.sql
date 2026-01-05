-- Update can_access_tenant function to allow Superadmins full read access in dev mode
CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_super_admin boolean := false;
  v_current_tenant uuid;
  v_user_company_id uuid;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user is a super admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = v_user_id 
    AND role = 'super_admin'
  ) INTO v_is_super_admin;

  -- Get current tenant (from impersonation session)
  v_current_tenant := current_tenant_id();

  -- Super admin with active impersonation session
  IF v_is_super_admin = true AND v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- Super admin without impersonation: allow ALL access (development mode)
  IF v_is_super_admin = true THEN
    RETURN TRUE;
  END IF;

  -- Regular user: check if they belong to the company
  SELECT company_id INTO v_user_company_id
  FROM user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;