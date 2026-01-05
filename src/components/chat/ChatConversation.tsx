import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Search, Phone, Video, MoreVertical, Languages, Mic, X, Reply, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import { VoiceRecorder } from "./VoiceRecorder";
import ThreadView from "./ThreadView";
import TypingIndicator from "./TypingIndicator";
import LanguageSelector from "./LanguageSelector";
import { ExtendedMessage } from "@/types/chat-extended";
import { useReadReceipts } from "@/hooks/useReadReceipts";
import { useLanguagePreferences } from "@/hooks/useLanguagePreferences";
import { getSupportedLanguages } from "@/services/translationService";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ChatConversationProps {
  chat: {
    id: string;
    name: string;
    type: string;
  };
  messages: ExtendedMessage[];
  onSendMessage: (content: string) => void;
  onSendVoiceMessage?: (audioBlob: Blob, duration: number) => void;
  onSendMessageWithAttachment?: (content: string, file: File) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReplyToMessage?: (parentMessageId: string, content: string) => void;
  onLoadThreadMessages?: (parentMessageId: string) => Promise<ExtendedMessage[]>;
  onDetailsClick: () => void;
  onSlashCommand?: (command: string) => void;
  onCardSubmit?: (cardId: string, formData: Record<string, any>) => void;
  onReact?: (messageId: string, reaction: string) => void;
  onSendTypingIndicator?: () => void;
  onSubscribeToTyping?: (callback: (userId: string, isTyping: boolean) => void) => void;
  memberCount?: number;
}

export default function ChatConversation({
  chat,
  messages,
  onSendMessage,
  onSendVoiceMessage,
  onSendMessageWithAttachment,
  onEditMessage,
  onDeleteMessage,
  onReplyToMessage,
  onLoadThreadMessages,
  onDetailsClick,
  onSlashCommand,
  onCardSubmit,
  onReact,
  onSendTypingIndicator,
  onSubscribeToTyping,
  memberCount = 0,
}: ChatConversationProps) {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThread, setSelectedThread] = useState<ExtendedMessage | null>(null);
  const [threadMessages, setThreadMessages] = useState<ExtendedMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [typingUserNames, setTypingUserNames] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<ExtendedMessage | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { markMessageAsRead, receipts } = useReadReceipts(chat.id);
  const { preference } = useLanguagePreferences();
  
  // Debug: Log message count on each render
  console.log('[ChatConversation] Rendering with', messages.length, 'messages for channel:', chat.id);
  const { toast } = useToast();

  // Stabile handleMessageSend Funktion mit useCallback
  const handleMessageSend = useCallback((content: string) => {
    if (replyingTo && onReplyToMessage) {
      onReplyToMessage(replyingTo.id, content);
      setReplyingTo(null);
    } else {
      onSendMessage(content);
    }
  }, [replyingTo, onReplyToMessage, onSendMessage]);

  const filteredMessages = searchQuery
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // Helper: Create signed URL for private storage
  const getSignedUrl = async (bucket: string, filePath: string): Promise<string> => {
    console.log(`🎤 Creating signed URL for bucket: ${bucket}, path: ${filePath}`);
    
    if (!filePath) {
      console.error('🎤 No file path provided for signed URL');
      return '';
    }
    
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error(`🎤 Storage error for ${bucket}/${filePath}:`, error);
        throw error;
      }
      
      console.log(`🎤 Signed URL created successfully for ${bucket}/${filePath}`);
      return data.signedUrl;
    } catch (error) {
      console.error(`🎤 Failed to create signed URL for ${bucket}/${filePath}:`, error);
      return '';
    }
  };

  // Phase 3: Load signed URLs for all voice messages and attachments (parallel)
  useEffect(() => {
    const loadUrls = async () => {
      console.log('🎤 Loading signed URLs for', messages.length, 'messages');
      
      const messagesWithMedia = messages.filter(
        m => m.voice_messages?.[0] || m.attachments?.[0]
      );
      
      if (messagesWithMedia.length === 0) {
        console.log('🎤 No messages with media found');
        return;
      }
      
      const urlPromises = messagesWithMedia.map(async (message) => {
        const result: [string, string][] = [];
        
        if (message.voice_messages?.[0]) {
          console.log('🎤 Voice message found:', message.voice_messages[0].file_path);
          const url = await getSignedUrl('voice-messages', message.voice_messages[0].file_path);
          if (url) result.push([`voice-${message.id}`, url]);
        }
        
        if (message.attachments?.[0]) {
          console.log('🎤 Attachment found:', message.attachments[0].file_path);
          const url = await getSignedUrl('message-attachments', message.attachments[0].file_path);
          if (url) result.push([`attach-${message.id}`, url]);
        }
        
        return result;
      });
      
      const allResults = await Promise.all(urlPromises);
      const urls = Object.fromEntries(allResults.flat());
      console.log('🎤 Loaded signed URLs:', Object.keys(urls));
      setSignedUrls(urls);
    };
    
    if (messages.length > 0) {
      loadUrls();
    }
  }, [messages]);

  // Phase 4: Subscribe to typing indicators and load user names
  useEffect(() => {
    if (!onSubscribeToTyping) return;

    onSubscribeToTyping((userId: string, isTyping: boolean) => {
      setTypingUsers(prev => {
        if (isTyping && !prev.includes(userId)) {
          // Load user name if not already loaded
          if (!typingUserNames[userId]) {
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', userId)
              .single()
              .then(({ data }) => {
                setTypingUserNames(prevNames => ({
                  ...prevNames,
                  [userId]: data?.full_name || 'Jemand'
                }));
              });
          }
          return [...prev, userId];
        } else if (!isTyping) {
          return prev.filter(id => id !== userId);
        }
        return prev;
      });
    });
  }, [onSubscribeToTyping, typingUserNames]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-mark messages as read using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              markMessageAsRead(messageId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      messageElements.forEach((el) => observer.unobserve(el));
    };
  }, [messages, markMessageAsRead]);

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    if (onSendVoiceMessage) {
      await onSendVoiceMessage(audioBlob, duration);
      setShowVoiceRecorder(false);
    }
  };

  const handleViewThread = async (message: ExtendedMessage) => {
    if (onLoadThreadMessages) {
      const threads = await onLoadThreadMessages(message.id);
      setThreadMessages(threads);
      setSelectedThread(message);
    }
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    setThreadMessages([]);
  };

  const handleReplyInThread = async (content: string) => {
    if (selectedThread && onReplyToMessage) {
      await onReplyToMessage(selectedThread.id, content);
      // Reload thread messages
      if (onLoadThreadMessages) {
        const threads = await onLoadThreadMessages(selectedThread.id);
        setThreadMessages(threads);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{chat.name}</h2>
          <p className="text-sm text-muted-foreground">{memberCount} Mitglieder</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toast({ title: "Anruf", description: "Funktion in Entwicklung" })}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toast({ title: "Videoanruf", description: "Funktion in Entwicklung" })}
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSearch(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
          
          {/* Language Selection Dialog */}
          <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Languages className="w-5 h-5" />
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded px-1">
                  {targetLanguage.toUpperCase()}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Übersetzungssprache wählen</DialogTitle>
              </DialogHeader>
              <LanguageSelector
                currentLanguage={targetLanguage}
                languages={getSupportedLanguages()}
                onSelect={(lang) => {
                  setTargetLanguage(lang);
                  setLanguageDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
          
          {preference?.auto_translate && (
            <Badge variant="secondary" className="gap-1">
              <Languages className="w-3 h-3" />
              Auto
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={onDetailsClick}>
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {filteredMessages.length === 0 ? (
          // Empty state for new chats
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Willkommen in {chat.name}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Dies ist der Beginn Ihrer Unterhaltung. Senden Sie eine Nachricht, um loszulegen!
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const messageReceipts = receipts[message.id] || [];
            const prevMessage = index > 0 ? filteredMessages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;

            // Phase 3: Get voice message with signed URL from state
            const voiceMessage = message.message_type === 'voice' && message.voice_messages?.[0]
              ? {
                  fileUrl: signedUrls[`voice-${message.id}`] || '',
                  duration: message.voice_messages[0].duration
                }
              : undefined;

            // Phase 3: Get attachment with signed URL from state
            const attachment = message.attachments?.[0]
              ? {
                  name: message.attachments[0].file_name,
                  size: `${(message.attachments[0].file_size / 1024 / 1024).toFixed(2)} MB`,
                  url: signedUrls[`attach-${message.id}`] || ''
                }
              : undefined;

            return (
              <div key={message.id} data-message-id={message.id}>
                <MessageItem
                  id={message.id}
                  sender={message.sender?.full_name || 'Unbekannt'}
                  timestamp={new Date(message.created_at || '').toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  content={message.content || ''}
                  avatar={message.sender?.full_name?.slice(0, 2).toUpperCase() || 'UN'}
                  avatarUrl={message.sender?.avatar_url || ''}
                  senderId={message.sender_id}
                  messageType={message.message_type}
                  voiceMessage={voiceMessage}
                  attachment={attachment}
                  showAvatar={showAvatar}
                  reactions={message.reactions}
                  readReceipts={messageReceipts}
                  targetLanguage={targetLanguage}
                  isEdited={message.is_edited}
                  threadCount={message.thread_count}
                  onReact={(reaction) => onReact?.(message.id, reaction)}
                  onMarkAsRead={() => markMessageAsRead(message.id)}
                  onEdit={(newContent) => onEditMessage?.(message.id, newContent)}
                  onDelete={() => onDeleteMessage?.(message.id)}
                  onReply={() => setReplyingTo(message)}
                  onViewThread={() => handleViewThread(message)}
                />
              </div>
            );
          })
        )}
        {/* Phase 4: Show typing indicator with user names */}
        <TypingIndicator 
          typingUsers={typingUsers.map(id => typingUserNames[id] || 'Jemand')} 
        />
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nachrichten durchsuchen</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Suchbegriff eingeben..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {searchQuery && `${filteredMessages.length} Ergebnis(se) gefunden`}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Input */}
      <div className="p-4 border-t">
        {/* Phase 5: Reply Banner */}
        {replyingTo && (
          <div className="mb-2 px-3 py-2 bg-muted border-l-4 border-primary flex items-center justify-between rounded">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Reply className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">Antwort an {replyingTo.sender?.full_name || 'Unbekannt'}</span>
                <p className="text-xs text-muted-foreground truncate">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 shrink-0" 
              onClick={() => setReplyingTo(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {showVoiceRecorder ? (
          <VoiceRecorder
            onSend={handleVoiceSend}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        ) : (
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVoiceRecorder(true)}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <MessageInput 
                onSend={handleMessageSend}
                onSlashCommand={onSlashCommand}
                onCardSubmit={onCardSubmit}
                onSendWithAttachment={onSendMessageWithAttachment}
                onTyping={onSendTypingIndicator}
              />
            </div>
          </div>
        )}
      </div>

      {/* Thread View Slide-out */}
      {selectedThread && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l shadow-lg z-50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Thread</h3>
            <Button variant="ghost" size="icon" onClick={handleCloseThread}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <ThreadView
            parentMessage={selectedThread}
            threadMessages={threadMessages}
            onClose={handleCloseThread}
            onReply={handleReplyInThread}
            onReact={(messageId, reaction) => onReact?.(messageId, reaction)}
          />
        </div>
      )}
    </div>
  );
}
