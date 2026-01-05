-- Chat System Migration

-- Channels table
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'announcement', 'system_feed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT false,
  company_id UUID,
  tags TEXT[] DEFAULT '{}',
  retention_policy_days INTEGER DEFAULT 730,
  legal_hold BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'voice', 'system', 'hr_card')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE, -- for threads
  mentions UUID[] DEFAULT '{}',
  channel_refs TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Channel Members
CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Message Attachments
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Voice Messages
CREATE TABLE IF NOT EXISTS public.voice_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- in seconds
  file_path TEXT NOT NULL,
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Presence
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  typing_in_channel UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  custom_status TEXT,
  UNIQUE(user_id)
);

-- Chat Notifications
CREATE TABLE IF NOT EXISTS public.chat_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'mention', 'reaction', 'system')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Bookmarks
CREATE TABLE IF NOT EXISTS public.message_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- Channel Pins
CREATE TABLE IF NOT EXISTS public.channel_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, message_id)
);

-- Chat Audit Log
CREATE TABLE IF NOT EXISTS public.chat_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Channels
CREATE POLICY "Users can view public channels" ON public.channels
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view channels they are members of" ON public.channels
  FOR SELECT USING (
    id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all channels" ON public.channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin', 'hr')
    )
  );

-- RLS Policies for Messages
CREATE POLICY "Users can view messages in accessible channels" ON public.messages
  FOR SELECT USING (
    channel_id IN (
      SELECT c.id FROM public.channels c
      LEFT JOIN public.channel_members cm ON c.id = cm.channel_id
      WHERE c.is_public = true OR cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in accessible channels" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    channel_id IN (
      SELECT c.id FROM public.channels c
      LEFT JOIN public.channel_members cm ON c.id = cm.channel_id
      WHERE c.is_public = true OR cm.user_id = auth.uid()
    )
  );

-- RLS Policies for Channel Members
CREATE POLICY "Users can view channel memberships" ON public.channel_members
  FOR SELECT USING (
    channel_id IN (
      SELECT c.id FROM public.channels c
      LEFT JOIN public.channel_members cm ON c.id = cm.channel_id
      WHERE c.is_public = true OR cm.user_id = auth.uid()
    )
  );

-- RLS Policies for other tables
CREATE POLICY "Users can manage their own reactions" ON public.message_reactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view reactions on accessible messages" ON public.message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      JOIN public.channels c ON m.channel_id = c.id
      LEFT JOIN public.channel_members cm ON c.id = cm.channel_id
      WHERE c.is_public = true OR cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own presence" ON public.user_presence
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view others' presence" ON public.user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own notifications" ON public.chat_notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own bookmarks" ON public.message_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- Triggers
CREATE OR REPLACE FUNCTION update_channel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER channels_updated_at_trigger
  BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION update_channel_updated_at();

CREATE TRIGGER messages_updated_at_trigger
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_channel_updated_at();

-- Create indexes for performance
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_channel_members_user_id ON public.channel_members(user_id);
CREATE INDEX idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX idx_user_presence_user_id ON public.user_presence(user_id);

-- Seed data
INSERT INTO public.channels (id, name, description, type, is_public, metadata) VALUES
  ('c1', 'ankuendigungen', 'Allgemeine Ankündigungen', 'announcement', true, '{"readonly_for_members": true}'),
  ('c2', 'team-hr', 'HR Team Kommunikation', 'group', false, '{}'),
  ('c3', 'standort-muc-schicht-a', 'München Schicht A', 'group', true, '{"location": "muc", "shift": "a"}'),
  ('c4', 'recruiting-req-1234', 'Recruiting für Position 1234', 'group', false, '{"requisition_id": "1234"}')
ON CONFLICT (id) DO NOTHING;