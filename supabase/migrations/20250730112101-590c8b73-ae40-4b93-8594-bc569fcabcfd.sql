-- Lösche und erstelle die get_user_company_id Funktion neu
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_company_id UUID;
BEGIN
  -- Hole die company_id des Benutzers aus user_roles
  SELECT company_id INTO user_company_id
  FROM public.user_roles 
  WHERE user_id = user_uuid 
  LIMIT 1;
  
  RETURN user_company_id;
END;
$function$;

-- Teste die aktuelle Situation - DEBUG INFO
SELECT 
  'Current User Company' as info,
  get_user_company_id(auth.uid()) as company_id,
  c.name as company_name
FROM companies c 
WHERE c.id = get_user_company_id(auth.uid())
UNION ALL
SELECT 
  'Tenant Info' as info,
  get_tenant_company_id_safe() as company_id,
  'Tenant Mode: ' || is_in_tenant_context()::text as company_name;

-- Prüfe wie viele Mitarbeiter jede Firma haben sollte
SELECT 
  c.name as company_name,
  COUNT(DISTINCT e.id) as actual_employees
FROM companies c
LEFT JOIN employees e ON e.company_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;