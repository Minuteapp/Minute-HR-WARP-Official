-- Erweitere die RLS Policy für budget_plans um Admin-Zugriff
DROP POLICY IF EXISTS "Users can update budget plans" ON public.budget_plans;

CREATE POLICY "Users can update budget plans" ON public.budget_plans
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );