-- Lösche alte Funktionen und erstelle sie mit korrekten Parameternamen neu

-- Lösche existierende Funktionen
DROP FUNCTION IF EXISTS public.set_tenant_context_with_user_id(uuid, uuid);
DROP FUNCTION IF EXISTS public.clear_tenant_context_with_user_id(uuid);

-- Funktion zum Setzen des Tenant-Kontexts
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(
  p_company_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe ob User SuperAdmin ist
  IF NOT is_superadmin_safe(p_user_id) THEN
    RAISE EXCEPTION 'Nur SuperAdmins können Tenant-Kontext wechseln';
  END IF;
  
  -- Prüfe ob Company existiert
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Firma nicht gefunden';
  END IF;
  
  -- Lösche existierende Tenant-Sessions für den User
  DELETE FROM user_tenant_sessions 
  WHERE user_id = p_user_id;
  
  -- Erstelle neue Tenant-Session
  INSERT INTO user_tenant_sessions (
    user_id, 
    tenant_company_id, 
    is_tenant_mode,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_company_id,
    true,
    now(),
    now()
  );
END;
$$;

-- Funktion zum Löschen des Tenant-Kontexts
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe ob User SuperAdmin ist
  IF NOT is_superadmin_safe(p_user_id) THEN
    RAISE EXCEPTION 'Nur SuperAdmins können Tenant-Kontext verlassen';
  END IF;
  
  -- Lösche alle Tenant-Sessions für den User
  DELETE FROM user_tenant_sessions 
  WHERE user_id = p_user_id;
END;
$$;