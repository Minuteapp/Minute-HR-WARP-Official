-- RLS Policies für employees Tabelle

-- Policy für SELECT: Alle authentifizierten Benutzer können Mitarbeiter sehen
CREATE POLICY "Authenticated users can view employees"
ON employees
FOR SELECT
TO authenticated
USING (true);

-- Policy für INSERT: Nur Admins und Superadmins können Mitarbeiter erstellen
CREATE POLICY "Admins can insert employees"
ON employees
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'superadmin', 'hr')
  )
);

-- Policy für UPDATE: Nur Admins und Superadmins können Mitarbeiter aktualisieren
CREATE POLICY "Admins can update employees"
ON employees
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'superadmin', 'hr')
  )
);

-- Policy für DELETE: Nur Superadmins können Mitarbeiter löschen
CREATE POLICY "Superadmins can delete employees"
ON employees
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'superadmin'
  )
);