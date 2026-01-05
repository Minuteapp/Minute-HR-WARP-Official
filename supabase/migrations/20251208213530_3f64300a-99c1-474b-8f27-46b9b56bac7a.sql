-- Repariere die get_user_effective_permissions Funktion
-- Problem 1: Entferne den fehlerhaften user_role::user_role Cast
-- Problem 2: Korrigiere JOIN von pm.name zu pm.module_key

CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(p_user_id uuid)
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
SET search_path = public
AS $$
DECLARE
  v_user_role TEXT;
  v_preview_role TEXT;
  v_is_preview_active BOOLEAN := false;
BEGIN
  -- Sicherheitsprüfung: Nur für sich selbst oder Admins
  IF p_user_id != auth.uid() AND NOT (
    EXISTS (SELECT 1 FROM public.user_roles ur 
           WHERE ur.user_id = auth.uid() 
           AND ur.role IN ('admin', 'superadmin'))
  ) THEN
    RAISE EXCEPTION 'Access denied: Cannot access permissions for other users';
  END IF;

  -- Prüfe ob Preview-Modus aktiv ist (nur für Superadmins)
  SELECT preview_role::TEXT, is_preview_active INTO v_preview_role, v_is_preview_active
  FROM public.user_role_preview_sessions
  WHERE user_id = p_user_id AND is_preview_active = true
  LIMIT 1;

  -- Hole die tatsächliche Rolle des Benutzers
  SELECT role::TEXT INTO v_user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Falls Preview aktiv, verwende die Preview-Rolle
  IF v_is_preview_active AND v_preview_role IS NOT NULL THEN
    v_user_role := v_preview_role;
  END IF;
  
  -- Falls keine Rolle gefunden, verwende 'employee' als Standard
  IF v_user_role IS NULL THEN
    v_user_role := 'employee';
  END IF;
  
  -- Gib die effektiven Berechtigungen für die Rolle zurück
  -- KORRIGIERT: JOIN auf pm.module_key statt pm.name
  -- KORRIGIERT: Kein Cast auf user_role Enum mehr
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
  JOIN public.permission_modules pm ON pm.module_key = rpm.module_name
  WHERE rpm.role = v_user_role
    AND pm.is_active = true;
END;
$$;