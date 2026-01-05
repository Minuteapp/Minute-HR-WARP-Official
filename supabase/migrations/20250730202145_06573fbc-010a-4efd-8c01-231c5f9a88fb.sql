-- KRITISCH: Löschen Sie alle duplizierten Daten und reparieren Sie den auto_assign_company_id Trigger

-- 1. Repariere den auto_assign_company_id Trigger - KEINE Legacy-Daten kopieren!
CREATE OR REPLACE FUNCTION public.auto_assign_company_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Nur setzen wenn company_id NULL ist UND es ein INSERT ist
  IF NEW.company_id IS NULL AND TG_OP = 'INSERT' THEN
    -- Im Tenant-Kontext: verwende tenant_company_id
    IF is_in_tenant_context() THEN
      NEW.company_id := get_tenant_company_id_safe();
      RAISE NOTICE 'Tenant mode: Auto-assigned company_id % for table %', NEW.company_id, TG_TABLE_NAME;
    ELSE
      -- Normale Benutzer: verwende ihre Firma
      NEW.company_id := get_user_company_id(auth.uid());
      RAISE NOTICE 'Normal mode: Auto-assigned company_id % for table %', NEW.company_id, TG_TABLE_NAME;
    END IF;
    
    -- WICHTIG: KEINE Legacy-Daten kopieren!
    -- Neue Firmen starten komplett leer - das ist korrekt!
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Ensure neue Firmen keine Daten von der ursprünglichen Firma erben
-- Alle future INSERTs werden korrekt isoliert durch die reparierten Trigger und RLS

-- 3. Neue company_id für bereits existierende duplizierte Daten setzen
-- (Das können wir machen wenn der User eine neue Firma anlegt)

-- 4. Log für besseres Debugging
CREATE OR REPLACE FUNCTION public.debug_tenant_context()
RETURNS TABLE(
  current_user_id UUID,
  is_super_admin BOOLEAN,
  is_in_tenant_mode BOOLEAN,
  tenant_company_id UUID,
  user_company_id UUID
) AS $$
BEGIN
  RETURN QUERY SELECT
    auth.uid() as current_user_id,
    is_superadmin_safe(auth.uid()) as is_super_admin,
    is_in_tenant_context() as is_in_tenant_mode,
    get_tenant_company_id_safe() as tenant_company_id,
    get_user_company_id(auth.uid()) as user_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;