-- Erst die Super-Admin-Funktion reparieren
CREATE OR REPLACE FUNCTION public.is_superadmin_safe(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Prüfe sowohl user_roles Tabelle als auch user_metadata
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = $1 AND role = 'superadmin'
    )),
    (SELECT 
      CASE 
        WHEN raw_user_meta_data->>'role' = 'superadmin' THEN true
        ELSE false
      END
      FROM auth.users 
      WHERE id = $1
    ),
    false
  );
$function$;