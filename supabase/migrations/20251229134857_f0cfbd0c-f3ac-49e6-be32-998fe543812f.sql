
-- =====================================================
-- PHASE 4: NOT NULL CONSTRAINTS + FK VALIDATION
-- company_id wird auf NOT NULL gesetzt
-- =====================================================

-- 1. Zuerst prüfen ob noch NULL company_ids existieren
DO $$
DECLARE
  tbl RECORD;
  null_count INTEGER;
  has_nulls BOOLEAN := false;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND column_name = 'company_id'
      AND is_nullable = 'YES'
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE company_id IS NULL', tbl.table_name)
      INTO null_count;
      
      IF null_count > 0 THEN
        has_nulls := true;
        RAISE NOTICE 'WARNING: % has % rows with NULL company_id', tbl.table_name, null_count;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
  
  IF has_nulls THEN
    RAISE NOTICE 'Some tables still have NULL company_ids - they will be skipped for NOT NULL constraint';
  ELSE
    RAISE NOTICE 'All tables ready for NOT NULL constraint';
  END IF;
END $$;

-- 2. Setze NOT NULL Constraint auf alle Tabellen mit company_id
DO $$
DECLARE
  tbl RECORD;
  null_count INTEGER;
  success_count INTEGER := 0;
  skip_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Setting NOT NULL constraints ===';
  
  FOR tbl IN 
    SELECT c.table_name 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
      AND c.column_name = 'company_id'
      AND c.is_nullable = 'YES'
      AND c.table_name NOT IN ('migration_journal')
    ORDER BY c.table_name
  LOOP
    BEGIN
      -- Prüfe ob NULL Werte existieren
      EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE company_id IS NULL', tbl.table_name)
      INTO null_count;
      
      IF null_count = 0 THEN
        -- Setze NOT NULL
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN company_id SET NOT NULL', tbl.table_name);
        success_count := success_count + 1;
      ELSE
        skip_count := skip_count + 1;
        RAISE NOTICE 'Skipped % (has % NULL rows)', tbl.table_name, null_count;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not alter %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '=== NOT NULL Summary ===';
  RAISE NOTICE 'Successfully set NOT NULL on % tables', success_count;
  RAISE NOTICE 'Skipped % tables (had NULL values)', skip_count;
END $$;

-- 3. Aktualisiere auto_set_company_id Trigger für automatisches Setzen
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

  -- 1. Aktive Impersonation-Session
  SELECT impersonated_company_id INTO v_company_id
  FROM active_tenant_sessions
  WHERE session_user_id = auth.uid()
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  -- 2. Falls keine Session, aus user_roles
  IF v_company_id IS NULL THEN
    SELECT company_id INTO v_company_id
    FROM user_roles
    WHERE user_id = auth.uid()
      AND company_id IS NOT NULL
    ORDER BY created_at DESC
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

  -- Setze company_id wenn ermittelt, sonst Fehler
  IF v_company_id IS NOT NULL THEN
    NEW.company_id := v_company_id;
  ELSE
    RAISE EXCEPTION 'Cannot determine company_id for user %', auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Erstelle Trigger für alle wichtigen Tabellen
DO $$
DECLARE
  critical_tables TEXT[] := ARRAY[
    'time_entries', 'calendar_events', 'documents', 'absence_requests',
    'absences', 'projects', 'tickets', 'notifications', 'audit_logs',
    'expense_reports', 'payroll_records', 'performance_reviews',
    'employees', 'departments', 'teams', 'shifts', 'tasks',
    'messages', 'channels', 'reports', 'contracts'
  ];
  tbl TEXT;
  trigger_name TEXT;
BEGIN
  FOREACH tbl IN ARRAY critical_tables
  LOOP
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
        trigger_name := 'auto_set_' || tbl || '_company_id';
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trigger_name, tbl);
        EXECUTE format(
          'CREATE TRIGGER %I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.auto_set_company_id()',
          trigger_name, tbl
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create trigger for %: %', tbl, SQLERRM;
    END;
  END LOOP;
END $$;
