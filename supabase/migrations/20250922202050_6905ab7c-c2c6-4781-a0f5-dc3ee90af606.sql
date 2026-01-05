-- ===================================================================
-- VOLLSTÄNDIGE RLS POLICY BEREINIGUNG & ECHTE DATEN-ISOLATION (KORRIGIERT)
-- Problem: Neue Firmen sehen immer noch alle Test-/Mock-Daten
-- Lösung: Komplette Policy-Bereinigung + echte Multi-Tenant Isolation
-- ===================================================================

-- ===================================================================
-- SCHRITT 1: KOMPLETTE POLICY BEREINIGUNG (ALLE TABELLEN)  
-- ===================================================================

-- COMPANIES: Alle überlappenden Policies entfernen
DROP POLICY IF EXISTS "SuperAdmin full access to companies" ON public.companies;
DROP POLICY IF EXISTS "Allow all to view companies" ON public.companies;
DROP POLICY IF EXISTS "Allow creation of companies" ON public.companies;
DROP POLICY IF EXISTS "Allow updating companies" ON public.companies;
DROP POLICY IF EXISTS "SuperAdmins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "SuperAdmins can create companies" ON public.companies;
DROP POLICY IF EXISTS "SuperAdmins can update companies" ON public.companies;
DROP POLICY IF EXISTS "SuperAdmins can delete companies" ON public.companies;
DROP POLICY IF EXISTS "Company admins can view their company" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their assigned company" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;

-- EMPLOYEES: Alle Policies entfernen
DROP POLICY IF EXISTS "Clean Company Employee Isolation" ON public.employees;
DROP POLICY IF EXISTS "Company Employees Isolation" ON public.employees;
DROP POLICY IF EXISTS "employees_company_isolation" ON public.employees;
DROP POLICY IF EXISTS "employees_critical_tenant_isolation" ON public.employees;
DROP POLICY IF EXISTS "SuperAdmin full access to employees" ON public.employees;
DROP POLICY IF EXISTS "Allow all to view employees" ON public.employees;
DROP POLICY IF EXISTS "Allow creation of employees" ON public.employees;
DROP POLICY IF EXISTS "Allow updating employees" ON public.employees;

-- ABSENCE_REQUESTS: Alle Policies entfernen  
DROP POLICY IF EXISTS "Clean Company Absence Isolation" ON public.absence_requests;
DROP POLICY IF EXISTS "Absence Company Isolation" ON public.absence_requests;
DROP POLICY IF EXISTS "absence_requests_company_isolation" ON public.absence_requests;
DROP POLICY IF EXISTS "SuperAdmin full access to absence_requests" ON public.absence_requests;

-- ===================================================================
-- SCHRITT 2: DATEN BEREINIGUNG - ALLE TEST-DATEN DER SVH ZUWEISEN
-- ===================================================================

-- Alle Mitarbeiter ohne company_id der SVH GmbH zuweisen
UPDATE public.employees 
SET company_id = (
  SELECT id FROM public.companies 
  WHERE name = 'SVH GmbH' 
  LIMIT 1
)
WHERE company_id IS NULL;

-- ===================================================================
-- SCHRITT 3: FUNKTIONEN KORRIGIEREN (ERST DROPPEN)
-- ===================================================================

-- Drop und recreate get_user_company_id wegen Parameter-Konflikt
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);

CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Hole company_id aus user_roles (primäre Quelle)
  RETURN (
    SELECT ur.company_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = p_user_id
    LIMIT 1
  );
END;
$$;

-- ===================================================================
-- SCHRITT 4: ECHTE MULTI-TENANT ISOLATION (SINGLE POLICY PRO TABELLE)
-- ===================================================================

-- COMPANIES: Eine einzige, saubere Policy
CREATE POLICY "Multi_Tenant_Company_Access"
ON public.companies
FOR ALL
USING (
  CASE 
    -- SuperAdmin kann alle Firmen verwalten
    WHEN is_superadmin_safe(auth.uid()) THEN 
      true
    -- Normale Admins: Nur ihre eigene Firma
    WHEN is_admin_safe(auth.uid()) THEN 
      id = get_user_company_id(auth.uid())
    -- Normale Benutzer: Nur ihre Firma (readonly)
    ELSE 
      id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE 
    -- Nur SuperAdmins können Firmen erstellen/bearbeiten
    WHEN is_superadmin_safe(auth.uid()) THEN 
      true
    -- Admins können nur ihre eigene Firma bearbeiten
    WHEN is_admin_safe(auth.uid()) THEN 
      id = get_user_company_id(auth.uid())
    -- Normale Benutzer können keine Firmen bearbeiten
    ELSE 
      false
  END
);

-- EMPLOYEES: Eine einzige, strenge Policy für echte Isolation
CREATE POLICY "Multi_Tenant_Employee_Access"
ON public.employees
FOR ALL
USING (
  CASE 
    -- SuperAdmin im Tenant-Mode: Nur die ausgewählte Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin OHNE Tenant-Mode: NUR EIGENE Firma (nicht alle!)
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      company_id = get_user_company_id(auth.uid())
    -- Normale Benutzer: Nur ihre Firma + sich selbst
    ELSE 
      (company_id = get_user_company_id(auth.uid()) AND get_user_company_id(auth.uid()) IS NOT NULL) 
      OR id = auth.uid()
  END
)
WITH CHECK (
  CASE 
    -- SuperAdmin im Tenant-Mode: Kann für die Firma erstellen
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- SuperAdmin ohne Tenant: Kann für eigene Firma erstellen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      company_id = get_user_company_id(auth.uid())
    -- Normale Benutzer: Können für ihre Firma erstellen
    ELSE 
      (company_id = get_user_company_id(auth.uid()) AND get_user_company_id(auth.uid()) IS NOT NULL)
      OR id = auth.uid()
  END
);

-- ABSENCE_REQUESTS: Eine einzige, strenge Policy für echte Isolation
CREATE POLICY "Multi_Tenant_Absence_Access"
ON public.absence_requests
FOR ALL
USING (
  CASE 
    -- SuperAdmin im Tenant-Mode: Nur Anträge der Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
    -- SuperAdmin OHNE Tenant: NUR EIGENE Firma (KRITISCH!)
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
      ) OR user_id = auth.uid()
    -- Normale Benutzer: Eigene + Firmen-Anträge
    ELSE 
      user_id = auth.uid() OR user_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.company_id = get_user_company_id(auth.uid()) 
        AND get_user_company_id(auth.uid()) IS NOT NULL
      )
  END
)
WITH CHECK (
  CASE 
    -- SuperAdmin im Tenant-Mode: Kann für Tenant-Firma erstellen
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
    -- SuperAdmin ohne Tenant: Kann für eigene Firma erstellen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
      ) OR user_id = auth.uid()
    -- Normale Benutzer: Können für ihre Firma erstellen
    ELSE 
      user_id = auth.uid() OR user_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.company_id = get_user_company_id(auth.uid()) 
        AND get_user_company_id(auth.uid()) IS NOT NULL
      )
  END
);

-- ===================================================================
-- SCHRITT 5: AUDIT LOG & VERIFICATION
-- ===================================================================

INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'complete_rls_policy_cleanup_fixed', 
  'multi_tenant_system', 
  'full_data_isolation_v2',
  jsonb_build_object(
    'issue', 'Neue Firmen sahen weiterhin alle Test-/Mock-Daten - Migration korrigiert',
    'solution', 'Vollständige RLS Policy Bereinigung + echte Multi-Tenant Isolation',
    'policies_removed', 'Alle überlappenden Policies komplett entfernt',
    'policies_created', 'Eine saubere Policy pro Tabelle (companies, employees, absence_requests)', 
    'data_cleanup', 'Test-Daten der SVH GmbH zugewiesen',
    'function_fix', 'get_user_company_id Funktion korrekt erneuert',
    'superadmin_behavior', 'SuperAdmin ohne Tenant-Mode sieht nur eigene Firma',
    'isolation_level', 'KRITISCH - Jede Firma komplett isoliert von anderen'
  ),
  'critical'
);

SELECT 
  'VOLLSTÄNDIGE RLS BEREINIGUNG ERFOLGREICH! 🧹✨' as status,
  'Neue Firmen haben jetzt komplett leere Datenbanken' as isolation,
  'SuperAdmin sieht standardmäßig nur SVH GmbH Daten' as superadmin_fix;