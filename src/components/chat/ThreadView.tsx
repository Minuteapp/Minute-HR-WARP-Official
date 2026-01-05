import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import MessageItem from './MessageItem';
import { ExtendedMessage } from '@/types/chat-extended';

interface ThreadViewProps {
  parentMessage: ExtendedMessage;
  threadMessages: ExtendedMessage[];
  onClose: () => void;
  onReply: (content: string) => void;
  onReact: (messageId: string, reaction: string) => void;
}

export default function ThreadView({
  parentMessage,
  threadMessages,
  onClose,
  onReply,
  onReact,
}: ThreadViewProps) {
  const [replyContent, setReplyContent] = useState('');

  const handleSendReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
    }
  };

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="font-semibold">Thread</h3>
          <p className="text-xs text-muted-foreground">
            {threadMessages.length} {threadMessages.length === 1 ? 'Antwort' : 'Antworten'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Parent Message */}
      <div className="border-b">
        <MessageItem
          id={parentMessage.id}
          sender={parentMessage.sender?.full_name || 'Unbekannt'}
          timestamp={new Date(parentMessage.created_at).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          content={parentMessage.content || ''}
          avatar={parentMessage.sender?.full_name?.slice(0, 2).toUpperCase() || 'UN'}
          senderId={parentMessage.sender_id}
          messageType={parentMessage.message_type}
          reactions={parentMessage.reactions}
          isEdited={parentMessage.is_edited}
          onReact={(reaction) => onReact(parentMessage.id, reaction)}
        />
      </div>

      {/* Thread Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {threadMessages.map((message) => (
            <MessageItem
              key={message.id}
              id={message.id}
              sender={message.sender?.full_name || 'Unbekannt'}
              timestamp={new Date(message.created_at).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              content={message.content || ''}
              avatar={message.sender?.full_name?.slice(0, 2).toUpperCase() || 'UN'}
              senderId={message.sender_id}
              messageType={message.message_type}
              reactions={message.reactions}
              isEdited={message.is_edited}
              onReact={(reaction) => onReact(message.id, reaction)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Antworten..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
            className="min-h-[60px] resize-none"
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button onClick={handleSendReply} disabled={!replyContent.trim()}>
            Antworten
          </Button>
        </div>
      </div>
    </div>
  );
}
