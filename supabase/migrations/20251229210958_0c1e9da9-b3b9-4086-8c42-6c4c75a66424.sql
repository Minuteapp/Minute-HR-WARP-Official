-- Fix: Tenant-Kontext, Impersonation und RLS für zuverlässigen Superadmin-Zugriff
-- 1) set_tenant_context_with_user_id: company_id Spalte befüllen
-- 2) start_impersonation_session: company_id Spalte befüllen
-- 3) can_access_tenant/can_write_tenant: DB-basierter Superadmin-Fallback hinzufügen

-- ============================================================
-- 1) set_tenant_context_with_user_id: company_id MUSS gesetzt werden
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inserted_id uuid;
  v_user_role text;
BEGIN
  -- Hole die Rolle des Benutzers
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Prüfe ob der Benutzer berechtigt ist (SuperAdmin ODER Admin ODER HR)
  IF v_user_role NOT IN ('superadmin', 'admin', 'hr', 'hr_manager') THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Nicht berechtigt - Nur SuperAdmins, Admins und HR-Manager können Tenant-Kontext setzen',
      'user_id', p_user_id,
      'user_role', COALESCE(v_user_role, 'keine Rolle gefunden')
    );
  END IF;
  
  -- Für Admins und HR: Prüfe ob sie versuchen, auf IHRE eigene Firma zuzugreifen
  IF v_user_role IN ('admin', 'hr', 'hr_manager') THEN
    DECLARE
      v_user_company_id uuid;
    BEGIN
      SELECT company_id INTO v_user_company_id
      FROM user_roles
      WHERE user_id = p_user_id
      LIMIT 1;
      
      IF v_user_company_id IS DISTINCT FROM p_company_id THEN
        RETURN json_build_object(
          'success', false, 
          'error', 'Nicht berechtigt - Sie können nur den Kontext Ihrer eigenen Firma setzen',
          'user_id', p_user_id,
          'user_role', v_user_role,
          'user_company_id', v_user_company_id,
          'requested_company_id', p_company_id
        );
      END IF;
    END;
  END IF;
  
  -- Lösche vorhandene Session
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
  
  -- Erstelle neue Session MIT company_id (FIX!)
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, company_id, is_tenant_mode, created_at)
  VALUES (p_user_id, p_company_id, p_company_id, true, NOW())
  RETURNING user_id INTO v_inserted_id;
  
  IF v_inserted_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'INSERT fehlgeschlagen - Session konnte nicht erstellt werden',
      'user_id', p_user_id,
      'company_id', p_company_id
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'user_id', v_inserted_id,
    'company_id', p_company_id,
    'user_role', v_user_role,
    'debug', 'Tenant-Session erfolgreich erstellt'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', p_user_id,
      'company_id', p_company_id
    );
END;
$$;

-- ============================================================
-- 2) start_impersonation_session: company_id im INSERT setzen
-- ============================================================
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

  -- Prüfe ob bereits eine aktive Session existiert
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

  -- Session erstellen MIT company_id (FIX!)
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

  -- Initiales Audit-Log MIT company_id (FIX!)
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

-- ============================================================
-- 3) can_access_tenant: DB-basierter Superadmin-Fallback (nicht nur JWT!)
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- PRIORITÄT 1: JWT-Claim company_id (schnellste Prüfung)
    (public.get_jwt_company_id() = p_company_id)
    OR
    -- PRIORITÄT 2: SuperAdmin aus JWT
    (public.get_jwt_user_role() IN ('super_admin', 'superadmin'))
    OR
    -- PRIORITÄT 3: DB-basierter SuperAdmin Check (FIX! - unabhängig von JWT)
    public.is_superadmin_safe(auth.uid())
    OR
    -- PRIORITÄT 4: Active Tenant Session (für SuperAdmin Impersonation)
    EXISTS (
      SELECT 1 FROM active_tenant_sessions 
      WHERE session_user_id = auth.uid() 
        AND impersonated_company_id = p_company_id 
        AND is_active = true
    )
    OR
    -- PRIORITÄT 5: user_tenant_sessions (Tenant-Modus)
    EXISTS (
      SELECT 1 FROM user_tenant_sessions 
      WHERE user_id = auth.uid() 
        AND tenant_company_id = p_company_id 
        AND is_tenant_mode = true
    )
    OR
    -- PRIORITÄT 6: DB-basierte Prüfung (Legacy/Backup)
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND company_id = p_company_id)
    OR
    EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND company_id = p_company_id)
$$;

-- ============================================================
-- 4) can_write_tenant: DB-basierter Superadmin-Fallback hinzufügen
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_write_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- PRIORITÄT 1: JWT-Claim company_id + Rolle mit Schreibrechten
    (
      public.get_jwt_company_id() = p_company_id 
      AND public.get_jwt_user_role() IN ('admin', 'hr_manager', 'manager', 'super_admin', 'superadmin')
    )
    OR
    -- PRIORITÄT 2: SuperAdmin aus JWT ohne aktive Impersonation (volle Rechte)
    (
      public.get_jwt_user_role() IN ('super_admin', 'superadmin')
      AND NOT EXISTS (
        SELECT 1 FROM active_tenant_sessions 
        WHERE session_user_id = auth.uid() AND is_active = true
      )
    )
    OR
    -- PRIORITÄT 3: DB-basierter SuperAdmin (FIX! - unabhängig von JWT)
    (
      public.is_superadmin_safe(auth.uid())
      AND NOT EXISTS (
        SELECT 1 FROM impersonation_sessions 
        WHERE superadmin_id = auth.uid() 
          AND status = 'active' 
          AND ended_at IS NULL 
          AND mode = 'view_only'
      )
    )
    OR
    -- PRIORITÄT 4: Active Tenant Session mit Schreibrechten
    EXISTS (
      SELECT 1 FROM active_tenant_sessions 
      WHERE session_user_id = auth.uid() 
        AND impersonated_company_id = p_company_id 
        AND is_active = true
        AND can_write = true
    )
    OR
    -- PRIORITÄT 5: DB-basierte Rollenprüfung (Legacy)
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
        AND company_id = p_company_id 
        AND role IN ('admin', 'hr_manager', 'manager')
    )
$$;

-- ============================================================
-- 5) Hilfsfunktion: User-ID per Email finden (für Edge Function)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER(TRIM(p_email)) LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO service_role;