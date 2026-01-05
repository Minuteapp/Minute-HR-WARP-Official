
-- =====================================================
-- PHASE 5: BATCH-RLS-POLICIES FÜR ALLE DOMAIN-TABELLEN
-- Erstellt standardisierte tenant-basierte Policies
-- =====================================================

-- Dynamische Policy-Erstellung für alle Tabellen mit company_id
DO $$
DECLARE
  tbl RECORD;
  policy_exists BOOLEAN;
BEGIN
  FOR tbl IN 
    SELECT DISTINCT c.table_name 
    FROM information_schema.columns c
    JOIN information_schema.tables t ON c.table_name = t.table_name AND t.table_schema = 'public'
    WHERE c.column_name = 'company_id'
      AND c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.table_name NOT IN ('employees', 'time_entries', 'calendar_events', 'documents', 'projects', 'absence_requests', 'active_tenant_sessions', 'companies', 'user_roles')
  LOOP
    -- Prüfe ob tenant_*_select Policy bereits existiert
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = tbl.table_name 
        AND policyname = 'tenant_' || tbl.table_name || '_select'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
      -- DROP alte Policies falls vorhanden
      BEGIN
        EXECUTE format('DROP POLICY IF EXISTS "tenant_%I_select" ON %I', tbl.table_name, tbl.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "tenant_%I_insert" ON %I', tbl.table_name, tbl.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "tenant_%I_update" ON %I', tbl.table_name, tbl.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "tenant_%I_delete" ON %I', tbl.table_name, tbl.table_name);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
      
      -- Erstelle neue tenant-basierte Policies
      BEGIN
        EXECUTE format(
          'CREATE POLICY "tenant_%I_select" ON %I FOR SELECT TO authenticated USING (public.can_access_tenant(company_id))',
          tbl.table_name, tbl.table_name
        );
        EXECUTE format(
          'CREATE POLICY "tenant_%I_insert" ON %I FOR INSERT TO authenticated WITH CHECK (public.can_write_tenant(company_id))',
          tbl.table_name, tbl.table_name
        );
        EXECUTE format(
          'CREATE POLICY "tenant_%I_update" ON %I FOR UPDATE TO authenticated USING (public.can_write_tenant(company_id))',
          tbl.table_name, tbl.table_name
        );
        EXECUTE format(
          'CREATE POLICY "tenant_%I_delete" ON %I FOR DELETE TO authenticated USING (public.can_write_tenant(company_id))',
          tbl.table_name, tbl.table_name
        );
        RAISE NOTICE 'Created policies for: %', tbl.table_name;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipped % due to: %', tbl.table_name, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;
