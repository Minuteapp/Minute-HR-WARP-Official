-- CRITICAL FIX: Update get_effective_company_id to prevent data leakage
-- Superadmins without tenant session get NULL to prevent viewing their own company data

CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tenant_company_id uuid;
  v_user_company_id uuid;
  v_is_superadmin boolean;
BEGIN
  -- Check if user is in tenant mode
  SELECT tenant_company_id INTO v_tenant_company_id
  FROM user_tenant_sessions
  WHERE user_id = auth.uid() AND is_tenant_mode = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- Return tenant company if in tenant mode
  IF v_tenant_company_id IS NOT NULL THEN
    RETURN v_tenant_company_id;
  END IF;
  
  -- Check if user is superadmin
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ) INTO v_is_superadmin;
  
  -- CRITICAL: Superadmins without tenant session get NULL
  -- This prevents them from seeing data from their own company
  IF v_is_superadmin THEN
    RETURN NULL;
  END IF;
  
  -- For normal users: return their company ID
  SELECT company_id INTO v_user_company_id
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_user_company_id;
END;
$function$;