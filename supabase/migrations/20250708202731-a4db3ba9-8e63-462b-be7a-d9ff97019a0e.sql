-- Add basic RLS policies for tables without specific column requirements
-- Calendar Event Templates
DROP POLICY IF EXISTS "Users can view event templates" ON public.calendar_event_templates;
CREATE POLICY "Users can view event templates" ON public.calendar_event_templates
FOR SELECT USING (public.get_current_user_role() IN ('admin', 'superadmin') OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their event templates" ON public.calendar_event_templates;
CREATE POLICY "Users can manage their event templates" ON public.calendar_event_templates
FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Calendar Invitations - basic policy
DROP POLICY IF EXISTS "Users can view invitations" ON public.calendar_invitations;
CREATE POLICY "Users can view invitations" ON public.calendar_invitations
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage invitations" ON public.calendar_invitations;
CREATE POLICY "Admins can manage invitations" ON public.calendar_invitations
FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Calendar Reminders - basic policy
DROP POLICY IF EXISTS "Users can view reminders" ON public.calendar_reminders;
CREATE POLICY "Users can view reminders" ON public.calendar_reminders
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage reminders" ON public.calendar_reminders;
CREATE POLICY "Admins can manage reminders" ON public.calendar_reminders
FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Channel Members - basic policy
DROP POLICY IF EXISTS "Users can view channel members" ON public.channel_members;
CREATE POLICY "Users can view channel members" ON public.channel_members
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage channel members" ON public.channel_members;
CREATE POLICY "Admins can manage channel members" ON public.channel_members
FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Add some additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_invitations_event_id ON public.calendar_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_reminders_event_id ON public.calendar_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);