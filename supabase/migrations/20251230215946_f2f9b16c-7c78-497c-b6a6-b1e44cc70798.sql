-- Aktualisierte Funktion: Erlaubt Pre-Tenant Impersonation ohne User
CREATE OR REPLACE FUNCTION public.start_impersonation_session(
  p_target_user_id uuid,
  p_target_tenant_id uuid,
  p_mode text,
  p_justification text,
  p_justification_type text,
  p_duration_minutes integer,
  p_is_pre_tenant boolean DEFAULT false,
  p_ip_address inet DEFAULT null,
  p_user_agent text DEFAULT null
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
  v_is_pre_tenant boolean;
BEGIN
  v_superadmin_id := auth.uid();
  v_is_pre_tenant := COALESCE(p_is_pre_tenant, false);
  
  -- Prüfe SuperAdmin-Status
  IF NOT public.is_superadmin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'not_superadmin',
      'message', 'Nur Superadmins können Impersonation starten'
    );
  END IF;
  
  -- Beende aktive Sessions des SuperAdmins
  UPDATE impersonation_sessions 
  SET status = 'ended', ended_at = now()
  WHERE superadmin_id = v_superadmin_id AND status = 'active';
  
  UPDATE active_tenant_sessions
  SET is_active = false
  WHERE session_user_id = v_superadmin_id;
  
  -- Prüfe ob Tenant existiert
  SELECT name INTO v_target_tenant_name
  FROM companies WHERE id = p_target_tenant_id;
  
  IF v_target_tenant_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'tenant_not_found', 
      'message', 'Tenant nicht gefunden'
    );
  END IF;
  
  -- Pre-Tenant Modus: Kein spezifischer User erforderlich
  IF v_is_pre_tenant OR p_target_user_id IS NULL THEN
    v_is_pre_tenant := true;
    v_target_user_email := 'pre-tenant@system';
    v_target_user_role := 'pre_tenant_admin';
    
  ELSE
    -- Normaler Modus: User muss existieren und Mitglied des Tenants sein
    SELECT 
      COALESCE(e.email, p.email),
      COALESCE((SELECT role FROM user_roles WHERE user_id = p_target_user_id AND company_id = p_target_tenant_id LIMIT 1), 'employee')
    INTO v_target_user_email, v_target_user_role
    FROM profiles p
    LEFT JOIN employees e ON e.user_id = p_target_user_id AND e.company_id = p_target_tenant_id
    WHERE p.id = p_target_user_id;
    
    IF v_target_user_email IS NULL THEN
      -- User existiert nicht in profiles
      SELECT email INTO v_target_user_email FROM profiles WHERE id = p_target_user_id;
      IF v_target_user_email IS NULL THEN
        RETURN jsonb_build_object(
          'success', false, 
          'error', 'user_not_found', 
          'message', 'User nicht gefunden'
        );
      END IF;
      -- User existiert, aber nicht in diesem Tenant - als Pre-Tenant behandeln
      v_is_pre_tenant := true;
      v_target_user_role := 'pre_tenant';
    ELSE
      -- Prüfe ob User Mitglied des Tenants ist
      IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = p_target_user_id AND company_id = p_target_tenant_id) THEN
        -- User ist kein Mitglied - trotzdem erlauben aber als Pre-Tenant markieren
        v_is_pre_tenant := true;
        v_target_user_role := 'pre_tenant';
      END IF;
    END IF;
  END IF;
  
  -- Session erstellen
  v_session_id := gen_random_uuid();
  v_expires_at := now() + (p_duration_minutes || ' minutes')::interval;
  
  INSERT INTO impersonation_sessions (
    id, 
    superadmin_id, 
    target_user_id, 
    target_tenant_id, 
    mode, 
    justification,
    justification_type,
    status, 
    is_pre_tenant, 
    started_at, 
    expires_at,
    ip_address,
    user_agent
  )
  VALUES (
    v_session_id, 
    v_superadmin_id, 
    p_target_user_id, 
    p_target_tenant_id, 
    p_mode, 
    p_justification,
    p_justification_type,
    'active', 
    v_is_pre_tenant, 
    now(), 
    v_expires_at,
    p_ip_address,
    p_user_agent
  );
  
  -- KRITISCH: Sync mit active_tenant_sessions für RLS
  INSERT INTO active_tenant_sessions (
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
  
  -- Audit-Log
  INSERT INTO impersonation_audit_logs (session_id, superadmin_id, action, details)
  VALUES (v_session_id, v_superadmin_id, 'session_started', jsonb_build_object(
    'target_user_id', p_target_user_id, 
    'target_user_email', v_target_user_email,
    'target_tenant_id', p_target_tenant_id, 
    'target_tenant_name', v_target_tenant_name,
    'target_user_role', v_target_user_role, 
    'mode', p_mode, 
    'justification', p_justification,
    'justification_type', p_justification_type,
    'is_pre_tenant', v_is_pre_tenant,
    'duration_minutes', p_duration_minutes
  ));
  
  RETURN jsonb_build_object(
    'success', true, 
    'session_id', v_session_id, 
    'expires_at', v_expires_at,
    'target_user_email', v_target_user_email, 
    'target_user_role', v_target_user_role,
    'target_tenant_name', v_target_tenant_name, 
    'mode', p_mode, 
    'is_pre_tenant', v_is_pre_tenant
  );
END;
$$;