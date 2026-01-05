-- Besserer Ansatz: Session-Variable für Tenant-Kontext
-- Diese wird vom Frontend gesetzt wenn wir im Tenant-Modus sind

CREATE OR REPLACE FUNCTION public.is_in_superadmin_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  tenant_company_id TEXT;
BEGIN
  -- Prüfe ob eine Tenant-Session-Variable gesetzt ist
  BEGIN
    tenant_company_id := current_setting('app.tenant_company_id', true);
  EXCEPTION WHEN OTHERS THEN
    tenant_company_id := NULL;
  END;
  
  -- Wenn Tenant-Variable gesetzt ist, sind wir NICHT im Super-Admin-Context
  IF tenant_company_id IS NOT NULL AND tenant_company_id != '' THEN
    RETURN false;
  END IF;
  
  -- Sonst: Normal Super-Admin Check
  RETURN is_superadmin(auth.uid());
END;
$$;

-- Funktion um die aktuelle Tenant-Company-ID zu bekommen
CREATE OR REPLACE FUNCTION public.get_current_tenant_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  tenant_company_id TEXT;
  company_uuid UUID;
BEGIN
  -- Versuche Tenant-Session-Variable zu lesen
  BEGIN
    tenant_company_id := current_setting('app.tenant_company_id', true);
    IF tenant_company_id IS NOT NULL AND tenant_company_id != '' THEN
      company_uuid := tenant_company_id::uuid;
      RETURN company_uuid;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Falls Fehler oder nicht gesetzt, fallback auf user_roles
  END;
  
  -- Fallback: get_user_company_id 
  RETURN get_user_company_id(auth.uid());
END;
$$;