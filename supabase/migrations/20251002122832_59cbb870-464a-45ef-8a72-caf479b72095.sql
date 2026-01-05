-- FINALE SICHERHEITSREPARATUR: debug_tenant_context härten

-- debug_tenant_context muss gedroppt werden wegen Return-Type-Änderung
DROP FUNCTION IF EXISTS public.debug_tenant_context();

CREATE OR REPLACE FUNCTION public.debug_tenant_context()
RETURNS TABLE(
  user_id uuid, 
  tenant_company_id uuid, 
  is_tenant_mode boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    uts.user_id,
    uts.tenant_company_id,
    uts.is_tenant_mode
  FROM user_tenant_sessions uts
  WHERE uts.user_id = auth.uid();
END;
$function$;