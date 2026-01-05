
-- Phase 1: Kritische Funktionen reparieren
CREATE OR REPLACE FUNCTION public.is_acting_as()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.impersonation_sessions WHERE superadmin_id = auth.uid() AND mode = 'act_as' AND status = 'active' AND (expires_at IS NULL OR expires_at > now()));
END;
$$;

CREATE OR REPLACE FUNCTION public.get_effective_user_id()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE target_id uuid;
BEGIN
  SELECT target_user_id INTO target_id FROM public.impersonation_sessions WHERE superadmin_id = auth.uid() AND mode = 'act_as' AND status = 'active' AND (expires_at IS NULL OR expires_at > now()) ORDER BY created_at DESC LIMIT 1;
  IF target_id IS NOT NULL THEN RETURN target_id; END IF;
  RETURN auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role_in_company(_user_id uuid, _company_id uuid, _roles text[])
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND company_id = _company_id AND role::text = ANY(_roles));
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_acting_as() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_in_company(uuid, uuid, text[]) TO authenticated;

-- Phase 2: Policies entfernen
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "employees_select_all" ON public.employees;
DROP POLICY IF EXISTS "time_entries_select_all" ON public.time_entries;
DROP POLICY IF EXISTS "absence_requests_select_all" ON public.absence_requests;
DROP POLICY IF EXISTS "notifications_select_all" ON public.notifications;
DROP POLICY IF EXISTS "business_trips_select_all" ON public.business_trips;
DROP POLICY IF EXISTS "Allow authenticated users to view business trips" ON public.business_trips;
DROP POLICY IF EXISTS "impersonation_sessions_select_all" ON public.impersonation_sessions;

-- Phase 3: Sichere Policies (ohne chats)

CREATE POLICY "profiles_select_secure" ON public.profiles FOR SELECT TO authenticated
USING (id = public.get_effective_user_id() OR public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'hr', 'superadmin']));

CREATE POLICY "employees_select_secure" ON public.employees FOR SELECT TO authenticated
USING (user_id = public.get_effective_user_id() OR (company_id = public.get_effective_company_id() AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'hr', 'manager', 'superadmin'])));

CREATE POLICY "time_entries_select_secure" ON public.time_entries FOR SELECT TO authenticated
USING (user_id = public.get_effective_user_id() OR (company_id = public.get_effective_company_id() AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'hr', 'manager', 'superadmin'])));

CREATE POLICY "absence_requests_select_secure" ON public.absence_requests FOR SELECT TO authenticated
USING (user_id = public.get_effective_user_id() OR (company_id = public.get_effective_company_id() AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'hr', 'manager', 'superadmin'])));

CREATE POLICY "notifications_select_secure" ON public.notifications FOR SELECT TO authenticated
USING (user_id = public.get_effective_user_id());

CREATE POLICY "business_trips_select_secure" ON public.business_trips FOR SELECT TO authenticated
USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = public.get_effective_user_id())
  OR (company_id = public.get_effective_company_id() AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'hr', 'manager', 'superadmin']))
);

CREATE POLICY "impersonation_sessions_select_secure" ON public.impersonation_sessions FOR SELECT TO authenticated
USING (superadmin_id = auth.uid());
