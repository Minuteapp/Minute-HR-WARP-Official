-- Zusätzliche Policy für alle Admins
CREATE POLICY "Allow admins full access to employees" 
ON public.employees 
FOR ALL 
USING (
  -- Alle Benutzer mit Admin-Rolle
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.raw_user_meta_data->>'role' = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.raw_user_meta_data->>'role' = 'superadmin'
  )
)