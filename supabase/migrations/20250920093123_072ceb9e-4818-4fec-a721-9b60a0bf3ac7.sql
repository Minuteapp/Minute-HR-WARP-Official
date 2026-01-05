-- KRITISCHE DATENSCHUTZ-REPARATUR: Tenant-Isolation für alle Tabellen

-- 1. Prüfe und repariere wichtige Hilfsfunktionen
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  tenant_id uuid;
BEGIN
  -- Hole aktive Tenant-Session
  SELECT uts.tenant_company_id 
  INTO tenant_id
  FROM user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL;
  
  RETURN tenant_id;
END;
$$;

-- 2. Verbesserte is_in_tenant_context Funktion
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_tenant_sessions uts
    WHERE uts.user_id = auth.uid() 
      AND uts.is_tenant_mode = true
      AND uts.tenant_company_id IS NOT NULL
  );
END;
$$;

-- 3. TASKS Tabelle - Tenant-Isolation
DROP POLICY IF EXISTS "Task isolation by company" ON tasks;
CREATE POLICY "Task isolation by company" 
ON tasks FOR ALL 
USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
)
WITH CHECK (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- 4. PROJECTS Tabelle - Tenant-Isolation
DROP POLICY IF EXISTS "Project isolation by company" ON projects;
CREATE POLICY "Project isolation by company" 
ON projects FOR ALL 
USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
)
WITH CHECK (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- 5. EMPLOYEES Tabelle - Tenant-Isolation
DROP POLICY IF EXISTS "Employee isolation by company" ON employees;
CREATE POLICY "Employee isolation by company" 
ON employees FOR ALL 
USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
)
WITH CHECK (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  END
);

-- 6. USER_ROLES Tabelle - Tenant-Isolation
DROP POLICY IF EXISTS "User roles isolation by company" ON user_roles;
CREATE POLICY "User roles isolation by company" 
ON user_roles FOR ALL 
USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL OR user_id = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR company_id IS NULL OR user_id = auth.uid()
  END
);

-- 7. CALENDAR_EVENTS Tabelle - Tenant-Isolation (falls existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Calendar events isolation by company" ON calendar_events';
    EXECUTE 'CREATE POLICY "Calendar events isolation by company" 
    ON calendar_events FOR ALL 
    USING (
      CASE
        WHEN is_in_tenant_context() THEN 
          company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
          true
        ELSE 
          company_id = get_user_company_id(auth.uid()) OR company_id IS NULL OR user_id = auth.uid()
      END
    )
    WITH CHECK (
      CASE
        WHEN is_in_tenant_context() THEN 
          company_id = get_tenant_company_id_safe()
        WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
          true
        ELSE 
          company_id = get_user_company_id(auth.uid()) OR company_id IS NULL OR user_id = auth.uid()
      END
    )';
  END IF;
END $$;

-- 8. Verbessere Debug-Funktion
CREATE OR REPLACE FUNCTION public.debug_tenant_context()
RETURNS TABLE(
  current_user_id uuid, 
  is_super_admin boolean, 
  is_in_tenant_mode boolean, 
  tenant_company_id uuid, 
  user_company_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    is_superadmin_safe(auth.uid()) as is_super_admin,
    is_in_tenant_context() as is_in_tenant_mode,
    get_tenant_company_id_safe() as tenant_company_id,
    get_user_company_id(auth.uid()) as user_company_id;
END;
$$;