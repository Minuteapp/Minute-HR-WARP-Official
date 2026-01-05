-- KRITISCHE SICHERHEITSREPARATUR: Multi-Tenant-System komplett reparieren (KORRIGIERT)
-- PROBLEM: Datenleckage zwischen Firmen durch unsichere RLS Policies

-- ===================================================================
-- SCHRITT 0: BESTEHENDE FUNKTIONEN BEREINIGEN
-- ===================================================================

-- Lösche bestehende Funktionen um Konflikte zu vermeiden
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);
DROP FUNCTION IF EXISTS public.is_superadmin_safe(uuid);
DROP FUNCTION IF EXISTS public.is_in_tenant_context();
DROP FUNCTION IF EXISTS public.get_tenant_company_id_safe();

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
-- SCHRITT 2: SICHERE HELPER-FUNKTIONEN NEU ERSTELLEN
-- ===================================================================

-- Sichere SuperAdmin-Funktion (mit Fallback)
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(check_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfe zuerst user_roles Tabelle
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = check_user_id AND ur.role = 'superadmin'
  ) THEN
    RETURN true;
  END IF;
  
  -- Fallback auf auth.users Metadaten
  IF EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = check_user_id 
    AND au.raw_user_meta_data->>'role' = 'superadmin'
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Tenant-Context-Funktionen neu erstellen
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

CREATE OR REPLACE FUNCTION public.get_user_company_id(check_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT ur.company_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = check_user_id
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

-- USER_TENANT_SESSIONS SICHERN
CREATE POLICY "Users manage own tenant sessions"
ON public.user_tenant_sessions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- SCHRITT 4: AUDIT LOG FÜR SICHERHEITSREPARATUR
-- ===================================================================

INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_repair_critical_phase1', 
  'rls_policies', 
  'companies_user_tenant_sessions',
  jsonb_build_object(
    'issue', 'Critical data leak between companies - PHASE 1',
    'action', 'Removed unsafe policies, secured companies table',
    'tables_fixed', ARRAY['companies', 'user_tenant_sessions'],
    'policies_removed', 'All conflicting/unsafe policies including CRITICAL "Temporary open access"',
    'policies_added', 'Secure single-policy approach'
  ),
  'critical'
);

-- Erfolgsmeldung Phase 1
SELECT 'PHASE 1 ABGESCHLOSSEN: Kritische Sicherheitslücke geschlossen - Companies Isolation repariert' as status;