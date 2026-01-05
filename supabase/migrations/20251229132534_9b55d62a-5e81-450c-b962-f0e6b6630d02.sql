
-- =====================================================
-- PHASE 5 TEIL 2: BEREINIGE ALTE/DOPPELTE POLICIES
-- Entferne alte Policies die durch tenant_ ersetzt wurden
-- =====================================================

-- Für Tabellen mit neuen tenant_ Policies: Entferne alte Policies
DO $$
DECLARE
  tbl RECORD;
  old_policy RECORD;
BEGIN
  -- Für jede Tabelle mit tenant_ policies
  FOR tbl IN 
    SELECT DISTINCT tablename 
    FROM pg_policies 
    WHERE policyname LIKE 'tenant_%_select'
  LOOP
    -- Finde und lösche alte Policies (nicht tenant_)
    FOR old_policy IN 
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = tbl.tablename 
        AND policyname NOT LIKE 'tenant_%'
        AND schemaname = 'public'
    LOOP
      BEGIN
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', old_policy.policyname, tbl.tablename);
        RAISE NOTICE 'Dropped old policy: % on %', old_policy.policyname, tbl.tablename;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop: % on % - %', old_policy.policyname, tbl.tablename, SQLERRM;
      END;
    END LOOP;
  END LOOP;
END $$;
