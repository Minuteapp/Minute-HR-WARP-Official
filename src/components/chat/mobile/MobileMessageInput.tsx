import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Mic, Send, Smile, Paperclip } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { VoiceRecorder } from "@/components/chat/VoiceRecorder";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MobileMessageInputProps {
  onSend: (message: string) => void;
  onSendVoice?: (audioBlob: Blob, duration: number) => void;
  onSendAttachment?: (file: File, message: string) => void;
  onTyping?: () => void;
}

export default function MobileMessageInput({ 
  onSend, 
  onSendVoice,
  onSendAttachment,
  onTyping 
}: MobileMessageInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingCallRef = useRef<number>(0);
  const onTypingRef = useRef(onTyping);

  // onTyping in Ref speichern ohne Dependency-Problem
  useEffect(() => {
    onTypingRef.current = onTyping;
  }, [onTyping]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendAttachment) {
      onSendAttachment(file, message);
      setMessage("");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };

  const handleVoiceSend = (audioBlob: Blob, duration: number) => {
    if (onSendVoice) {
      onSendVoice(audioBlob, duration);
      setIsRecording(false);
    }
  };

  const handleVoiceCancel = () => {
    setIsRecording(false);
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

  if (isRecording) {
    return (
      <div className="border-t bg-background p-3">
        <VoiceRecorder 
          onSend={handleVoiceSend}
          onCancel={handleVoiceCancel}
        />
      </div>
    );
  }

  return (
    <div className="border-t bg-background p-3 flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,application/pdf,.doc,.docx"
      />

      {/* Anhang-Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="shrink-0"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="w-5 h-5" />
      </Button>

      {/* Input-Feld */}
      <Input
        placeholder="Nachricht..."
        className="flex-1 rounded-full border-muted"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
      />

      {/* Emoji-Button */}
      <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Smile className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </PopoverContent>
      </Popover>

      {/* Mikrofon-Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="shrink-0"
        onClick={() => setIsRecording(true)}
      >
        <Mic className="w-5 h-5" />
      </Button>

      {/* Senden-Button */}
      <Button 
        size="icon" 
        className="rounded-full shrink-0" 
        onClick={handleSend}
        disabled={!message.trim()}
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
