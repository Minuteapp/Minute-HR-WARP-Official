-- SICHERHEITSREPARATUR TEIL 7B: Weitere kritische Funktion reparieren
-- Weniger invasive Reparatur zur Vermeidung von Deadlocks

CREATE OR REPLACE FUNCTION public.is_superadmin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Check user_roles table first (primary method)
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback to metadata check (backup method)
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = $1 AND raw_user_meta_data->>'role' = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;