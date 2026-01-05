-- 1) is_acting_as(): view_only berücksichtigen
CREATE OR REPLACE FUNCTION public.is_acting_as()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.impersonation_sessions s
    WHERE s.superadmin_id = auth.uid()
      AND s.status = 'active'
      AND s.mode IN ('act_as', 'view_only')
      AND s.ended_at IS NULL
      AND s.expires_at > now()
  );
END;
$$;

-- 2) get_effective_user_id(): view_only berücksichtigen
CREATE OR REPLACE FUNCTION public.get_effective_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_user_id uuid;
BEGIN
  SELECT s.target_user_id
  INTO v_target_user_id
  FROM public.impersonation_sessions s
  WHERE s.superadmin_id = auth.uid()
    AND s.status = 'active'
    AND s.mode IN ('act_as', 'view_only')
    AND s.ended_at IS NULL
    AND s.expires_at > now()
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_target_user_id IS NOT NULL THEN
    RETURN v_target_user_id;
  END IF;

  RETURN auth.uid();
END;
$$;

-- 3) get_effective_company_id(): Impersonation konsistent (view_only + ended_at)
CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- Erst: Aktive Impersonation-Session prüfen
    (SELECT s.target_tenant_id
     FROM public.impersonation_sessions s
     WHERE s.superadmin_id = auth.uid()
       AND s.status = 'active'
       AND s.mode IN ('act_as', 'view_only')
       AND s.ended_at IS NULL
       AND s.expires_at > now()
     ORDER BY s.created_at DESC
     LIMIT 1),
    -- Fallback: user_tenant_sessions
    (SELECT uts.tenant_company_id
     FROM public.user_tenant_sessions uts
     WHERE uts.user_id = auth.uid()
       AND uts.is_tenant_mode = true
     ORDER BY uts.updated_at DESC
     LIMIT 1),
    -- Fallback: company_id aus user_roles
    (SELECT ur.company_id
     FROM public.user_roles ur
     WHERE ur.user_id = auth.uid()
     LIMIT 1),
    -- Fallback: company_id aus employees
    (SELECT e.company_id
     FROM public.employees e
     WHERE e.user_id = auth.uid()
     LIMIT 1)
  )
$$;

-- 4) time_entries: redundante SELECT-Policies entfernen und nur die sichere behalten
DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_select_own_or_manager" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view time entries from their company" ON public.time_entries;
DROP POLICY IF EXISTS "Allow authenticated users to view time entries" ON public.time_entries;

DROP POLICY IF EXISTS "time_entries_select_secure" ON public.time_entries;
CREATE POLICY "time_entries_select_secure" ON public.time_entries
FOR SELECT
USING (
  user_id = public.get_effective_user_id()
  OR (
    company_id = public.get_effective_company_id()
    AND public.has_role_in_company(
      public.get_effective_user_id(),
      public.get_effective_company_id(),
      ARRAY['admin'::text, 'hr'::text, 'manager'::text, 'superadmin'::text]
    )
  )
);

-- (Optional aber hilfreich) EXECUTE-Rechte sicherstellen
GRANT EXECUTE ON FUNCTION public.is_acting_as() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_company_id() TO authenticated;
