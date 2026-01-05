import React, { useState, useRef, useEffect } from 'react';
import { Hash, Users, Pin, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExtendedChannel, ExtendedMessage } from '@/types/chat-extended';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';
import { cn } from '@/lib/utils';

interface ConversationViewProps {
  channel: ExtendedChannel | null;
  messages: ExtendedMessage[];
  onSendMessage: (content: string, type?: string, metadata?: Record<string, any>) => void;
  onReactToMessage: (messageId: string, reaction: string) => void;
}

const ConversationView = ({ 
  channel, 
  messages, 
  onSendMessage,
  onReactToMessage 
}: ConversationViewProps) => {
  const [showPinned, setShowPinned] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const getChannelIcon = (channel: ExtendedChannel) => {
    switch (channel.type) {
      case 'group':
        return <Users className="h-5 w-5" />;
      case 'announcement':
        return <Pin className="h-5 w-5" />;
      default:
        return <Hash className="h-5 w-5" />;
    }
  };

  const pinnedMessages = messages.filter(msg => msg.is_pinned);
  const displayMessages = showPinned ? pinnedMessages : messages;

  if (!channel) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Wählen Sie einen Kanal aus
          </h3>
          <p className="text-sm text-muted-foreground">
            Starten Sie eine Unterhaltung oder treten Sie einem Kanal bei
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          {getChannelIcon(channel)}
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              {channel.type !== 'direct' && '#'}{channel.name}
              {channel.is_private && (
                <span className="text-xs bg-muted px-2 py-1 rounded">Privat</span>
              )}
            </h2>
            {channel.description && (
              <p className="text-sm text-muted-foreground">
                {channel.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pinnedMessages.length > 0 && (
            <Button
              variant={showPinned ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPinned(!showPinned)}
            >
              <Pin className="h-4 w-4 mr-2" />
              {pinnedMessages.length}
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="p-4 space-y-4">
          {showPinned && (
            <div className="bg-muted/30 p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Pin className="h-4 w-4" />
                <span className="text-sm font-medium">Angepinnte Nachrichten</span>
              </div>
            </div>
          )}

          {displayMessages.length === 0 ? (
            <div className="text-center py-8">
              <Hash className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {showPinned ? 'Keine angepinnten Nachrichten' : 'Noch keine Nachrichten'}
              </p>
            </div>
          ) : (
            displayMessages.map((message, index) => {
              const showAvatar = index === 0 || 
                displayMessages[index - 1]?.sender_id !== message.sender_id ||
                (new Date(message.created_at).getTime() - 
                 new Date(displayMessages[index - 1]?.created_at || 0).getTime()) > 300000; // 5 minutes

              return (
                <MessageItem
                  key={message.id}
                  id={message.id}
                  sender={message.sender?.full_name || 'Unknown'}
                  timestamp={new Date(message.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  content={message.content || ''}
                  avatar={message.sender?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  showAvatar={showAvatar}
                />
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Composer */}
      {!showPinned && (
        <div className="border-t bg-card">
          <MessageComposer
            onSendMessage={onSendMessage}
            placeholder={`Nachricht an ${channel.type !== 'direct' ? '#' : ''}${channel.name}`}
          />
        </div>
      )}
    </div>
  );
};

export default ConversationView;