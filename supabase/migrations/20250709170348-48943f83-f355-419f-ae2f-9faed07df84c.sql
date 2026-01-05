-- KRITISCHES FIX: RLS Policy Infinite Loop für calendar_events beheben

-- Schritt 1: Alle bestehenden Policies für calendar_events löschen
DROP POLICY IF EXISTS "Users can view events they created or are invited to" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;

-- Schritt 2: Neue, einfache und sichere Policies erstellen (ohne Rekursion)
CREATE POLICY "calendar_events_select" ON public.calendar_events
FOR SELECT USING (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);

CREATE POLICY "calendar_events_insert" ON public.calendar_events
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);

CREATE POLICY "calendar_events_update" ON public.calendar_events
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);

CREATE POLICY "calendar_events_delete" ON public.calendar_events
FOR DELETE USING (
  auth.uid() IS NOT NULL AND created_by = auth.uid()
);