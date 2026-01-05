-- Verbesserte Policy für das Lesen von Employee-Profilen
DROP POLICY IF EXISTS "Users can read their own employee profile" ON public.employees;

CREATE POLICY "Users can read their own employee profile" 
ON public.employees 
FOR SELECT 
USING (
  -- Benutzer kann sein eigenes Profil lesen basierend auf E-Mail oder speziell für Daniel Häuslein
  auth.uid()::text IN (
    SELECT id::text FROM auth.users 
    WHERE email = employees.email
  )
  OR email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
  -- Admins können alle Employee-Profile lesen
  OR EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND user_metadata->>'role' = 'admin'
  )
);

-- Verbesserte Policy für das Erstellen von Employee-Profilen  
DROP POLICY IF EXISTS "Users can create their own employee profile" ON public.employees;

CREATE POLICY "Users can create their own employee profile" 
ON public.employees 
FOR INSERT 
WITH CHECK (
  -- Benutzer kann ein Profil erstellen, wenn die E-Mail mit der Auth-E-Mail übereinstimmt
  email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
  OR email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
);