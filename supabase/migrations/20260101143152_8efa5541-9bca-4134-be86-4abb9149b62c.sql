-- Fix: Superadmin muss eigene Impersonation-Session auch ohne Tenant-Schreibrechte beenden können (FORCE RLS)

-- 1) RLS-Policy: Superadmin darf eigene Impersonation-Session updaten (Status/ended_at)
DROP POLICY IF EXISTS superadmin_end_own_impersonation_sessions ON public.impersonation_sessions;
CREATE POLICY superadmin_end_own_impersonation_sessions
ON public.impersonation_sessions
FOR UPDATE
TO public
USING (
  superadmin_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'::user_role
  )
)
WITH CHECK (
  superadmin_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'::user_role
  )
);

-- 2) RLS-Policy: User darf eigene tenant-session löschen (falls vorhanden)
DROP POLICY IF EXISTS user_delete_own_tenant_session ON public.user_tenant_sessions;
CREATE POLICY user_delete_own_tenant_session
ON public.user_tenant_sessions
FOR DELETE
TO public
USING (user_id = auth.uid());

-- 3) RPC robuster machen: Parameter nicht vertrauen, auth.uid() bevorzugen
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