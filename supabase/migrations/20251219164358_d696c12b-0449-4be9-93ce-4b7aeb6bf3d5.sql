-- SELECT Policy für tasks Tabelle hinzufügen
-- Ermöglicht Benutzern, Aufgaben zu sehen die:
-- 1. Zur gleichen Firma gehören
-- 2. Von ihnen selbst erstellt wurden
-- 3. Ihnen zugewiesen sind
-- 4. Sie SuperAdmin sind

CREATE POLICY "Users can view tasks in their company" 
ON public.tasks 
FOR SELECT 
USING (
  is_superadmin_safe(auth.uid()) 
  OR company_id = get_effective_company_id()
  OR created_by = auth.uid()
  OR assigned_to @> ARRAY[auth.uid()]
);