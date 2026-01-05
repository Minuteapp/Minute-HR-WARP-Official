
-- =====================================================
-- PHASE 3: BATCH 4 - Employee-bezogene Tabellen (dynamisch)
-- =====================================================

-- Dynamische Migration für alle Tabellen mit employee_id
DO $$
DECLARE
  tbl RECORD;
  sql_stmt TEXT;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    JOIN information_schema.tables t ON c.table_name = t.table_name
    WHERE c.column_name = 'employee_id'
      AND c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c2 
        WHERE c2.table_name = c.table_name 
        AND c2.column_name = 'company_id'
      )
  LOOP
    sql_stmt := format(
      'UPDATE %I t SET company_id = e.company_id FROM employees e WHERE t.employee_id = e.id AND t.company_id IS NULL AND e.company_id IS NOT NULL',
      tbl.table_name
    );
    BEGIN
      EXECUTE sql_stmt;
      RAISE NOTICE 'Migrated table: %', tbl.table_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped table % due to error: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Dynamische Migration für alle Tabellen mit user_id → employees
DO $$
DECLARE
  tbl RECORD;
  sql_stmt TEXT;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    JOIN information_schema.tables t ON c.table_name = t.table_name
    WHERE c.column_name = 'user_id'
      AND c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c2 
        WHERE c2.table_name = c.table_name 
        AND c2.column_name = 'company_id'
      )
      AND c.table_name NOT IN ('user_roles', 'profiles') -- Skip diese
  LOOP
    -- Versuche erst über employees
    sql_stmt := format(
      'UPDATE %I t SET company_id = e.company_id FROM employees e WHERE t.user_id = e.id AND t.company_id IS NULL AND e.company_id IS NOT NULL',
      tbl.table_name
    );
    BEGIN
      EXECUTE sql_stmt;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ignoriere Fehler
    END;
    
    -- Dann über user_roles (für auth.uid)
    sql_stmt := format(
      'UPDATE %I t SET company_id = ur.company_id FROM user_roles ur WHERE t.user_id = ur.user_id AND t.company_id IS NULL AND ur.company_id IS NOT NULL',
      tbl.table_name
    );
    BEGIN
      EXECUTE sql_stmt;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ignoriere Fehler
    END;
  END LOOP;
END $$;

-- Dynamische Migration für alle Tabellen mit created_by → user_roles
DO $$
DECLARE
  tbl RECORD;
  sql_stmt TEXT;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    JOIN information_schema.tables t ON c.table_name = t.table_name
    WHERE c.column_name = 'created_by'
      AND c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c2 
        WHERE c2.table_name = c.table_name 
        AND c2.column_name = 'company_id'
      )
  LOOP
    sql_stmt := format(
      'UPDATE %I t SET company_id = ur.company_id FROM user_roles ur WHERE t.created_by = ur.user_id AND t.company_id IS NULL AND ur.company_id IS NOT NULL',
      tbl.table_name
    );
    BEGIN
      EXECUTE sql_stmt;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;
