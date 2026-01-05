-- 3) Überarbeite get_effective_company_id() mit korrekten Spaltennamen
CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- Erst: Aktive Impersonation-Session prüfen
    (SELECT target_tenant_id FROM public.impersonation_sessions
     WHERE superadmin_id = auth.uid()
       AND status = 'active'
       AND mode IN ('act_as', 'view_only')
       AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 1),
    -- Fallback: user_tenant_sessions (korrigiert: tenant_company_id)
    (SELECT tenant_company_id FROM public.user_tenant_sessions
     WHERE user_id = auth.uid()
       AND is_tenant_mode = true
     ORDER BY updated_at DESC
     LIMIT 1),
    -- Fallback: company_id aus user_roles
    (SELECT company_id FROM public.user_roles
     WHERE user_id = auth.uid()
     LIMIT 1),
    -- Fallback: company_id aus employees
    (SELECT company_id FROM public.employees
     WHERE user_id = auth.uid()
     LIMIT 1)
  )
$$;

-- 4) Entferne redundante time_entries SELECT-Policies
DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_select_own_or_manager" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view time entries from their company" ON public.time_entries;
DROP POLICY IF EXISTS "Allow authenticated users to view time entries" ON public.time_entries;

-- Stelle sicher dass nur time_entries_select_secure existiert
DROP POLICY IF EXISTS "time_entries_select_secure" ON public.time_entries;
CREATE POLICY "time_entries_select_secure" ON public.time_entries
FOR SELECT USING (
  user_id = public.get_effective_user_id()
  OR (
    company_id = public.get_effective_company_id()
    AND public.has_role_in_company(auth.uid(), public.get_effective_company_id(), ARRAY['admin', 'hr', 'manager', 'superadmin'])
  )
);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_effective_company_id() TO authenticated;