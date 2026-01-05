-- Korrigiere die can_write_tenant Funktion
-- Problem: Die Funktion versucht "can_write" aus impersonation_sessions zu lesen,
-- aber diese Spalte existiert dort nicht (nur in active_tenant_sessions)

CREATE OR REPLACE FUNCTION public.can_write_tenant(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_tenant UUID;
  v_is_super_admin BOOLEAN;
  v_user_company_id UUID;
  v_can_write BOOLEAN;
  v_session_mode TEXT;
BEGIN
  IF p_company_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_current_tenant := public.current_tenant_id();

  IF v_current_tenant IS NOT NULL THEN
    IF p_company_id != v_current_tenant THEN
      RETURN FALSE;
    END IF;
    
    -- KORRIGIERT: impersonation_sessions hat KEINE can_write Spalte
    -- Stattdessen prüfen wir den "mode" - 'act_as' = Schreibrechte
    SELECT mode INTO v_session_mode
    FROM public.impersonation_sessions
    WHERE superadmin_id = v_user_id 
      AND target_tenant_id = v_current_tenant
      AND status = 'active' 
      AND expires_at > NOW() 
      AND ended_at IS NULL
    LIMIT 1;
    
    IF v_session_mode IS NOT NULL THEN
      RETURN v_session_mode = 'act_as';
    END IF;
    
    -- Für Tunnel-Sessions (user_tenant_sessions): Schreiben erlaubt
    IF EXISTS (
      SELECT 1 FROM public.user_tenant_sessions
      WHERE user_id = v_user_id 
        AND tenant_company_id = v_current_tenant
        AND is_tenant_mode = true
    ) THEN
      RETURN TRUE;
    END IF;
    
    -- Active Tenant Session mit Schreibrechten (diese Tabelle HAT can_write)
    SELECT can_write INTO v_can_write
    FROM public.active_tenant_sessions
    WHERE session_user_id = v_user_id 
      AND impersonated_company_id = v_current_tenant
      AND is_active = true
    LIMIT 1;
    
    IF v_can_write IS NOT NULL THEN
      RETURN v_can_write;
    END IF;
    
    RETURN FALSE;
  END IF;

  v_is_super_admin := public.is_superadmin(v_user_id);

  IF v_is_super_admin = true THEN
    SELECT company_id INTO v_user_company_id
    FROM public.user_roles
    WHERE user_id = v_user_id
    LIMIT 1;
    
    RETURN p_company_id = v_user_company_id;
  END IF;

  SELECT company_id INTO v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;