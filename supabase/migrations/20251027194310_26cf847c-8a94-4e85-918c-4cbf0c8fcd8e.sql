-- Behebe zirkuläre Abhängigkeiten in channels RLS policies
-- Drop problematische Policies die direkt auf channel_members zugreifen
DROP POLICY IF EXISTS "channels_member_select" ON channels;
DROP POLICY IF EXISTS "Channel creators and admins can update channels" ON channels;

-- Neue SELECT Policy für Channel-Mitglieder (nicht-rekursiv mit is_channel_member_safe)
CREATE POLICY "channels_member_select"
ON channels FOR SELECT
TO authenticated
USING (is_channel_member_safe(id, auth.uid()));

-- Neue UPDATE Policy für Creators und Channel-Mitglieder (nicht-rekursiv)
CREATE POLICY "Channel creators and admins can update channels"
ON channels FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR
  is_channel_member_safe(id, auth.uid())
);