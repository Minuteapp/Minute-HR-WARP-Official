
import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, MessageReaction, VoiceMessage, MessageAttachment } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Edit, 
  Trash, 
  Reply, 
  Pin, 
  PinOff, 
  MoreHorizontal, 
  Smile, 
  FileText, 
  Languages, 
  MessageSquare, 
  Copy, 
  Check,
  Paperclip
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  channelId: string;
  reactions: Record<string, MessageReaction[]>;
  translations: Record<string, string>;
  voiceMessages: Record<string, VoiceMessage>;
  attachments: Record<string, MessageAttachment[]>;
  isTypingMap: Record<string, boolean>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onReplyMessage: (messageId: string) => void;
  onPinMessage: (messageId: string, pin: boolean) => Promise<void>;
  onReactMessage: (messageId: string, reaction: string) => Promise<void>;
  onViewAttachments: (messageId: string) => void;
  pinnedMessages: Message[];
}

const emojiOptions = ['👍', '❤️', '😂', '🎉', '🚀', '👏', '🙏', '👀', '🔥', '✅'];

const dateFormatOptions = {
  today: 'HH:mm',
  yesterday: "'Gestern', HH:mm",
  thisWeek: 'EEEE, HH:mm',
  thisYear: 'dd. MMM, HH:mm',
  older: 'dd.MM.yyyy, HH:mm'
};

const ChatMessages = ({
  messages,
  loading,
  channelId,
  reactions,
  translations,
  voiceMessages,
  attachments,
  isTypingMap,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onPinMessage,
  onReactMessage,
  onViewAttachments,
  pinnedMessages
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  useEffect(() => {
    if (messages.length > 0 && !editingMessageId) {
      scrollToBottom();
    }
  }, [messages, editingMessageId]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleStartEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content || '');
  };
  
  const handleCancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };
  
  const handleSaveEditing = async () => {
    if (!editingMessageId) return;
    
    try {
      await onEditMessage(editingMessageId, editingContent);
      setEditingMessageId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Nachricht:', error);
      toast.error('Die Nachricht konnte nicht bearbeitet werden');
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await onDeleteMessage(messageId);
    } catch (error) {
      console.error('Fehler beim Löschen der Nachricht:', error);
      toast.error('Die Nachricht konnte nicht gelöscht werden');
    }
  };
  
  const handlePinMessage = async (messageId: string, pin: boolean) => {
    try {
      await onPinMessage(messageId, pin);
    } catch (error) {
      console.error('Fehler beim Anheften/Lösen der Nachricht:', error);
      toast.error('Die Nachricht konnte nicht angeheftet/gelöst werden');
    }
  };
  
  const handleAddReaction = async (messageId: string, reaction: string) => {
    try {
      await onReactMessage(messageId, reaction);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Reaktion:', error);
      toast.error('Die Reaktion konnte nicht hinzugefügt werden');
    }
  };
  
  const toggleTranslation = (messageId: string) => {
    setShowTranslation(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };
  
  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch(err => {
        console.error('Fehler beim Kopieren:', err);
        toast.error('Text konnte nicht kopiert werden');
      });
  };
  
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Vor weniger als einer Minute
    if (now.getTime() - messageDate.getTime() < 60000) {
      return 'Gerade eben';
    }
    
    // Heute
    if (messageDate >= today) {
      return format(messageDate, dateFormatOptions.today, { locale: de });
    }
    
    // Gestern
    if (messageDate >= yesterday) {
      return format(messageDate, dateFormatOptions.yesterday, { locale: de });
    }
    
    // Diese Woche
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    if (messageDate >= startOfWeek) {
      return format(messageDate, dateFormatOptions.thisWeek, { locale: de });
    }
    
    // Dieses Jahr
    if (messageDate.getFullYear() === now.getFullYear()) {
      return format(messageDate, dateFormatOptions.thisYear, { locale: de });
    }
    
    // Älter
    return format(messageDate, dateFormatOptions.older, { locale: de });
  };
  
  const renderMessage = (message: Message, index: number) => {
    const isEditing = editingMessageId === message.id;
    const messageReactions = reactions[message.id] || [];
    const hasAttachments = attachments[message.id]?.length > 0;
    const isVoiceMessage = message.message_type === 'voice';
    const isPinned = pinnedMessages.some(pm => pm.id === message.id);
    const voice = isVoiceMessage ? voiceMessages[message.id] : null;
    
    // Zeitstempel gruppieren - Nachrichten innerhalb von 5 Minuten gruppieren
    const showHeader = index === 0 || 
      !messages[index - 1].sender_id || 
      messages[index - 1].sender_id !== message.sender_id || 
      (new Date(message.created_at || '').getTime() - 
       new Date(messages[index - 1].created_at || '').getTime() > 5 * 60 * 1000);
    
    return (
      <div key={message.id} className="py-2 px-1">
        {showHeader && (
          <div className="flex items-center mt-4 mb-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${message.sender_id}`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <div className="text-sm font-medium">
                Benutzer {message.sender_id?.substring(0, 4)}
                {isPinned && (
                  <span className="ml-2">
                    <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                      <Pin className="h-3 w-3 mr-1" />
                      Angeheftet
                    </Badge>
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimestamp(message.created_at)}
                {message.is_edited && (
                  <span className="ml-1">(bearbeitet)</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className={`pl-10 ${showHeader ? '' : 'mt-1'}`}>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="min-h-[100px]"
                placeholder="Nachricht bearbeiten..."
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancelEditing}
                >
                  Abbrechen
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveEditing}
                  disabled={!editingContent.trim()}
                >
                  Speichern
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {isVoiceMessage && voice ? (
                <div className="mb-1 flex items-center bg-muted/30 p-2 rounded-md">
                  <audio src={voice.file_path} controls className="w-full h-8" />
                </div>
              ) : (
                <div className="relative group">
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {showTranslation[message.id] && translations[message.id] ? 
                      translations[message.id] : 
                      message.content
                    }
                  </p>
                  
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => toggleTranslation(message.id)}
                          >
                            <Languages className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{showTranslation[message.id] ? "Original anzeigen" : "Übersetzt anzeigen"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => handleCopyMessage(message.content || '', message.id)}
                          >
                            {copiedMessageId === message.id ? 
                              <Check className="h-4 w-4 text-green-500" /> : 
                              <Copy className="h-4 w-4" />
                            }
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{copiedMessageId === message.id ? "Kopiert!" : "Kopieren"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onReplyMessage(message.id)}>
                          <Reply className="mr-2 h-4 w-4" />
                          <span>Antworten</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleStartEditing(message)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Bearbeiten</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handlePinMessage(message.id, !isPinned)}
                        >
                          {isPinned ? (
                            <>
                              <PinOff className="mr-2 h-4 w-4" />
                              <span>Lösen</span>
                            </>
                          ) : (
                            <>
                              <Pin className="mr-2 h-4 w-4" />
                              <span>Anheften</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Löschen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
              
              {hasAttachments && (
                <div className="mt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => onViewAttachments(message.id)}
                  >
                    <Paperclip className="mr-1 h-3 w-3" />
                    {attachments[message.id].length} {attachments[message.id].length === 1 ? 'Anhang' : 'Anhänge'}
                  </Button>
                </div>
              )}
              
              {/* Reaktionen */}
              {messageReactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(
                    messageReactions.reduce((acc, reaction) => {
                      acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([emoji, count]) => (
                    <Badge 
                      key={emoji} 
                      variant="outline"
                      className="bg-muted/30 hover:bg-muted cursor-pointer"
                      onClick={() => handleAddReaction(message.id, emoji)}
                    >
                      {emoji} {count}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Reaktions-Toolbar */}
              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-1" align="start">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {emojiOptions.map(emoji => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleAddReaction(message.id, emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => onReplyMessage(message.id)}
                >
                  <Reply className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const typingUsers = Object.entries(isTypingMap)
    .filter(([_, isTyping]) => isTyping)
    .map(([userId]) => userId);
  
  return (
    <ScrollArea 
      ref={scrollAreaRef} 
      className="h-[calc(100vh-20rem)] pr-4"
    >
      {messages.length === 0 ? (
        loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <p>Nachrichten werden geladen...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Nachrichten</h3>
            <p className="text-muted-foreground max-w-md">
              Es sind noch keine Nachrichten in diesem Kanal. Senden Sie die erste Nachricht, um eine Konversation zu starten!
            </p>
          </div>
        )
      ) : (
        <>
          {messages.map(renderMessage)}
          
          {typingUsers.length > 0 && (
            <div className="py-2 px-4">
              <div className="flex items-center text-muted-foreground text-sm">
                <div className="flex space-x-1 mr-2">
                  <div className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <span>
                  {typingUsers.length === 1 ? (
                    `Benutzer ${typingUsers[0].substring(0, 4)} schreibt...`
                  ) : (
                    `${typingUsers.length} Personen schreiben...`
                  )}
                </span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </ScrollArea>
  );
};

export default ChatMessages;
