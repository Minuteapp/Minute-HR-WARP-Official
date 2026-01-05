-- Prüfe und entferne alle verbleibenden Policies für channel_members
DROP POLICY IF EXISTS "Users can view public channel members or own created channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join public channels or own channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave any channel they are member of" ON public.channel_members;

-- Prüfe auch channels Policies
DROP POLICY IF EXISTS "Users can view public channels or their own" ON public.channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Users can update their own channels" ON public.channels;

-- Entferne auch can_access_channel_simple Funktion falls sie problematisch ist
DROP FUNCTION IF EXISTS public.can_access_channel_simple(uuid);

-- Erstelle sehr einfache, direkte Policies ohne Funktionen
CREATE POLICY "Simple channel select policy"
ON public.channels
FOR SELECT
USING (true); -- Temporär alle Channels sichtbar machen

CREATE POLICY "Simple channel insert policy"
ON public.channels
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Simple channel update policy"
ON public.channels
FOR UPDATE
USING (created_by = auth.uid());

-- Sehr einfache channel_members Policies
CREATE POLICY "Simple channel members select policy"
ON public.channel_members
FOR SELECT
USING (true); -- Temporär alle Members sichtbar machen

CREATE POLICY "Simple channel members insert policy"
ON public.channel_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Simple channel members delete policy"
ON public.channel_members
FOR DELETE
USING (user_id = auth.uid());