
-- =====================================================
-- PHASE 4 SCHRITT 3: STANDARDISIERTE RLS-POLICIES
-- Korrigiert für tatsächliche Spaltenstrukturen
-- =====================================================

-- EMPLOYEES: Tenant-isolierte Zugriffskontrolle
DROP POLICY IF EXISTS "tenant_employees_select" ON employees;
DROP POLICY IF EXISTS "tenant_employees_insert" ON employees;
DROP POLICY IF EXISTS "tenant_employees_update" ON employees;
DROP POLICY IF EXISTS "tenant_employees_delete" ON employees;

CREATE POLICY "tenant_employees_select" ON employees
  FOR SELECT TO authenticated
  USING (public.can_access_tenant(company_id));

CREATE POLICY "tenant_employees_insert" ON employees
  FOR INSERT TO authenticated
  WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_employees_update" ON employees
  FOR UPDATE TO authenticated
  USING (public.can_write_tenant(company_id));

CREATE POLICY "tenant_employees_delete" ON employees
  FOR DELETE TO authenticated
  USING (public.can_write_tenant(company_id));

-- TIME_ENTRIES: Eigene Einträge (user_id) oder Tenant-Admin
DROP POLICY IF EXISTS "tenant_time_entries_select" ON time_entries;
DROP POLICY IF EXISTS "tenant_time_entries_insert" ON time_entries;
DROP POLICY IF EXISTS "tenant_time_entries_update" ON time_entries;
DROP POLICY IF EXISTS "tenant_time_entries_delete" ON time_entries;

CREATE POLICY "tenant_time_entries_select" ON time_entries
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.can_access_tenant(company_id)
  );

CREATE POLICY "tenant_time_entries_insert" ON time_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_time_entries_update" ON time_entries
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_time_entries_delete" ON time_entries
  FOR DELETE TO authenticated
  USING (
    public.can_write_tenant(company_id)
  );

-- CALENDAR_EVENTS: Eigene Events oder Tenant
DROP POLICY IF EXISTS "tenant_calendar_events_select" ON calendar_events;
DROP POLICY IF EXISTS "tenant_calendar_events_insert" ON calendar_events;
DROP POLICY IF EXISTS "tenant_calendar_events_update" ON calendar_events;
DROP POLICY IF EXISTS "tenant_calendar_events_delete" ON calendar_events;

CREATE POLICY "tenant_calendar_events_select" ON calendar_events
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.can_access_tenant(company_id)
  );

CREATE POLICY "tenant_calendar_events_insert" ON calendar_events
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_calendar_events_update" ON calendar_events
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_calendar_events_delete" ON calendar_events
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.can_write_tenant(company_id)
  );

-- DOCUMENTS: Tenant-Isolierung
DROP POLICY IF EXISTS "tenant_documents_select" ON documents;
DROP POLICY IF EXISTS "tenant_documents_insert" ON documents;
DROP POLICY IF EXISTS "tenant_documents_update" ON documents;
DROP POLICY IF EXISTS "tenant_documents_delete" ON documents;

CREATE POLICY "tenant_documents_select" ON documents
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.can_access_tenant(company_id)
  );

CREATE POLICY "tenant_documents_insert" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_documents_update" ON documents
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_documents_delete" ON documents
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.can_write_tenant(company_id)
  );

-- PROJECTS: Tenant-Isolierung
DROP POLICY IF EXISTS "tenant_projects_select" ON projects;
DROP POLICY IF EXISTS "tenant_projects_insert" ON projects;
DROP POLICY IF EXISTS "tenant_projects_update" ON projects;
DROP POLICY IF EXISTS "tenant_projects_delete" ON projects;

CREATE POLICY "tenant_projects_select" ON projects
  FOR SELECT TO authenticated
  USING (public.can_access_tenant(company_id));

CREATE POLICY "tenant_projects_insert" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_projects_update" ON projects
  FOR UPDATE TO authenticated
  USING (public.can_write_tenant(company_id));

CREATE POLICY "tenant_projects_delete" ON projects
  FOR DELETE TO authenticated
  USING (public.can_write_tenant(company_id));

-- ABSENCE_REQUESTS: Eigene oder Tenant
DROP POLICY IF EXISTS "tenant_absence_requests_select" ON absence_requests;
DROP POLICY IF EXISTS "tenant_absence_requests_insert" ON absence_requests;
DROP POLICY IF EXISTS "tenant_absence_requests_update" ON absence_requests;
DROP POLICY IF EXISTS "tenant_absence_requests_delete" ON absence_requests;

CREATE POLICY "tenant_absence_requests_select" ON absence_requests
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.can_access_tenant(company_id)
  );

CREATE POLICY "tenant_absence_requests_insert" ON absence_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_absence_requests_update" ON absence_requests
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.can_write_tenant(company_id)
  );

CREATE POLICY "tenant_absence_requests_delete" ON absence_requests
  FOR DELETE TO authenticated
  USING (
    public.can_write_tenant(company_id)
  );
