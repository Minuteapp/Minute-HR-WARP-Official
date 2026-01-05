-- SCHRITT 1: Nur die kritischen Funktionen reparieren
CREATE OR REPLACE FUNCTION public.get_tenant_company_id_safe()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  tenant_id uuid;
BEGIN
  -- Hole aktive Tenant-Session
  SELECT uts.tenant_company_id 
  INTO tenant_id
  FROM user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
    AND uts.is_tenant_mode = true
    AND uts.tenant_company_id IS NOT NULL;
  
  RETURN tenant_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_in_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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