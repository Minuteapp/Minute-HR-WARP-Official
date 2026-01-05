-- Überprüfe die bestehenden RLS-Policies für channel_members
-- und behebe die unendliche Rekursion

-- Zuerst alle bestehenden Policies für channel_members entfernen
DROP POLICY IF EXISTS "channel_members_select" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_insert" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_update" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_delete" ON public.channel_members;

-- Neue, sichere RLS-Policies erstellen
CREATE POLICY "Users can view channel members where they are members"
ON public.channel_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.channel_members cm 
    WHERE cm.channel_id = channel_members.channel_id 
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join channels"
ON public.channel_members FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership"
ON public.channel_members FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave channels"
ON public.channel_members FOR DELETE 
USING (user_id = auth.uid());

-- Admins haben vollen Zugriff
CREATE POLICY "Admins can manage all channel members"
ON public.channel_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);