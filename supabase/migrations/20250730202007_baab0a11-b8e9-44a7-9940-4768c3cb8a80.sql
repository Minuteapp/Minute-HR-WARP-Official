-- KRITISCH: Vollständige Daten-Isolation für ALLE Tabellen mit company_id

-- Time Entries Tabelle (laut Network Requests verwendet)
DROP POLICY IF EXISTS "Time entries company isolation" ON time_entries;
CREATE POLICY "Time entries company isolation" ON time_entries FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Documents Tabelle
DROP POLICY IF EXISTS "Documents company isolation" ON documents;
CREATE POLICY "Documents company isolation" ON documents FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Goals Tabelle
DROP POLICY IF EXISTS "Goals company isolation" ON goals;
CREATE POLICY "Goals company isolation" ON goals FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Budget Dimensions Tabelle
DROP POLICY IF EXISTS "Budget dimensions company isolation" ON budget_dimensions;
CREATE POLICY "Budget dimensions company isolation" ON budget_dimensions FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- Calendar Events Tabelle
DROP POLICY IF EXISTS "Calendar events company isolation" ON calendar_events;
CREATE POLICY "Calendar events company isolation" ON calendar_events FOR ALL USING (
  CASE 
    WHEN is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context() THEN true
    WHEN is_in_tenant_context() THEN company_id = get_tenant_company_id_safe()
    ELSE company_id = get_user_company_id(auth.uid()) AND company_id IS NOT NULL
  END
);

-- KRITISCH: Auto-Assign Trigger für company_id reparieren
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
      RAISE NOTICE 'Auto-assigned tenant company_id: %', NEW.company_id;
    ELSE
      -- Normale Benutzer: verwende ihre Firma
      NEW.company_id := get_user_company_id(auth.uid());
      RAISE NOTICE 'Auto-assigned user company_id: %', NEW.company_id;
    END IF;
    
    -- KEINE Daten aus anderen Firmen kopieren!
    -- Neue Firmen starten mit leeren Daten
  END IF;
  
  RETURN NEW;
END;
$function$;