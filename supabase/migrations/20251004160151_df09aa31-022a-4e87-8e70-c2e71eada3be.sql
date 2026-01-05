-- =====================================================
-- FUNKTIONEN MIT search_path ABSICHERN (Teil 3)
-- =====================================================

-- Funktion: is_channel_member
CREATE OR REPLACE FUNCTION public.is_channel_member(channel_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_id = channel_uuid AND user_id = user_uuid
  );
$$;

-- Funktion: is_in_tenant_context
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_tenant_sessions
    WHERE user_id = auth.uid()
    AND is_tenant_mode = true
  );
END;
$$;

-- Funktion: get_tenant_company_id_safe
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_company_id uuid;
BEGIN
  SELECT tenant_company_id INTO v_tenant_company_id
  FROM public.user_tenant_sessions
  WHERE user_id = auth.uid()
  AND is_tenant_mode = true
  LIMIT 1;
  
  RETURN v_tenant_company_id;
END;
$$;

-- Funktion: is_team_manager
CREATE OR REPLACE FUNCTION public.is_team_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('manager', 'admin', 'superadmin')
  );
END;
$$;

-- Funktion: clear_tenant_context_with_user_id
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_tenant_sessions
  WHERE user_id = p_user_id;
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Funktion: is_ip_allowed
CREATE OR REPLACE FUNCTION public.is_ip_allowed(p_user_id uuid, p_ip_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings RECORD;
BEGIN
  SELECT allowed_ip_addresses, blocked_ip_addresses
  INTO v_settings
  FROM public.user_security_settings
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  IF v_settings.blocked_ip_addresses IS NOT NULL AND 
     p_ip_address = ANY(v_settings.blocked_ip_addresses) THEN
    RETURN FALSE;
  END IF;
  
  IF v_settings.allowed_ip_addresses IS NOT NULL AND 
     array_length(v_settings.allowed_ip_addresses, 1) > 0 THEN
    RETURN p_ip_address = ANY(v_settings.allowed_ip_addresses);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Funktion: deactivate_company
CREATE OR REPLACE FUNCTION public.deactivate_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE companies
  SET is_active = false
  WHERE id = p_company_id;
END;
$$;

-- Funktion: get_user_effective_permissions_with_overrides
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions_with_overrides(p_user_id uuid)
RETURNS TABLE(module_name text, submodule_name text, action_key text, permission_granted boolean, permission_source text, conditions jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF user_role IS NULL THEN
    user_role := 'employee';
  END IF;
  
  RETURN QUERY
  WITH base_permissions AS (
    SELECT 
      rpm.module_name,
      NULL::text as submodule_name,
      unnest(rpm.allowed_actions) as action_key,
      true as permission_granted,
      'role_matrix' as permission_source,
      '{}'::jsonb as conditions
    FROM role_permission_matrix rpm
    WHERE rpm.role = user_role::user_role
      AND rpm.is_visible = true
  ),
  user_overrides AS (
    SELECT 
      upo.module_name,
      upo.submodule_name,
      upo.action_key,
      CASE WHEN upo.permission_type = 'grant' THEN true ELSE false END as permission_granted,
      'user_override' as permission_source,
      upo.conditions
    FROM user_permission_overrides upo
    WHERE upo.user_id = p_user_id
      AND upo.is_active = true
      AND (upo.expires_at IS NULL OR upo.expires_at > now())
  )
  SELECT bp.* FROM base_permissions bp
  WHERE NOT EXISTS (
    SELECT 1 FROM user_overrides uo 
    WHERE uo.module_name = bp.module_name 
    AND uo.action_key = bp.action_key
    AND uo.submodule_name IS NOT DISTINCT FROM bp.submodule_name
  )
  UNION ALL
  SELECT uo.* FROM user_overrides uo;
END;
$$;