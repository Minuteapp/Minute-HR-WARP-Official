import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMinuteCompanion } from '@/hooks/useMinuteCompanion';
import { useNavigate } from 'react-router-dom';

interface MinuteCompanionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickReplies = [
  { label: 'Was kann dieser Assistent?', message: 'Was kann dieser Assistent?' },
  { label: '▶️ Starte Zeiterfassung', message: 'Starte die Zeiterfassung' },
  { label: '📋 Zeige meine Aufgaben', message: 'Zeige meine Aufgaben' },
  { label: '✏️ Erstelle eine Aufgabe', message: 'Erstelle eine neue Aufgabe mit dem Titel "Meeting vorbereiten"' },
  { label: '🏖️ Urlaub beantragen', message: 'Ich möchte Urlaub beantragen' },
];

const MinuteCompanionPopup: React.FC<MinuteCompanionPopupProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, sendMessage } = useMinuteCompanion();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleQuickReply = async (message: string) => {
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  const showWelcome = messages.length === 0;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] bg-background rounded-2xl shadow-2xl border border-border flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">Minute Companion</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto h-8 w-8 rounded-full hover:bg-muted" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {showWelcome ? (
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[280px]">
                <p className="text-sm">
                  Hi there 👋<br />
                  Willkommen bei <strong>Minute</strong>!<br />
                  Wie kann ich dir heute helfen?
                </p>
              </div>
            </div>

            {/* Quick Reply Buttons - Right aligned */}
            <div className="flex flex-col items-end gap-2 mt-4">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 text-sm"
                  onClick={() => handleQuickReply(reply.message)}
                  disabled={isLoading}
                >
                  {reply.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={cn("flex gap-3", msg.role === 'user' && "flex-row-reverse")}>
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div className={cn(
                  "rounded-2xl px-4 py-3 max-w-[280px]",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-muted rounded-tl-sm"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3">
                      {msg.actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant="secondary"
                          size="sm"
                          className="w-full justify-start text-xs rounded-full"
                          onClick={() => handleActionClick(action.path)}
                        >
                          👉 {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Schreibe deine Nachricht..."
            className="flex-1 rounded-full bg-background border-border"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MinuteCompanionPopup;
