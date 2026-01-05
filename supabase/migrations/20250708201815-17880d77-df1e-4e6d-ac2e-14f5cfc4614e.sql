-- Fix infinite recursion in calendar_events RLS policies completely
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.calendar_events;

-- Make sure the get_current_user_role function exists and is safe
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create completely safe RLS policies without any recursion risk
CREATE POLICY "Users can view calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (
  created_by = auth.uid() 
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

CREATE POLICY "Users can create calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY "Users can update their calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (
  created_by = auth.uid()
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

CREATE POLICY "Users can delete their calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (
  created_by = auth.uid()
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(type);

-- Fix any other potential RLS recursion issues
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Add performance indexes for time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id_date ON public.time_entries(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON public.time_entries(status);

-- Add performance indexes for absence requests
CREATE INDEX IF NOT EXISTS idx_absence_requests_user_id_date ON public.absence_requests(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_absence_requests_status ON public.absence_requests(status);