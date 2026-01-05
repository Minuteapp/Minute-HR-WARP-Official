-- Behebe rekursive Policy bei channel_members (vereinfacht)

-- Alte Policy löschen
DROP POLICY IF EXISTS "channel_members_select" ON channel_members;

-- Einfache Policy: User sieht seine eigenen Mitgliedschaften
CREATE POLICY "channel_members_view_own"
ON channel_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Zusätzliche Policy: User sieht Mitglieder in Channels, wo sie selbst Mitglied sind
CREATE POLICY "channel_members_view_peers"
ON channel_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
  )
);