-- Zuerst alle bestehenden Policies für channel_members entfernen
DROP POLICY IF EXISTS "Users can view channel members for accessible channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join accessible channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave channels they belong to" ON public.channel_members;
DROP POLICY IF EXISTS "Allow members to view channel membership" ON public.channel_members;
DROP POLICY IF EXISTS "Allow users to join channels" ON public.channel_members;
DROP POLICY IF EXISTS "Allow users to leave channels" ON public.channel_members;

-- Entferne auch problematische Funktionen
DROP FUNCTION IF EXISTS public.user_can_access_channel(uuid);
DROP FUNCTION IF EXISTS public.can_access_channel_member(uuid, uuid);

-- Erstelle eine einfache, nicht-rekursive Funktion
CREATE OR REPLACE FUNCTION public.can_access_channel_simple(p_channel_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prüfe ob der Channel öffentlich ist
  IF EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = p_channel_id 
    AND is_public = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Prüfe ob der User der Ersteller des Channels ist
  IF EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = p_channel_id 
    AND created_by = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Erstelle neue, einfache RLS Policies ohne Rekursion
CREATE POLICY "Users can view public channel members or own created channels"
ON public.channel_members
FOR SELECT
USING (can_access_channel_simple(channel_id));

CREATE POLICY "Users can join public channels or own channels"
ON public.channel_members
FOR INSERT
WITH CHECK (can_access_channel_simple(channel_id) AND user_id = auth.uid());

CREATE POLICY "Users can leave any channel they are member of"
ON public.channel_members
FOR DELETE
USING (user_id = auth.uid());

-- Erstelle einfache Policies für channels Tabelle
DROP POLICY IF EXISTS "Users can view channels" ON public.channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Users can update their own channels" ON public.channels;

CREATE POLICY "Users can view public channels or their own"
ON public.channels
FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create channels"
ON public.channels
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own channels"
ON public.channels
FOR UPDATE
USING (created_by = auth.uid());