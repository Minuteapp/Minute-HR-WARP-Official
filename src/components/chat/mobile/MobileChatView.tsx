import { useState, useEffect } from "react";
import MobileChatHeader from "./MobileChatHeader";
import MobileChatTabs from "./MobileChatTabs";
import MobileChatList from "./MobileChatList";
import MobileChatBottomNav from "./MobileChatBottomNav";
import NewChatDialog from "./NewChatDialog";
import MobileConversationView from "./MobileConversationView";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";

export default function MobileChatView() {
  const [filter, setFilter] = useState<"all" | "unread" | "pinned">("all");
  const [activeTab, setActiveTab] = useState("chats");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "conversation">("list");
  const [selectedChannel, setSelectedChannel] = useState<{
    id: string;
    name: string;
    type: "team" | "hr" | "shift" | "dm" | "channel" | "private" | "project";
    memberCount: number;
  } | null>(null);
  const { toast } = useToast();
  const { channels, selectChannel, loading } = useChat();

  const handleChatClick = (chatId: string) => {
    const channel = channels.find(c => c.id === chatId);
    if (channel) {
      selectChannel(channel);
      setSelectedChannel({
        id: channel.id,
        name: channel.name,
        type: channel.type as any,
        memberCount: channel.member_count || 0,
      });
      setCurrentView("conversation");
    }
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedChannel(null);
  };

  const handleAnrufe = () => {
    toast({ title: "Anrufe", description: "Anrufe-Funktion in Entwicklung" });
  };

  const handleDateien = () => {
    toast({ title: "Dateien", description: "Dateien-Funktion in Entwicklung" });
  };

  const handleArchiv = () => {
    toast({ title: "Archiv", description: "Archiv-Funktion in Entwicklung" });
  };

  if (currentView === "conversation" && selectedChannel) {
    return (
      <MobileConversationView
        channelId={selectedChannel.id}
        channelName={selectedChannel.name}
        channelType={selectedChannel.type}
        memberCount={selectedChannel.memberCount}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background fixed inset-0 z-50 overflow-hidden">
      <MobileChatHeader
        onNewChat={() => setIsNewChatOpen(true)}
        filter={filter}
        onFilterChange={setFilter}
      />

      <MobileChatTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-hidden">
        <MobileChatList
          filter={filter}
          activeTab={activeTab}
          onChatClick={handleChatClick}
          channels={channels}
          loading={loading}
        />
      </div>

      <MobileChatBottomNav
        onAnrufe={handleAnrufe}
        onDateien={handleDateien}
        onArchiv={handleArchiv}
      />

      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
      />
    </div>
  );
}
