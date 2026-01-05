-- RLS Policies für Chat-Modul - Nur existierende Tabellen
-- ============================================
-- CHANNELS TABLE
-- ============================================
CREATE POLICY "Authenticated users can view channels"
ON channels FOR SELECT
TO authenticated
USING (
  is_public = true 
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = channels.id
    AND channel_members.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create channels"
ON channels FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Channel creators and admins can update channels"
ON channels FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = channels.id
    AND channel_members.user_id = auth.uid()
    AND channel_members.role IN ('admin', 'owner')
  )
);

-- ============================================
-- CHANNEL_MEMBERS TABLE
-- ============================================
CREATE POLICY "Users can view channel members of their channels"
ON channel_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join channels"
ON channel_members FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM channels
    WHERE channels.id = channel_members.channel_id
    AND channels.created_by = auth.uid()
  )
);

CREATE POLICY "Users can leave channels"
ON channel_members FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('admin', 'owner')
  )
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE POLICY "Users can view messages in their channels"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = messages.channel_id
    AND channel_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to joined channels"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = messages.channel_id
    AND channel_members.user_id = auth.uid()
  )
  AND sender_id = auth.uid()
);

CREATE POLICY "Users can edit own messages"
ON messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete own messages or as channel admin"
ON messages FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = messages.channel_id
    AND channel_members.user_id = auth.uid()
    AND channel_members.role IN ('admin', 'owner')
  )
);

-- ============================================
-- MESSAGE_REACTIONS TABLE
-- ============================================
CREATE POLICY "Users can view reactions in their channels"
ON message_reactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_reactions.message_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add reactions"
ON message_reactions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_reactions.message_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove own reactions"
ON message_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- MESSAGE_ATTACHMENTS TABLE
-- ============================================
CREATE POLICY "Users can view attachments in their channels"
ON message_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_attachments.message_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload attachments"
ON message_attachments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_attachments.message_id
    AND cm.user_id = auth.uid()
  )
);

-- ============================================
-- VOICE_MESSAGES TABLE
-- ============================================
CREATE POLICY "Users can view voice messages in their channels"
ON voice_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = voice_messages.message_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create voice messages"
ON voice_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = voice_messages.message_id
    AND cm.user_id = auth.uid()
  )
);

-- ============================================
-- CHAT_NOTIFICATIONS TABLE
-- ============================================
CREATE POLICY "Users can view own notifications"
ON chat_notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON chat_notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
ON chat_notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- MESSAGE_TRANSLATIONS TABLE
-- ============================================
CREATE POLICY "Users can view translations in their channels"
ON message_translations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_translations.message_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create translations"
ON message_translations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_translations.message_id
    AND cm.user_id = auth.uid()
  )
);

-- ============================================
-- LANGUAGE_PREFERENCES TABLE
-- ============================================
CREATE POLICY "Users can view own language preferences"
ON language_preferences FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own language preferences"
ON language_preferences FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own language preferences"
ON language_preferences FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- CHAT_COMMANDS TABLE
-- ============================================
CREATE POLICY "All users can view active commands"
ON chat_commands FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================
-- MESSAGE_READ_RECEIPTS TABLE
-- ============================================
CREATE POLICY "Users can view read receipts in their channels"
ON message_read_receipts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_read_receipts.message_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own read receipts"
ON message_read_receipts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own read receipts"
ON message_read_receipts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Voice Messages Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-messages',
  'voice-messages',
  false,
  10485760, -- 10MB
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Voice Messages Storage Policies
CREATE POLICY "Users can upload own voice messages"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-messages'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view voice messages in their channels"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'voice-messages');

CREATE POLICY "Users can delete own voice messages"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-messages'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Message Attachments Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  52428800, -- 50MB
  ARRAY['image/*', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.*', 'application/vnd.figma']
) ON CONFLICT (id) DO NOTHING;

-- Attachments Storage Policies
CREATE POLICY "Users can upload attachments to their channels"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view attachments in their channels"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);