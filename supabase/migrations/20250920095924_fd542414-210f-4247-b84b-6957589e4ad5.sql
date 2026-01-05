-- SCHRITT 2: Kritische RLS-Policies für Tenant-Isolation

-- TASKS Tabelle - Tenant-Isolation
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

-- PROJECTS Tabelle - Tenant-Isolation
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

-- EMPLOYEES Tabelle - Tenant-Isolation
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