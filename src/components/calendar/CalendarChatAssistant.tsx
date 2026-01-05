import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2, Calendar, Lightbulb } from 'lucide-react';
import { useCalendarAI } from '@/hooks/useCalendarAI';
import { CalendarEvent } from '@/types/calendar';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface CalendarChatAssistantProps {
  events: CalendarEvent[];
}

const CalendarChatAssistant: React.FC<CalendarChatAssistantProps> = ({ events }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const { callAIAssistant, isLoading } = useCalendarAI();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    try {
      const result = await callAIAssistant.mutateAsync({
        prompt,
        events,
        context: {
          currentDate: new Date().toISOString(),
          userPreferences: {}
        }
      });
      
      setResponse(result.response);
      setPrompt('');
    } catch (error) {
      console.error('Fehler beim KI-Aufruf:', error);
      toast.error('Fehler beim Abrufen der KI-Antwort');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    'Zeige mir eine Übersicht meiner Termine diese Woche',
    'Finde freie Zeiten für ein 1-stündiges Meeting',
    'Analysiere meine Arbeitsbelastung',
    'Schlage optimale Zeiten für Fokusarbeit vor'
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          KI-Kalender-Assistent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Response Display */}
        {response && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              KI-Antwort
            </div>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Quick Prompts */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Schnelle Aktionen:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((quickPrompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-3 text-wrap"
                onClick={() => setPrompt(quickPrompt)}
                disabled={isLoading}
              >
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-xs">{quickPrompt}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <Textarea
            placeholder="Fragen Sie den KI-Assistenten zu Ihrem Kalender... z.B. 'Wann habe ich diese Woche Zeit für ein Meeting?'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Drücken Sie Enter zum Senden (Shift+Enter für neue Zeile)
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLoading ? 'Analysiere...' : 'Senden'}
            </Button>
          </div>
        </div>

        {/* Event Count Display */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 rounded p-2">
          <Calendar className="h-3 w-3" />
          {events.length} Termine werden analysiert
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarChatAssistant;