-- Problem: Es gibt mehrere PERMISSIVE Policies, die sich gegenseitig überschreiben
-- Lösung: Alle Policies löschen und durch EINE konsistente Policy ersetzen

-- Lösche ALLE alten Policies auf employees
DROP POLICY IF EXISTS "Employees - Company Isolation" ON employees;
DROP POLICY IF EXISTS "Strict company isolation SELECT" ON employees;
DROP POLICY IF EXISTS "Strict company isolation INSERT" ON employees;
DROP POLICY IF EXISTS "Strict company isolation UPDATE" ON employees;
DROP POLICY IF EXISTS "Strict company isolation DELETE" ON employees;
DROP POLICY IF EXISTS "strict_select_employees" ON employees;
DROP POLICY IF EXISTS "strict_insert_employees" ON employees;
DROP POLICY IF EXISTS "strict_update_employees" ON employees;
DROP POLICY IF EXISTS "strict_delete_employees" ON employees;

-- Erstelle NEUE, einheitliche Policies die company_id IMMER respektieren
-- SELECT: Zeige nur Mitarbeiter der aktuellen effectiven Firma
CREATE POLICY "employees_select_policy" 
ON employees 
FOR SELECT 
USING (company_id = get_effective_company_id() OR id = auth.uid());

-- INSERT: Nur in die effective company einfügen
CREATE POLICY "employees_insert_policy" 
ON employees 
FOR INSERT 
WITH CHECK (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- UPDATE: Nur in der effective company bearbeiten
CREATE POLICY "employees_update_policy" 
ON employees 
FOR UPDATE 
USING (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'superadmin')
  )
);

-- DELETE: Nur in der effective company löschen
CREATE POLICY "employees_delete_policy" 
ON employees 
FOR DELETE 
USING (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);