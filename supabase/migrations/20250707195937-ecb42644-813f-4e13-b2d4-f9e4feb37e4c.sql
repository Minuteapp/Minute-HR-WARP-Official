-- Fix calendar_events RLS policies to prevent infinite recursion
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can manage their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins can manage all calendar events" ON public.calendar_events;

-- Create simple, non-recursive policies
CREATE POLICY "calendar_events_own_access"
ON public.calendar_events
FOR ALL
USING (created_by = auth.uid());

CREATE POLICY "calendar_events_admin_access"
ON public.calendar_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Ensure end_time column exists and is properly set
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Update any NULL end_time values
UPDATE public.calendar_events 
SET end_time = start_time + INTERVAL '1 hour'
WHERE end_time IS NULL;