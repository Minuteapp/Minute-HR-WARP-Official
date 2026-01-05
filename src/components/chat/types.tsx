export type Channel = {
  id: string;
  name: string;
  type: "public" | "private" | "dm" | "project" | "shift" | "hr-confidential";
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  participants?: string[];
  isOnline?: boolean;
  status?: string;
  isPinned?: boolean;
  description?: string;
};

export type Message = {
  id: string;
  sender: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "action-card" | "system" | "audio" | "video";
  reactions?: { emoji: string; count: number; users: string[] }[];
  thread?: Message[];
  attachments?: { name: string; type: string; size: string; url?: string; duration?: number }[];
  actionCard?: {
    type: string;
    title: string;
    fields: { label: string; value: string }[];
    actions: { label: string; variant: "approve" | "reject" | "primary" }[];
  };
  isEdited?: boolean;
};
