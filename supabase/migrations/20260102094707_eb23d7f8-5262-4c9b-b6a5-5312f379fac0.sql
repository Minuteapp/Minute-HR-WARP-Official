-- KRITISCHER FIX: Aktualisiere die 9-Parameter start_impersonation_session Funktion
-- um auch active_tenant_sessions zu synchronisieren (für RLS)
CREATE OR REPLACE FUNCTION public.start_impersonation_session(
  p_target_user_id uuid, 
  p_target_tenant_id uuid, 
  p_mode text, 
  p_justification text, 
  p_justification_type text, 
  p_duration_minutes integer DEFAULT 30, 
  p_is_pre_tenant boolean DEFAULT false, 
  p_ip_address text DEFAULT NULL, 
  p_user_agent text DEFAULT NULL
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

  -- Beende alle bestehenden aktiven Sessions
  UPDATE public.impersonation_sessions 
  SET status = 'ended', ended_at = now(), updated_at = now()
  WHERE superadmin_id = v_superadmin_id AND status = 'active';
  
  -- KRITISCH: Deaktiviere alte active_tenant_sessions
  UPDATE public.active_tenant_sessions
  SET is_active = false
  WHERE session_user_id = v_superadmin_id;

  -- Berechne Ablaufzeit (max 60 Minuten)
  v_expires_at := now() + (LEAST(p_duration_minutes, 60) || ' minutes')::interval;

  -- Session erstellen MIT company_id
  INSERT INTO public.impersonation_sessions (
    superadmin_id,
    target_user_id,
    target_tenant_id,
    company_id,
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

  -- KRITISCH: Sync mit active_tenant_sessions für RLS-Funktionen!
  INSERT INTO public.active_tenant_sessions (
    session_user_id, 
    impersonated_company_id, 
    is_active, 
    can_write, 
    expires_at, 
    reason
  )
  VALUES (
    v_superadmin_id, 
    p_target_tenant_id, 
    true, 
    p_mode = 'act_as', 
    v_expires_at, 
    'impersonation:' || v_session_id::text
  )
  ON CONFLICT (session_user_id) DO UPDATE SET
    impersonated_company_id = EXCLUDED.impersonated_company_id,
    is_active = true,
    can_write = EXCLUDED.can_write,
    expires_at = EXCLUDED.expires_at,
    reason = EXCLUDED.reason;

  -- Initiales Audit-Log MIT company_id
  INSERT INTO public.impersonation_audit_logs (
    session_id,
    actor_user_id,
    performed_by_superadmin_id,
    company_id,
    action,
    resource_type,
    resource_id,
    new_values
  ) VALUES (
    v_session_id,
    COALESCE(p_target_user_id, v_superadmin_id),
    v_superadmin_id,
    p_target_tenant_id,
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