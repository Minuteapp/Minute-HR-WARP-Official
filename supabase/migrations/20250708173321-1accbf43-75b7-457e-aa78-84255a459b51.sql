-- Entferne alle channel_members Policies nochmal vollständig
DROP POLICY IF EXISTS "Allow members to view channel membership" ON public.channel_members;
DROP POLICY IF EXISTS "Allow users to join channels" ON public.channel_members;
DROP POLICY IF EXISTS "Allow users to leave channels" ON public.channel_members;

-- Entferne auch die bereits gelöschte can_access_channel_member function
DROP FUNCTION IF EXISTS public.can_access_channel_member(uuid, uuid);

-- Erstelle eine noch einfachere Security Definer Function
CREATE OR REPLACE FUNCTION public.user_can_access_channel(p_channel_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe ob der Channel öffentlich ist oder der User der Ersteller ist
  RETURN EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = p_channel_id 
    AND (is_public = true OR created_by = auth.uid())
  );
END;
$$;

-- Neue einfache Policies für channel_members ohne Rekursion
CREATE POLICY "Users can view channel members for accessible channels"
ON public.channel_members
FOR SELECT
USING (user_can_access_channel(channel_id));

CREATE POLICY "Users can join accessible channels"
ON public.channel_members
FOR INSERT
WITH CHECK (user_can_access_channel(channel_id) AND user_id = auth.uid());

CREATE POLICY "Users can leave channels they belong to"
ON public.channel_members
FOR DELETE
USING (user_id = auth.uid());