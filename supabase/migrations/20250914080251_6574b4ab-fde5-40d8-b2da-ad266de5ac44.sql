-- Lösche existierende Funktionen um Konflikte zu vermeiden
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);

-- Erstelle Funktionen für Tenant-Kontext neu
CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id uuid;
BEGIN
  -- Erst aus user_roles versuchen
  SELECT ur.company_id INTO company_id
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
  LIMIT 1;
  
  -- Falls nicht gefunden, aus employees versuchen
  IF company_id IS NULL THEN
    SELECT e.company_id INTO company_id
    FROM public.employees e
    WHERE e.id = p_user_id
    LIMIT 1;
  END IF;
  
  RETURN company_id;
END;
$$;