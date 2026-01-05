-- FIRMA-DATEN ISOLATION REPARATUR
-- Problem: Alle neuen Firmen sehen Test-/Mock-Daten von SVH GmbH
-- Lösung: Saubere RLS Policies + Daten-Isolation

-- ===================================================================
-- SCHRITT 1: BEREINIGUNG DER MEHRFACH-POLICIES
-- ===================================================================

-- Entferne alle überlappenden employees policies
DROP POLICY IF EXISTS "Company Employees Isolation" ON public.employees;
DROP POLICY IF EXISTS "employees_company_isolation" ON public.employees;
DROP POLICY IF EXISTS "employees_critical_tenant_isolation" ON public.employees;

-- Entferne auch andere überlappende policies falls vorhanden
DROP POLICY IF EXISTS "Absence Company Isolation" ON public.absence_requests;
DROP POLICY IF EXISTS "absence_requests_company_isolation" ON public.absence_requests;

-- ===================================================================
-- SCHRITT 2: SAUBERE FIRMEN-ISOLATION FÜR EMPLOYEES
-- ===================================================================

CREATE POLICY "Clean Company Employee Isolation"
ON public.employees
FOR ALL
USING (
  CASE 
    -- SuperAdmin im God-Mode: Alle Mitarbeiter sehen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- SuperAdmin/Admin im Tenant-Mode: Nur Mitarbeiter der ausgewählten Firma
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- Normale Benutzer: Nur Mitarbeiter ihrer eigenen Firma
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR id = auth.uid()
  END
)
WITH CHECK (
  CASE 
    -- SuperAdmin im God-Mode: Kann alles erstellen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- SuperAdmin/Admin im Tenant-Mode: Nur für die ausgewählte Firma
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- Normale Benutzer: Nur für ihre eigene Firma
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR id = auth.uid()
  END
);

-- ===================================================================
-- SCHRITT 3: SAUBERE FIRMEN-ISOLATION FÜR ABSENCE_REQUESTS  
-- ===================================================================

CREATE POLICY "Clean Company Absence Isolation"
ON public.absence_requests
FOR ALL
USING (
  CASE 
    -- SuperAdmin im God-Mode: Alle Anträge sehen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- SuperAdmin/Admin im Tenant-Mode: Nur Anträge der Firma-Mitarbeiter
    WHEN is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
    -- Normale Benutzer: Eigene + Firmen-Anträge
    ELSE 
      user_id = auth.uid() OR user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid()) 
        AND get_user_company_id(auth.uid()) IS NOT NULL
      )
  END
)
WITH CHECK (
  CASE 
    -- SuperAdmin im God-Mode: Kann alles erstellen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- SuperAdmin/Admin im Tenant-Mode: Nur für Firma-Mitarbeiter
    WHEN is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
    -- Normale Benutzer: Eigene + Firmen-Anträge
    ELSE 
      user_id = auth.uid() OR user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid()) 
        AND get_user_company_id(auth.uid()) IS NOT NULL
      )
  END
);

-- ===================================================================
-- SCHRITT 4: AUDIT LOG FÜR DATEN-ISOLATION REPARATUR
-- ===================================================================

INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'company_data_isolation_fix', 
  'multi_tenant_policies', 
  'employees_absence_isolation',
  jsonb_build_object(
    'issue', 'Neue Firmen sahen Test-/Mock-Daten von SVH GmbH',
    'solution', 'Saubere RLS Policies für Firmen-Daten-Isolation implementiert',
    'affected_tables', '["employees", "absence_requests"]',
    'benefit', 'Jede Firma sieht nur noch ihre eigenen Daten',
    'policies_cleaned', 'Mehrfach-Policies entfernt, einheitliche Isolation'
  ),
  'high'
);

SELECT 'FIRMEN-DATEN ISOLATION REPARIERT 🏢✨ - Jede Firma hat jetzt ihre eigenen Daten!' as isolation_status;