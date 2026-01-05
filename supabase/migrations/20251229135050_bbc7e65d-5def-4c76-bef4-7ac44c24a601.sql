
-- =====================================================
-- PHASE 5: RLS FORCE AKTIVIEREN
-- Alle Domain-Tabellen bekommen FORCE ROW LEVEL SECURITY
-- =====================================================

-- 1. Prüfe aktuellen RLS Status
DO $$
DECLARE
  enabled_count INTEGER;
  forced_count INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE relrowsecurity = true),
    COUNT(*) FILTER (WHERE relforcerowsecurity = true)
  INTO enabled_count, forced_count
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' AND c.relkind = 'r';
  
  RAISE NOTICE 'Before: % tables with RLS enabled, % with RLS forced', enabled_count, forced_count;
END $$;

-- 2. FORCE RLS auf allen Tabellen mit company_id
DO $$
DECLARE
  tbl RECORD;
  success_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Forcing RLS on all domain tables ===';
  
  FOR tbl IN 
    SELECT DISTINCT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
      AND c.column_name = 'company_id'
      AND c.table_name NOT IN ('migration_journal')
    ORDER BY c.table_name
  LOOP
    BEGIN
      -- Enable RLS falls nicht bereits aktiviert
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.table_name);
      -- Force RLS
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl.table_name);
      success_count := success_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not force RLS on %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '=== Successfully forced RLS on % tables ===', success_count;
END $$;

-- 3. Prüfe finalen RLS Status
DO $$
DECLARE
  enabled_count INTEGER;
  forced_count INTEGER;
  not_forced TEXT[] := ARRAY[]::TEXT[];
  tbl RECORD;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE relrowsecurity = true),
    COUNT(*) FILTER (WHERE relforcerowsecurity = true)
  INTO enabled_count, forced_count
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' AND c.relkind = 'r';
  
  RAISE NOTICE 'After: % tables with RLS enabled, % with RLS forced', enabled_count, forced_count;
  
  -- Liste Tabellen ohne FORCE
  FOR tbl IN 
    SELECT c.relname as table_name
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r'
      AND c.relrowsecurity = true 
      AND c.relforcerowsecurity = false
  LOOP
    not_forced := array_append(not_forced, tbl.table_name);
  END LOOP;
  
  IF array_length(not_forced, 1) > 0 THEN
    RAISE NOTICE 'Tables with RLS enabled but NOT forced: %', not_forced;
  END IF;
END $$;
