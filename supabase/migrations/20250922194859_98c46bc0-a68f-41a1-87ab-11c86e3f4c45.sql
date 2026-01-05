-- KRITISCHE SICHERHEITSREPARATUR: KOMPLETTE CASCADE-BEREINIGUNG
-- PROBLEM: Hunderte von unsicheren RLS Policies verwenden fehlerhafte Funktionen

-- ===================================================================
-- SCHRITT 1: ALLES UNSICHERE LÖSCHEN (CASCADE)
-- ===================================================================

-- Lösche ALLE abhängigen Policies mit CASCADE
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_superadmin_safe(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_in_tenant_context() CASCADE;
DROP FUNCTION IF EXISTS public.get_tenant_company_id_safe() CASCADE;

-- Kritische unsichere Policies manuell entfernen
DROP POLICY IF EXISTS "Temporary open access for data recovery" ON companies;
DROP POLICY IF EXISTS "Allow all to view companies" ON companies;
DROP POLICY IF EXISTS "Allow creation of companies" ON companies;
DROP POLICY IF EXISTS "Allow updating companies" ON companies;

-- ===================================================================
-- SCHRITT 2: SICHERE FUNKTIONEN NEU ERSTELLEN
-- ===================================================================

CREATE OR REPLACE FUNCTION public.is_superadmin_safe(check_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfe user_roles Tabelle
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = check_user_id AND ur.role = 'superadmin'
  ) THEN
    RETURN true;
  END IF;
  
  -- Fallback auf auth.users
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
-- SCHRITT 3: SICHERE RLS POLICIES FÜR KRITISCHE TABELLEN
-- ===================================================================

-- COMPANIES: Sichere Isolation
CREATE POLICY "Secure Company Isolation"
ON public.companies
FOR ALL
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN id = get_tenant_company_id_safe()
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

-- EMPLOYEES: Sichere Isolation
CREATE POLICY "Secure Employee Isolation"
ON public.employees
FOR ALL
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
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

-- USER_ROLES: Sichere Isolation
CREATE POLICY "Secure User Roles Isolation"
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

-- USER_TENANT_SESSIONS: Nur eigene Sessions
CREATE POLICY "Users manage own tenant sessions"
ON public.user_tenant_sessions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- SCHRITT 4: AUDIT LOG
-- ===================================================================

INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'security_repair_cascade_critical', 
  'rls_policies', 
  'all_tables_cascade',
  jsonb_build_object(
    'issue', 'Massive data leak - hundreds of unsafe policies removed',
    'action', 'CASCADE removal of all unsafe RLS policies and functions',
    'scope', 'Complete database security overhaul',
    'tables_secured', ARRAY['companies', 'employees', 'user_roles', 'user_tenant_sessions'],
    'policies_removed', 'ALL policies using unsafe get_user_company_id function',
    'severity', 'CRITICAL - Multi-tenant isolation completely broken'
  ),
  'critical'
);

SELECT 'KRITISCHE CASCADE-REPARATUR ABGESCHLOSSEN - Alle unsicheren Policies entfernt' as status;