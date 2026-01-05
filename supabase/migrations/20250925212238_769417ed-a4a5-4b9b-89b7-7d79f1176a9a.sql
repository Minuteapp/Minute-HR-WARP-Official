-- SICHERHEITSREPARATUR TEIL 5C: Einzelne kritische Funktion reparieren
-- Fokus auf eine Änderung zur Zeit zur Vermeidung von Deadlocks

CREATE OR REPLACE FUNCTION public.is_superadmin_fallback(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'superadmin' FROM auth.users WHERE id = $1),
    ($1::text IN ('e7219c39-dbe0-45f3-a6b8-cbbf20517bb2')),
    false
  );
$function$;