
import { useState } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Check, MoreVertical, Edit, Trash, Reply, Copy, 
  Pin, PinOff, MessageSquare, ThumbsUp, Heart, 
  Smile, PlayCircle, PauseCircle, Download, Languages
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Message, MessageReaction } from '@/types/chat';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatMessageProps {
  message: Message;
  sender: "user" | "other";
  timestamp: Date;
  avatarUrl?: string;
  senderName: string;
  reactions?: MessageReaction[];
  isEdited?: boolean;
  isPinned?: boolean;
  isVoiceMessage?: boolean;
  translation?: string;
  hasAttachments?: boolean;
  voiceUrl?: string;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onPin?: (messageId: string, pin: boolean) => void;
  onReaction?: (messageId: string, reaction: string) => void;
  onOpenAttachments?: (messageId: string) => void;
  showTranslation?: boolean;
  toggleTranslation?: () => void;
}

const ChatMessage = ({ 
  message,
  sender, 
  timestamp, 
  avatarUrl,
  senderName,
  reactions = [],
  isEdited = false,
  isPinned = false,
  isVoiceMessage = false,
  translation,
  hasAttachments = false,
  voiceUrl,
  onEdit,
  onDelete,
  onReply,
  onPin,
  onReaction,
  onOpenAttachments,
  showTranslation = false,
  toggleTranslation
}: ChatMessageProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  const isUserMessage = sender === 'user';
  
  const handlePlayAudio = () => {
    if (!voiceUrl) return;
    
    if (!audioElement) {
      const audio = new Audio(voiceUrl);
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };
  
  const handleCopyText = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast({ 
        description: "Text in die Zwischenablage kopiert"
      });
    }
  };
  
  const renderVoiceMessage = () => {
    return (
      <div className="flex items-center gap-2 my-1">
        <Button 
          size="sm" 
          variant="outline" 
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
          onClick={handlePlayAudio}
        >
          {isPlaying ? (
            <PauseCircle className="h-6 w-6" />
          ) : (
            <PlayCircle className="h-6 w-6" />
          )}
        </Button>
        <div className="h-[24px] bg-gray-200 dark:bg-gray-700 rounded-full w-[150px]">
          <div className="bg-gray-400 dark:bg-gray-500 h-full rounded-full" style={{ width: '70%' }}></div>
        </div>
      </div>
    );
  };
  
  const renderAttachmentIndicator = () => {
    if (!hasAttachments) return null;
    
    return (
      <div 
        className="flex items-center gap-1 mt-1 text-xs cursor-pointer hover:underline" 
        onClick={() => onOpenAttachments?.(message.id)}
      >
        <Download className="h-3 w-3" />
        <span>Anhänge anzeigen</span>
      </div>
    );
  };
  
  const renderReactions = () => {
    if (!reactions || reactions.length === 0) return null;
    
    // Reaktionen nach Typ gruppieren
    const reactionGroups: Record<string, number> = {};
    reactions.forEach(reaction => {
      reactionGroups[reaction.reaction] = (reactionGroups[reaction.reaction] || 0) + 1;
    });
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([reaction, count]) => (
          <Badge
            key={reaction}
            variant="outline"
            className="px-2 py-0 text-xs cursor-pointer hover:bg-primary/10"
            onClick={() => onReaction?.(message.id, reaction)}
          >
            {reaction} {count}
          </Badge>
        ))}
      </div>
    );
  };
  
  const messageTimeFormatted = format(timestamp, 'HH:mm');

  return (
    <div
      className={cn(
        "flex w-full gap-3 p-2 group",
        isUserMessage ? "flex-row-reverse" : "flex-row",
        isPinned && "bg-amber-50 dark:bg-amber-950/20"
      )}
    >
      <Avatar className="h-8 w-8 mt-1">
        {avatarUrl ? (
          <img src={avatarUrl} alt={senderName} className="rounded-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium uppercase">
            {senderName.charAt(0)}
          </div>
        )}
      </Avatar>
      
      <div className="flex-1 max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-sm font-medium",
            isUserMessage ? "text-right" : ""
          )}>
            {senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {messageTimeFormatted}
          </span>
          {isEdited && (
            <span className="text-xs text-muted-foreground">(bearbeitet)</span>
          )}
          {isPinned && (
            <Pin className="h-3 w-3 text-amber-500" />
          )}
        </div>
        
        <div 
          className={cn(
            "relative group rounded-lg p-3 inline-block max-w-full break-words",
            isUserMessage 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-muted",
            isVoiceMessage && "min-w-[200px]"
          )}
        >
          {isVoiceMessage ? (
            renderVoiceMessage()
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap break-words">
                {showTranslation && translation ? translation : message.content}
              </p>
              
              {translation && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2 mt-1"
                  onClick={toggleTranslation}
                >
                  <Languages className="h-3 w-3 mr-1" />
                  <span className="text-xs">
                    {showTranslation ? "Original anzeigen" : "Übersetzung anzeigen"}
                  </span>
                </Button>
              )}
            </>
          )}
          
          {renderAttachmentIndicator()}
          {renderReactions()}
          
          <div className={cn(
            "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
            isUserMessage ? "-left-8 -right-auto" : "-right-8"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isUserMessage ? "start" : "end"}>
                <DropdownMenuItem onClick={() => onReply?.(message.id)}>
                  <Reply className="h-4 w-4 mr-2" />
                  <span>Antworten</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyText}>
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Kopieren</span>
                </DropdownMenuItem>
                
                {onPin && (
                  <DropdownMenuItem onClick={() => onPin(message.id, !isPinned)}>
                    {isPinned ? (
                      <>
                        <PinOff className="h-4 w-4 mr-2" />
                        <span>Loslösen</span>
                      </>
                    ) : (
                      <>
                        <Pin className="h-4 w-4 mr-2" />
                        <span>Anheften</span>
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                
                {isUserMessage && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Bearbeiten</span>
                  </DropdownMenuItem>
                )}
                
                {isUserMessage && onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive" 
                    onClick={() => onDelete(message.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    <span>Löschen</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className={cn(
          "mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isUserMessage ? "text-right" : "text-left"
        )}>
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => onReaction?.(message.id, '👍')}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gefällt mir</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => onReaction?.(message.id, '❤️')}
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Liebe</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => {/* Öffne Emoji-Picker */}}
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Emoji hinzufügen</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => onReply?.(message.id)}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Antworten</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
