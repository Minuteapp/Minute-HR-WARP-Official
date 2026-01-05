-- Entferne alle problematischen RLS Policies, die auf auth.users verweisen
DROP POLICY IF EXISTS "Users can view their own employee data" ON employees;

-- Bereinige doppelte Policies
DROP POLICY IF EXISTS "Alle authentifizierten Benutzer können Mitarbeiter lesen" ON employees;
DROP POLICY IF EXISTS "Allow full access to admins" ON employees;
DROP POLICY IF EXISTS "Benutzer können Mitarbeiter aktualisieren" ON employees;
DROP POLICY IF EXISTS "Benutzer können Mitarbeiter anlegen" ON employees;
DROP POLICY IF EXISTS "Enable insert access for all users" ON employees;
DROP POLICY IF EXISTS "Enable update access for all users" ON employees;
DROP POLICY IF EXISTS "employees_insert_policy" ON employees;

-- Erstelle saubere, einfache RLS Policies für employees
CREATE POLICY "Company isolation for employees_insert" 
ON employees FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) OR
  (company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ))
);

CREATE POLICY "Company isolation for employees_update" 
ON employees FOR UPDATE 
USING (
  is_superadmin(auth.uid()) OR
  (company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ))
);

CREATE POLICY "Company isolation for employees_delete" 
ON employees FOR DELETE 
USING (
  is_superadmin(auth.uid()) OR
  (company_id IN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.company_id IS NOT NULL
  ))
);