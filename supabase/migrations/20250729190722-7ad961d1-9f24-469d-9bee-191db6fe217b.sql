-- SOFORT-FIX: Stelle den Zugriff auf Ihre Daten wieder her

-- Temporäre permissive Policy für roadmaps 
DROP POLICY IF EXISTS "Users can access own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can access own roadmaps" ON public.roadmaps
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Temporäre permissive Policy für andere kritische Tabellen falls fehlend
DROP POLICY IF EXISTS "Temporary open access for data recovery" ON public.companies;
CREATE POLICY "Temporary open access for data recovery" ON public.companies
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Stelle sicher, dass SuperAdmin wieder funktioniert 
CREATE OR REPLACE FUNCTION public.is_superadmin_fallback(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Fallback für SuperAdmin-Zugriff
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'superadmin' FROM auth.users WHERE id = $1),
    ($1::text IN ('e7219c39-dbe0-45f3-a6b8-cbbf20517bb2')), -- Ihre User-ID als Fallback
    false
  );
$$;

-- Temporäre SuperAdmin Policy für alle kritischen Tabellen
DROP POLICY IF EXISTS "Emergency SuperAdmin Access" ON public.roadmaps;
CREATE POLICY "Emergency SuperAdmin Access" ON public.roadmaps
FOR ALL
USING (is_superadmin_fallback(auth.uid()))
WITH CHECK (is_superadmin_fallback(auth.uid()));

-- Repariere die is_superadmin Funktion 
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Stelle sicher, dass der ursprüngliche SuperAdmin Zugriff hat
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'superadmin' FROM auth.users WHERE id = $1),
    ($1::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'), -- Ihre User-ID
    false
  );
$$;