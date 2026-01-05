-- SCHRITT 5B KORRIGIERT: Calendar Events RLS mit JSONB-Handling
DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view events they're invited to" ON calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can create calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Event creators can update calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can view calendar events in their company" ON calendar_events;
DROP POLICY IF EXISTS "Users can create calendar events in their company" ON calendar_events;
DROP POLICY IF EXISTS "Users can update calendar events in their company" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete calendar events in their company" ON calendar_events;

CREATE POLICY "Users can view calendar events in their company" ON calendar_events
  FOR SELECT USING (
    is_superadmin_safe(auth.uid()) OR
    (company_id = get_effective_company_id() AND (
      created_by = auth.uid() OR
      attendees ? auth.uid()::text
    ))
  );

CREATE POLICY "Users can create calendar events in their company" ON calendar_events
  FOR INSERT WITH CHECK (
    company_id = get_effective_company_id()
  );

CREATE POLICY "Users can update calendar events in their company" ON calendar_events
  FOR UPDATE USING (
    company_id = get_effective_company_id() AND
    (created_by = auth.uid() OR is_superadmin_safe(auth.uid()))
  );

CREATE POLICY "Users can delete calendar events in their company" ON calendar_events
  FOR DELETE USING (
    company_id = get_effective_company_id() AND
    (created_by = auth.uid() OR is_superadmin_safe(auth.uid()))
  );

DROP TRIGGER IF EXISTS set_company_id_calendar_events ON calendar_events;
CREATE TRIGGER set_company_id_calendar_events
  BEFORE INSERT ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION auto_set_company_id();