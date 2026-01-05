-- ===================================================================
-- PHASE 2: RLS-POLICY-BEREINIGUNG für Tabellen mit company_id
-- ===================================================================

-- ============= ABSENCE_QUOTAS =============
DROP POLICY IF EXISTS "HR manages quotas" ON public.absence_quotas;
DROP POLICY IF EXISTS "Users view own quotas" ON public.absence_quotas;

CREATE POLICY "strict_select_quotas" ON public.absence_quotas
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "strict_insert_quotas" ON public.absence_quotas
FOR INSERT WITH CHECK (company_id = get_effective_company_id());

CREATE POLICY "strict_update_quotas" ON public.absence_quotas
FOR UPDATE USING (company_id = get_effective_company_id());

CREATE POLICY "strict_delete_quotas" ON public.absence_quotas
FOR DELETE USING (company_id = get_effective_company_id());

-- ============= ABSENCE_BLACKOUT_PERIODS =============
DROP POLICY IF EXISTS "HR manages blackout periods" ON public.absence_blackout_periods;
DROP POLICY IF EXISTS "Users view blackout periods" ON public.absence_blackout_periods;

CREATE POLICY "strict_select_blackout" ON public.absence_blackout_periods
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "strict_insert_blackout" ON public.absence_blackout_periods
FOR INSERT WITH CHECK (company_id = get_effective_company_id());

CREATE POLICY "strict_update_blackout" ON public.absence_blackout_periods
FOR UPDATE USING (company_id = get_effective_company_id());

CREATE POLICY "strict_delete_blackout" ON public.absence_blackout_periods
FOR DELETE USING (company_id = get_effective_company_id());

-- ============= ABSENCE_HOLIDAYS =============
DROP POLICY IF EXISTS "HR manages holidays" ON public.absence_holidays;
DROP POLICY IF EXISTS "Users view holidays" ON public.absence_holidays;

CREATE POLICY "strict_select_holidays" ON public.absence_holidays
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "strict_insert_holidays" ON public.absence_holidays
FOR INSERT WITH CHECK (company_id = get_effective_company_id());

CREATE POLICY "strict_update_holidays" ON public.absence_holidays
FOR UPDATE USING (company_id = get_effective_company_id());

CREATE POLICY "strict_delete_holidays" ON public.absence_holidays
FOR DELETE USING (company_id = get_effective_company_id());

-- ============= ABSENCE_SETTINGS_HIERARCHY =============
DROP POLICY IF EXISTS "Admin manages settings" ON public.absence_settings_hierarchy;
DROP POLICY IF EXISTS "Users view settings" ON public.absence_settings_hierarchy;

CREATE POLICY "strict_select_settings_hier" ON public.absence_settings_hierarchy
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "strict_insert_settings_hier" ON public.absence_settings_hierarchy
FOR INSERT WITH CHECK (company_id = get_effective_company_id());

CREATE POLICY "strict_update_settings_hier" ON public.absence_settings_hierarchy
FOR UPDATE USING (company_id = get_effective_company_id());

CREATE POLICY "strict_delete_settings_hier" ON public.absence_settings_hierarchy
FOR DELETE USING (company_id = get_effective_company_id());

-- ============= ABSENCE_PAYROLL_MAPPINGS =============
DROP POLICY IF EXISTS "HR manages payroll mappings" ON public.absence_payroll_mappings;
DROP POLICY IF EXISTS "HR views payroll mappings" ON public.absence_payroll_mappings;

CREATE POLICY "strict_select_payroll" ON public.absence_payroll_mappings
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "strict_insert_payroll" ON public.absence_payroll_mappings
FOR INSERT WITH CHECK (company_id = get_effective_company_id());

CREATE POLICY "strict_update_payroll" ON public.absence_payroll_mappings
FOR UPDATE USING (company_id = get_effective_company_id());

CREATE POLICY "strict_delete_payroll" ON public.absence_payroll_mappings
FOR DELETE USING (company_id = get_effective_company_id());

-- ============= ABSENCE_SUBSTITUTE_RULES =============
DROP POLICY IF EXISTS "Users manage own substitute rules" ON public.absence_substitute_rules;

CREATE POLICY "strict_select_substitute" ON public.absence_substitute_rules
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "strict_insert_substitute" ON public.absence_substitute_rules
FOR INSERT WITH CHECK (company_id = get_effective_company_id());

CREATE POLICY "strict_update_substitute" ON public.absence_substitute_rules
FOR UPDATE USING (company_id = get_effective_company_id());

CREATE POLICY "strict_delete_substitute" ON public.absence_substitute_rules
FOR DELETE USING (company_id = get_effective_company_id());

-- Bestätige
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 2 Teil 1 abgeschlossen: RLS Policies für Absence-Tabellen erstellt';
END $$;