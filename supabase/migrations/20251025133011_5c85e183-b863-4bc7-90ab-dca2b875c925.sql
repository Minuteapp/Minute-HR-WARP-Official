-- ============================================================================
-- Fix Chat Module RLS Policies - Remove infinite recursion
-- ============================================================================

-- Step 1: Drop all existing policies on chat tables
-- ============================================================================

-- Drop all policies on channels
DROP POLICY IF EXISTS "Anyone can view public channels" ON channels;
DROP POLICY IF EXISTS "Members can view their channels" ON channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON channels;
DROP POLICY IF EXISTS "Channel creators can update their channels" ON channels;
DROP POLICY IF EXISTS "Users can view channels they are members of" ON channels;
DROP POLICY IF EXISTS "Authenticated users can view public channels" ON channels;
DROP POLICY IF EXISTS "Users can create channels" ON channels;
DROP POLICY IF EXISTS "Users can update their own channels" ON channels;

-- Drop all policies on channel_members (many duplicates)
DROP POLICY IF EXISTS "Users can view their own memberships" ON channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON channel_members;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON channel_members;
DROP POLICY IF EXISTS "Users can view channel members" ON channel_members;
DROP POLICY IF EXISTS "Users can view their memberships" ON channel_members;
DROP POLICY IF EXISTS "Users can add members to channels they own" ON channel_members;
DROP POLICY IF EXISTS "Users can remove themselves from channels" ON channel_members;
DROP POLICY IF EXISTS "Channel owners can manage members" ON channel_members;

-- Drop all policies on messages
DROP POLICY IF EXISTS "Members can view messages in their channels" ON messages;
DROP POLICY IF EXISTS "Members can send messages in their channels" ON messages;
DROP POLICY IF EXISTS "Users can edit their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in channels they are members of" ON messages;
DROP POLICY IF EXISTS "Users can send messages to channels they are members of" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Drop all policies on chat_commands
DROP POLICY IF EXISTS "Users can view active commands" ON chat_commands;
DROP POLICY IF EXISTS "Admins can manage commands" ON chat_commands;
DROP POLICY IF EXISTS "Anyone can view active commands" ON chat_commands;
DROP POLICY IF EXISTS "Admins can insert commands" ON chat_commands;
DROP POLICY IF EXISTS "Admins can update commands" ON chat_commands;
DROP POLICY IF EXISTS "Admins can delete commands" ON chat_commands;

-- Drop all policies on chat_interactive_cards
DROP POLICY IF EXISTS "Users can view cards in their channels" ON chat_interactive_cards;
DROP POLICY IF EXISTS "System can create cards" ON chat_interactive_cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON chat_interactive_cards;
DROP POLICY IF EXISTS "Users can view interactive cards" ON chat_interactive_cards;
DROP POLICY IF EXISTS "System can insert cards" ON chat_interactive_cards;
DROP POLICY IF EXISTS "Users can update cards" ON chat_interactive_cards;

-- Step 2: Create new, clean, non-recursive policies
-- ============================================================================

-- Policies for CHANNELS table
-- ============================================================================

-- Everyone can view public channels
CREATE POLICY "channels_select_public" ON channels
  FOR SELECT USING (is_public = true);

-- Members can view their private channels
CREATE POLICY "channels_select_member" ON channels
  FOR SELECT USING (
    id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can create channels
CREATE POLICY "channels_insert_authenticated" ON channels
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Channel creators can update their channels
CREATE POLICY "channels_update_creator" ON channels
  FOR UPDATE USING (auth.uid() = created_by);

-- Channel creators can delete their channels
CREATE POLICY "channels_delete_creator" ON channels
  FOR DELETE USING (auth.uid() = created_by);

-- Policies for CHANNEL_MEMBERS table
-- ============================================================================

-- Users can view their own memberships
CREATE POLICY "channel_members_select_own" ON channel_members
  FOR SELECT USING (auth.uid() = user_id);

-- Users can join channels (create their own membership)
CREATE POLICY "channel_members_insert_own" ON channel_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave channels (delete their own membership)
CREATE POLICY "channel_members_delete_own" ON channel_members
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all memberships
CREATE POLICY "channel_members_admin_all" ON channel_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Policies for MESSAGES table
-- ============================================================================

-- Members can view messages in their channels
CREATE POLICY "messages_select_member" ON messages
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- Members can send messages in their channels
CREATE POLICY "messages_insert_member" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can edit their own messages
CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "messages_delete_own" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Policies for CHAT_COMMANDS table
-- ============================================================================

-- All authenticated users can view active commands
CREATE POLICY "chat_commands_select_active" ON chat_commands
  FOR SELECT USING (is_active = true);

-- Only admins can manage commands
CREATE POLICY "chat_commands_admin_manage" ON chat_commands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Policies for CHAT_INTERACTIVE_CARDS table
-- ============================================================================

-- Users can view cards in their channels
CREATE POLICY "chat_cards_select_member" ON chat_interactive_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN channel_members cm ON cm.channel_id = m.channel_id
      WHERE m.id = message_id 
      AND cm.user_id = auth.uid()
    )
  );

-- System/authenticated users can create cards
CREATE POLICY "chat_cards_insert_authenticated" ON chat_interactive_cards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update cards in messages they sent
CREATE POLICY "chat_cards_update_sender" ON chat_interactive_cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE id = message_id 
      AND sender_id = auth.uid()
    )
  );

-- ============================================================================
-- Migration complete
-- All chat tables now have clean, non-recursive RLS policies
-- ============================================================================