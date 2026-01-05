import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Mic, Calendar, Plus, Hash, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface MessageComposerProps {
  onSendMessage: (content: string, type?: string, metadata?: Record<string, any>) => void;
  placeholder?: string;
}

const MessageComposer = ({ onSendMessage, placeholder = "Nachricht schreiben..." }: MessageComposerProps) => {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content.trim());
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const insertAtCursor = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + text.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const quickActions = [
    { icon: Calendar, label: 'Termin vorschlagen', action: () => insertAtCursor('[Termin] ') },
    { icon: Plus, label: 'Aufgabe erstellen', action: () => insertAtCursor('[Aufgabe] ') },
    { icon: Hash, label: 'Kanal erwähnen', action: () => insertAtCursor('#') },
    { icon: AtSign, label: 'Person erwähnen', action: () => insertAtCursor('@') }
  ];

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end gap-2">
        {/* Quick Actions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-1">
              <div className="font-medium text-sm mb-2">Schnellaktionen</div>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={action.action}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
              <Separator className="my-2" />
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Paperclip className="h-4 w-4 mr-2" />
                Datei anhängen
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[40px] max-h-[120px] resize-none pr-12"
            rows={1}
          />
          
          {/* Emoji Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 h-6 w-6"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice Message Button */}
        <Button
          type="button"
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          className="shrink-0"
          onMouseDown={() => setIsRecording(true)}
          onMouseUp={() => setIsRecording(false)}
          onMouseLeave={() => setIsRecording(false)}
        >
          <Mic className="h-4 w-4" />
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!content.trim()}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Sprachnachricht wird aufgenommen...
        </div>
      )}
    </form>
  );
};

export default MessageComposer;