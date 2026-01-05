-- Fehlende Database-Funktion für get_user_effective_permissions erstellen
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(p_user_id UUID)
RETURNS TABLE (
  module_name TEXT,
  module_id TEXT, 
  is_visible BOOLEAN,
  allowed_actions TEXT[],
  visible_fields JSONB,
  editable_fields JSONB,
  allowed_notifications TEXT[],
  workflow_triggers TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Hole die Rolle des Benutzers
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Falls keine Rolle gefunden, verwende 'employee' als Standard
  IF user_role IS NULL THEN
    user_role := 'employee';
  END IF;
  
  -- Gib die effektiven Berechtigungen für die Rolle zurück
  RETURN QUERY
  SELECT 
    rpm.module_name,
    pm.module_key as module_id,
    rpm.is_visible,
    rpm.allowed_actions,
    rpm.visible_fields,
    rpm.editable_fields,
    rpm.allowed_notifications,
    rpm.workflow_triggers
  FROM public.role_permission_matrix rpm
  JOIN public.permission_modules pm ON pm.name = rpm.module_name
  WHERE rpm.role = user_role::user_role;
END;
$$;