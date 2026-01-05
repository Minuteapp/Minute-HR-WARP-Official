-- Policy für Benutzer, um ihr eigenes Mitarbeiterprofil zu erstellen
CREATE POLICY "Users can create their own employee profile" 
ON public.employees 
FOR INSERT 
WITH CHECK (
  -- Benutzer kann ein Profil erstellen, wenn die E-Mail übereinstimmt oder es Daniel Häuslein ist
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  OR email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
);

-- Policy für Benutzer, um ihr eigenes Mitarbeiterprofil zu lesen
CREATE POLICY "Users can read their own employee profile" 
ON public.employees 
FOR SELECT 
USING (
  -- Benutzer kann sein eigenes Profil lesen basierend auf E-Mail oder Namen
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
  OR email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
);