-- KRITISCHE SICHERHEITSREPARATUR: Multi-Tenant-System komplett reparieren
-- PROBLEM: Datenleckage zwischen Firmen durch unsichere RLS Policies

-- ===================================================================
-- SCHRITT 1: ALLE UNSICHEREN/WIDERSPRÜCHLICHEN POLICIES ENTFERNEN
-- ===================================================================

-- Companies Table: Alle existierenden Policies entfernen
DROP POLICY IF EXISTS "Allow all to view companies" ON companies;
DROP POLICY IF EXISTS "Allow creation of companies" ON companies;
DROP POLICY IF EXISTS "Allow updating companies" ON companies;
DROP POLICY IF EXISTS "Company Isolation for SuperAdmin and Company Users" ON companies;
DROP POLICY IF EXISTS "SuperAdmin full access to companies" ON companies;
DROP POLICY IF EXISTS "Users can only see their own company" ON companies;
DROP POLICY IF EXISTS "Temporary open access for data recovery" ON companies; -- KRITISCH!

-- Employees Table: Unsichere Policies entfernen
DROP POLICY IF EXISTS "Employee Company Isolation" ON employees;
DROP POLICY IF EXISTS "SuperAdmin full access to employees" ON employees;
DROP POLICY IF EXISTS "Users can view employees in same company" ON employees;

-- User Roles: Cleanup
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "SuperAdmin full access to user_roles" ON user_roles;

-- Absence Requests: Cleanup 
DROP POLICY IF EXISTS "Absence Company Isolation" ON absence_requests;
DROP POLICY IF EXISTS "SuperAdmin full access to absence_requests" ON absence_requests;

-- ===================================================================
-- SCHRITT 2: SICHERE HELPER-FUNKTIONEN ERSTELLEN/REPARIEREN
-- ===================================================================

-- Sichere SuperAdmin-Funktion (mit Fallback)
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfe zuerst user_roles Tabelle
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'superadmin'
  ) THEN
    RETURN true;
  END IF;
  
  -- Fallback auf auth.users Metadaten
  IF EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = $1 
    AND au.raw_user_meta_data->>'role' = 'superadmin'
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Tenant-Context-Funktionen reparieren
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_tenant_sessions uts
    WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT uts.tenant_company_id 
    FROM public.user_tenant_sessions uts
    WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT ur.company_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = $1
    AND ur.company_id IS NOT NULL
    LIMIT 1
  );
END;
$$;

-- ===================================================================
-- SCHRITT 3: SICHERE RLS POLICIES IMPLEMENTIEREN
-- ===================================================================

-- COMPANIES TABLE: Eine einzige, sichere Policy
CREATE POLICY "Secure Company Isolation"
ON public.companies
FOR ALL
USING (
  CASE
    -- SuperAdmin außerhalb Tenant-Modus: Zugriff auf ALLES
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN
      true
    -- SuperAdmin im Tenant-Modus: NUR aktuelle Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN
      id = get_tenant_company_id_safe()
    -- Normale Benutzer: NUR ihre eigene Firma
    ELSE
      id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE
    -- SuperAdmin außerhalb Tenant-Modus: Kann alles erstellen/ändern
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN
      true
    -- SuperAdmin im Tenant-Modus: NUR aktuelle Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN
      id = get_tenant_company_id_safe()
    -- Normale Benutzer: NUR ihre eigene Firma (falls überhaupt erlaubt)
    ELSE
      id = get_user_company_id(auth.uid())
  END
);

-- EMPLOYEES TABLE: Eine einzige, sichere Policy
CREATE POLICY "Secure Employee Isolation"
ON public.employees
FOR ALL
USING (
  CASE
    -- SuperAdmin außerhalb Tenant-Modus: Zugriff auf ALLES
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN
      true
    -- SuperAdmin im Tenant-Modus: NUR Mitarbeiter der aktuellen Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN
      company_id = get_tenant_company_id_safe()
    -- Normale Benutzer: NUR Mitarbeiter ihrer eigenen Firma
    ELSE
      company_id = get_user_company_id(auth.uid()) OR id = auth.uid()
  END
)
WITH CHECK (
  CASE
    -- SuperAdmin außerhalb Tenant-Modus: Kann alles erstellen/ändern
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN
      true
    -- SuperAdmin im Tenant-Modus: NUR für aktuelle Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN
      company_id = get_tenant_company_id_safe()
    -- Normale Benutzer: NUR für ihre eigene Firma
    ELSE
      company_id = get_user_company_id(auth.uid())
  END
);

-- USER_ROLES TABLE: Eine einzige, sichere Policy
CREATE POLICY "Secure User Roles Isolation"
ON public.user_roles
FOR ALL
USING (
  CASE
    -- SuperAdmin außerhalb Tenant-Modus: Zugriff auf ALLES
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN
      true
    -- SuperAdmin im Tenant-Modus: NUR Rollen der aktuellen Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN
      company_id = get_tenant_company_id_safe() OR company_id IS NULL
    -- Normale Benutzer: NUR ihre eigene Rolle oder Rollen ihrer Firma (falls Admin)
    WHEN user_id = auth.uid() THEN
      true
    ELSE
      (company_id = get_user_company_id(auth.uid()) AND 
       EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role IN ('admin', 'hr')))
  END
)
WITH CHECK (
  CASE
    -- SuperAdmin außerhalb Tenant-Modus: Kann alles erstellen/ändern
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN
      true
    -- SuperAdmin im Tenant-Modus: NUR für aktuelle Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN
      company_id = get_tenant_company_id_safe() OR company_id IS NULL
    -- Normale Benutzer: Sehr eingeschränkte Rechte
    ELSE
      (user_id = auth.uid() OR 
       (company_id = get_user_company_id(auth.uid()) AND 
        EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role IN ('admin', 'hr'))))
  END
);

-- ===================================================================
-- SCHRITT 4: USER_TENANT_SESSIONS SICHERN
-- ===================================================================

-- User Tenant Sessions: Nur eigene Sessions
CREATE POLICY "Users manage own tenant sessions"
ON public.user_tenant_sessions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- SCHRITT 5: AUDIT LOG FÜR SICHERHEITSREPARATUR
-- ===================================================================

INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_repair_critical', 
  'rls_policies', 
  'all_tables',
  jsonb_build_object(
    'issue', 'Critical data leak between companies',
    'action', 'Complete RLS policy overhaul',
    'tables_fixed', ARRAY['companies', 'employees', 'user_roles', 'user_tenant_sessions'],
    'policies_removed', 'All conflicting/unsafe policies',
    'policies_added', 'Secure single-policy-per-table approach'
  ),
  'critical'
);

-- Erfolgsmeldung
SELECT 'KRITISCHE SICHERHEITSLÜCKE GESCHLOSSEN - Multi-Tenant-Isolation repariert' as status;