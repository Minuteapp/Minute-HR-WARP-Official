-- ZWEITE PHASE: Verbleibende kritische Security Definer Funktionen beheben

-- 1. Weitere Admin-Funktionen von SECURITY DEFINER zu SECURITY INVOKER konvertieren
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use table alias to avoid ambiguity
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = 'admin'::user_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use table alias to avoid ambiguity
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = 'superadmin'::user_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin_fallback(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
  -- Fallback für SuperAdmin-Zugriff - jetzt mit RLS-Respekt
  SELECT COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'superadmin' FROM auth.users WHERE id = $1),
    ($1::text IN ('e7219c39-dbe0-45f3-a6b8-cbbf20517bb2')), -- Ihre User-ID als Fallback
    false
  );
$$;

-- 2. Debug-Funktionen sicher machen
CREATE OR REPLACE FUNCTION public.debug_superadmin_status(check_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  is_superadmin_meta boolean,
  is_superadmin_roles boolean,
  is_hardcoded_fallback boolean,
  final_result boolean
)
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    target_user_id,
    COALESCE((SELECT u.raw_user_meta_data->>'role' = 'superadmin' FROM auth.users u WHERE u.id = target_user_id), false) as is_superadmin_meta,
    EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = target_user_id AND ur.role = 'superadmin') as is_superadmin_roles,
    (target_user_id::text = 'e7219c39-dbe0-45f3-a6b8-cbbf20517bb2'::text) as is_hardcoded_fallback,
    is_superadmin_safe(target_user_id) as final_result;
END;
$$;

-- 3. CRUD-Funktionen mit RLS-Respekt umgestalten
CREATE OR REPLACE FUNCTION public.create_approval_requests(
  p_workflow_instance_id uuid,
  p_approval_steps jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  step jsonb;
  step_number int := 1;
  approver_id uuid;
BEGIN
  -- Jetzt respektiert es RLS-Policies für alle Datenbankoperationen
  FOR step IN SELECT * FROM jsonb_array_elements(p_approval_steps)
  LOOP
    -- Ermittlung des Genehmigers basierend auf Rolle (mit RLS)
    IF step->>'approver_role' IS NOT NULL THEN
      SELECT ur.user_id INTO approver_id
      FROM public.user_roles ur  -- RLS wird jetzt respektiert
      WHERE ur.role = (step->>'approver_role')::user_role
      LIMIT 1;
    END IF;
    
    -- Insert mit RLS-Policies
    INSERT INTO public.workflow_steps (
      workflow_instance_id,
      step_number,
      step_type,
      approver_id,
      approver_role,
      conditions,
      status
    ) VALUES (
      p_workflow_instance_id,
      step_number,
      COALESCE(step->>'type', 'approval'),
      approver_id,
      step->>'approver_role',
      COALESCE(step->'conditions', '{}'::jsonb),
      'pending'
    );
    
    step_number := step_number + 1;
  END LOOP;
  
  RETURN true;
END;
$$;

-- 4. Admin-Invitation-Funktionen sicher machen
-- Diese Funktion war besonders problematisch da sie RLS umgehen konnte
CREATE OR REPLACE FUNCTION public.delete_admin_invitation(p_id uuid, p_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_result json;
BEGIN
  -- Jetzt wird RLS respektiert - nur SuperAdmins können löschen
  DELETE FROM public.admin_invitations
  WHERE id = p_id AND company_id = p_company_id;
  
  -- Check if any rows were affected
  IF FOUND THEN
    v_result := json_build_object(
      'success', true,
      'message', 'Admin invitation deleted successfully'
    );
  ELSE
    v_result := json_build_object(
      'success', false,
      'message', 'Admin invitation not found or access denied'
    );
  END IF;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Error deleting admin invitation: ' || SQLERRM
    );
END;
$$;

-- 5. Version-Control-Funktionen sicher machen
CREATE OR REPLACE FUNCTION public.create_article_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Geändert von DEFINER zu INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  -- Neue Version erstellen bei Inhaltsänderungen - jetzt mit RLS
  IF OLD.title != NEW.title OR OLD.content != NEW.content OR OLD.summary != NEW.summary THEN
    INSERT INTO public.knowledge_article_versions (
      article_id, version_number, title, content, summary, created_by
    ) 
    SELECT 
      NEW.id,
      COALESCE(MAX(version_number), 0) + 1,
      NEW.title,
      NEW.content,
      NEW.summary,
      NEW.author_id
    FROM public.knowledge_article_versions 
    WHERE article_id = NEW.id;  -- RLS wird jetzt respektiert
  END IF;
  
  -- updated_at aktualisieren
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 6. Audit-Log für weitere Sicherheitsverbesserungen
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(),
  'security_definer_fix_phase2',
  'database_functions',
  'remaining_critical_functions',
  jsonb_build_object(
    'action_type', 'security_definer_to_invoker_phase2',
    'functions_fixed', ARRAY[
      'is_admin', 'is_superadmin', 'is_superadmin_fallback',
      'debug_superadmin_status', 'create_approval_requests',
      'delete_admin_invitation', 'create_article_version'
    ],
    'security_improvement', 'Additional critical functions now respect RLS policies',
    'phase', 2
  ),
  'high'
);