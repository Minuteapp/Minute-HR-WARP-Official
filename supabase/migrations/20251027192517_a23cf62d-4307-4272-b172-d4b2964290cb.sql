-- Phase 2: RLS-Policies bereinigen

-- 1. Channels: Alte Policies löschen
DROP POLICY IF EXISTS "ch_select" ON channels;
DROP POLICY IF EXISTS "ch_insert" ON channels;
DROP POLICY IF EXISTS "ch_update" ON channels;
DROP POLICY IF EXISTS "ch_delete" ON channels;

-- Neue Policy für Mitglieder hinzufügen
CREATE POLICY "channels_member_select"
ON channels FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = channels.id
    AND channel_members.user_id = auth.uid()
  )
);

-- 2. Channel_members: Alte Policies löschen
DROP POLICY IF EXISTS "cm_select" ON channel_members;
DROP POLICY IF EXISTS "cm_insert" ON channel_members;
DROP POLICY IF EXISTS "cm_update" ON channel_members;
DROP POLICY IF EXISTS "cm_delete" ON channel_members;

-- Neue, einfachere Policies für channel_members
CREATE POLICY "channel_members_select"
ON channel_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  channel_id IN (
    SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "channel_members_insert"
ON channel_members FOR INSERT
TO authenticated
WITH CHECK (
  -- Creator kann Mitglieder hinzufügen
  EXISTS (
    SELECT 1 FROM channels
    WHERE channels.id = channel_members.channel_id
    AND channels.created_by = auth.uid()
  ) OR
  -- Admins können Mitglieder hinzufügen
  EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('admin', 'owner')
  )
);

CREATE POLICY "channel_members_delete"
ON channel_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('admin', 'owner')
  )
);

-- 3. Messages: Policies vereinfachen
DROP POLICY IF EXISTS "msg_select" ON messages;
DROP POLICY IF EXISTS "msg_insert" ON messages;
DROP POLICY IF EXISTS "msg_update" ON messages;
DROP POLICY IF EXISTS "msg_delete" ON messages;

CREATE POLICY "messages_select"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = messages.channel_id
    AND channel_members.user_id = auth.uid()
  )
);

CREATE POLICY "messages_insert"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = messages.channel_id
    AND channel_members.user_id = auth.uid()
  )
);

CREATE POLICY "messages_update"
ON messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

CREATE POLICY "messages_delete"
ON messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- 4. Message_attachments: Policies vereinfachen
DROP POLICY IF EXISTS "att_select" ON message_attachments;
DROP POLICY IF EXISTS "att_insert" ON message_attachments;
DROP POLICY IF EXISTS "att_delete" ON message_attachments;

CREATE POLICY "message_attachments_select"
ON message_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages
    JOIN channel_members ON channel_members.channel_id = messages.channel_id
    WHERE messages.id = message_attachments.message_id
    AND channel_members.user_id = auth.uid()
  )
);

CREATE POLICY "message_attachments_insert"
ON message_attachments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages
    JOIN channel_members ON channel_members.channel_id = messages.channel_id
    WHERE messages.id = message_attachments.message_id
    AND channel_members.user_id = auth.uid()
  )
);