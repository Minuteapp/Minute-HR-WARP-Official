-- Add RLS policies for the newly enabled tables
-- Calendar Event Templates
DROP POLICY IF EXISTS "Users can view event templates" ON public.calendar_event_templates;
CREATE POLICY "Users can view event templates" ON public.calendar_event_templates
FOR SELECT USING (is_public = true OR created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Users can manage their event templates" ON public.calendar_event_templates;
CREATE POLICY "Users can manage their event templates" ON public.calendar_event_templates
FOR ALL USING (created_by = auth.uid() OR public.get_current_user_role() IN ('admin', 'superadmin'));

-- Calendar Invitations
DROP POLICY IF EXISTS "Users can view their invitations" ON public.calendar_invitations;
CREATE POLICY "Users can view their invitations" ON public.calendar_invitations
FOR SELECT USING (
  invited_user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_invitations.event_id 
    AND created_by = auth.uid()
  )
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

DROP POLICY IF EXISTS "Users can manage invitations for their events" ON public.calendar_invitations;
CREATE POLICY "Users can manage invitations for their events" ON public.calendar_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_invitations.event_id 
    AND created_by = auth.uid()
  ) OR public.get_current_user_role() IN ('admin', 'superadmin')
);

-- Calendar Reminders
DROP POLICY IF EXISTS "Users can view their reminders" ON public.calendar_reminders;
CREATE POLICY "Users can view their reminders" ON public.calendar_reminders
FOR SELECT USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_reminders.event_id 
    AND created_by = auth.uid()
  )
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

DROP POLICY IF EXISTS "Users can manage their reminders" ON public.calendar_reminders;
CREATE POLICY "Users can manage their reminders" ON public.calendar_reminders
FOR ALL USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.calendar_events 
    WHERE id = calendar_reminders.event_id 
    AND created_by = auth.uid()
  ) OR public.get_current_user_role() IN ('admin', 'superadmin')
);

-- Channel Members
DROP POLICY IF EXISTS "Users can view channel members" ON public.channel_members;
CREATE POLICY "Users can view channel members" ON public.channel_members
FOR SELECT USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = channel_members.channel_id 
    AND created_by = auth.uid()
  )
  OR public.get_current_user_role() IN ('admin', 'superadmin')
);

DROP POLICY IF EXISTS "Users can manage channel members" ON public.channel_members;
CREATE POLICY "Users can manage channel members" ON public.channel_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = channel_members.channel_id 
    AND created_by = auth.uid()
  ) OR public.get_current_user_role() IN ('admin', 'superadmin')
);