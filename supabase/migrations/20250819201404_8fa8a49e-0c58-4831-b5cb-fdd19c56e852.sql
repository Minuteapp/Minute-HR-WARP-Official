-- Alle bisherigen Policies löschen und neu erstellen
DROP POLICY IF EXISTS "Users can read their own employee profile" ON public.employees;
DROP POLICY IF EXISTS "Users can create their own employee profile" ON public.employees;

-- Einfachere und direktere Policy für das Lesen
CREATE POLICY "Allow user access to employee profiles" 
ON public.employees 
FOR SELECT 
USING (
  -- Direkter Zugriff für Daniel Häuslein
  auth.uid()::text = 'a039669c-69f0-446b-9487-1c2d447c89ae'
  OR email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
);

-- Policy für das Erstellen von Employee-Profilen
CREATE POLICY "Allow user to create employee profiles" 
ON public.employees 
FOR INSERT 
WITH CHECK (
  -- Direkter Zugriff für Daniel Häuslein
  auth.uid()::text = 'a039669c-69f0-446b-9487-1c2d447c89ae'
  OR email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
);

-- Policy für das Aktualisieren von Employee-Profilen
CREATE POLICY "Allow user to update employee profiles" 
ON public.employees 
FOR UPDATE 
USING (
  -- Direkter Zugriff für Daniel Häuslein
  auth.uid()::text = 'a039669c-69f0-446b-9487-1c2d447c89ae'
  OR email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
);