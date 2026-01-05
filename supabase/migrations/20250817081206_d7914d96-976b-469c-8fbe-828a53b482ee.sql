-- Temporär RLS deaktivieren für channel_members
ALTER TABLE public.channel_members DISABLE ROW LEVEL SECURITY;

-- Alle bestehenden Policies entfernen
DROP POLICY IF EXISTS "Users can view channel members where they are members" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON public.channel_members;
DROP POLICY IF EXISTS "Admins can manage all channel members" ON public.channel_members;

-- Security Definer Funktion für User-Rolle erstellen
CREATE OR REPLACE FUNCTION public.is_channel_member(channel_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_id = channel_uuid AND user_id = user_uuid
  );
$$;

-- RLS wieder aktivieren
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Neue, sichere RLS-Policies erstellen
CREATE POLICY "Users can view channel members where they are members"
ON public.channel_members FOR SELECT 
USING (
  public.is_channel_member(channel_id, auth.uid())
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