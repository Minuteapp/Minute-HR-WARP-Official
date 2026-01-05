-- Füge company_id Spalten hinzu wo sie fehlen
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE goals ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Lösche alle überflüssigen und widersprüchlichen RLS-Policies für EMPLOYEES
DROP POLICY IF EXISTS "Users can view employees of their company" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_select" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_insert" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_update" ON employees;
DROP POLICY IF EXISTS "Company isolation for employees_delete" ON employees;

-- Neue saubere Employee Policies
CREATE POLICY "Employee Company Isolation - SELECT" 
ON employees FOR SELECT 
USING (
  -- Superadmin sieht alle
  is_superadmin(auth.uid()) OR
  -- User sehen nur ihre Company (KEINE NULL company_id im Tenant-Modus!)
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Employee Company Isolation - INSERT" 
ON employees FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Employee Company Isolation - UPDATE" 
ON employees FOR UPDATE 
USING (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);

CREATE POLICY "Employee Company Isolation - DELETE" 
ON employees FOR DELETE 
USING (
  is_superadmin(auth.uid()) OR 
  (company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL)
);