-- Fix infinite recursion in channel_members policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Admins can manage channel members" ON public.channel_members;

-- Create simple, safe policies without recursion
CREATE POLICY "Channel members can view members" ON public.channel_members
FOR SELECT USING (user_id = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Channel owners can manage members" ON public.channel_members
FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Also fix any potential issues with channels table
-- Make sure channels table has proper RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view channels" ON public.channels;
CREATE POLICY "Users can view channels" ON public.channels
FOR SELECT USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.channel_members cm 
    WHERE cm.channel_id = channels.id AND cm.user_id = auth.uid()
  )
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
CREATE POLICY "Users can create channels" ON public.channels
FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Channel owners can manage channels" ON public.channels;
CREATE POLICY "Channel owners can manage channels" ON public.channels
FOR ALL USING (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'));