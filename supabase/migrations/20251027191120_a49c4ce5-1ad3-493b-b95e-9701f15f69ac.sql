-- Entferne alle potentiell rekursiven Policies auf channels
DROP POLICY IF EXISTS "Users can view channels they are members of" ON channels;
DROP POLICY IF EXISTS "Users can view their channels" ON channels;
DROP POLICY IF EXISTS "Users can view public channels" ON channels;

-- Erstelle neue, nicht-rekursive Policies für channels
CREATE POLICY "Users can view public channels"
ON channels FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "Users can view their own created channels"
ON channels FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can view channels where they are members"
ON channels FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = channels.id
    AND channel_members.user_id = auth.uid()
  )
);

-- Policy für INSERT
CREATE POLICY "Users can create channels"
ON channels FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Policy für UPDATE
CREATE POLICY "Users can update their own channels"
ON channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Policy für DELETE
CREATE POLICY "Users can delete their own channels"
ON channels FOR DELETE
TO authenticated
USING (created_by = auth.uid());