
-- =====================================================
-- PHASE 3: BATCH 5 - Referenztabellen
-- Tabellen die über andere Referenz-IDs verknüpft sind
-- =====================================================

-- Für Tabellen mit project_id
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    WHERE c.column_name = 'project_id' AND c.table_schema = 'public'
      AND EXISTS (SELECT 1 FROM information_schema.columns c2 WHERE c2.table_name = c.table_name AND c2.column_name = 'company_id')
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I t SET company_id = p.company_id FROM projects p WHERE t.project_id = p.id AND t.company_id IS NULL AND p.company_id IS NOT NULL',
        tbl.table_name
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Für Tabellen mit department_id  
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    WHERE c.column_name = 'department_id' AND c.table_schema = 'public'
      AND EXISTS (SELECT 1 FROM information_schema.columns c2 WHERE c2.table_name = c.table_name AND c2.column_name = 'company_id')
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I t SET company_id = d.company_id FROM departments d WHERE t.department_id = d.id AND t.company_id IS NULL AND d.company_id IS NOT NULL',
        tbl.table_name
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Für Tabellen mit team_id
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    WHERE c.column_name = 'team_id' AND c.table_schema = 'public'
      AND EXISTS (SELECT 1 FROM information_schema.columns c2 WHERE c2.table_name = c.table_name AND c2.column_name = 'company_id')
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I t SET company_id = tm.company_id FROM teams tm WHERE t.team_id = tm.id AND t.company_id IS NULL AND tm.company_id IS NOT NULL',
        tbl.table_name
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Für Tabellen mit budget_id
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    WHERE c.column_name = 'budget_id' AND c.table_schema = 'public'
      AND EXISTS (SELECT 1 FROM information_schema.columns c2 WHERE c2.table_name = c.table_name AND c2.column_name = 'company_id')
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I t SET company_id = b.company_id FROM budgets b WHERE t.budget_id = b.id AND t.company_id IS NULL AND b.company_id IS NOT NULL',
        tbl.table_name
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Für Tabellen mit workflow_id
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    WHERE c.column_name = 'workflow_id' AND c.table_schema = 'public'
      AND EXISTS (SELECT 1 FROM information_schema.columns c2 WHERE c2.table_name = c.table_name AND c2.column_name = 'company_id')
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I t SET company_id = w.company_id FROM workflows w WHERE t.workflow_id = w.id AND t.company_id IS NULL AND w.company_id IS NOT NULL',
        tbl.table_name
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Für Tabellen mit trip_id
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    WHERE c.column_name = 'trip_id' AND c.table_schema = 'public'
      AND EXISTS (SELECT 1 FROM information_schema.columns c2 WHERE c2.table_name = c.table_name AND c2.column_name = 'company_id')
  LOOP
    BEGIN
      EXECUTE format(
        'UPDATE %I t SET company_id = tr.company_id FROM trips tr WHERE t.trip_id = tr.id AND t.company_id IS NULL AND tr.company_id IS NOT NULL',
        tbl.table_name
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;
