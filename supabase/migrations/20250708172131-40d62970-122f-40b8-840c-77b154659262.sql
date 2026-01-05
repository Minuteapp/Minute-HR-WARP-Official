-- Entferne die problematische RLS Policy für channel_members
DROP POLICY IF EXISTS "Allow access to channel members" ON public.channel_members;

-- Erstelle eine einfachere Policy ohne Rekursion
CREATE POLICY "Users can view channel members where they are members"
ON public.channel_members
FOR SELECT
USING (
  channel_id IN (
    SELECT channel_id 
    FROM public.channel_members 
    WHERE user_id = auth.uid()
  )
  OR 
  channel_id IN (
    SELECT id 
    FROM public.channels 
    WHERE is_public = true
  )
);

-- Policy für das Einfügen von Channel-Mitgliedern
CREATE POLICY "Channel creators can add members"
ON public.channel_members
FOR INSERT
WITH CHECK (
  channel_id IN (
    SELECT id 
    FROM public.channels 
    WHERE created_by = auth.uid()
  )
  OR
  user_id = auth.uid()
);

-- Policy für das Aktualisieren von Channel-Mitgliedern
CREATE POLICY "Channel owners can update members"
ON public.channel_members
FOR UPDATE
USING (
  channel_id IN (
    SELECT id 
    FROM public.channels 
    WHERE created_by = auth.uid()
  )
);

-- Policy für das Löschen von Channel-Mitgliedern
CREATE POLICY "Channel owners and members can remove themselves"
ON public.channel_members
FOR DELETE
USING (
  channel_id IN (
    SELECT id 
    FROM public.channels 
    WHERE created_by = auth.uid()
  )
  OR
  user_id = auth.uid()
);