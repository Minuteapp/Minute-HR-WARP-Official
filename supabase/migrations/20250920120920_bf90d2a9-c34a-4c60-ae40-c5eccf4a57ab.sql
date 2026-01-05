-- Erstelle kompatible Tenant-Context Funktionen ohne bestehende zu löschen

-- Funktion um die aktuelle Tenant-Company-ID zu ermitteln
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe aktive Tenant-Session
  RETURN (
    SELECT uts.tenant_company_id 
    FROM user_tenant_sessions uts
    WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL
    LIMIT 1
  );
END;
$$;

-- Funktion um zu prüfen ob User im Tenant-Context ist
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_tenant_sessions uts
    WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL
  );
END;
$$;

-- Aktualisiere die bestehende get_user_company_id Funktion um sie zu korrigieren
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = user_uuid
    LIMIT 1
  );
END;
$$;