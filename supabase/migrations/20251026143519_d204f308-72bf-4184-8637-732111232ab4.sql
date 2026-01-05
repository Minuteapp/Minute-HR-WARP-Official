-- Complete RLS restart for chat module - Extended cleanup
-- Remove ALL existing policies including new ones

-- ============================================
-- STEP 1: Drop ALL existing policies (extended list)
-- ============================================

-- Drop ALL channel_members policies
DROP POLICY IF EXISTS "channel_members_select" ON channel_members;
DROP POLICY IF EXISTS "channel_members_select_policy" ON channel_members;
DROP POLICY IF EXISTS "channel_members_select_own" ON channel_members;
DROP POLICY IF EXISTS "channel_members_insert" ON channel_members;
DROP POLICY IF EXISTS "channel_members_insert_policy" ON channel_members;
DROP POLICY IF EXISTS "channel_members_insert_own" ON channel_members;
DROP POLICY IF EXISTS "channel_members_update" ON channel_members;
DROP POLICY IF EXISTS "channel_members_update_policy" ON channel_members;
DROP POLICY IF EXISTS "channel_members_update_own" ON channel_members;
DROP POLICY IF EXISTS "channel_members_delete" ON channel_members;
DROP POLICY IF EXISTS "channel_members_delete_policy" ON channel_members;
DROP POLICY IF EXISTS "channel_members_delete_own" ON channel_members;
DROP POLICY IF EXISTS "channel_members_admin_all" ON channel_members;

-- Drop ALL channels policies
DROP POLICY IF EXISTS "channels_select" ON channels;
DROP POLICY IF EXISTS "channels_select_policy" ON channels;
DROP POLICY IF EXISTS "channels_select_public_or_own" ON channels;
DROP POLICY IF EXISTS "channels_insert" ON channels;
DROP POLICY IF EXISTS "channels_insert_policy" ON channels;
DROP POLICY IF EXISTS "channels_insert_own" ON channels;
DROP POLICY IF EXISTS "channels_update" ON channels;
DROP POLICY IF EXISTS "channels_update_policy" ON channels;
DROP POLICY IF EXISTS "channels_update_own" ON channels;
DROP POLICY IF EXISTS "channels_delete" ON channels;
DROP POLICY IF EXISTS "channels_delete_policy" ON channels;
DROP POLICY IF EXISTS "channels_delete_own" ON channels;
DROP POLICY IF EXISTS "channels_admin_all" ON channels;

-- Drop ALL messages policies
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_select_all" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;
DROP POLICY IF EXISTS "messages_delete" ON messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON messages;
DROP POLICY IF EXISTS "messages_delete_own" ON messages;
DROP POLICY IF EXISTS "messages_admin_all" ON messages;

-- Drop ALL chat_commands policies
DROP POLICY IF EXISTS "chat_commands_select" ON chat_commands;
DROP POLICY IF EXISTS "chat_commands_select_policy" ON chat_commands;
DROP POLICY IF EXISTS "chat_commands_select_all" ON chat_commands;
DROP POLICY IF EXISTS "chat_commands_admin_all" ON chat_commands;

-- Drop ALL chat_interactive_cards policies
DROP POLICY IF EXISTS "chat_interactive_cards_select" ON chat_interactive_cards;
DROP POLICY IF EXISTS "chat_interactive_cards_select_policy" ON chat_interactive_cards;
DROP POLICY IF EXISTS "chat_interactive_cards_select_all" ON chat_interactive_cards;
DROP POLICY IF EXISTS "chat_interactive_cards_admin_all" ON chat_interactive_cards;

-- ============================================
-- STEP 2: Drop problematic security definer functions
-- ============================================

DROP FUNCTION IF EXISTS public.is_channel_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_channel_public(uuid);

-- ============================================
-- STEP 3: Create clean, non-recursive policies
-- ============================================

-- ========== CHANNEL_MEMBERS POLICIES ==========

CREATE POLICY "channel_members_select_own"
ON channel_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "channel_members_insert_own"
ON channel_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_members_update_own"
ON channel_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_members_delete_own"
ON channel_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Admin policy for channel_members
CREATE POLICY "channel_members_admin_all"
ON channel_members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- ========== CHANNELS POLICIES ==========

CREATE POLICY "channels_select_public_or_own"
ON channels FOR SELECT
TO authenticated
USING (
  is_public = true 
  OR created_by = auth.uid()
);

CREATE POLICY "channels_insert_own"
ON channels FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_update_own"
ON channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_delete_own"
ON channels FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Admin policy for channels
CREATE POLICY "channels_admin_all"
ON channels FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- ========== MESSAGES POLICIES ==========

CREATE POLICY "messages_select_all"
ON messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "messages_insert_own"
ON messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_own"
ON messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_delete_own"
ON messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Admin policy for messages
CREATE POLICY "messages_admin_all"
ON messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- ========== CHAT_COMMANDS POLICIES ==========

CREATE POLICY "chat_commands_select_all"
ON chat_commands FOR SELECT
TO authenticated
USING (true);

-- Admin policy for chat_commands
CREATE POLICY "chat_commands_admin_all"
ON chat_commands FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- ========== CHAT_INTERACTIVE_CARDS POLICIES ==========

CREATE POLICY "chat_interactive_cards_select_all"
ON chat_interactive_cards FOR SELECT
TO authenticated
USING (true);

-- Admin policy for chat_interactive_cards
CREATE POLICY "chat_interactive_cards_admin_all"
ON chat_interactive_cards FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);