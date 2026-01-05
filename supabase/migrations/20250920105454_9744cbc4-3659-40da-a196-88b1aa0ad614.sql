-- REPARATUR: Nur Projects Table policies - eine Tabelle nach der anderen

-- PROJECTS
DROP POLICY IF EXISTS "Company Isolation for Projects" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation - DELETE" ON projects;  
DROP POLICY IF EXISTS "Project Company Isolation - INSERT" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation - SELECT" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation - UPDATE" ON projects;
DROP POLICY IF EXISTS "Project Company Isolation CRITICAL" ON projects;
DROP POLICY IF EXISTS "SuperAdmin full access to projects" ON projects;

CREATE POLICY "projects_critical_tenant_isolation" 
ON projects FOR ALL 
USING (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR owner_id = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR owner_id = auth.uid()
  END
);