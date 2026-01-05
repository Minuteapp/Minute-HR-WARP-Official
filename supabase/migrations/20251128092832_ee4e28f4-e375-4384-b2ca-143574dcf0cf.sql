-- Entferne die fehlerhafte Policy
DROP POLICY IF EXISTS "employees_select_policy" ON public.employees;

-- Erstelle eine neue, funktionierende SELECT Policy für employees
-- Diese Policy erlaubt authenticated Benutzern den Zugriff auf Mitarbeiter ihrer Firma
CREATE POLICY "employees_select_policy" ON public.employees
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Fall 1: Benutzer hat eine Rolle und company_id stimmt überein
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = employees.company_id
      AND user_roles.role IN ('admin', 'hr', 'superadmin', 'employee', 'manager')
    )
    -- Fall 2: SuperAdmin ohne Tenant-Kontext (kann alle Firmen sehen)
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'superadmin'
    )
  )
);