-- Fix calendar_events table structure
-- The issue is that the 'end' column doesn't exist, but the code expects it

-- First, let's check the current structure and add missing columns
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Update existing events that might have NULL end_time
UPDATE public.calendar_events 
SET end_time = start_time + INTERVAL '1 hour'
WHERE end_time IS NULL;

-- Also fix the RLS policies that might be causing infinite recursion
DROP POLICY IF EXISTS "Users can view calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete calendar events" ON public.calendar_events;

-- Create simpler, non-recursive RLS policies
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