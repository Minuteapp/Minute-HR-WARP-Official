-- Vereinfachte Tenant-Context-Funktionen mit besserer Cache-Kompatibilität

-- Lösche alte Funktionen vollständig
DROP FUNCTION IF EXISTS public.set_tenant_context_with_user_id(uuid, uuid);
DROP FUNCTION IF EXISTS public.clear_tenant_context_with_user_id(uuid);

-- Erstelle vereinfachte Funktionen
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe ob der Benutzer berechtigt ist
  IF NOT is_superadmin_safe(p_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Nicht berechtigt');
  END IF;
  
  -- Lösche vorhandene Session
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
  
  -- Erstelle neue Session
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, created_at)
  VALUES (p_user_id, p_company_id, true, NOW());
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Lösche alle Sessions für den Benutzer
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;