-- =====================================================
-- STRIKTE TENANT-ISOLATION: RLS-Policies korrigieren
-- Entferne user_id/created_by OR-Klauseln, nur noch tenant-basiert
-- =====================================================

-- =====================================================
-- 1. time_entries: Policies löschen und neu erstellen
-- =====================================================
DROP POLICY IF EXISTS "tenant_time_entries_select" ON public.time_entries;
DROP POLICY IF EXISTS "tenant_time_entries_insert" ON public.time_entries;
DROP POLICY IF EXISTS "tenant_time_entries_update" ON public.time_entries;
DROP POLICY IF EXISTS "tenant_time_entries_delete" ON public.time_entries;
DROP POLICY IF EXISTS "Users can view their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON public.time_entries;

CREATE POLICY "tenant_time_entries_select" ON public.time_entries
  FOR SELECT USING (public.can_access_tenant(company_id));

CREATE POLICY "tenant_time_entries_insert" ON public.time_entries
  FOR INSERT WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_time_entries_update" ON public.time_entries
  FOR UPDATE USING (public.can_write_tenant(company_id))
  WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_time_entries_delete" ON public.time_entries
  FOR DELETE USING (public.can_write_tenant(company_id));

-- =====================================================
-- 2. absence_requests: Policies löschen und neu erstellen
-- =====================================================
DROP POLICY IF EXISTS "tenant_absence_requests_select" ON public.absence_requests;
DROP POLICY IF EXISTS "tenant_absence_requests_insert" ON public.absence_requests;
DROP POLICY IF EXISTS "tenant_absence_requests_update" ON public.absence_requests;
DROP POLICY IF EXISTS "tenant_absence_requests_delete" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can view their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can insert their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can update their own absence requests" ON public.absence_requests;
DROP POLICY IF EXISTS "Users can delete their own absence requests" ON public.absence_requests;

CREATE POLICY "tenant_absence_requests_select" ON public.absence_requests
  FOR SELECT USING (public.can_access_tenant(company_id));

CREATE POLICY "tenant_absence_requests_insert" ON public.absence_requests
  FOR INSERT WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_absence_requests_update" ON public.absence_requests
  FOR UPDATE USING (public.can_write_tenant(company_id))
  WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_absence_requests_delete" ON public.absence_requests
  FOR DELETE USING (public.can_write_tenant(company_id));

-- =====================================================
-- 3. calendar_events: Policies löschen und neu erstellen
-- =====================================================
DROP POLICY IF EXISTS "tenant_calendar_events_select" ON public.calendar_events;
DROP POLICY IF EXISTS "tenant_calendar_events_insert" ON public.calendar_events;
DROP POLICY IF EXISTS "tenant_calendar_events_update" ON public.calendar_events;
DROP POLICY IF EXISTS "tenant_calendar_events_delete" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;

CREATE POLICY "tenant_calendar_events_select" ON public.calendar_events
  FOR SELECT USING (public.can_access_tenant(company_id));

CREATE POLICY "tenant_calendar_events_insert" ON public.calendar_events
  FOR INSERT WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_calendar_events_update" ON public.calendar_events
  FOR UPDATE USING (public.can_write_tenant(company_id))
  WITH CHECK (public.can_write_tenant(company_id));

CREATE POLICY "tenant_calendar_events_delete" ON public.calendar_events
  FOR DELETE USING (public.can_write_tenant(company_id));