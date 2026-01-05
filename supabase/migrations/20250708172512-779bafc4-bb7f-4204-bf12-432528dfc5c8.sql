-- Entferne alle problematischen Policies für channel_members
DROP POLICY IF EXISTS "Users can view channel members where they are members" ON public.channel_members;
DROP POLICY IF EXISTS "Channel creators can add members" ON public.channel_members;
DROP POLICY IF EXISTS "Channel owners can update members" ON public.channel_members;
DROP POLICY IF EXISTS "Channel owners and members can remove themselves" ON public.channel_members;

-- Erstelle security definer function um Rekursion zu vermeiden
CREATE OR REPLACE FUNCTION public.can_access_channel_member(channel_member_user_id uuid, channel_member_channel_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.channel_members cm
    WHERE cm.channel_id = channel_member_channel_id AND cm.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.channels c
    WHERE c.id = channel_member_channel_id AND c.created_by = auth.uid()
  );
END;
$$;

-- Neue sichere Policies ohne Rekursion
CREATE POLICY "Users can view channel members if they have access"
ON public.channel_members
FOR SELECT
USING (
  channel_id IN (
    SELECT id FROM public.channels WHERE is_public = true
  )
  OR
  can_access_channel_member(user_id, channel_id)
);

CREATE POLICY "Users can add themselves to channels"
ON public.channel_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR
  channel_id IN (
    SELECT id FROM public.channels WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Channel owners can update members"
ON public.channel_members
FOR UPDATE
USING (
  channel_id IN (
    SELECT id FROM public.channels WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can remove themselves or owners can remove members"
ON public.channel_members
FOR DELETE
USING (
  user_id = auth.uid()
  OR
  channel_id IN (
    SELECT id FROM public.channels WHERE created_by = auth.uid()
  )
);