-- Alte Policy löschen
DROP POLICY IF EXISTS "Users can create projects in their company" ON public.projects;

-- Neue Policy erstellen mit Superadmin-Ausnahme
CREATE POLICY "Users can create projects in their company" 
ON public.projects
FOR INSERT
TO public
WITH CHECK (
  (company_id = get_effective_company_id()) 
  OR is_superadmin_safe(auth.uid())
);