
-- =====================================================
-- PHASE 6: AUTOMATISCHE COMPANY_ID TRIGGER
-- Setzt company_id automatisch basierend auf Benutzerkontext
-- =====================================================

-- 1. Zentrale Trigger-Funktion für automatisches company_id Setzen
CREATE OR REPLACE FUNCTION public.auto_set_company_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Wenn company_id bereits gesetzt ist, nicht überschreiben
  IF NEW.company_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Versuche company_id aus verschiedenen Quellen zu ermitteln
  -- 1. Aktive Impersonation-Session
  SELECT impersonated_company_id INTO v_company_id
  FROM active_tenant_sessions
  WHERE session_user_id = auth.uid()
    AND is_active = true
  LIMIT 1;

  -- 2. Falls keine Session, aus user_roles
  IF v_company_id IS NULL THEN
    SELECT company_id INTO v_company_id
    FROM user_roles
    WHERE user_id = auth.uid()
      AND company_id IS NOT NULL
    ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END
    LIMIT 1;
  END IF;

  -- 3. Falls nicht gefunden, aus employees
  IF v_company_id IS NULL THEN
    SELECT company_id INTO v_company_id
    FROM employees
    WHERE user_id = auth.uid()
      AND company_id IS NOT NULL
    LIMIT 1;
  END IF;

  -- Setze company_id wenn ermittelt
  IF v_company_id IS NOT NULL THEN
    NEW.company_id := v_company_id;
  END IF;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_set_company_id() TO authenticated;

-- 2. Funktion zum dynamischen Erstellen der Trigger
CREATE OR REPLACE FUNCTION public.create_company_id_trigger(p_table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trigger_name TEXT;
BEGIN
  trigger_name := 'auto_set_' || p_table_name || '_company_id';
  
  -- Lösche alten Trigger falls vorhanden
  EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_name, p_table_name);
  
  -- Erstelle neuen Trigger
  EXECUTE format(
    'CREATE TRIGGER %I BEFORE INSERT ON %I FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id()',
    trigger_name, p_table_name
  );
END;
$$;

-- 3. Erstelle Trigger für wichtigste Tabellen
DO $$
DECLARE
  tables_to_trigger TEXT[] := ARRAY[
    'time_entries', 'calendar_events', 'documents', 'absence_requests',
    'absences', 'projects', 'tickets', 'notifications', 'audit_logs',
    'expense_reports', 'payroll_records', 'performance_reviews'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_to_trigger
  LOOP
    BEGIN
      -- Prüfe ob Tabelle existiert
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
        PERFORM public.create_company_id_trigger(tbl);
        RAISE NOTICE 'Created trigger for: %', tbl;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create trigger for %: %', tbl, SQLERRM;
    END;
  END LOOP;
END $$;
