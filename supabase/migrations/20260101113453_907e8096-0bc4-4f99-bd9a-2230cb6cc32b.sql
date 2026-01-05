-- Fix: get_effective_company_id soll im Tenant-Modus (user_tenant_sessions/impersonation/active_tenant_sessions)
-- die aktuelle Tenant-Company zurückgeben, damit Inserts/Updates RLS (can_write_tenant) bestehen.

CREATE OR REPLACE FUNCTION public.get_effective_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_tenant_company_id uuid;
  v_session_company_id uuid;
  v_user_company_id uuid;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  -- If no user is authenticated, return NULL
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- PRIORITÄT 0: Tenant-Context (Impersonation / Tenant-Mode)
  v_tenant_company_id := public.current_tenant_id();
  IF v_tenant_company_id IS NOT NULL THEN
    RETURN v_tenant_company_id;
  END IF;
  
  -- PRIORITÄT 1: Prüfe auf aktive Tenant-Session (legacy fallback)
  SELECT impersonated_company_id INTO v_session_company_id
  FROM active_tenant_sessions
  WHERE session_user_id = v_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_session_company_id IS NOT NULL THEN
    RETURN v_session_company_id;
  END IF;
  
  -- PRIORITÄT 2: Prüfe profiles Tabelle
  SELECT company_id INTO v_user_company_id 
  FROM profiles 
  WHERE id = v_user_id;
  
  IF v_user_company_id IS NOT NULL THEN
    RETURN v_user_company_id;
  END IF;
  
  -- PRIORITÄT 3: Prüfe user_roles Tabelle
  SELECT company_id INTO v_user_company_id 
  FROM user_roles 
  WHERE user_id = v_user_id 
  LIMIT 1;
  
  IF v_user_company_id IS NOT NULL THEN
    RETURN v_user_company_id;
  END IF;
  
  -- PRIORITÄT 4: Prüfe employees Tabelle
  SELECT company_id INTO v_user_company_id
  FROM employees
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN v_user_company_id;
END;
$$;