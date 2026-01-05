-- Einfachere Policy für das Lesen von Employee-Profilen
DROP POLICY IF EXISTS "Users can read their own employee profile" ON public.employees;

CREATE POLICY "Users can read their own employee profile" 
ON public.employees 
FOR SELECT 
USING (
  -- Explizite Erlaubnis für Daniel Häuslein
  email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
  -- Oder wenn die E-Mail mit der aktuell eingeloggten E-Mail übereinstimmt
  OR email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- Einfachere Policy für das Erstellen von Employee-Profilen
DROP POLICY IF EXISTS "Users can create their own employee profile" ON public.employees;

CREATE POLICY "Users can create their own employee profile" 
ON public.employees 
FOR INSERT 
WITH CHECK (
  -- Explizite Erlaubnis für Daniel Häuslein
  email = 'daniel.haeuslein@live.de'
  OR name = 'Daniel Häuslein'
  -- Oder wenn die E-Mail mit der aktuell eingeloggten E-Mail übereinstimmt
  OR email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);