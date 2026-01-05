-- SICHERHEITSREPARATUR TEIL 9: Weitere kritische Funktion reparieren
-- get_user_effective_permissions_with_overrides Funktion härten

CREATE OR REPLACE FUNCTION public.get_user_effective_permissions_with_overrides(p_user_id uuid)
 RETURNS TABLE(module_name text, submodule_name text, action_key text, permission_granted boolean, permission_source text, conditions jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF user_role IS NULL THEN
    user_role := 'employee';
  END IF;
  
  RETURN QUERY
  WITH base_permissions AS (
    SELECT 
      rpm.module_name,
      NULL::text as submodule_name,
      unnest(rpm.allowed_actions) as action_key,
      true as permission_granted,
      'role_matrix' as permission_source,
      '{}'::jsonb as conditions
    FROM public.role_permission_matrix rpm
    WHERE rpm.role = user_role::user_role
      AND rpm.is_visible = true
  ),
  user_overrides AS (
    SELECT 
      upo.module_name,
      upo.submodule_name,
      upo.action_key,
      CASE WHEN upo.permission_type = 'grant' THEN true ELSE false END as permission_granted,
      'user_override' as permission_source,
      upo.conditions
    FROM public.user_permission_overrides upo
    WHERE upo.user_id = p_user_id
      AND upo.is_active = true
      AND (upo.expires_at IS NULL OR upo.expires_at > now())
  )
  SELECT bp.* FROM base_permissions bp
  WHERE NOT EXISTS (
    SELECT 1 FROM user_overrides uo 
    WHERE uo.module_name = bp.module_name 
    AND uo.action_key = bp.action_key
    AND uo.submodule_name IS NOT DISTINCT FROM bp.submodule_name
  )
  UNION ALL
  SELECT uo.* FROM user_overrides uo;
END;
$function$;