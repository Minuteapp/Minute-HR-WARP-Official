import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import ChatSidebar, { ChatItem } from "./chat/ChatSidebar";
import ChatConversation from "./chat/ChatConversation";
import ChatDetailsPanel from "./chat/ChatDetailsPanel";
import { NewChannelDialog } from "./chat/NewChannelDialog";
import { useChat } from "@/hooks/useChat";

export function Chat() {
  const [activeTab, setActiveTab] = useState<"chats" | "channels" | "dms" | "mentions" | "archive">("chats");
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isNewChannelDialogOpen, setIsNewChannelDialogOpen] = useState(false);
  
  const { 
    channels, 
    activeChannel, 
    messages, 
    loading, 
    sendMessage, 
    sendVoiceMessage, 
    sendMessageWithAttachment,
    editMessage,
    deleteMessage,
    replyToMessage,
    loadThreadMessages,
    selectChannel, 
    createChannel, 
    reactToMessage, 
    handleSlashCommand, 
    submitCard,
    sendTypingIndicator,
    subscribeToTyping
  } = useChat();

  // Konvertiere Channels zu ChatItems für die Sidebar
  const chatItems: ChatItem[] = channels.map(channel => ({
    id: channel.id,
    name: channel.name,
    type: channel.type as any,
    lastMessage: channel.last_message || "",
    timestamp: channel.last_activity || "",
    unreadCount: channel.unread_count,
    avatarUrl: channel.avatar_url,
  }));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <MessageSquare className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Chats werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <NewChannelDialog 
        open={isNewChannelDialogOpen}
        onOpenChange={setIsNewChannelDialogOpen}
        onCreateChannel={createChannel}
        showTrigger={false}
      />
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatSidebar
          chats={chatItems}
          activeTab={activeTab}
          selectedChat={selectedChat}
          onTabChange={setActiveTab}
          onSelectChat={(chat) => {
            setSelectedChat(chat);
            const channel = channels.find(c => c.id === chat.id);
            if (channel) {
              selectChannel(channel);
            }
            setShowDetails(false);
          }}
          onNewChat={() => setIsNewChannelDialogOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {selectedChat && activeChannel ? (
          <>
            <div className="flex-1">
              <ChatConversation
                chat={selectedChat}
                messages={messages}
                onSendMessage={sendMessage}
                onSendVoiceMessage={sendVoiceMessage}
                onSendMessageWithAttachment={sendMessageWithAttachment}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
                onReplyToMessage={replyToMessage}
                onLoadThreadMessages={loadThreadMessages}
                onDetailsClick={() => setShowDetails(!showDetails)}
                onSlashCommand={(cmd) => handleSlashCommand(cmd, activeChannel?.id || '')}
                onCardSubmit={submitCard}
                onReact={reactToMessage}
                onSendTypingIndicator={sendTypingIndicator}
                onSubscribeToTyping={subscribeToTyping}
                memberCount={activeChannel?.member_count || 0}
              />
            </div>

            {showDetails && (
              <div className="w-96 flex-shrink-0">
                <ChatDetailsPanel
                  channelName={selectedChat.name}
                  memberCount={activeChannel.member_count || 0}
                  members={[]}
                  channelId={activeChannel.id}
                  onClose={() => setShowDetails(false)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-card">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-muted-foreground mb-2">Keine Konversation ausgewählt</h3>
              <p className="text-muted-foreground text-sm">
                Wähle einen Chat oder Kanal aus der Liste
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
