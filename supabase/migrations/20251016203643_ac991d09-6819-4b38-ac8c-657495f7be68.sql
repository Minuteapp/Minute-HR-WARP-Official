-- RLS Policies für employees Tabelle

-- Superadmins können alle Mitarbeiter sehen
CREATE POLICY "Superadmins view all employees"
ON employees FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'superadmin'
  )
);

-- Admins und HR können Mitarbeiter ihrer Company sehen
CREATE POLICY "Admins and HR view company employees"
ON employees FOR SELECT
TO authenticated
USING (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'hr')
    AND user_roles.company_id = employees.company_id
  )
);

-- Mitarbeiter können ihr eigenes Profil sehen
CREATE POLICY "Employees view own profile"
ON employees FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Admins und HR können Mitarbeiter ihrer Company bearbeiten
CREATE POLICY "Admins and HR update company employees"
ON employees FOR UPDATE
TO authenticated
USING (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'hr', 'superadmin')
  )
);

-- Admins und HR können Mitarbeiter erstellen
CREATE POLICY "Admins and HR insert employees"
ON employees FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'hr', 'superadmin')
  )
);