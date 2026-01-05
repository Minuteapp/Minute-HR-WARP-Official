-- Fix: Tenant-Modus zuverlässig verlassen (beendet auch hängen gebliebene/abgelaufene impersonation_sessions)

CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
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
      'error', 'Nicht berechtigt - Nur SuperAdmins, Admins und HR-Manager können Tenant-Kontext löschen',
      'user_id', p_user_id,
      'user_role', COALESCE(v_user_role, 'keine Rolle gefunden')
    );
  END IF;

  -- Beende ggf. aktive (auch abgelaufene) Impersonation-Sessions,
  -- damit der SuperAdmin nicht im Tenant-Modus "festhängt".
  UPDATE impersonation_sessions
  SET ended_at = now(),
      status = 'ended'
  WHERE superadmin_id = p_user_id
    AND status = 'active';
  
  -- Lösche Tenant-Session
  DELETE FROM user_tenant_sessions
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'user_role', v_user_role
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