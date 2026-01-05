-- Edge Function für Tenant-Kontext setzen
CREATE OR REPLACE FUNCTION public.set_tenant_context(p_company_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_exists BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Aktuellen Benutzer holen
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Benutzer nicht authentifiziert'
    );
  END IF;
  
  -- Prüfen ob die Firma existiert
  SELECT EXISTS (
    SELECT 1 FROM companies WHERE id = p_company_id AND is_active = true
  ) INTO v_company_exists;
  
  IF NOT v_company_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Firma nicht gefunden oder nicht aktiv'
    );
  END IF;
  
  -- Tenant-Session setzen oder aktualisieren
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode)
  VALUES (v_user_id, p_company_id, true)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = p_company_id,
    is_tenant_mode = true,
    updated_at = now();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Tenant-Kontext erfolgreich gesetzt',
    'tenant_company_id', p_company_id
  );
END;
$$;

-- Funktion zum Verlassen des Tenant-Kontexts
CREATE OR REPLACE FUNCTION public.clear_tenant_context()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Benutzer nicht authentifiziert'
    );
  END IF;
  
  -- Tenant-Session zurücksetzen
  UPDATE user_tenant_sessions 
  SET 
    tenant_company_id = NULL,
    is_tenant_mode = false,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Tenant-Kontext erfolgreich gelöscht'
  );
END;
$$;