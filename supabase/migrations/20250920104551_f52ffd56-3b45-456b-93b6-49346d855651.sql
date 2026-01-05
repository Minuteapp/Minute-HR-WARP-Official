-- Repariere die Employees Isolation SOFORT
-- Entferne alle widersprüchlichen Policies

DROP POLICY IF EXISTS "Allow authenticated users full employee access" ON employees;
DROP POLICY IF EXISTS "Allow authenticated users select employees" ON employees;
DROP POLICY IF EXISTS "Company Isolation for Employees" ON employees;
DROP POLICY IF EXISTS "Employee Company Isolation" ON employees;
DROP POLICY IF EXISTS "Employee Company Isolation - DELETE" ON employees;
DROP POLICY IF EXISTS "Employee Company Isolation - INSERT" ON employees;
DROP POLICY IF EXISTS "Employee Company Isolation - SELECT" ON employees;
DROP POLICY IF EXISTS "Employee Company Isolation - UPDATE" ON employees;
DROP POLICY IF EXISTS "Employees - Company Isolation" ON employees;
DROP POLICY IF EXISTS "Employees Company Isolation" ON employees;
DROP POLICY IF EXISTS "Employees can update own basic data" ON employees;
DROP POLICY IF EXISTS "Employees can view own data" ON employees;
DROP POLICY IF EXISTS "Employees company isolation modify" ON employees;
DROP POLICY IF EXISTS "Employees company isolation select" ON employees;
DROP POLICY IF EXISTS "HR staff can manage employees" ON employees;
DROP POLICY IF EXISTS "HR staff can view all employees" ON employees;
DROP POLICY IF EXISTS "Managers can view team employees" ON employees;
DROP POLICY IF EXISTS "SuperAdmin full access to employees" ON employees;

-- Erstelle EINE klare, eindeutige Policy
CREATE POLICY "employees_critical_tenant_isolation" 
ON employees FOR ALL 
USING (
  CASE
    -- SuperAdmin ohne Tenant-Modus: Alle Daten sehen
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    -- SuperAdmin im Tenant-Modus: Nur Daten der aktuellen Tenant-Firma
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    -- Normale Benutzer: Nur ihre eigene Firma
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR id = auth.uid()
  END
)
WITH CHECK (
  CASE
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN 
      true
    WHEN is_superadmin_safe(auth.uid()) AND is_in_tenant_context() THEN 
      company_id = get_tenant_company_id_safe()
    ELSE 
      company_id = get_user_company_id(auth.uid()) OR id = auth.uid()
  END
);