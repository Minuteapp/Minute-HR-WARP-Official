-- =====================================================
-- PHASE 1: company_id zu fehlenden Tabellen hinzufügen
-- =====================================================

-- Development Firma ID für Backfill
DO $$
DECLARE
  dev_company_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Sicherstellen, dass die Development-Firma existiert
  INSERT INTO companies (id, name)
  VALUES (dev_company_id, 'Development')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- 1. DEPARTMENTS: company_id hinzufügen
ALTER TABLE departments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Bestehende Departments der Development-Firma zuordnen
UPDATE departments 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- 2. TEAMS: company_id hinzufügen (falls nicht vorhanden)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

UPDATE teams 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- 3. TIME_ENTRIES: company_id hinzufügen
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

UPDATE time_entries 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- 4. SICK_LEAVES: company_id hinzufügen
ALTER TABLE sick_leaves ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

UPDATE sick_leaves 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- 5. TICKETS: company_id hinzufügen
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

UPDATE tickets 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- 6. AUDIT_LOGS: company_id hinzufügen
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

UPDATE audit_logs 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- =====================================================
-- PHASE 2: RLS Policies korrigieren
-- =====================================================

-- DEPARTMENTS RLS
DROP POLICY IF EXISTS "Everyone can view departments" ON departments;
DROP POLICY IF EXISTS "departments_select_policy" ON departments;
DROP POLICY IF EXISTS "departments_insert_policy" ON departments;
DROP POLICY IF EXISTS "departments_update_policy" ON departments;
DROP POLICY IF EXISTS "departments_delete_policy" ON departments;

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_select_policy" ON departments
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "departments_insert_policy" ON departments
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "departments_update_policy" ON departments
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "departments_delete_policy" ON departments
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- TEAMS RLS
DROP POLICY IF EXISTS "Everyone can view teams" ON teams;
DROP POLICY IF EXISTS "teams_select_policy" ON teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "teams_delete_policy" ON teams;

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_policy" ON teams
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "teams_insert_policy" ON teams
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "teams_update_policy" ON teams
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "teams_delete_policy" ON teams
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- TIME_ENTRIES RLS
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;
DROP POLICY IF EXISTS "time_entries_select_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON time_entries;

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_select_policy" ON time_entries
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "time_entries_insert_policy" ON time_entries
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "time_entries_update_policy" ON time_entries
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "time_entries_delete_policy" ON time_entries
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- SICK_LEAVES RLS
DROP POLICY IF EXISTS "Users can view their own sick leaves" ON sick_leaves;
DROP POLICY IF EXISTS "Users can insert their own sick leaves" ON sick_leaves;
DROP POLICY IF EXISTS "Users can update their own sick leaves" ON sick_leaves;
DROP POLICY IF EXISTS "sick_leaves_select_policy" ON sick_leaves;
DROP POLICY IF EXISTS "sick_leaves_insert_policy" ON sick_leaves;
DROP POLICY IF EXISTS "sick_leaves_update_policy" ON sick_leaves;
DROP POLICY IF EXISTS "sick_leaves_delete_policy" ON sick_leaves;

ALTER TABLE sick_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sick_leaves_select_policy" ON sick_leaves
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "sick_leaves_insert_policy" ON sick_leaves
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "sick_leaves_update_policy" ON sick_leaves
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "sick_leaves_delete_policy" ON sick_leaves
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- TICKETS RLS
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "tickets_select_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_insert_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_update_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_delete_policy" ON tickets;

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_policy" ON tickets
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "tickets_insert_policy" ON tickets
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "tickets_update_policy" ON tickets
FOR UPDATE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "tickets_delete_policy" ON tickets
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- AUDIT_LOGS RLS
DROP POLICY IF EXISTS "Users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_policy" ON audit_logs
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

CREATE POLICY "audit_logs_insert_policy" ON audit_logs
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id = get_effective_company_id()
);

-- =====================================================
-- PHASE 3: Indizes für Performance hinzufügen
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_teams_company_id ON teams(company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_company_id ON time_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_sick_leaves_company_id ON sick_leaves(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);