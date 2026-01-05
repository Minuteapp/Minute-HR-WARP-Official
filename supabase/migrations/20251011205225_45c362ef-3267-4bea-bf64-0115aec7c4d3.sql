-- FIX: Superadmins können ALLE Mitarbeiter sehen
-- Schritt 1: Alte Policies entfernen

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Employees visible by company" ON employees;
  DROP POLICY IF EXISTS "Users can view employees" ON employees;
  DROP POLICY IF EXISTS "Admins view all employees" ON employees;
  DROP POLICY IF EXISTS "Superadmins see all employees" ON employees;
  DROP POLICY IF EXISTS "Users can insert employees" ON employees;
  DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
  DROP POLICY IF EXISTS "Users can update employees" ON employees;
  DROP POLICY IF EXISTS "Admins can update employees" ON employees;
  DROP POLICY IF EXISTS "Users can delete employees" ON employees;
  DROP POLICY IF EXISTS "Admins can delete employees" ON employees;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schritt 2: Neue Policy - Superadmins sehen ALLE
CREATE POLICY "employees_select_policy" 
ON employees 
FOR SELECT
USING (
  is_superadmin_safe(auth.uid())
  OR
  (company_id IS NOT NULL AND company_id = get_effective_company_id())
);

-- Schritt 3: INSERT - Superadmins + Admins
CREATE POLICY "employees_insert_policy"
ON employees
FOR INSERT
WITH CHECK (
  is_superadmin_safe(auth.uid())
  OR
  (
    company_id = get_effective_company_id()
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);

-- Schritt 4: UPDATE
CREATE POLICY "employees_update_policy"
ON employees
FOR UPDATE
USING (
  is_superadmin_safe(auth.uid())
  OR
  (
    company_id = get_effective_company_id()
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);

-- Schritt 5: DELETE
CREATE POLICY "employees_delete_policy"
ON employees
FOR DELETE
USING (
  is_superadmin_safe(auth.uid())
  OR
  (
    company_id = get_effective_company_id()
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr')
    )
  )
);