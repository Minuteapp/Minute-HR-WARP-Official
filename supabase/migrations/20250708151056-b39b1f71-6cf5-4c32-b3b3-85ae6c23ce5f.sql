-- Fix calendar_events table to properly handle event creation
-- The issue is that code expects 'end' column but database has 'end_time'

-- First, drop any problematic RLS policies
DROP POLICY IF EXISTS "calendar_events_own_access" ON public.calendar_events;
DROP POLICY IF EXISTS "calendar_events_admin_access" ON public.calendar_events;

-- Create simple, non-recursive RLS policies
CREATE POLICY "Users can manage their own calendar events"
ON public.calendar_events
FOR ALL
USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all calendar events"
ON public.calendar_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Make sure end_time column exists and has proper constraints
ALTER TABLE public.calendar_events 
ALTER COLUMN end_time SET NOT NULL;

-- Update any events that might have NULL end_time
UPDATE public.calendar_events 
SET end_time = start_time + INTERVAL '1 hour'
WHERE end_time IS NULL;