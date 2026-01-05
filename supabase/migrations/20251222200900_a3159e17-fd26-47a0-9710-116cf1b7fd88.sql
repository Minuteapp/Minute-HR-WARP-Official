
-- Entferne gefährliche SELECT qual:true Policies auf sensitiven Tabellen

-- Asset-related
DROP POLICY IF EXISTS "Users can read assets" ON public.assets;
DROP POLICY IF EXISTS "Users can read assignments" ON public.asset_assignments;

-- AI-related
DROP POLICY IF EXISTS "ai_automations_select" ON public.ai_automations;
DROP POLICY IF EXISTS "ai_cost_tracking_select" ON public.ai_cost_tracking;
DROP POLICY IF EXISTS "ai_forecasts_select" ON public.ai_forecasts;
DROP POLICY IF EXISTS "ai_models_select" ON public.ai_models;
DROP POLICY IF EXISTS "ai_provider_settings_select" ON public.ai_provider_settings;
DROP POLICY IF EXISTS "ai_provider_settings_all" ON public.ai_provider_settings;

-- API-related
DROP POLICY IF EXISTS "api_global_settings_select" ON public.api_global_settings;
DROP POLICY IF EXISTS "api_global_settings_all" ON public.api_global_settings;
DROP POLICY IF EXISTS "api_module_settings_select" ON public.api_module_settings;
DROP POLICY IF EXISTS "api_module_settings_all" ON public.api_module_settings;
DROP POLICY IF EXISTS "api_usage_logs_select" ON public.api_usage_logs;

-- Audit
DROP POLICY IF EXISTS "Users can view findings" ON public.audit_findings;
DROP POLICY IF EXISTS "Users can update findings" ON public.audit_findings;

-- Business trip expenses/reports
DROP POLICY IF EXISTS "Users can view business trip expenses" ON public.business_trip_expenses;
DROP POLICY IF EXISTS "Users can view expenses" ON public.business_trip_expenses;
DROP POLICY IF EXISTS "Users can view business trip reports" ON public.business_trip_reports;
DROP POLICY IF EXISTS "Users can view reports" ON public.business_trip_reports;

-- Calendar
DROP POLICY IF EXISTS "Authenticated users can view calendar_conflicts" ON public.calendar_conflicts;

-- Sichere Ersatz-Policies für kritische Tabellen

-- assets: Mandanten-basiert
CREATE POLICY "assets_select_secure" ON public.assets FOR SELECT TO authenticated
USING (company_id = public.get_effective_company_id());

-- ai_provider_settings: Nur Admin
CREATE POLICY "ai_provider_settings_select_secure" ON public.ai_provider_settings FOR SELECT TO authenticated
USING (
  company_id = public.get_effective_company_id() 
  AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'superadmin'])
);

-- api_global_settings: Nur Admin
CREATE POLICY "api_global_settings_select_secure" ON public.api_global_settings FOR SELECT TO authenticated
USING (
  company_id = public.get_effective_company_id() 
  AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'superadmin'])
);

-- api_module_settings: Nur Admin
CREATE POLICY "api_module_settings_select_secure" ON public.api_module_settings FOR SELECT TO authenticated
USING (
  company_id = public.get_effective_company_id() 
  AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'superadmin'])
);

-- business_trip_expenses: Mandanten-basiert oder eigene
CREATE POLICY "business_trip_expenses_select_secure" ON public.business_trip_expenses FOR SELECT TO authenticated
USING (
  business_trip_id IN (
    SELECT id FROM public.business_trips 
    WHERE employee_id IN (SELECT id FROM public.employees WHERE user_id = public.get_effective_user_id())
  )
  OR (company_id = public.get_effective_company_id() AND public.has_role_in_company(public.get_effective_user_id(), public.get_effective_company_id(), ARRAY['admin', 'hr', 'manager', 'superadmin']))
);
