-- Füge SELECT RLS Policy für employees Tabelle hinzu
CREATE POLICY "employees_select_policy" ON public.employees
FOR SELECT
USING (
  company_id = get_effective_company_id()
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'hr', 'superadmin', 'employee', 'manager')
  )
);