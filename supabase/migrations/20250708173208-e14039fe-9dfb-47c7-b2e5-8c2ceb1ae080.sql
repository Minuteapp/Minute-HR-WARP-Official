-- Entferne alle problematischen Policies für channels
DROP POLICY IF EXISTS "Users can view channels they have access to" ON public.channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Channel owners can update their channels" ON public.channels;
DROP POLICY IF EXISTS "Users can view accessible channels" ON public.channels;
DROP POLICY IF EXISTS "Allow access to public channels" ON public.channels;

-- Entferne alle problematischen Policies für channel_members (bereits von vorheriger Migration)
DROP POLICY IF EXISTS "Users can view channel members if they have access" ON public.channel_members;
DROP POLICY IF EXISTS "Users can add themselves to channels" ON public.channel_members;
DROP POLICY IF EXISTS "Channel owners can update members" ON public.channel_members;
DROP POLICY IF EXISTS "Users can remove themselves or owners can remove members" ON public.channel_members;

-- Erstelle sehr einfache, sichere Policies ohne Rekursion für channels
CREATE POLICY "Allow authenticated users to view public channels"
ON public.channels
FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Allow authenticated users to create channels"
ON public.channels
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Channel creators can update their channels"
ON public.channels
FOR UPDATE
USING (created_by = auth.uid());

-- Erstelle sehr einfache, sichere Policies ohne Rekursion für channel_members
CREATE POLICY "Allow members to view channel membership"
ON public.channel_members
FOR SELECT
USING (
  user_id = auth.uid() OR 
  channel_id IN (
    SELECT id FROM public.channels WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Allow users to join channels"
ON public.channel_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR 
  channel_id IN (
    SELECT id FROM public.channels WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Allow users to leave channels"
ON public.channel_members
FOR DELETE
USING (
  user_id = auth.uid() OR 
  channel_id IN (
    SELECT id FROM public.channels WHERE created_by = auth.uid()
  )
);