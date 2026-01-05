
import { Json } from '@/integrations/supabase/types';

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_public: boolean | null;
  metadata: Json | null;
}

export interface Message {
  id: string;
  content: string | null;
  sender_id: string;
  channel_id: string;
  message_type: string;
  created_at: string | null;
  updated_at: string | null;
  is_edited: boolean;
  metadata: Json | null;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    full_name?: string | null;
    avatar_url?: string | null;
    username?: string | null;
    id?: string | null;
  } | null;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface MessageTranslation {
  id: string;
  message_id: string;
  language: string;
  translated_content: string;
  created_at: string;
}

export interface ChatNotification {
  id: string;
  user_id: string;
  channel_id: string;
  message_id?: string;
  type: 'message' | 'mention' | 'reaction' | 'system';
  read: boolean;
  created_at: string;
}

export interface VoiceMessage {
  id: string;
  message_id: string;
  duration: number;
  file_path: string;
  created_at: string;
}

export interface LanguagePreference {
  id: string;
  user_id: string;
  language: string;
  auto_translate: boolean;
}
