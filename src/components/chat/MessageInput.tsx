import React, { useState, useRef, useEffect, memo } from "react";
import { Send, Paperclip, Smile, X, FileIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "./EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSend: (message: string) => void;
  onSlashCommand?: (command: string) => void;
  onCardSubmit?: (cardId: string, formData: Record<string, any>) => void;
  onSendWithAttachment?: (content: string, file: File) => void;
  onTyping?: () => void;
}

function MessageInput({
  onSend,
  onSlashCommand,
  onSendWithAttachment,
  onTyping,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const lastTypingCallRef = useRef<number>(0);
  const onTypingRef = useRef(onTyping);

  // onTyping in Ref speichern ohne Dependency-Problem
  useEffect(() => {
    onTypingRef.current = onTyping;
  }, [onTyping]);

  const handleSend = async () => {
    // Wenn Datei angehängt, sende mit Anhang
    if (pendingFile && onSendWithAttachment) {
      setUploading(true);
      try {
        console.log('[MessageInput] Sending message with attachment:', pendingFile.name);
        await onSendWithAttachment(message || pendingFile.name, pendingFile);
        setMessage("");
        clearPendingFile();
        toast({
          title: 'Gesendet',
          description: 'Nachricht mit Anhang wurde gesendet'
        });
      } catch (error: any) {
        console.error('[MessageInput] Error sending with attachment:', error);
        toast({
          title: 'Fehler beim Senden',
          description: error?.message || 'Datei konnte nicht gesendet werden',
          variant: 'destructive'
        });
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!message.trim()) return;

    // Check if it's a slash command
    if (message.startsWith("/") && onSlashCommand) {
      console.log('[MessageInput] Executing slash command:', message);
      onSlashCommand(message);
    } else {
      console.log('[MessageInput] Sending message:', message.substring(0, 50));
      onSend(message);
    }
    
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[MessageInput] File selected:', file.name, file.type, file.size);

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Datei zu groß',
        description: 'Maximale Dateigröße ist 10MB',
        variant: 'destructive'
      });
      return;
    }

    // Set pending file for preview
    setPendingFile(file);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearPendingFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPendingFile(null);
    setPreviewUrl(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  // Separater useEffect für Typing-Indicator - NUR message als Dependency
  useEffect(() => {
    if (message.length > 0 && onTypingRef.current) {
      const now = Date.now();
      if (now - lastTypingCallRef.current >= 2000) {
        lastTypingCallRef.current = now;
        setTimeout(() => onTypingRef.current?.(), 0);
      }
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value); // NUR State setzen, sonst nichts!
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-muted rounded-lg p-2">
      {/* File Preview */}
      {pendingFile && (
        <div className="mb-2 p-2 bg-background rounded-md border flex items-center gap-3">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Vorschau" 
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{pendingFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(pendingFile.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={clearPendingFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        />
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={pendingFile ? "Nachricht hinzufügen (optional)..." : "Nachricht eingeben... (/ für Befehle)"}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Smile className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <EmojiPicker onSelect={handleEmojiSelect} />
            </PopoverContent>
          </Popover>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={(!message.trim() && !pendingFile) || uploading}
            className="h-8 w-8"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(MessageInput);
