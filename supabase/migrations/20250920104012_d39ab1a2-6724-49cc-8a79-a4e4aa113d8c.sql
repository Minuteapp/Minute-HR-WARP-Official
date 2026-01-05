-- Vereinfachte kritische Sicherheits-Reparatur (Deadlock-frei)
-- Nur die allerkritischsten Policies ohne komplexe Referenzen

-- 1. Companies Tabelle - Extrem kritisch
DO $$
BEGIN
  -- Lösche alte Policies einzeln
  DROP POLICY IF EXISTS "companies_select" ON companies;
  DROP POLICY IF EXISTS "SuperAdmins can read companies" ON companies;
  DROP POLICY IF EXISTS "Companies visible by superadmin" ON companies;
  
  -- Einfache SuperAdmin-Policy
  CREATE POLICY "companies_superadmin_only" 
  ON companies FOR ALL 
  USING (is_superadmin_safe(auth.uid()))
  WITH CHECK (is_superadmin_safe(auth.uid()));
END $$;

-- 2. User Roles - Extrem kritisch
DO $$
BEGIN
  DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
  DROP POLICY IF EXISTS "user_roles_all" ON user_roles;
  
  CREATE POLICY "user_roles_secure" 
  ON user_roles FOR ALL 
  USING (
    -- SuperAdmin kann alles sehen
    is_superadmin_safe(auth.uid()) OR 
    -- User kann eigene Rolle sehen
    user_id = auth.uid()
  )
  WITH CHECK (is_superadmin_safe(auth.uid()));
END $$;

-- 3. Time Entries - Kritisch für Zeiterfassung
DO $$
BEGIN
  DROP POLICY IF EXISTS "time_entries_select" ON time_entries;
  DROP POLICY IF EXISTS "time_entries_all" ON time_entries;
  
  CREATE POLICY "time_entries_basic" 
  ON time_entries FOR ALL 
  USING (
    is_superadmin_safe(auth.uid()) OR user_id = auth.uid()
  )
  WITH CHECK (
    is_superadmin_safe(auth.uid()) OR user_id = auth.uid()
  );
END $$;