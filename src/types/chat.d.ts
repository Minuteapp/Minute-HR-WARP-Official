
export interface Message {
  id: string;
  content?: string;
  sender_id: string;
  channel_id: string;
  message_type: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  metadata: Record<string, any> | null;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  metadata: Record<string, any> | null;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    username: string;
    id: string;
  };
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
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

export interface VoiceMessage {
  id: string;
  message_id: string;
  duration: number;
  file_path: string;
  created_at: string;
}
