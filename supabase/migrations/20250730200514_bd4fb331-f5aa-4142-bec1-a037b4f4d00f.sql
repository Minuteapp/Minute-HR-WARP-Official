-- KRITISCH: Repariere Tenant-System - Teil 1 (Funktionen korrigieren)

-- Lösche existierende Funktionen um sie neu zu erstellen
DROP FUNCTION IF EXISTS set_tenant_context(uuid);
DROP FUNCTION IF EXISTS clear_tenant_context();
DROP FUNCTION IF EXISTS get_current_tenant_id();

-- Erstelle korrigierte Tenant-System-Funktionen
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  tenant_context_id UUID;
BEGIN
  -- Prüfe zuerst aktive Tenant-Session
  SELECT uts.tenant_company_id 
  INTO tenant_context_id
  FROM user_tenant_sessions uts
  WHERE uts.user_id = auth.uid() 
  AND uts.is_tenant_mode = true
  AND uts.tenant_company_id IS NOT NULL;
  
  IF tenant_context_id IS NOT NULL THEN
    RETURN tenant_context_id;
  END IF;
  
  -- Fallback: Verwende die Company des aktuellen Users
  RETURN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Korrigierte set_tenant_context Funktion (ohne Return)
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS void AS $$
BEGIN
  -- Nur Super-Admins dürfen den Tenant-Kontext wechseln
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext wechseln';
  END IF;
  
  -- Update oder erstelle Tenant-Session
  INSERT INTO user_tenant_sessions (user_id, tenant_company_id, is_tenant_mode, updated_at)
  VALUES (auth.uid(), tenant_id, true, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    tenant_company_id = tenant_id,
    is_tenant_mode = true,
    updated_at = now();
    
  -- Log für Debugging
  RAISE NOTICE 'Tenant context gesetzt: user_id=%, tenant_id=%', auth.uid(), tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Korrigierte clear_tenant_context Funktion (ohne Return)
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS void AS $$
BEGIN
  -- Nur Super-Admins dürfen den Tenant-Kontext löschen
  IF NOT is_superadmin_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext löschen';
  END IF;
  
  -- Lösche Tenant-Session komplett
  DELETE FROM user_tenant_sessions 
  WHERE user_id = auth.uid();
  
  -- Log für Debugging
  RAISE NOTICE 'Tenant context gelöscht für user_id=%', auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;