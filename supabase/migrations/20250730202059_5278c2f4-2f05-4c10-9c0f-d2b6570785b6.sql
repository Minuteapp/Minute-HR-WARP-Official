-- KRITISCH: RLS-Policies für alle Tabellen mit company_id (korrekte Liste)

-- Goals Tabelle
DROP POLICY IF EXISTS "Goals company isolation" ON goals;
CREATE POLICY "Goals company isolation" ON goals FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Calendar Events Tabelle
DROP POLICY IF EXISTS "Calendar events company isolation" ON calendar_events;
CREATE POLICY "Calendar events company isolation" ON calendar_events FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Objectives Tabelle
DROP POLICY IF EXISTS "Objectives company isolation" ON objectives;
CREATE POLICY "Objectives company isolation" ON objectives FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Onboarding Goals Tabelle
DROP POLICY IF EXISTS "Onboarding goals company isolation" ON onboarding_goals;
CREATE POLICY "Onboarding goals company isolation" ON onboarding_goals FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Strategic Themes Tabelle
DROP POLICY IF EXISTS "Strategic themes company isolation" ON strategic_themes;
CREATE POLICY "Strategic themes company isolation" ON strategic_themes FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Company Locations Tabelle
DROP POLICY IF EXISTS "Company locations isolation" ON company_locations;
CREATE POLICY "Company locations isolation" ON company_locations FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);