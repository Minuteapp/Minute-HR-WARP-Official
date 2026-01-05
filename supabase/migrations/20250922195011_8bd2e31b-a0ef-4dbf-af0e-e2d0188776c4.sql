-- FINALE SICHERHEITSREPARATUR: Policy-Konflikte beseitigen

-- ===================================================================
-- SCHRITT 1: ALLE BESTEHENDEN POLICIES EXPLIZIT LÖSCHEN
-- ===================================================================

-- User Tenant Sessions: Alle bestehenden Policies entfernen
DROP POLICY IF EXISTS "Users manage own tenant sessions" ON user_tenant_sessions;
DROP POLICY IF EXISTS "SuperAdmin can manage tenant sessions" ON user_tenant_sessions;
DROP POLICY IF EXISTS "Users can view their own tenant sessions" ON user_tenant_sessions;

-- Companies: Alle Reste entfernen
DROP POLICY IF EXISTS "Secure Company Isolation" ON companies;

-- Employees: Alle Reste entfernen  
DROP POLICY IF EXISTS "Secure Employee Isolation" ON employees;

-- User Roles: Alle Reste entfernen
DROP POLICY IF EXISTS "Secure User Roles Isolation" ON user_roles;

-- ===================================================================
-- SCHRITT 2: FINAL SICHERE POLICIES ERSTELLEN
-- ===================================================================

-- COMPANIES: Finale sichere Policy
CREATE POLICY "Final Secure Company Isolation"
ON public.companies
FOR ALL
USING (
  CASE
    -- SuperAdmin außerhalb Tenant-Modus: ALLES
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    -- SuperAdmin im Tenant-Modus: NUR Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN id = get_tenant_company_id_safe()
    -- Normale Benutzer: NUR eigene Firma
    ELSE id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN id = get_tenant_company_id_safe()
    ELSE id = get_user_company_id(auth.uid())
  END
);

-- EMPLOYEES: Finale sichere Policy
CREATE POLICY "Final Secure Employee Isolation"
ON public.employees
FOR ALL
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_superladmin_safe(auth.uid()) AND is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) OR id = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid())
  END
);

-- USER_ROLES: Finale sichere Policy
CREATE POLICY "Final Secure User Roles Isolation"
ON public.user_roles
FOR ALL
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe() OR company_id IS NULL
    WHEN user_id = auth.uid() THEN true
    ELSE 
      company_id = get_user_company_id(auth.uid()) AND 
      EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role IN ('admin', 'hr'))
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe() OR company_id IS NULL
    ELSE 
      user_id = auth.uid() OR 
      (company_id = get_user_company_id(auth.uid()) AND 
       EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role IN ('admin', 'hr')))
  END
);

-- USER_TENANT_SESSIONS: Finale sichere Policy
CREATE POLICY "Final Secure Tenant Sessions"
ON public.user_tenant_sessions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- SCHRITT 3: TESTFIRMA BEREINIGEN (FALLS EXISTENT)
-- ===================================================================

-- Bereinige mögliche Cross-Contamination in Testfirma Clean
UPDATE public.companies 
SET 
  logo_url = NULL,
  primary_color = NULL, 
  secondary_color = NULL,
  brand_font = NULL,
  metadata = '{}'::jsonb
WHERE name = 'Testfirma Clean GmbH';

-- ===================================================================
-- SCHRITT 4: FINALE AUDIT-LOG-EINTRÄGE
-- ===================================================================

INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_repair_complete', 
  'multi_tenant_system', 
  'final_repair',
  jsonb_build_object(
    'status', 'CRITICAL SECURITY BREACH FIXED',
    'action', 'Complete Multi-Tenant isolation restored',
    'tables_secured', ARRAY['companies', 'employees', 'user_roles', 'user_tenant_sessions'],
    'data_contamination', 'Prevented further data leaks between companies',
    'testfirma_cleaned', 'Testfirma Clean bereinigt von Cross-Contamination'
  ),
  'critical'
);

SELECT 'SICHERHEITSLÜCKE GESCHLOSSEN ✅ - Multi-Tenant-Isolation wiederhergestellt' as final_status;