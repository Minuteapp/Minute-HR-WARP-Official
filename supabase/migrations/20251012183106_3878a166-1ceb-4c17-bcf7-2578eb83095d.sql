-- ===================================================================
-- NOTFALL-FIX: Superadmin-Zugriff wiederherstellen
-- Alle RLS Policies müssen Superadmins explizit erlauben!
-- ===================================================================

-- ============= EMPLOYEES =============
DROP POLICY IF EXISTS "strict_select_employees" ON public.employees;
DROP POLICY IF EXISTS "strict_insert_employees" ON public.employees;
DROP POLICY IF EXISTS "strict_update_employees" ON public.employees;
DROP POLICY IF EXISTS "strict_delete_employees" ON public.employees;

CREATE POLICY "strict_select_employees" ON public.employees
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_employees" ON public.employees
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_employees" ON public.employees
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_employees" ON public.employees
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= ABSENCE_QUOTAS =============
DROP POLICY IF EXISTS "strict_select_quotas" ON public.absence_quotas;
DROP POLICY IF EXISTS "strict_insert_quotas" ON public.absence_quotas;
DROP POLICY IF EXISTS "strict_update_quotas" ON public.absence_quotas;
DROP POLICY IF EXISTS "strict_delete_quotas" ON public.absence_quotas;

CREATE POLICY "strict_select_quotas" ON public.absence_quotas
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_quotas" ON public.absence_quotas
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_quotas" ON public.absence_quotas
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_quotas" ON public.absence_quotas
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= ABSENCE_BLACKOUT_PERIODS =============
DROP POLICY IF EXISTS "strict_select_blackout" ON public.absence_blackout_periods;
DROP POLICY IF EXISTS "strict_insert_blackout" ON public.absence_blackout_periods;
DROP POLICY IF EXISTS "strict_update_blackout" ON public.absence_blackout_periods;
DROP POLICY IF EXISTS "strict_delete_blackout" ON public.absence_blackout_periods;

CREATE POLICY "strict_select_blackout" ON public.absence_blackout_periods
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_blackout" ON public.absence_blackout_periods
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_blackout" ON public.absence_blackout_periods
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_blackout" ON public.absence_blackout_periods
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= ABSENCE_HOLIDAYS =============
DROP POLICY IF EXISTS "strict_select_holidays" ON public.absence_holidays;
DROP POLICY IF EXISTS "strict_insert_holidays" ON public.absence_holidays;
DROP POLICY IF EXISTS "strict_update_holidays" ON public.absence_holidays;
DROP POLICY IF EXISTS "strict_delete_holidays" ON public.absence_holidays;

CREATE POLICY "strict_select_holidays" ON public.absence_holidays
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_holidays" ON public.absence_holidays
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_holidays" ON public.absence_holidays
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_holidays" ON public.absence_holidays
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= ABSENCE_SETTINGS_HIERARCHY =============
DROP POLICY IF EXISTS "strict_select_settings_hier" ON public.absence_settings_hierarchy;
DROP POLICY IF EXISTS "strict_insert_settings_hier" ON public.absence_settings_hierarchy;
DROP POLICY IF EXISTS "strict_update_settings_hier" ON public.absence_settings_hierarchy;
DROP POLICY IF EXISTS "strict_delete_settings_hier" ON public.absence_settings_hierarchy;

CREATE POLICY "strict_select_settings_hier" ON public.absence_settings_hierarchy
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_settings_hier" ON public.absence_settings_hierarchy
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_settings_hier" ON public.absence_settings_hierarchy
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_settings_hier" ON public.absence_settings_hierarchy
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= ABSENCE_PAYROLL_MAPPINGS =============
DROP POLICY IF EXISTS "strict_select_payroll" ON public.absence_payroll_mappings;
DROP POLICY IF EXISTS "strict_insert_payroll" ON public.absence_payroll_mappings;
DROP POLICY IF EXISTS "strict_update_payroll" ON public.absence_payroll_mappings;
DROP POLICY IF EXISTS "strict_delete_payroll" ON public.absence_payroll_mappings;

CREATE POLICY "strict_select_payroll" ON public.absence_payroll_mappings
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_payroll" ON public.absence_payroll_mappings
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_payroll" ON public.absence_payroll_mappings
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_payroll" ON public.absence_payroll_mappings
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= ABSENCE_SUBSTITUTE_RULES =============
DROP POLICY IF EXISTS "strict_select_substitute" ON public.absence_substitute_rules;
DROP POLICY IF EXISTS "strict_insert_substitute" ON public.absence_substitute_rules;
DROP POLICY IF EXISTS "strict_update_substitute" ON public.absence_substitute_rules;
DROP POLICY IF EXISTS "strict_delete_substitute" ON public.absence_substitute_rules;

CREATE POLICY "strict_select_substitute" ON public.absence_substitute_rules
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_substitute" ON public.absence_substitute_rules
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_substitute" ON public.absence_substitute_rules
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_substitute" ON public.absence_substitute_rules
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= BUDGET_PLANS =============
DROP POLICY IF EXISTS "strict_select_budget" ON public.budget_plans;
DROP POLICY IF EXISTS "strict_insert_budget" ON public.budget_plans;
DROP POLICY IF EXISTS "strict_update_budget" ON public.budget_plans;
DROP POLICY IF EXISTS "strict_delete_budget" ON public.budget_plans;

CREATE POLICY "strict_select_budget" ON public.budget_plans
FOR SELECT USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_insert_budget" ON public.budget_plans
FOR INSERT WITH CHECK (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_update_budget" ON public.budget_plans
FOR UPDATE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

CREATE POLICY "strict_delete_budget" ON public.budget_plans
FOR DELETE USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
);

-- ============= COMPANIES (Spezial) =============
-- Superadmins brauchen ALLE Companies zu sehen, normale Admins nur ihre eigene
DROP POLICY IF EXISTS "admin_own_company" ON public.companies;

CREATE POLICY "admin_own_company" ON public.companies
FOR SELECT USING (
  is_superadmin_safe(auth.uid())
  OR id = get_effective_company_id()
);

-- Bestätige
DO $$
BEGIN
  RAISE NOTICE '✅ NOTFALL-FIX ABGESCHLOSSEN: Superadmin hat wieder vollen Zugriff!';
  RAISE NOTICE '✅ Betroffene Tabellen: employees, absence_*, budget_plans, companies';
  RAISE NOTICE '✅ Superadmins sehen jetzt ALLE Daten (auch ohne Tenant-Modus)';
END $$;