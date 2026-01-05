-- Fix get_active_impersonation_session to handle NULL target_user_id (Pre-Tenant mode)
CREATE OR REPLACE FUNCTION public.get_active_impersonation_session()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_target_user_email text := null;
  v_target_user_name text := null;
  v_target_tenant_name text := null;
BEGIN
  -- Find active session for current user
  SELECT * INTO v_session
  FROM public.active_tenant_sessions
  WHERE session_user_id = auth.uid()
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_session IS NULL THEN
    RETURN json_build_object('active', false);
  END IF;

  -- Only fetch target user if target_user_id is set (not Pre-Tenant mode)
  IF v_session.target_user_id IS NOT NULL THEN
    SELECT 
      COALESCE(u.email, 'Unbekannt'),
      COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Unbekannt')
    INTO v_target_user_email, v_target_user_name
    FROM auth.users u
    WHERE u.id = v_session.target_user_id;
  END IF;

  -- Get tenant name
  SELECT name INTO v_target_tenant_name
  FROM public.companies
  WHERE id = v_session.impersonated_company_id;

  RETURN json_build_object(
    'active', true,
    'session_id', v_session.id,
    'target_user_id', v_session.target_user_id,
    'target_user_email', v_target_user_email,
    'target_user_name', v_target_user_name,
    'target_tenant_id', v_session.impersonated_company_id,
    'target_tenant_name', COALESCE(v_target_tenant_name, 'Unbekannt'),
    'reason', v_session.reason,
    'can_write', COALESCE(v_session.can_write, false),
    'is_pre_tenant', (v_session.target_user_id IS NULL),
    'created_at', v_session.created_at,
    'expires_at', v_session.expires_at
  );
END;
$$;