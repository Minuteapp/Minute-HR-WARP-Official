-- Korrigiere die Tenant-Context-Funktionen um Parameter-Matching zu beheben

-- Drop und recreate die Funktion mit korrekten Parametern
DROP FUNCTION IF EXISTS public.set_tenant_context_with_user_id(uuid, uuid);

CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe ob der Benutzer berechtigt ist, in diesen Tenant-Kontext zu wechseln
  IF NOT is_superadmin_safe(p_user_id) THEN
    RAISE EXCEPTION 'Nicht berechtigt, in Tenant-Kontext zu wechseln';
  END IF;
  
  -- Prüfe ob die user_tenant_sessions Tabelle existiert
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_tenant_sessions') THEN
    RAISE EXCEPTION 'Tabelle user_tenant_sessions existiert nicht';
  END IF;
  
  -- Lösche vorhandene Tenant-Session
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
  
  -- Erstelle neue Tenant-Session
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, created_at)
  VALUES (p_user_id, p_company_id, true, NOW());
END;
$$;

-- Korrigiere auch die clear Funktion
DROP FUNCTION IF EXISTS public.clear_tenant_context_with_user_id(uuid);

CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe ob die user_tenant_sessions Tabelle existiert
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_tenant_sessions') THEN
    RAISE EXCEPTION 'Tabelle user_tenant_sessions existiert nicht';
  END IF;
  
  -- Lösche alle Tenant-Sessions für den Benutzer
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
END;
$$;