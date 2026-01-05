export interface ExtendedChannel {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'announcement' | 'system_feed';
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_private: boolean;
  company_id?: string;
  tags: string[];
  retention_policy_days: number;
  legal_hold: boolean;
  metadata: Record<string, any>;
  unread_count?: number;
  last_message?: string;
  last_activity?: string;
  member_count?: number;
  avatar_url?: string;
}

export interface ExtendedMessage {
  id: string;
  content?: string;
  sender_id: string;
  channel_id: string;
  message_type: 'text' | 'file' | 'voice' | 'system' | 'hr_card';
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_pinned: boolean;
  parent_message_id?: string;
  mentions: string[];
  channel_refs: string[];
  metadata: Record<string, any>;
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  voice_messages?: Array<{
    id: string;
    duration: number;
    file_path: string;
  }>;
  thread_count?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
  user?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  metadata: Record<string, any>;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  typing_in_channel?: string;
  custom_status?: string;
}

export interface HRWorkflowCard {
  type: 'absence_request' | 'expense_report' | 'shift_swap' | 'travel_request';
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  data: Record<string, any>;
  actions: Array<{
    label: string;
    action: string;
    variant: 'default' | 'destructive';
    permission_required?: string;
  }>;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at: string;
  notifications_enabled: boolean;
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
    presence?: UserPresence;
  };
}