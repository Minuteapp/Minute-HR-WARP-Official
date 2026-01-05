-- ===================================================================
-- PHASE 2 TEIL 2: Weitere kritische Tabellen mit company_id
-- ===================================================================

-- ============= BUDGET_PLANS =============
-- Lösche erst alle existierenden Policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'budget_plans'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.budget_plans';
  END LOOP;
END $$;

CREATE POLICY "strict_select_budget" ON public.budget_plans
FOR SELECT USING (company_id = get_effective_company_id());

CREATE POLICY "strict_insert_budget" ON public.budget_plans
FOR INSERT WITH CHECK (company_id = get_effective_company_id());

CREATE POLICY "strict_update_budget" ON public.budget_plans
FOR UPDATE USING (company_id = get_effective_company_id());

CREATE POLICY "strict_delete_budget" ON public.budget_plans
FOR DELETE USING (company_id = get_effective_company_id());

-- ============= COMPANIES =============
-- Superadmins müssen alle Companies sehen können für die Verwaltung
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.companies';
  END LOOP;
END $$;

-- Superadmins sehen alle Companies
CREATE POLICY "superadmin_all_companies" ON public.companies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- Normale Admins sehen nur ihre eigene Company
CREATE POLICY "admin_own_company" ON public.companies
FOR SELECT USING (
  id = get_effective_company_id()
  AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- Bestätige
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 2 Teil 2 abgeschlossen: Budget Plans + Companies gesichert';
END $$;