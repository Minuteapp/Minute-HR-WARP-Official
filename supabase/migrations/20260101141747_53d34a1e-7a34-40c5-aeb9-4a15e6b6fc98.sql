-- Fix: Robuste Version ohne LIMIT 1 Rollen-Check + Zähler für Debugging

CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_is_authorized boolean := false;
  v_ended_impersonations int := 0;
  v_deleted_tenant_sessions int := 0;
BEGIN
  -- Prüfe Berechtigung OHNE LIMIT 1 (deterministisch)
  -- Erlaubt wenn: is_superadmin_safe ODER eine der erlaubten Rollen existiert
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
      AND role IN ('superadmin', 'admin', 'hr', 'hr_manager')
  ) INTO v_is_authorized;
  
  -- Alternativ auch via is_superadmin_safe prüfen
  IF NOT v_is_authorized THEN
    BEGIN
      SELECT public.is_superadmin_safe(p_user_id) INTO v_is_authorized;
    EXCEPTION WHEN OTHERS THEN
      v_is_authorized := false;
    END;
  END IF;
  
  IF NOT v_is_authorized THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Nicht berechtigt - Nur SuperAdmins, Admins und HR-Manager können Tenant-Kontext löschen',
      'user_id', p_user_id
    );
  END IF;

  -- Beende ALLE aktiven Impersonation-Sessions für diesen Superadmin
  WITH ended AS (
    UPDATE impersonation_sessions
    SET ended_at = now(),
        status = 'ended'
    WHERE superadmin_id = p_user_id
      AND status = 'active'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_ended_impersonations FROM ended;
  
  -- Lösche Tenant-Session
  WITH deleted AS (
    DELETE FROM user_tenant_sessions
    WHERE user_id = p_user_id
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_tenant_sessions FROM deleted;
  
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'ended_impersonations_count', v_ended_impersonations,
    'deleted_tenant_sessions_count', v_deleted_tenant_sessions
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'user_id', p_user_id
    );
END;
$function$;