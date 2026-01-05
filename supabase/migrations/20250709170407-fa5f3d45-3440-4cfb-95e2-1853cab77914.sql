-- KRITISCHES FIX: Alle calendar_events Policies löschen und neue erstellen

-- Alle bestehenden Policies löschen
DROP POLICY IF EXISTS "calendar_events_select" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_insert" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_update" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_delete" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view events they created or are invited to" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;

-- Neue, einfache Policies ohne Rekursion
CREATE POLICY "Allow users to view own events" ON public.calendar_events
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Allow users to create events" ON public.calendar_events
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow users to update own events" ON public.calendar_events
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Allow users to delete own events" ON public.calendar_events
FOR DELETE USING (created_by = auth.uid());