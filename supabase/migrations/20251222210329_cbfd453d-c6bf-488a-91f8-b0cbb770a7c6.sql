-- Fix: Impersonation-Session-Erkennung & Debug-Context (DB-only)

-- 1) get_active_impersonation_session(): Kriterien konsistent zu effective_* Funktionen
CREATE OR REPLACE FUNCTION public.get_active_impersonation_session()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session RECORD;
  v_target_user RECORD;
  v_target_tenant RECORD;
BEGIN
  -- Aktive Session suchen (konsistent: ended_at IS NULL + mode)
  SELECT * INTO v_session
  FROM public.impersonation_sessions
  WHERE superadmin_id = auth.uid()
    AND status = 'active'
    AND ended_at IS NULL
    AND mode IN ('act_as', 'view_only')
    AND expires_at > now()
  ORDER BY started_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('active', false);
  END IF;

  -- User-Infos
  IF v_session.target_user_id IS NOT NULL THEN
    SELECT email, raw_user_meta_data->>'full_name' as full_name
    INTO v_target_user
    FROM auth.users
    WHERE id = v_session.target_user_id;
  END IF;

  -- Tenant-Infos
  IF v_session.target_tenant_id IS NOT NULL THEN
    SELECT name
    INTO v_target_tenant
    FROM public.companies
    WHERE id = v_session.target_tenant_id;
  END IF;

  RETURN json_build_object(
    'active', true,
    'session_id', v_session.id,
    'mode', v_session.mode,
    'target_user_id', v_session.target_user_id,
    'target_user_email', v_target_user.email,
    'target_user_name', v_target_user.full_name,
    'target_tenant_id', v_session.target_tenant_id,
    'target_tenant_name', v_target_tenant.name,
    'started_at', v_session.started_at,
    'expires_at', v_session.expires_at,
    'is_pre_tenant', v_session.is_pre_tenant,
    'justification', v_session.justification
  );
END;
$function$;


-- 2) start_impersonation_session(): Session robust aktiv setzen (defensiv)
CREATE OR REPLACE FUNCTION public.start_impersonation_session(
  p_target_user_id uuid,
  p_target_tenant_id uuid,
  p_mode text,
  p_justification text,
  p_justification_type text,
  p_duration_minutes integer DEFAULT 30,
  p_is_pre_tenant boolean DEFAULT false,
  p_ip_address text DEFAULT NULL::text,
  p_user_agent text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session_id UUID;
  v_superadmin_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_superadmin_id := auth.uid();

  -- Nur Superadmins dürfen
  IF NOT public.is_superadmin_safe(v_superadmin_id) THEN
    RETURN json_build_object('success', false, 'error', 'Nur Superadmins können Impersonation-Sessions starten');
  END IF;

  -- Prüfe ob bereits eine aktive Session existiert (konsistent: ended_at IS NULL + mode)
  IF EXISTS (
    SELECT 1
    FROM public.impersonation_sessions
    WHERE superadmin_id = v_superadmin_id
      AND status = 'active'
      AND ended_at IS NULL
      AND mode IN ('act_as', 'view_only')
      AND expires_at > now()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Es existiert bereits eine aktive Session. Bitte diese zuerst beenden.');
  END IF;

  -- Berechne Ablaufzeit (max 60 Minuten)
  v_expires_at := now() + (LEAST(p_duration_minutes, 60) || ' minutes')::interval;

  -- Session erstellen (defensiv: status/started_at/ended_at explizit)
  INSERT INTO public.impersonation_sessions (
    superadmin_id,
    target_user_id,
    target_tenant_id,
    mode,
    justification,
    justification_type,
    started_at,
    expires_at,
    ended_at,
    status,
    is_pre_tenant,
    ip_address,
    user_agent,
    created_at,
    updated_at
  ) VALUES (
    v_superadmin_id,
    p_target_user_id,
    p_target_tenant_id,
    p_mode,
    p_justification,
    p_justification_type,
    now(),
    v_expires_at,
    NULL,
    'active',
    p_is_pre_tenant,
    p_ip_address::inet,
    p_user_agent,
    now(),
    now()
  ) RETURNING id INTO v_session_id;

  -- Initiales Audit-Log
  INSERT INTO public.impersonation_audit_logs (
    session_id,
    actor_user_id,
    performed_by_superadmin_id,
    action,
    resource_type,
    resource_id,
    new_values
  ) VALUES (
    v_session_id,
    COALESCE(p_target_user_id, v_superadmin_id),
    v_superadmin_id,
    'session_started',
    'impersonation_session',
    v_session_id::text,
    json_build_object(
      'mode', p_mode,
      'justification', p_justification,
      'target_tenant_id', p_target_tenant_id,
      'target_user_id', p_target_user_id,
      'duration_minutes', p_duration_minutes
    )::jsonb
  );

  RETURN json_build_object(
    'success', true,
    'session_id', v_session_id,
    'expires_at', v_expires_at
  );
END;
$function$;


-- 3) DB-only Debug: effektiven Kontext als JSON zurückgeben
CREATE OR REPLACE FUNCTION public.get_effective_impersonation_context()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'active_session', (
      SELECT row_to_json(s)
      FROM public.impersonation_sessions s
      WHERE s.superadmin_id = auth.uid()
        AND s.status = 'active'
        AND s.ended_at IS NULL
        AND s.mode IN ('act_as', 'view_only')
        AND s.expires_at > now()
      ORDER BY s.started_at DESC
      LIMIT 1
    ),
    'effective_user_id', public.get_effective_user_id(),
    'effective_company_id', public.get_effective_company_id(),
    'is_acting_as', public.is_acting_as()
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_active_impersonation_session() TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_impersonation_session(uuid, uuid, text, text, text, integer, boolean, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_impersonation_context() TO authenticated;
