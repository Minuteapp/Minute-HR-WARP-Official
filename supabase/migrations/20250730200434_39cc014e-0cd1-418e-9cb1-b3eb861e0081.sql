-- KRITISCH: Repariere Tenant-Isolation und RLS-Policies
-- Zuerst prüfen wir die aktuelle Tenant-Context-Funktion

-- Stelle sicher, dass der Tenant-Context korrekt gesetzt wird
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  -- Prüfe zuerst den explizit gesetzten Tenant-Kontext
  DECLARE
    tenant_context_id UUID;
  BEGIN
    SELECT (current_setting('app.current_tenant_id', true))::UUID INTO tenant_context_id;
    IF tenant_context_id IS NOT NULL THEN
      RETURN tenant_context_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignoriere Fehler und fahre fort
  END;
  
  -- Fallback: Verwende die Company des aktuellen Users
  RETURN (
    SELECT ur.company_id 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erstelle eine sichere Funktion zum Setzen des Tenant-Kontexts
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS void AS $$
BEGIN
  -- Nur Super-Admins dürfen den Tenant-Kontext wechseln
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext wechseln';
  END IF;
  
  -- Setze den Tenant-Kontext
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zum Löschen des Tenant-Kontexts
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS void AS $$
BEGIN
  -- Nur Super-Admins dürfen den Tenant-Kontext löschen
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Nur Super-Admins können den Tenant-Kontext löschen';
  END IF;
  
  -- Lösche den Tenant-Kontext
  PERFORM set_config('app.current_tenant_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;