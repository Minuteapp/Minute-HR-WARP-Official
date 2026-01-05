-- Schritt 1: Droppe existierende Function
DROP FUNCTION IF EXISTS public.is_channel_member_safe(uuid, uuid);

-- Schritt 2: Erstelle neue Function mit korrekten Namen
CREATE OR REPLACE FUNCTION public.is_channel_member_safe(p_channel_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = p_channel_id
    AND user_id = p_user_id
  );
$$;

-- Schritt 3: Entferne rekursive Policy
DROP POLICY IF EXISTS "Users can view channel members of their channels" ON channel_members;

-- Schritt 4: Erstelle neue, nicht-rekursive Policy
CREATE POLICY "Users can view channel members"
ON channel_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM channels
    WHERE channels.id = channel_members.channel_id
    AND channels.is_public = true
  )
);