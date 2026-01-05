
-- =====================================================
-- FIX: Korrigierte Tenant-Context Funktionen
-- Problem: Falsche Spaltennamen + Superadmin sieht alle Daten
-- =====================================================

-- 1) current_tenant_id() - Mit korrekten Spaltennamen
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

  -- Superadmin-Check für spätere Logik
  SELECT is_super_admin INTO v_is_super_admin
  FROM public.profiles
  WHERE id = v_user_id;

  -- Priorität 1: Aktive Impersonation Session (korrigierte Spalten!)
  SELECT target_tenant_id INTO v_tenant_id
  FROM public.impersonation_sessions
  WHERE superadmin_id = v_user_id
    AND status = 'active'
    AND expires_at > NOW()
    AND ended_at IS NULL
  ORDER BY started_at DESC
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- Priorität 2: User Tenant Session (Tunnel-Modus) - korrigierte Spalten!
  SELECT tenant_company_id INTO v_tenant_id
  FROM public.user_tenant_sessions
  WHERE user_id = v_user_id
    AND is_tenant_mode = true
    AND tenant_company_id IS NOT NULL
  ORDER BY updated_at DESC
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
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- KRITISCH: Superadmin OHNE aktive Session bekommt KEINEN Tenant-Context!
  -- Das verhindert, dass Superadmin automatisch alle Daten sieht
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

-- 2) can_access_tenant() - Strikte Tenant-Isolation
CREATE OR REPLACE FUNCTION public.can_access_tenant(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_super_admin BOOLEAN;
  v_current_tenant UUID;
BEGIN
  -- NULL company_id = NIEMALS sichtbar
  IF p_company_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Superadmin-Check
  SELECT is_super_admin INTO v_is_super_admin
  FROM public.profiles
  WHERE id = v_user_id;

  -- Aktueller Tenant-Context (jetzt korrekt!)
  v_current_tenant := public.current_tenant_id();

  -- Wenn Tenant-Context aktiv: NUR diesen Tenant sehen (egal ob Superadmin oder nicht)
  IF v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- KRITISCH: Superadmin OHNE Tenant-Context sieht KEINE tenant-scoped Daten!
  -- Er muss erst in einen Tenant wechseln
  IF v_is_super_admin = true THEN
    -- Superadmin ohne Session: Zugriff nur auf eigene Firma (falls vorhanden)
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = v_user_id AND company_id = p_company_id
    );
  END IF;

  -- Normaler User ohne Tenant-Context: Nur eigene Firma
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_user_id AND company_id = p_company_id
  );
END;
$$;

-- 3) can_write_tenant() - Korrigierte Spalten + strikte Isolation
CREATE OR REPLACE FUNCTION public.can_write_tenant(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_super_admin BOOLEAN;
  v_current_tenant UUID;
  v_can_write BOOLEAN;
BEGIN
  -- NULL company_id = NIEMALS schreiben
  IF p_company_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Superadmin-Check
  SELECT is_super_admin INTO v_is_super_admin
  FROM public.profiles
  WHERE id = v_user_id;

  -- Aktueller Tenant-Context
  v_current_tenant := public.current_tenant_id();

  -- Wenn im Tenant-Context: Nur in diesen Tenant schreiben
  IF v_current_tenant IS NOT NULL THEN
    -- Prüfe ob Impersonation write-Rechte hat (korrigierte Spalten!)
    SELECT COALESCE(
      (SELECT true FROM public.impersonation_sessions
       WHERE superadmin_id = v_user_id
         AND target_tenant_id = v_current_tenant
         AND status = 'active'
         AND expires_at > NOW()
         AND ended_at IS NULL
       LIMIT 1),
      -- User Tenant Session erlaubt immer schreiben
      (SELECT true FROM public.user_tenant_sessions
       WHERE user_id = v_user_id
         AND tenant_company_id = v_current_tenant
         AND is_tenant_mode = true
       LIMIT 1),
      -- Active Tenant Session prüfen
      (SELECT can_write FROM public.active_tenant_sessions
       WHERE session_user_id = v_user_id
         AND impersonated_company_id = v_current_tenant
         AND is_active = true
       LIMIT 1),
      -- Normaler User in eigener Firma
      (SELECT true FROM public.user_roles
       WHERE user_id = v_user_id
         AND company_id = v_current_tenant
       LIMIT 1)
    ) INTO v_can_write;
    
    IF v_can_write IS NOT TRUE THEN
      RETURN FALSE;
    END IF;
    
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- Ohne Tenant-Context: Nur in eigene Firma schreiben
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_user_id AND company_id = p_company_id
  );
END;
$$;
