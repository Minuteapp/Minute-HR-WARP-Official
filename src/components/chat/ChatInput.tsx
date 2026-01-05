
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Paperclip, Mic, Square, X } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onSendVoiceMessage?: (audioBlob: Blob, duration: number) => void;
  isLoading?: boolean;
}

const ChatInput = ({ input, setInput, onSendMessage, onSendVoiceMessage, isLoading = false }: ChatInputProps) => {
  const { toast } = useToast();
  const {
    isRecording,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording
  } = useVoiceRecording();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onSendMessage();
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Aufnahme stoppen und senden
      stopRecording();
    } else {
      // Aufnahme sofort starten
      try {
        await startRecording();
        toast({
          title: "Aufnahme gestartet",
          description: "Klicken Sie erneut auf das Mikrofon, um die Aufnahme zu beenden."
        });
      } catch (error) {
        console.error('Mikrofon-Fehler:', error);
        toast({
          title: "Mikrofon-Zugriff verweigert",
          description: "Bitte erlauben Sie den Zugriff auf das Mikrofon in Ihren Browser-Einstellungen.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSendVoice = () => {
    if (audioBlob && onSendVoiceMessage) {
      onSendVoiceMessage(audioBlob, duration);
      resetRecording();
      toast({
        title: "Sprachnachricht gesendet",
        description: `Dauer: ${formatDuration(duration)}`
      });
    } else if (audioBlob) {
      // Fallback: Audio-URL erstellen und anzeigen
      const url = URL.createObjectURL(audioBlob);
      console.log('🎤 Audio-URL erstellt:', url);
      toast({
        title: "Sprachnachricht aufgenommen",
        description: `Dauer: ${formatDuration(duration)} - Senden-Funktion noch nicht verbunden.`
      });
      resetRecording();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Wenn Audio aufgenommen wurde, zeige Vorschau
  if (audioBlob) {
    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-3 bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Sprachnachricht</span>
              <span className="text-sm text-muted-foreground">{formatDuration(duration)}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => {
              resetRecording();
            }}
            className="h-9 w-9 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleSendVoice}
            size="icon"
            className="h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Während der Aufnahme
  if (isRecording) {
    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-3 bg-destructive/10 rounded-lg p-3 animate-pulse">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium text-destructive">Aufnahme läuft...</span>
            <span className="text-sm text-muted-foreground">{formatDuration(duration)}</span>
          </div>
          
          <Button 
            variant="ghost"
            size="icon"
            onClick={cancelRecording}
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={stopRecording}
            size="icon"
            className="h-9 w-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex gap-2 items-center">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <Smile className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground h-9 w-9"
            onClick={handleMicClick}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nachricht eingeben..."
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1 bg-background border-border focus-visible:ring-primary focus-visible:ring-1 focus-visible:ring-offset-0"
        />
        
        <Button 
          onClick={onSendMessage} 
          disabled={isLoading || !input.trim()} 
          size="icon"
          className="h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
