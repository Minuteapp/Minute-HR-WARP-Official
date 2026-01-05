-- RLS Policies für WFM-Tabellen

-- wfm_resource_types
ALTER TABLE public.wfm_resource_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_resource_types_select" ON public.wfm_resource_types
FOR SELECT USING (
  company_id = get_effective_company_id() OR is_superadmin_safe(auth.uid())
);

CREATE POLICY "wfm_resource_types_manage" ON public.wfm_resource_types
FOR ALL USING (
  company_id = get_effective_company_id()
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
);

-- wfm_resources
ALTER TABLE public.wfm_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_resources_select" ON public.wfm_resources
FOR SELECT USING (
  company_id = get_effective_company_id() OR is_superadmin_safe(auth.uid())
);

CREATE POLICY "wfm_resources_manage" ON public.wfm_resources
FOR ALL USING (
  company_id = get_effective_company_id()
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin'))
);

-- wfm_skills
ALTER TABLE public.wfm_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_skills_select" ON public.wfm_skills
FOR SELECT USING (company_id = get_effective_company_id() OR is_superadmin_safe(auth.uid()));

CREATE POLICY "wfm_skills_manage" ON public.wfm_skills
FOR ALL USING (
  company_id = get_effective_company_id()
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
);

-- wfm_licenses
ALTER TABLE public.wfm_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_licenses_select" ON public.wfm_licenses
FOR SELECT USING (company_id = get_effective_company_id() OR is_superadmin_safe(auth.uid()));

CREATE POLICY "wfm_licenses_manage" ON public.wfm_licenses
FOR ALL USING (
  company_id = get_effective_company_id()
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
);

-- wfm_employee_skills
ALTER TABLE public.wfm_employee_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_employee_skills_select" ON public.wfm_employee_skills
FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees WHERE id = wfm_employee_skills.employee_id AND company_id = get_effective_company_id())
);

CREATE POLICY "wfm_employee_skills_manage" ON public.wfm_employee_skills
FOR ALL USING (
  EXISTS (SELECT 1 FROM employees WHERE id = wfm_employee_skills.employee_id AND company_id = get_effective_company_id())
);

-- wfm_employee_licenses
ALTER TABLE public.wfm_employee_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_employee_licenses_select" ON public.wfm_employee_licenses
FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees WHERE id = wfm_employee_licenses.employee_id AND company_id = get_effective_company_id())
);

CREATE POLICY "wfm_employee_licenses_manage" ON public.wfm_employee_licenses
FOR ALL USING (
  EXISTS (SELECT 1 FROM employees WHERE id = wfm_employee_licenses.employee_id AND company_id = get_effective_company_id())
);

-- wfm_rules
ALTER TABLE public.wfm_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_rules_select" ON public.wfm_rules
FOR SELECT USING (company_id = get_effective_company_id() OR is_superadmin_safe(auth.uid()));

CREATE POLICY "wfm_rules_manage" ON public.wfm_rules
FOR ALL USING (
  company_id = get_effective_company_id()
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'superadmin'))
);

-- wfm_swap_requests
ALTER TABLE public.wfm_swap_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_swap_requests_select" ON public.wfm_swap_requests
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "wfm_swap_requests_insert" ON public.wfm_swap_requests
FOR INSERT WITH CHECK (
  company_id = get_effective_company_id()
  AND requesting_employee_id IN (SELECT id FROM employees WHERE company_id = get_effective_company_id())
);

CREATE POLICY "wfm_swap_requests_update" ON public.wfm_swap_requests
FOR UPDATE USING (
  company_id = get_effective_company_id()
  AND (
    requesting_employee_id IN (SELECT id FROM employees WHERE company_id = get_effective_company_id())
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin'))
  )
);

-- wfm_marketplace
ALTER TABLE public.wfm_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_marketplace_select" ON public.wfm_marketplace
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "wfm_marketplace_insert" ON public.wfm_marketplace
FOR INSERT WITH CHECK (
  company_id = get_effective_company_id()
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin'))
);

CREATE POLICY "wfm_marketplace_update" ON public.wfm_marketplace
FOR UPDATE USING (
  company_id = get_effective_company_id()
);

-- wfm_preferences
ALTER TABLE public.wfm_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_preferences_select" ON public.wfm_preferences
FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees WHERE id = wfm_preferences.employee_id AND company_id = get_effective_company_id())
);

CREATE POLICY "wfm_preferences_manage" ON public.wfm_preferences
FOR ALL USING (
  EXISTS (SELECT 1 FROM employees WHERE id = wfm_preferences.employee_id AND company_id = get_effective_company_id())
);

-- wfm_scenarios
ALTER TABLE public.wfm_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wfm_scenarios_select" ON public.wfm_scenarios
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "wfm_scenarios_manage" ON public.wfm_scenarios
FOR ALL USING (
  company_id = get_effective_company_id()
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr', 'manager', 'superadmin'))
);