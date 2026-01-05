-- =====================================================
-- FIX: Impersonation-Session sync mit active_tenant_sessions
-- Drop alte Funktionen zuerst, dann neu erstellen
-- =====================================================

-- Drop alte Funktionen
DROP FUNCTION IF EXISTS public.end_impersonation_session(uuid);
DROP FUNCTION IF EXISTS public.extend_impersonation_session(uuid, integer);
DROP FUNCTION IF EXISTS public.start_impersonation_session(uuid, uuid, text, text);
DROP FUNCTION IF EXISTS public.get_active_impersonation_session();
DROP FUNCTION IF EXISTS public.cleanup_expired_impersonation_sessions();

-- 1. start_impersonation_session mit active_tenant_sessions sync
CREATE OR REPLACE FUNCTION public.start_impersonation_session(
  p_target_user_id uuid,
  p_target_tenant_id uuid,
  p_reason text,
  p_mode text DEFAULT 'view_only'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_superadmin_id uuid;
  v_session_id uuid;
  v_expires_at timestamptz;
  v_target_user_email text;
  v_target_tenant_name text;
  v_target_user_role text;
  v_is_pre_tenant boolean := false;
BEGIN
  v_superadmin_id := auth.uid();
  
  IF NOT public.is_superadmin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'not_superadmin',
      'message', 'Nur Superadmins können Impersonation starten'
    );
  END IF;
  
  -- Beende aktive Sessions
  UPDATE impersonation_sessions 
  SET status = 'ended', ended_at = now()
  WHERE superadmin_id = v_superadmin_id AND status = 'active';
  
  UPDATE active_tenant_sessions
  SET is_active = false
  WHERE session_user_id = v_superadmin_id;
  
  -- Prüfe Tenant
  SELECT name INTO v_target_tenant_name
  FROM companies WHERE id = p_target_tenant_id;
  
  IF v_target_tenant_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'tenant_not_found', 'message', 'Tenant nicht gefunden');
  END IF;
  
  -- Hole User-Daten
  SELECT 
    COALESCE(e.email, p.email),
    COALESCE((SELECT role FROM user_roles WHERE user_id = p_target_user_id AND company_id = p_target_tenant_id LIMIT 1), 'employee')
  INTO v_target_user_email, v_target_user_role
  FROM profiles p
  LEFT JOIN employees e ON e.user_id = p_target_user_id AND e.company_id = p_target_tenant_id
  WHERE p.id = p_target_user_id;
  
  IF v_target_user_email IS NULL THEN
    SELECT email INTO v_target_user_email FROM profiles WHERE id = p_target_user_id;
    IF v_target_user_email IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'user_not_found', 'message', 'User nicht gefunden');
    END IF;
    v_is_pre_tenant := true;
    v_target_user_role := 'pre_tenant';
  ELSE
    IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = p_target_user_id AND company_id = p_target_tenant_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'user_not_in_tenant', 
        'message', format('User %s ist nicht Mitglied von Tenant %s', v_target_user_email, v_target_tenant_name));
    END IF;
  END IF;
  
  v_session_id := gen_random_uuid();
  v_expires_at := now() + interval '30 minutes';
  
  INSERT INTO impersonation_sessions (id, superadmin_id, target_user_id, target_tenant_id, mode, reason, status, is_pre_tenant, started_at, expires_at)
  VALUES (v_session_id, v_superadmin_id, p_target_user_id, p_target_tenant_id, p_mode, p_reason, 'active', v_is_pre_tenant, now(), v_expires_at);
  
  -- KRITISCH: Sync mit active_tenant_sessions für RLS
  INSERT INTO active_tenant_sessions (session_user_id, impersonated_company_id, is_active, can_write, expires_at, reason)
  VALUES (v_superadmin_id, p_target_tenant_id, true, p_mode = 'act_as', v_expires_at, 'impersonation:' || v_session_id::text)
  ON CONFLICT (session_user_id) DO UPDATE SET
    impersonated_company_id = EXCLUDED.impersonated_company_id,
    is_active = true,
    can_write = EXCLUDED.can_write,
    expires_at = EXCLUDED.expires_at,
    reason = EXCLUDED.reason;
  
  INSERT INTO impersonation_audit_logs (session_id, superadmin_id, action, details)
  VALUES (v_session_id, v_superadmin_id, 'session_started', jsonb_build_object(
    'target_user_id', p_target_user_id, 'target_user_email', v_target_user_email,
    'target_tenant_id', p_target_tenant_id, 'target_tenant_name', v_target_tenant_name,
    'target_user_role', v_target_user_role, 'mode', p_mode, 'reason', p_reason, 'is_pre_tenant', v_is_pre_tenant
  ));
  
  RETURN jsonb_build_object(
    'success', true, 'session_id', v_session_id, 'expires_at', v_expires_at,
    'target_user_email', v_target_user_email, 'target_user_role', v_target_user_role,
    'target_tenant_name', v_target_tenant_name, 'mode', p_mode, 'is_pre_tenant', v_is_pre_tenant
  );
END;
$$;

-- 2. end_impersonation_session mit active_tenant_sessions cleanup
CREATE OR REPLACE FUNCTION public.end_impersonation_session(p_session_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_superadmin_id uuid;
  v_session record;
BEGIN
  v_superadmin_id := auth.uid();
  
  IF p_session_id IS NOT NULL THEN
    SELECT * INTO v_session FROM impersonation_sessions
    WHERE id = p_session_id AND superadmin_id = v_superadmin_id AND status = 'active';
  ELSE
    SELECT * INTO v_session FROM impersonation_sessions
    WHERE superadmin_id = v_superadmin_id AND status = 'active'
    ORDER BY started_at DESC LIMIT 1;
  END IF;
  
  IF v_session IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_active_session', 'message', 'Keine aktive Impersonation-Session');
  END IF;
  
  UPDATE impersonation_sessions SET status = 'ended', ended_at = now() WHERE id = v_session.id;
  UPDATE active_tenant_sessions SET is_active = false WHERE session_user_id = v_superadmin_id;
  
  INSERT INTO impersonation_audit_logs (session_id, superadmin_id, action, details)
  VALUES (v_session.id, v_superadmin_id, 'session_ended', jsonb_build_object(
    'duration_minutes', EXTRACT(EPOCH FROM (now() - v_session.started_at)) / 60
  ));
  
  RETURN jsonb_build_object('success', true, 'session_id', v_session.id, 'ended_at', now());
END;
$$;

-- 3. extend_impersonation_session mit active_tenant_sessions sync
CREATE OR REPLACE FUNCTION public.extend_impersonation_session(p_session_id uuid DEFAULT NULL, p_extend_minutes integer DEFAULT 15)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_superadmin_id uuid;
  v_session record;
  v_new_expires_at timestamptz;
BEGIN
  v_superadmin_id := auth.uid();
  
  IF p_session_id IS NOT NULL THEN
    SELECT * INTO v_session FROM impersonation_sessions
    WHERE id = p_session_id AND superadmin_id = v_superadmin_id AND status = 'active';
  ELSE
    SELECT * INTO v_session FROM impersonation_sessions
    WHERE superadmin_id = v_superadmin_id AND status = 'active'
    ORDER BY started_at DESC LIMIT 1;
  END IF;
  
  IF v_session IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_active_session', 'message', 'Keine aktive Session');
  END IF;
  
  v_new_expires_at := GREATEST(v_session.expires_at, now()) + (p_extend_minutes || ' minutes')::interval;
  IF v_new_expires_at > v_session.started_at + interval '2 hours' THEN
    v_new_expires_at := v_session.started_at + interval '2 hours';
  END IF;
  
  UPDATE impersonation_sessions SET expires_at = v_new_expires_at WHERE id = v_session.id;
  UPDATE active_tenant_sessions SET expires_at = v_new_expires_at WHERE session_user_id = v_superadmin_id;
  
  INSERT INTO impersonation_audit_logs (session_id, superadmin_id, action, details)
  VALUES (v_session.id, v_superadmin_id, 'session_extended', jsonb_build_object('extend_minutes', p_extend_minutes, 'new_expires_at', v_new_expires_at));
  
  RETURN jsonb_build_object('success', true, 'session_id', v_session.id, 'new_expires_at', v_new_expires_at);
END;
$$;

-- 4. get_effective_company_id mit direktem Impersonation-Check
CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_jwt_company_id uuid;
  v_impersonation_tenant_id uuid;
  v_active_session_company_id uuid;
  v_employee_company_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN NULL; END IF;
  
  -- PRIORITÄT 1: JWT-Claim
  BEGIN
    v_jwt_company_id := (auth.jwt() ->> 'active_tenant_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_jwt_company_id := NULL;
  END;
  IF v_jwt_company_id IS NOT NULL THEN RETURN v_jwt_company_id; END IF;
  
  -- PRIORITÄT 2: Aktive Impersonation-Session
  SELECT target_tenant_id INTO v_impersonation_tenant_id
  FROM impersonation_sessions
  WHERE superadmin_id = v_user_id AND status = 'active' AND expires_at > now()
  ORDER BY started_at DESC LIMIT 1;
  IF v_impersonation_tenant_id IS NOT NULL THEN RETURN v_impersonation_tenant_id; END IF;
  
  -- PRIORITÄT 3: active_tenant_sessions
  SELECT impersonated_company_id INTO v_active_session_company_id
  FROM active_tenant_sessions
  WHERE session_user_id = v_user_id AND is_active = true AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
  IF v_active_session_company_id IS NOT NULL THEN RETURN v_active_session_company_id; END IF;
  
  -- PRIORITÄT 4: Mitarbeiter-Zuordnung
  SELECT company_id INTO v_employee_company_id FROM employees WHERE user_id = v_user_id LIMIT 1;
  RETURN v_employee_company_id;
END;
$$;

-- 5. get_active_impersonation_session
CREATE OR REPLACE FUNCTION public.get_active_impersonation_session()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_superadmin_id uuid;
  v_session record;
  v_target_user_email text;
  v_target_user_role text;
  v_target_tenant_name text;
BEGIN
  v_superadmin_id := auth.uid();
  
  SELECT * INTO v_session FROM impersonation_sessions
  WHERE superadmin_id = v_superadmin_id AND status = 'active' AND expires_at > now()
  ORDER BY started_at DESC LIMIT 1;
  
  IF v_session IS NULL THEN
    RETURN jsonb_build_object('active', false);
  END IF;
  
  SELECT COALESCE(e.email, p.email),
    COALESCE((SELECT role FROM user_roles WHERE user_id = v_session.target_user_id AND company_id = v_session.target_tenant_id LIMIT 1), 'employee')
  INTO v_target_user_email, v_target_user_role
  FROM profiles p
  LEFT JOIN employees e ON e.user_id = p.id AND e.company_id = v_session.target_tenant_id
  WHERE p.id = v_session.target_user_id;
  
  SELECT name INTO v_target_tenant_name FROM companies WHERE id = v_session.target_tenant_id;
  
  RETURN jsonb_build_object(
    'active', true, 'session_id', v_session.id,
    'target_user_id', v_session.target_user_id, 'target_user_email', COALESCE(v_target_user_email, 'Unknown'),
    'target_user_role', COALESCE(v_target_user_role, 'employee'),
    'target_tenant_id', v_session.target_tenant_id, 'target_tenant_name', COALESCE(v_target_tenant_name, 'Unknown'),
    'mode', v_session.mode, 'is_pre_tenant', v_session.is_pre_tenant,
    'started_at', v_session.started_at, 'expires_at', v_session.expires_at,
    'remaining_minutes', EXTRACT(EPOCH FROM (v_session.expires_at - now())) / 60
  );
END;
$$;

-- 6. cleanup_expired_impersonation_sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_impersonation_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  WITH expired AS (
    UPDATE impersonation_sessions SET status = 'expired', ended_at = now()
    WHERE status = 'active' AND expires_at < now()
    RETURNING superadmin_id
  )
  SELECT count(*) INTO v_count FROM expired;
  
  UPDATE active_tenant_sessions SET is_active = false
  WHERE reason LIKE 'impersonation:%' AND expires_at IS NOT NULL AND expires_at < now();
  
  RETURN v_count;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.start_impersonation_session(uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_impersonation_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.extend_impersonation_session(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_impersonation_session() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_impersonation_sessions() TO service_role;