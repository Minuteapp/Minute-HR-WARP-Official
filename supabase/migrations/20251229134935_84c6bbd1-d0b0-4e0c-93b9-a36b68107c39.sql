
-- =====================================================
-- PHASE 4b: Verbleibende NOT NULL Constraints
-- Für leere Tabellen und Tabellen ohne Daten
-- =====================================================

DO $$
DECLARE
  tbl RECORD;
  row_count INTEGER;
  null_count INTEGER;
  success_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Setting remaining NOT NULL constraints ===';
  
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
      -- Zähle Rows und NULL company_ids
      EXECUTE format('SELECT COUNT(*), COUNT(*) FILTER (WHERE company_id IS NULL) FROM public.%I', tbl.table_name)
      INTO row_count, null_count;
      
      IF null_count = 0 THEN
        -- Keine NULL Werte - setze NOT NULL
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN company_id SET NOT NULL', tbl.table_name);
        success_count := success_count + 1;
        RAISE NOTICE 'Set NOT NULL on % (% rows)', tbl.table_name, row_count;
      ELSIF row_count = null_count AND row_count > 0 THEN
        -- Alle Rows haben NULL - lösche diese (nach Quarantine)
        EXECUTE format(
          'INSERT INTO quarantine.rows (source_table, source_pk, payload_json, reason)
           SELECT %L, id, row_to_json(t), ''null_company_id_orphan''
           FROM public.%I t WHERE company_id IS NULL AND id IS NOT NULL',
          tbl.table_name, tbl.table_name
        );
        EXECUTE format('DELETE FROM public.%I WHERE company_id IS NULL', tbl.table_name);
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN company_id SET NOT NULL', tbl.table_name);
        success_count := success_count + 1;
        RAISE NOTICE 'Cleaned and set NOT NULL on % (removed % orphan rows)', tbl.table_name, null_count;
      ELSE
        RAISE NOTICE 'Skipped % (% of % rows have NULL)', tbl.table_name, null_count, row_count;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not process %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '=== Completed: % tables updated ===', success_count;
END $$;
