-- Erstelle nur die fehlenden Tenant-Funktionen ohne existierende zu ändern

-- Funktion: Prüft ob User im Tenant-Modus ist
CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_tenant_sessions 
    WHERE user_id = auth.uid() 
    AND is_tenant_mode = true
    AND tenant_company_id IS NOT NULL
  );
END;
$$;

-- Funktion: Holt die aktuelle Tenant Company ID
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tenant_id uuid;
BEGIN
  SELECT tenant_company_id INTO tenant_id
  FROM public.user_tenant_sessions 
  WHERE user_id = auth.uid() 
  AND is_tenant_mode = true
  AND tenant_company_id IS NOT NULL
  LIMIT 1;
  
  RETURN tenant_id;
END;
$$;

-- Funktion: Setzt Tenant-Kontext für einen User
CREATE OR REPLACE FUNCTION public.set_tenant_context_with_user_id(p_company_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lösche vorherige Sessions für diesen User
  DELETE FROM public.user_tenant_sessions 
  WHERE user_id = p_user_id;
  
  -- Erstelle neue Tenant-Session
  INSERT INTO public.user_tenant_sessions (
    user_id, 
    tenant_company_id, 
    is_tenant_mode
  ) VALUES (
    p_user_id, 
    p_company_id, 
    true
  );
END;
$$;

-- Funktion: Löscht Tenant-Kontext für einen User
CREATE OR REPLACE FUNCTION public.clear_tenant_context_with_user_id(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lösche alle Tenant-Sessions für diesen User
  DELETE FROM public.user_tenant_sessions 
  WHERE user_id = p_user_id;
END;
$$;