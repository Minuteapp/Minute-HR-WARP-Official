-- Lösche alle Mock-up und Test-Daten für saubere Tenant-Isolation

-- 1. Lösche Test- und Mock-up Firmen (behalte nur echte Firmen)
DELETE FROM companies WHERE 
  id = '00000000-0000-0000-0000-000000000001' -- Legacy System Data
  OR name ILIKE '%test%' 
  OR name ILIKE '%mock%'
  OR name = 'ejfojjegjegjeg'
  OR name = 'bayern ag'
  OR slug LIKE '%test%'
  OR is_active = false;

-- 2. Lösche verwaiste employees ohne company_id
DELETE FROM employees WHERE company_id IS NULL;

-- 3. Lösche employees von gelöschten Firmen
DELETE FROM employees WHERE company_id NOT IN (SELECT id FROM companies);

-- 4. Lösche time_entries die nicht zu validen employees gehören
DELETE FROM time_entries WHERE user_id NOT IN (SELECT id FROM employees);

-- 5. Lösche absence_requests die nicht zu validen employees gehören  
DELETE FROM absence_requests WHERE user_id NOT IN (SELECT id FROM employees);

-- 6. Lösche tasks die nicht zu validen companies gehören
DELETE FROM tasks WHERE 
  user_id NOT IN (SELECT id FROM employees)
  OR (assigned_to IS NOT NULL AND assigned_to NOT IN (SELECT id FROM employees));

-- 7. Lösche projects die nicht zu validen companies gehören
DELETE FROM projects WHERE 
  owner_id NOT IN (SELECT id FROM employees)
  OR company_id NOT IN (SELECT id FROM companies);

-- 8. Update RLS Policy für time_entries um Company-Isolation zu gewährleisten
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
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

-- 9. Update RLS Policy für tasks
DROP POLICY IF EXISTS "Task Company Isolation" ON tasks;

CREATE POLICY "Task Company Isolation" ON tasks
FOR ALL USING (
  CASE 
    WHEN is_in_tenant_context() THEN 
      (user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      ))
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    ELSE 
      (user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
        AND e.company_id IS NOT NULL
      ) OR user_id = auth.uid())
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

-- 10. Update RLS Policy für projects
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