-- Kritische Database-Fixes
-- 1. Infinite Recursion in calendar_events RLS Policy beheben
DROP POLICY IF EXISTS "Users can manage their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;

-- Neue, einfache RLS Policies für calendar_events
CREATE POLICY "calendar_events_select" 
ON public.calendar_events FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "calendar_events_insert" 
ON public.calendar_events FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "calendar_events_update" 
ON public.calendar_events FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "calendar_events_delete" 
ON public.calendar_events FOR DELETE 
USING (auth.uid() = created_by);

-- 2. Fehlende Spalten hinzufügen
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS review_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;