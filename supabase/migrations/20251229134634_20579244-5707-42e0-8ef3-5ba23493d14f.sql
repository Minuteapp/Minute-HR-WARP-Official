
-- =====================================================
-- PHASE 3: MOCKUP/TESTDATEN QUARANTINE UND LÖSCHUNG (v2)
-- Mit korrekter FK-Behandlung
-- =====================================================

-- 1. Zuerst alle Daten in Quarantine sichern
DO $$
DECLARE
  test_company_ids UUID[] := ARRAY[
    'c99edb2e-790d-42d0-abab-18260a684aa6'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
    '11d6ebe9-366a-4b6c-93fc-8df38bdb8306'::uuid
  ];
  tbl RECORD;
  quarantine_sql TEXT;
  rows_quarantined INTEGER;
  total_quarantined INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Phase 3: Quarantine all test data ===';
  
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND column_name = 'company_id'
      AND table_name NOT IN ('companies', 'migration_journal')
    ORDER BY table_name
  LOOP
    BEGIN
      quarantine_sql := format(
        'INSERT INTO quarantine.rows (source_table, source_pk, payload_json, reason)
         SELECT %L, id, row_to_json(t), ''mockup_test_data''
         FROM public.%I t
         WHERE company_id = ANY(%L)
         AND id IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM quarantine.rows q WHERE q.source_table = %L AND q.source_pk = t.id)',
        tbl.table_name, tbl.table_name, test_company_ids, tbl.table_name
      );
      EXECUTE quarantine_sql;
      GET DIAGNOSTICS rows_quarantined = ROW_COUNT;
      IF rows_quarantined > 0 THEN
        total_quarantined := total_quarantined + rows_quarantined;
        RAISE NOTICE 'Quarantined % rows from %', rows_quarantined, tbl.table_name;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Quarantine failed for %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
  
  -- Quarantine companies selbst
  INSERT INTO quarantine.rows (source_table, source_pk, payload_json, reason)
  SELECT 'companies', id, row_to_json(c), 'mockup_test_company'
  FROM public.companies c
  WHERE id = ANY(test_company_ids)
  AND NOT EXISTS (SELECT 1 FROM quarantine.rows q WHERE q.source_table = 'companies' AND q.source_pk = c.id);
  
  RAISE NOTICE 'Total quarantined: %', total_quarantined;
END $$;

-- 2. Temporär alle FK-Constraints auf companies deaktivieren
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'companies'
      AND tc.table_schema = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', r.table_name, r.constraint_name);
      RAISE NOTICE 'Dropped FK constraint % on %', r.constraint_name, r.table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop %: %', r.constraint_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- 3. Lösche Testdaten aus allen Tabellen
DO $$
DECLARE
  test_company_ids UUID[] := ARRAY[
    'c99edb2e-790d-42d0-abab-18260a684aa6'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
    '11d6ebe9-366a-4b6c-93fc-8df38bdb8306'::uuid
  ];
  tbl RECORD;
  delete_sql TEXT;
  rows_deleted INTEGER;
  total_deleted INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Phase 3: Delete all test data ===';
  
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND column_name = 'company_id'
      AND table_name NOT IN ('companies', 'migration_journal')
    ORDER BY table_name
  LOOP
    BEGIN
      delete_sql := format('DELETE FROM public.%I WHERE company_id = ANY(%L)', tbl.table_name, test_company_ids);
      EXECUTE delete_sql;
      GET DIAGNOSTICS rows_deleted = ROW_COUNT;
      IF rows_deleted > 0 THEN
        total_deleted := total_deleted + rows_deleted;
        RAISE NOTICE 'Deleted % rows from %', rows_deleted, tbl.table_name;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Delete failed for %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Total deleted: %', total_deleted;
END $$;

-- 4. Lösche Test-Companies
DELETE FROM public.companies
WHERE id IN (
  'c99edb2e-790d-42d0-abab-18260a684aa6'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
  '11d6ebe9-366a-4b6c-93fc-8df38bdb8306'::uuid
);

-- 5. FK-Constraints wieder hinzufügen
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND column_name = 'company_id'
      AND table_name != 'companies'
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (company_id) REFERENCES public.companies(id)',
        tbl.table_name,
        tbl.table_name || '_company_id_fkey'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Constraint existiert bereits oder andere Probleme - ignorieren
      NULL;
    END;
  END LOOP;
END $$;
