
-- =====================================================
-- PHASE 2: TENANT-ID BACKFILL (KORRIGIERT)
-- Bestehende Daten bekommen company_id zugewiesen
-- =====================================================

-- 1. Backfill chat_commands: company_id = tenant_id
UPDATE public.chat_commands 
SET company_id = tenant_id 
WHERE company_id IS NULL AND tenant_id IS NOT NULL;

-- 2. Backfill helpdesk_tickets: company_id aus user_roles via created_by
UPDATE public.helpdesk_tickets ht
SET company_id = (
  SELECT ur.company_id 
  FROM public.user_roles ur 
  WHERE ur.user_id = ht.created_by 
  LIMIT 1
)
WHERE ht.company_id IS NULL;

-- 3. Pulse-Tabellen: company_id = tenant_id
UPDATE public.pulse_survey_questions SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;
UPDATE public.pulse_survey_responses SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;
UPDATE public.pulse_surveys SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;
UPDATE public.pulse_survey_templates SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;
UPDATE public.pulse_survey_analytics SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;
UPDATE public.pulse_action_items SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;
UPDATE public.pulse_ai_insights SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;

-- 4. Chat-Tabellen: company_id = tenant_id  
UPDATE public.chat_command_executions SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;
UPDATE public.chat_interactive_cards SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL;

-- 5. Generischer Backfill für alle Tabellen mit tenant_id Spalte
DO $$
DECLARE
  tbl RECORD;
  rows_updated INTEGER;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c1.table_name
    FROM information_schema.columns c1
    JOIN information_schema.columns c2 ON c1.table_name = c2.table_name AND c2.table_schema = 'public'
    WHERE c1.table_schema = 'public' 
      AND c1.column_name = 'company_id'
      AND c2.column_name = 'tenant_id'
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE public.%I SET company_id = tenant_id WHERE company_id IS NULL AND tenant_id IS NOT NULL',
        tbl.table_name
      );
      GET DIAGNOSTICS rows_updated = ROW_COUNT;
      IF rows_updated > 0 THEN
        RAISE NOTICE 'Backfilled % rows in % via tenant_id', rows_updated, tbl.table_name;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not backfill %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- 6. Generischer Backfill für Tabellen mit created_by/user_id
DO $$
DECLARE
  tbl RECORD;
  update_sql TEXT;
  rows_updated INTEGER;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c1.table_name
    FROM information_schema.columns c1
    JOIN information_schema.columns c2 ON c1.table_name = c2.table_name AND c2.table_schema = 'public'
    WHERE c1.table_schema = 'public' 
      AND c1.column_name = 'company_id'
      AND c2.column_name IN ('created_by', 'user_id')
  LOOP
    BEGIN
      -- Versuche Backfill über created_by
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl.table_name AND table_schema = 'public' AND column_name = 'created_by') THEN
        update_sql := format(
          'UPDATE public.%I t SET company_id = (SELECT ur.company_id FROM public.user_roles ur WHERE ur.user_id = t.created_by LIMIT 1) WHERE t.company_id IS NULL AND t.created_by IS NOT NULL',
          tbl.table_name
        );
        EXECUTE update_sql;
        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        IF rows_updated > 0 THEN
          RAISE NOTICE 'Backfilled % rows in % via created_by', rows_updated, tbl.table_name;
        END IF;
      END IF;
      
      -- Versuche Backfill über user_id
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl.table_name AND table_schema = 'public' AND column_name = 'user_id') THEN
        update_sql := format(
          'UPDATE public.%I t SET company_id = (SELECT ur.company_id FROM public.user_roles ur WHERE ur.user_id = t.user_id LIMIT 1) WHERE t.company_id IS NULL AND t.user_id IS NOT NULL',
          tbl.table_name
        );
        EXECUTE update_sql;
        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        IF rows_updated > 0 THEN
          RAISE NOTICE 'Backfilled % rows in % via user_id', rows_updated, tbl.table_name;
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not backfill %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- 7. Zähle verbleibende NULL company_ids
DO $$
DECLARE
  tbl RECORD;
  null_count INTEGER;
  total_null INTEGER := 0;
BEGIN
  FOR tbl IN 
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'company_id'
  LOOP
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE company_id IS NULL', tbl.table_name)
      INTO null_count;
      
      IF null_count > 0 THEN
        total_null := total_null + null_count;
        RAISE NOTICE 'Table % has % rows with NULL company_id', tbl.table_name, null_count;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
  
  RAISE NOTICE '=== Total rows with NULL company_id: % ===', total_null;
END $$;
