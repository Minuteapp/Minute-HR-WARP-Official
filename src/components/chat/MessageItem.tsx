import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileText, Download, MoreHorizontal, Reply, Bookmark, BookmarkCheck, Share2, Smile, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageReactions from "./MessageReactions";
import { TranslatedMessageView } from "./TranslatedMessageView";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";
import { ReadReceiptAvatars } from "./ReadReceiptAvatars";
import { MessageReaction } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useMessageBookmarks } from "@/hooks/useMessageBookmarks";

export interface MessageItemProps {
  id: string;
  sender: string;
  timestamp: string;
  content: string;
  avatar: string;
  avatarUrl?: string;
  senderId?: string;
  messageType?: string;
  voiceMessage?: {
    fileUrl: string;
    duration: number;
  };
  reactions?: MessageReaction[];
  readReceipts?: any[];
  attachment?: {
    name: string;
    size: string;
    url?: string;
  };
  showAvatar?: boolean;
  targetLanguage?: string;
  isEdited?: boolean;
  threadCount?: number;
  onReact?: (reaction: string) => void;
  onTranslate?: () => void;
  onMarkAsRead?: () => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  onViewThread?: () => void;
}

export default function MessageItem({
  id,
  sender,
  timestamp,
  content,
  avatar,
  avatarUrl,
  senderId,
  messageType = 'text',
  voiceMessage,
  reactions,
  readReceipts,
  attachment,
  showAvatar = true,
  targetLanguage = 'de',
  isEdited = false,
  threadCount = 0,
  onReact,
  onTranslate,
  onMarkAsRead,
  onEdit,
  onDelete,
  onReply,
  onViewThread,
}: MessageItemProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useMessageBookmarks();
  
  const bookmarked = isBookmarked(id);
  
  const handleBookmarkClick = async () => {
    await toggleBookmark(id);
  };
  
  return (
    <div className="group hover:bg-accent/50 px-4 py-2 transition-colors relative">
      <div className="flex gap-3">
        {showAvatar ? (
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} alt={sender} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {avatar}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10" />
        )}

        <div className="flex-1 min-w-0">
          {showAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{sender}</span>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </div>
          )}

          {messageType === 'voice' && voiceMessage ? (
            <VoiceMessagePlayer 
              fileUrl={voiceMessage.fileUrl} 
              duration={voiceMessage.duration} 
            />
          ) : isEditMode ? (
            <div className="flex gap-2 items-start">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 text-sm p-2 border rounded-md min-h-[60px] resize-none"
                autoFocus
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => {
                    onEdit?.(editContent);
                    setIsEditMode(false);
                  }}
                >
                  Speichern
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditContent(content);
                    setIsEditMode(false);
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : messageType === 'text' ? (
            <div>
              <TranslatedMessageView
                originalText={content}
                messageId={id}
                targetLanguage={targetLanguage}
              />
              {isEdited && (
                <span className="text-xs text-muted-foreground ml-2">(bearbeitet)</span>
              )}
            </div>
          ) : (
            <div className="text-sm">{content}</div>
          )}

          {attachment && (
            <div className="mt-2 p-3 bg-muted rounded-lg flex items-center justify-between max-w-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">{attachment.name}</div>
                  <div className="text-xs text-muted-foreground">{attachment.size}</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => attachment.url && window.open(attachment.url, '_blank')}
                disabled={!attachment.url}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}

          {reactions && reactions.length > 0 && onReact && (
            <MessageReactions 
              reactions={reactions} 
              onReact={onReact}
            />
          )}

          {readReceipts && readReceipts.length > 0 && (
            <div className="mt-2">
              <ReadReceiptAvatars 
                receipts={readReceipts} 
                showCheckmarks={true}
              />
            </div>
          )}

          {threadCount > 0 && onViewThread && (
            <button
              onClick={onViewThread}
              className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Reply className="w-3 h-3" />
              {threadCount} {threadCount === 1 ? 'Antwort' : 'Antworten'}
            </button>
          )}
        </div>
      </div>

      {/* Action buttons (shown on hover) */}
      <div className="opacity-0 group-hover:opacity-100 absolute right-4 top-2 flex items-center gap-1 transition-opacity">
        {onReply && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReply}>
            <Reply className="w-4 h-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => onReact?.('👍')}
        >
          <Smile className="w-4 h-4" />
        </Button>
        {messageType === 'text' && onTranslate && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onTranslate}
          >
            <Languages className="w-4 h-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${bookmarked ? 'text-primary' : ''}`}
          onClick={handleBookmarkClick}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4 fill-current" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => toast({ 
            title: "Funktion in Entwicklung", 
            description: "Teilen-Funktion wird bald verfügbar sein" 
          })}
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && messageType === 'text' && (
              <DropdownMenuItem onClick={() => setIsEditMode(true)}>
                Bearbeiten
              </DropdownMenuItem>
            )}
            {onReply && (
              <DropdownMenuItem onClick={onReply}>
                Antworten
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Vorschau</DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Löschen
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
