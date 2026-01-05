-- SICHERHEITSREPARATUR TEIL 16: Letzte kritische Funktionen systematisch härten
-- Diese Migration fokussiert sich auf die definitiv verbleibenden Funktionen

-- user_can_access_project bereits vorhanden - zusätzliche Härtung
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_id 
    AND (
      p.owner_id = user_id 
      OR p.team_members::jsonb ? user_id::text
    )
  );
END;
$function$;

-- get_user_effective_permissions_with_overrides bereits vorhanden - zusätzliche Härtung  
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
  FROM user_roles
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
    FROM role_permission_matrix rpm
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
    FROM user_permission_overrides upo
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

-- log_project_activity bereits vorhanden - zusätzliche Härtung
CREATE OR REPLACE FUNCTION public.log_project_activity(p_project_id uuid, p_activity_type text, p_description text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO project_activities (project_id, user_id, activity_type, description, metadata)
  VALUES (p_project_id, auth.uid(), p_activity_type, p_description, p_metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;