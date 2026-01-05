
-- ============================================================
-- STOP THE BLEED: Strikte Tenant-Isolation
-- ============================================================

-- 1) Zentrale Tenant-Context Funktion (unified)
-- Prüft alle Context-Quellen in Prioritätsreihenfolge
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Priorität 1: Aktive Impersonation Session
  SELECT impersonated_company_id INTO v_tenant_id
  FROM public.impersonation_sessions
  WHERE admin_user_id = v_user_id
    AND is_active = true
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- Priorität 2: User Tenant Session (Tunnel-Modus)
  SELECT company_id INTO v_tenant_id
  FROM public.user_tenant_sessions
  WHERE user_id = v_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
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

  -- Priorität 4: Eigene Firma des Users (Default)
  SELECT company_id INTO v_tenant_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  RETURN v_tenant_id;
END;
$$;

-- 2) can_access_tenant: Darf der User Daten dieser company_id LESEN?
-- NIEMALS NULL company_id erlauben!
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

  -- Aktueller Tenant-Context
  v_current_tenant := public.current_tenant_id();

  -- Wenn Superadmin im Tenant-Context: Nur diesen Tenant sehen
  IF v_is_super_admin = true AND v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- Wenn Superadmin ohne Tenant-Context: Alle Daten sehen (außer NULL)
  IF v_is_super_admin = true THEN
    RETURN TRUE;
  END IF;

  -- Normaler User: Nur eigenen Tenant
  IF v_current_tenant IS NOT NULL THEN
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- Fallback: Prüfe direkte Firmenzugehörigkeit
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_user_id AND company_id = p_company_id
  );
END;
$$;

-- 3) can_write_tenant: Darf der User in diese company_id SCHREIBEN?
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

  -- Wenn im Tenant-Context (egal ob Superadmin oder nicht): Nur in diesen Tenant schreiben
  IF v_current_tenant IS NOT NULL THEN
    -- Prüfe ob Impersonation write-Rechte hat
    SELECT can_write INTO v_can_write
    FROM public.impersonation_sessions
    WHERE admin_user_id = v_user_id
      AND impersonated_company_id = v_current_tenant
      AND is_active = true
      AND expires_at > NOW()
    LIMIT 1;
    
    IF v_can_write = false THEN
      RETURN FALSE;
    END IF;
    
    RETURN p_company_id = v_current_tenant;
  END IF;

  -- Superadmin ohne Tenant-Context: Schreiben in eigene Firma oder explizit gewählte
  IF v_is_super_admin = true THEN
    -- Superadmin muss in einem Tenant-Context sein um zu schreiben
    -- Oder es ist die eigene Firma
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = v_user_id AND company_id = p_company_id
    );
  END IF;

  -- Normaler User: Nur eigene Firma
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_user_id AND company_id = p_company_id
  );
END;
$$;

-- 4) auto_assign_company_id: NIEMALS NULL lassen!
CREATE OR REPLACE FUNCTION public.auto_assign_company_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id UUID;
BEGIN
  -- Wenn company_id bereits gesetzt, nichts tun
  IF NEW.company_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_user_id := auth.uid();
  
  -- Versuche Tenant-Context zu ermitteln
  v_tenant_id := public.current_tenant_id();
  
  IF v_tenant_id IS NOT NULL THEN
    NEW.company_id := v_tenant_id;
    RETURN NEW;
  END IF;

  -- Fallback: Eigene Firma des Users
  IF v_user_id IS NOT NULL THEN
    SELECT company_id INTO v_tenant_id
    FROM public.user_roles
    WHERE user_id = v_user_id
    LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
      NEW.company_id := v_tenant_id;
      RETURN NEW;
    END IF;
  END IF;

  -- HARD FAIL: Niemals NULL company_id zulassen!
  RAISE EXCEPTION 'Cannot insert row without company_id. No tenant context and no default company found for user %', v_user_id;
END;
$$;

-- 5) Hilfsfunktion für User's Default Company
CREATE OR REPLACE FUNCTION public.get_user_default_company_id(p_user_id UUID DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT company_id INTO v_company_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  RETURN v_company_id;
END;
$$;

-- 6) FORCE RLS auf kritischen Tabellen
ALTER TABLE public.companies FORCE ROW LEVEL SECURITY;
ALTER TABLE public.active_tenant_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenant_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_sessions FORCE ROW LEVEL SECURITY;

-- 7) Berechtigungen
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_default_company_id(UUID) TO authenticated;
