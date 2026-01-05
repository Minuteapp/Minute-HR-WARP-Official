-- Repariere die kritischen Tenant-Isolation-Probleme
-- 1. Role Permissions Tabelle reparieren falls sie existiert
DROP POLICY IF EXISTS "role_permissions_select" ON role_permissions;
DROP POLICY IF EXISTS "role_permissions_all" ON role_permissions;

-- Erstelle eine einfache Policy für role_permissions falls Tabelle existiert
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
    CREATE POLICY "role_permissions_admin_access" 
    ON role_permissions FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    );
  END IF;
END $$;

-- 2. Kritische Tabellen ohne Policies reparieren
-- User Roles - Extrem kritisch
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_critical_isolation" 
ON user_roles FOR ALL 
USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM user_roles ur2 
        WHERE ur2.user_id = auth.uid() 
        AND ur2.role IN ('admin', 'superadmin')
        AND (ur2.company_id = user_roles.company_id OR user_roles.company_id IS NULL)
      )
  END
)
WITH CHECK (
  CASE
    WHEN is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      user_id = auth.uid() OR is_superadmin_safe(auth.uid())
  END
);

-- Companies - Kritisch
DROP POLICY IF EXISTS "companies_select" ON companies;
DROP POLICY IF EXISTS "SuperAdmins can read companies" ON companies;
CREATE POLICY "companies_critical_isolation" 
ON companies FOR ALL 
USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      id = get_user_company_id(auth.uid())
  END
)
WITH CHECK (
  CASE
    WHEN is_in_tenant_context() THEN 
      id = get_tenant_company_id_safe()
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      false
  END
);

-- Time Entries - Kritisch für Arbeitszeiterfassung
DROP POLICY IF EXISTS "time_entries_select" ON time_entries;
CREATE POLICY "time_entries_critical_isolation" 
ON time_entries FOR ALL 
USING (
  CASE
    WHEN is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      user_id = auth.uid() OR 
      user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
      )
  END
)
WITH CHECK (
  CASE
    WHEN is_in_tenant_context() THEN 
      user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      user_id = auth.uid()
  END
);