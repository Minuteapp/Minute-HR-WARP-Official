-- Fix infinite recursion in calendar_events RLS policies
-- First, create a security definer function to check user permissions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.calendar_events;

-- Create new safe RLS policies using the security definer function
CREATE POLICY "Users can view their own events" 
ON public.calendar_events 
FOR SELECT 
USING (
  created_by = auth.uid() 
  OR public.get_current_user_role() = 'admin'
  OR public.get_current_user_role() = 'superadmin'
);

CREATE POLICY "Users can create their own events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (
  created_by = auth.uid()
  OR public.get_current_user_role() = 'admin'
  OR public.get_current_user_role() = 'superadmin'
);

CREATE POLICY "Users can update their own events" 
ON public.calendar_events 
FOR UPDATE 
USING (
  created_by = auth.uid()
  OR public.get_current_user_role() = 'admin'
  OR public.get_current_user_role() = 'superadmin'
);

CREATE POLICY "Users can delete their own events" 
ON public.calendar_events 
FOR DELETE 
USING (
  created_by = auth.uid()
  OR public.get_current_user_role() = 'admin'
  OR public.get_current_user_role() = 'superadmin'
);

-- Create Mapbox token storage for secure token management
CREATE TABLE IF NOT EXISTS public.mapbox_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on mapbox_settings
ALTER TABLE public.mapbox_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage Mapbox settings
CREATE POLICY "Admins can manage Mapbox settings"
ON public.mapbox_settings
FOR ALL
USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Everyone can view Mapbox public token (it's public anyway)
CREATE POLICY "Everyone can view Mapbox public token"
ON public.mapbox_settings
FOR SELECT
USING (true);

-- Insert default Mapbox token placeholder
INSERT INTO public.mapbox_settings (public_token, created_by)
VALUES ('pk.your_mapbox_public_token_here', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;