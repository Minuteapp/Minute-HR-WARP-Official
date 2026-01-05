import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import MobileChatListItem from "./MobileChatListItem";
import { ExtendedChannel } from "@/types/chat-extended";

interface MobileChatListProps {
  filter: "all" | "unread" | "pinned";
  activeTab: string;
  onChatClick: (chatId: string) => void;
  channels: ExtendedChannel[];
  loading: boolean;
}

export default function MobileChatList({
  filter,
  activeTab,
  onChatClick,
  channels,
  loading,
}: MobileChatListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = channels.filter((channel) => {
    const matchesSearch = channel.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && channel.unread_count && channel.unread_count > 0);
    const matchesTab =
      activeTab === "chats" ||
      (activeTab === "channels" && (channel.type === 'group' || channel.type === 'announcement')) ||
      (activeTab === "dms" && channel.type === 'direct');
    return matchesSearch && matchesFilter && matchesTab;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Keine Chats gefunden
          </div>
        ) : (
          filteredChats.map((channel) => (
            <MobileChatListItem
              key={channel.id}
              id={channel.id}
              name={channel.name}
              type={channel.type as any}
              lastMessage={channel.last_message || ''}
              timestamp={channel.last_activity ? new Date(channel.last_activity).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}
              unreadCount={channel.unread_count}
              onClick={() => onChatClick(channel.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
