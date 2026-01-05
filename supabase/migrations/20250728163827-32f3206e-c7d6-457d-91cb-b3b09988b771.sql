-- KORRIGIERTE DATENISOLATION - Array-Problem behoben
-- Diese Migration behebt das Array-UUID Vergleichsproblem

-- 1. RLS für TASKS Tabelle (KRITISCH - User sieht fremde Tasks!)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Lösche eventuell existierende Policy
DROP POLICY IF EXISTS "Company Isolation for Tasks" ON tasks;

-- RLS Policy für Tasks - nur eigene Firma, korrigierte Array-Syntax
CREATE POLICY "Company Isolation for Tasks" ON tasks
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen (im Super-Admin Bereich)
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Tasks der aktuellen Tenant-Firma
    (is_in_tenant_context() AND EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = get_tenant_company_id_safe()
    ))
    OR
    -- Normale Benutzer: nur Tasks ihrer eigenen Firma - KORRIGIERTE ARRAY-SYNTAX
    (NOT is_in_tenant_context() AND (
      assigned_to = auth.uid() 
      OR created_by = auth.uid()
      OR project_id IN (
        SELECT p.id FROM projects p 
        WHERE p.owner_id = auth.uid() 
        OR (p.team_members IS NOT NULL AND p.team_members::jsonb ? auth.uid()::text)
      )
    ))
  );

-- 2. RLS für PROJECTS Tabelle
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Lösche eventuell existierende Policy
DROP POLICY IF EXISTS "Company Isolation for Projects" ON projects;

CREATE POLICY "Company Isolation for Projects" ON projects
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Projekte der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: nur eigene Projekte oder wo sie Mitglied sind - KORRIGIERTE ARRAY-SYNTAX
    (NOT is_in_tenant_context() AND (
      owner_id = auth.uid() 
      OR (team_members IS NOT NULL AND team_members::jsonb ? auth.uid()::text)
      OR company_id = get_user_company_id(auth.uid())
    ))
  );

-- 3. RLS für EMPLOYEES Tabelle
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Lösche eventuell existierende Policy
DROP POLICY IF EXISTS "Company Isolation for Employees" ON employees;

CREATE POLICY "Company Isolation for Employees" ON employees
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Mitarbeiter der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: nur Mitarbeiter ihrer eigenen Firma
    (NOT is_in_tenant_context() AND company_id = get_user_company_id(auth.uid()))
  );

-- 4. RLS für TIME_ENTRIES Tabelle
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Lösche eventuell existierende Policy
DROP POLICY IF EXISTS "Company Isolation for Time Entries" ON time_entries;

CREATE POLICY "Company Isolation for Time Entries" ON time_entries
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Time Entries von Mitarbeitern der Tenant-Firma
    (is_in_tenant_context() AND user_id IN (
      SELECT e.id FROM employees e 
      WHERE e.company_id = get_tenant_company_id_safe()
    ))
    OR
    -- Normale Benutzer: nur eigene Time Entries oder von Mitarbeitern ihrer Firma
    (NOT is_in_tenant_context() AND (
      user_id = auth.uid()
      OR user_id IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
      )
    ))
  );

-- 5. RLS für DOCUMENTS Tabelle
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Lösche eventuell existierende Policy
DROP POLICY IF EXISTS "Company Isolation for Documents" ON documents;

CREATE POLICY "Company Isolation for Documents" ON documents
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Dokumente der Tenant-Firma
    (is_in_tenant_context() AND company_id = get_tenant_company_id_safe())
    OR
    -- Normale Benutzer: nur Dokumente ihrer Firma oder eigene
    (NOT is_in_tenant_context() AND (
      uploaded_by = auth.uid()
      OR company_id = get_user_company_id(auth.uid())
    ))
  );

-- 6. RLS für CALENDAR_EVENTS Tabelle
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Lösche eventuell existierende Policy
DROP POLICY IF EXISTS "Company Isolation for Calendar Events" ON calendar_events;

CREATE POLICY "Company Isolation for Calendar Events" ON calendar_events
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Events von Mitarbeitern der Tenant-Firma
    (is_in_tenant_context() AND created_by IN (
      SELECT e.id FROM employees e 
      WHERE e.company_id = get_tenant_company_id_safe()
    ))
    OR
    -- Normale Benutzer: nur eigene Events oder von ihrer Firma
    (NOT is_in_tenant_context() AND (
      created_by = auth.uid()
      OR created_by IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
      )
    ))
  );

-- 7. RLS für GOALS Tabelle
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Lösche eventuell existierende Policy
DROP POLICY IF EXISTS "Company Isolation for Goals" ON goals;

CREATE POLICY "Company Isolation for Goals" ON goals
  FOR ALL 
  USING (
    -- Super-Admin kann alles sehen
    (is_superadmin_safe(auth.uid()) AND NOT is_in_tenant_context())
    OR
    -- Im Tenant-Kontext: nur Goals von Mitarbeitern der Tenant-Firma
    (is_in_tenant_context() AND (
      created_by IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
      OR assigned_to IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_tenant_company_id_safe()
      )
    ))
    OR
    -- Normale Benutzer: nur eigene Goals oder von ihrer Firma
    (NOT is_in_tenant_context() AND (
      created_by = auth.uid()
      OR assigned_to = auth.uid()
      OR created_by IN (
        SELECT e.id FROM employees e 
        WHERE e.company_id = get_user_company_id(auth.uid())
      )
    ))
  );