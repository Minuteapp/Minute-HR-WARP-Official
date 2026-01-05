-- Erstelle RPC-Funktion um aktive Firmen abzurufen
CREATE OR REPLACE FUNCTION public.get_active_companies()
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  is_active boolean,
  employee_count integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.is_active,
    c.employee_count,
    c.created_at
  FROM public.companies c
  WHERE c.is_active = true
  ORDER BY c.name;
END;
$function$;