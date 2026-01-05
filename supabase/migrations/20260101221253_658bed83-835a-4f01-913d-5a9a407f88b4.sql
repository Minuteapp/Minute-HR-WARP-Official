-- Fix 1: can_write_tenant() für Superadmin eigene Firma anpassen
CREATE OR REPLACE FUNCTION public.can_write_tenant(p_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_super_admin boolean;
  v_session_company_id uuid;
  v_can_write boolean;
  v_user_company_id uuid;
BEGIN
  IF p_company_id IS NULL THEN
    RETURN false;
  END IF;

  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  v_is_super_admin := public.is_superadmin(v_user_id);

  -- Check for active tenant session with write permission
  SELECT impersonated_company_id, can_write INTO v_session_company_id, v_can_write
  FROM public.active_tenant_sessions
  WHERE session_user_id = v_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  -- Superadmin MIT aktiver Session
  IF v_is_super_admin = true AND v_session_company_id IS NOT NULL THEN
    RETURN p_company_id = v_session_company_id AND COALESCE(v_can_write, true);
  END IF;

  -- Superadmin OHNE Session: eigene Firma aus user_roles erlauben (volle Schreibrechte)
  IF v_is_super_admin = true AND v_session_company_id IS NULL THEN
    SELECT company_id INTO v_user_company_id
    FROM public.user_roles
    WHERE user_id = v_user_id AND company_id IS NOT NULL
    LIMIT 1;
    
    RETURN p_company_id = v_user_company_id;
  END IF;

  -- Normaler User: Schreibrechte auf eigene Firma prüfen
  SELECT company_id INTO v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;

-- Fix 2: departments Tabelle um is_active Spalte erweitern
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;