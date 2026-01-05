-- Fix: SuperAdmin-Tunnel muss auch active_tenant_sessions setzen,
-- da current_tenant_id()/can_access_tenant() darauf basieren.

CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- SuperAdmin: aktive Tenant-Session setzen (für current_tenant_id)
  IF v_user_role = 'superadmin' THEN
    UPDATE public.active_tenant_sessions
    SET is_active = false,
        expires_at = COALESCE(expires_at, now())
    WHERE session_user_id = p_user_id
      AND is_active = true;

    INSERT INTO public.active_tenant_sessions (
      session_user_id,
      impersonated_company_id,
      is_active,
      can_write,
      reason,
      created_at,
      expires_at
    ) VALUES (
      p_user_id,
      p_company_id,
      true,
      true,
      'superadmin_tunnel',
      now(),
      NULL
    );
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
$function$;

CREATE OR REPLACE FUNCTION public.clear_tenant_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- SuperAdmin-Prüfung mit verbesserter Funktion
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext löschen';
  END IF;

  -- Deaktiviere aktive Tenant-Sessions
  UPDATE public.active_tenant_sessions
  SET is_active = false,
      expires_at = COALESCE(expires_at, now())
  WHERE session_user_id = auth.uid()
    AND is_active = true;
  
  -- Setze Tenant-Session zurück (nicht löschen, um Tabelle zu erhalten)
  INSERT INTO public.user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, updated_at)
  VALUES (auth.uid(), NULL, false, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = NULL,
    is_tenant_mode = false,
    updated_at = now();
  
  -- Log für Debugging
  RAISE NOTICE 'Tenant context erfolgreich gelöscht für user_id=%', auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_effective_user_id uuid := COALESCE(auth.uid(), p_user_id);
  v_is_authorized boolean := false;
  v_ended_impersonations int := 0;
  v_deleted_tenant_sessions int := 0;
  v_deactivated_active_sessions int := 0;
BEGIN
  IF v_effective_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Nicht authentifiziert'
    );
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = v_effective_user_id
      AND role IN ('superadmin', 'admin', 'hr', 'hr_manager')
  ) INTO v_is_authorized;

  IF NOT v_is_authorized THEN
    BEGIN
      SELECT public.is_superadmin_safe(v_effective_user_id) INTO v_is_authorized;
    EXCEPTION WHEN OTHERS THEN
      v_is_authorized := false;
    END;
  END IF;

  IF NOT v_is_authorized THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Nicht berechtigt - Nur SuperAdmins, Admins und HR-Manager können Tenant-Kontext löschen',
      'user_id', v_effective_user_id
    );
  END IF;

  WITH ended AS (
    UPDATE impersonation_sessions
    SET ended_at = now(),
        status = 'ended'
    WHERE superadmin_id = v_effective_user_id
      AND status = 'active'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_ended_impersonations FROM ended;

  WITH deactivated AS (
    UPDATE public.active_tenant_sessions
    SET is_active = false,
        expires_at = COALESCE(expires_at, now())
    WHERE session_user_id = v_effective_user_id
      AND is_active = true
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deactivated_active_sessions FROM deactivated;

  WITH deleted AS (
    DELETE FROM user_tenant_sessions
    WHERE user_id = v_effective_user_id
    RETURNING user_id
  )
  SELECT COUNT(*) INTO v_deleted_tenant_sessions FROM deleted;

  RETURN json_build_object(
    'success', true,
    'user_id', v_effective_user_id,
    'ended_impersonations_count', v_ended_impersonations,
    'deactivated_active_sessions_count', v_deactivated_active_sessions,
    'deleted_tenant_sessions_count', v_deleted_tenant_sessions
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', v_effective_user_id
    );
END;
$function$;
