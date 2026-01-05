-- Erst die existierenden Funktionen löschen und dann neu erstellen
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid);

-- Erstelle die fehlenden Tenant-Context-Funktionen

-- Funktion zum Setzen des Tenant-Kontexts
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
  
  -- Lösche vorhandene Tenant-Session
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
  
  -- Erstelle neue Tenant-Session
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, created_at)
  VALUES (p_user_id, p_company_id, true, NOW());
END;
$$;

-- Funktion zum Löschen des Tenant-Kontexts
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Lösche alle Tenant-Sessions für den Benutzer
  DELETE FROM user_tenant_sessions WHERE user_id = p_user_id;
END;
$$;

-- Hilfsfunktion um zu prüfen ob wir im Tenant-Kontext sind
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_tenant_sessions 
    WHERE user_id = auth.uid() 
    AND is_tenant_mode = true
  );
END;
$$;

-- Hilfsfunktion um die aktuelle Tenant Company ID zu holen
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tenant_id uuid;
BEGIN
  SELECT tenant_company_id INTO tenant_id
  FROM user_tenant_sessions 
  WHERE user_id = auth.uid() 
  AND is_tenant_mode = true
  LIMIT 1;
  
  RETURN tenant_id;
END;
$$;

-- Hilfsfunktion um die Company ID eines Benutzers zu holen
CREATE OR REPLACE FUNCTION public.get_user_company_id(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_id uuid;
BEGIN
  SELECT ur.company_id INTO company_id
  FROM user_roles ur
  WHERE ur.user_id = p_user_id
  LIMIT 1;
  
  RETURN company_id;
END;
$$;