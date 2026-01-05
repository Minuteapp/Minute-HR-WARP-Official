-- Update RLS Policies für korrekte Company-Isolation

-- 1. Update time_entries RLS Policy
DROP POLICY IF EXISTS "Time Entry Company Isolation" ON time_entries;

CREATE POLICY "Time Entry Company Isolation" ON time_entries
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      -- Im Tenant-Modus: Nur Daten der Tenant-Firma
      (user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      ))
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      -- SuperAdmin im Admin-Modus: Alle Daten
      true
    ELSE 
      -- Normale Benutzer: Nur eigene Daten in ihrer Firma
      (user_id = auth.uid() OR user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
        AND e.company_id IS NOT NULL
      ))
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      ))
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (user_id = auth.uid())
  END
);

-- 2. Update tasks RLS Policy
DROP POLICY IF EXISTS "Task Company Isolation" ON tasks;

CREATE POLICY "Task Company Isolation" ON tasks
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (company_id = get_user_company_id(auth.uid()))
  END
);

-- 3. Update projects RLS Policy
DROP POLICY IF EXISTS "Project Company Isolation" ON projects;

CREATE POLICY "Project Company Isolation" ON projects  
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (company_id = get_user_company_id(auth.uid()))
  END
);

-- 4. Verbessere employees RLS Policy  
DROP POLICY IF EXISTS "Employee Company Isolation" ON employees;

CREATE POLICY "Employee Company Isolation" ON employees
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
  END
)
WITH CHECK (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (company_id = get_tenant_company_id_safe())
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (company_id = get_user_company_id(auth.uid()))
  END
);