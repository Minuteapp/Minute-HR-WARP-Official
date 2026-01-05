-- Sichere RLS Policy für employees, die nicht auf auth.users zugreift
DROP POLICY IF EXISTS "Company isolation for employees_select" ON employees;

CREATE POLICY "Company isolation for employees_select" 
ON employees FOR SELECT 
USING (
  -- Superadmin sieht alle Mitarbeiter ohne company_id Einschränkung
  is_superadmin(auth.uid()) OR
  -- Normale User sehen nur ihre Firma
  (company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ))
);