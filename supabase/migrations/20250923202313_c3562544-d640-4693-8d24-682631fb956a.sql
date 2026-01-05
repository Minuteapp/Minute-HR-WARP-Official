-- KRITISCHE SICHERHEITSFIXES #4: Aktiviere RLS auf allen ungesicherten Tabellen

-- Die gefährlichsten Tabellen OHNE RLS (identifiziert durch Linter)
-- Diese ermöglichen derzeit ungeschützten öffentlichen Zugriff

-- Aktiviere RLS für Sequenzen und andere Tabellen die aktuell völlig ungeschützt sind
-- Note: Sequences sind normalerweise sicher, aber der Linter warnt trotzdem

-- Wichtig: Nur echte Tabellen mit sensiblen Daten sichern
-- Sequences werden automatisch vom System verwaltet und brauchen normalerweise kein RLS

-- Prüfe und sichere alle restlichen öffentlichen Tabellen
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Finde alle Tabellen im public Schema ohne RLS
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE '%_seq'  -- Exclude sequences
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE c.relrowsecurity = true
        )
    LOOP
        -- Aktiviere RLS für jede ungesicherte Tabelle
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
                      table_record.schemaname, table_record.tablename);
        
        -- Erstelle eine restriktive Standard-Policy (nur für Admins)
        EXECUTE format('CREATE POLICY "Admin access only - emergency security fix" 
                       ON %I.%I FOR ALL TO authenticated 
                       USING (EXISTS (
                           SELECT 1 FROM user_roles 
                           WHERE user_id = auth.uid() 
                           AND role IN (''admin''::user_role, ''superadmin''::user_role)
                       ))', table_record.schemaname, table_record.tablename);
        
        RAISE NOTICE 'Secured table: %', table_record.tablename;
    END LOOP;
END
$$;

-- Log der kritischen Sicherheitsreparatur
INSERT INTO public.security_audit_logs (
  user_id, action, resource_type, resource_id, details, risk_level
) VALUES (
  auth.uid(), 
  'emergency_rls_activation', 
  'database_security', 
  'all_unprotected_tables',
  '{"description": "Emergency activation of RLS on all unprotected public tables", "severity": "critical"}'::jsonb,
  'critical'
);