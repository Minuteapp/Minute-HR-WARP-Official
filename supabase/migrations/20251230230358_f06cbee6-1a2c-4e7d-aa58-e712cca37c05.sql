-- Korrektur: is_super_admin Column-Fehler beheben
-- Verwende die existierende is_superadmin() Funktion statt nicht-existierender Spalte

-- 1) current_tenant_id() - KORRIGIERT
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_is_super_admin BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- KORRIGIERT: Nutze existierende is_superadmin() Funktion
  v_is_super_admin := public.is_superadmin(v_user_id);

  -- Priorität 1: Aktive Impersonation Session
  SELECT target_tenant_id INTO v_tenant_id
  FROM public.impersonation_sessions
  WHERE superadmin_id = v_user_id 
    AND status = 'active' 
    AND expires_at > NOW() 
    AND ended_at IS NULL
  LIMIT 1;

  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- Priorität 2: User Tenant Session (Tunnel-Modus)
  SELECT tenant_company_id INTO v_tenant_id
  FROM public.user_tenant_sessions
  WHERE user_id = v_user_id 
    AND is_tenant_mode = true 
    AND tenant_company_id IS NOT NULL
  LIMIT 1;

  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- Priorität 3: Active Tenant Session
  SELECT impersonated_company_id INTO v_tenant_id
  FROM public.active_tenant_sessions
  WHERE session_user_id = v_user_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- KRITISCH: Superadmin OHNE aktive Session bekommt KEINEN Tenant-Context!
  IF v_is_super_admin = true THEN
    RETURN NULL;
  END IF;

  -- Nur normale User: Eigene Firma als Default
  SELECT company_id INTO v_tenant_id 
  FROM public.user_roles 
  WHERE user_id = v_user_id
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$;

-- 2) can_access_tenant() - KORRIGIERT
CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id UUID)
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
BEGIN
  -- NULL company_id = IMMER FALSE (keine NULL-Leaks)
  IF p_company_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Aktuellen Tenant-Kontext holen
  v_current_tenant := public.current_tenant_id();

  -- Wenn Tenant-Kontext aktiv: NUR diese Firma erlauben
  IF v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- KORRIGIERT: Nutze existierende is_superadmin() Funktion
  v_is_super_admin := public.is_superadmin(v_user_id);

  -- Superadmin ohne aktiven Kontext: Nur eigene Firma (aus user_roles)
  IF v_is_super_admin = true THEN
    SELECT company_id INTO v_user_company_id
    FROM public.user_roles
    WHERE user_id = v_user_id
    LIMIT 1;
    
    RETURN p_company_id = v_user_company_id;
  END IF;

  -- Normale User: Eigene Firma aus user_roles
  SELECT company_id INTO v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;

-- 3) can_write_tenant() - KORRIGIERT
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
BEGIN
  -- NULL company_id = IMMER FALSE
  IF p_company_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Aktuellen Tenant-Kontext holen
  v_current_tenant := public.current_tenant_id();

  -- Wenn Tenant-Kontext aktiv: Prüfe ob Schreibrechte für diesen Tenant
  IF v_current_tenant IS NOT NULL THEN
    -- Muss die richtige Firma sein
    IF p_company_id != v_current_tenant THEN
      RETURN FALSE;
    END IF;
    
    -- Prüfe Schreibrechte in Session-Tabellen
    SELECT can_write INTO v_can_write
    FROM public.impersonation_sessions
    WHERE superadmin_id = v_user_id 
      AND target_tenant_id = v_current_tenant
      AND status = 'active' 
      AND expires_at > NOW() 
      AND ended_at IS NULL
    LIMIT 1;
    
    IF v_can_write IS NOT NULL THEN
      RETURN v_can_write;
    END IF;
    
    -- Für Tunnel-Sessions: Schreiben erlaubt
    IF EXISTS (
      SELECT 1 FROM public.user_tenant_sessions
      WHERE user_id = v_user_id 
        AND tenant_company_id = v_current_tenant
        AND is_tenant_mode = true
    ) THEN
      RETURN TRUE;
    END IF;
    
    -- Active Tenant Session mit Schreibrechten
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

  -- KORRIGIERT: Nutze existierende is_superadmin() Funktion
  v_is_super_admin := public.is_superadmin(v_user_id);

  -- Superadmin ohne Session: Nur in eigener Firma schreiben
  IF v_is_super_admin = true THEN
    SELECT company_id INTO v_user_company_id
    FROM public.user_roles
    WHERE user_id = v_user_id
    LIMIT 1;
    
    RETURN p_company_id = v_user_company_id;
  END IF;

  -- Normale User: Eigene Firma
  SELECT company_id INTO v_user_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  RETURN p_company_id = v_user_company_id;
END;
$$;