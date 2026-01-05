-- Behebe infinite recursion in channel_members RLS policies (komplett)
-- ALLE existierenden Policies auf channel_members löschen
DROP POLICY IF EXISTS "channel_members_view_own" ON channel_members;
DROP POLICY IF EXISTS "channel_members_view_peers" ON channel_members;
DROP POLICY IF EXISTS "channel_members_view_in_own_channels" ON channel_members;
DROP POLICY IF EXISTS "channel_members_view_public" ON channel_members;
DROP POLICY IF EXISTS "channel_members_insert" ON channel_members;
DROP POLICY IF EXISTS "channel_members_insert_safe" ON channel_members;
DROP POLICY IF EXISTS "channel_members_delete" ON channel_members;
DROP POLICY IF EXISTS "channel_members_delete_safe" ON channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON channel_members;
DROP POLICY IF EXISTS "Users can view channel members" ON channel_members;
DROP POLICY IF EXISTS "channel_members_select" ON channel_members;

-- Neue SELECT-Policies (nicht-rekursiv mit is_channel_member_safe)
CREATE POLICY "channel_members_view_own"
ON channel_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "channel_members_view_in_own_channels"
ON channel_members FOR SELECT
TO authenticated
USING (is_channel_member_safe(channel_id, auth.uid()));

CREATE POLICY "channel_members_view_public"
ON channel_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM channels
    WHERE channels.id = channel_members.channel_id
    AND channels.is_public = true
  )
);

-- Neue INSERT-Policy (nicht-rekursiv)
CREATE POLICY "channel_members_insert_safe"
ON channel_members FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM channels
    WHERE channels.id = channel_members.channel_id
    AND channels.created_by = auth.uid()
  ) OR
  is_channel_member_safe(channel_members.channel_id, auth.uid())
);

-- Neue DELETE-Policy (nicht-rekursiv)
CREATE POLICY "channel_members_delete_safe"
ON channel_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM channels
    WHERE channels.id = channel_members.channel_id
    AND channels.created_by = auth.uid()
  )
);