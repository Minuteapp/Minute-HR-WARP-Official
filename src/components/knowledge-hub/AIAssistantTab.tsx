import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ id: string; title: string; category: string }>;
}

interface AIAssistantTabProps {
  onCreateArticle?: () => void;
}

export const AIAssistantTab = ({ onCreateArticle }: AIAssistantTabProps) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('knowledge-hub-chat', {
        body: { 
          question: currentQuery,
          conversationHistory
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        
        // Handle specific error codes
        if (error.message?.includes('429')) {
          toast.error('Zu viele Anfragen. Bitte warten Sie einen Moment.');
        } else if (error.message?.includes('402')) {
          toast.error('Bitte laden Sie Credits auf, um den KI-Assistenten zu nutzen.');
        } else {
          toast.error('Fehler bei der KI-Anfrage. Bitte versuchen Sie es erneut.');
        }
        
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Keine Antwort erhalten.',
        sources: data.sources || [],
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error calling AI assistant:', err);
      toast.error('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* KI-Assistent Box - Violett */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1">KI-Assistent aktiviert</h2>
            <p className="text-sm text-muted-foreground">
              Stellen Sie mir Fragen zu Ihrem Unternehmenswissen. Ich durchsuche alle Artikel, Workflows und Dokumente.
            </p>
          </div>
        </div>
        
        {/* Input-Feld */}
        <Input
          placeholder="Wie funktioniert der Genehmigungsprozess für Urlaub?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="bg-white"
          disabled={isLoading}
        />
      </div>

      {/* Chat History */}
      {messages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          <p className="text-xs font-semibold flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Quellen:
                          </p>
                          {message.sources.map((source) => (
                            <div key={source.id} className="text-xs p-2 bg-background rounded border">
                              <p className="font-medium">{source.title}</p>
                              <p className="text-muted-foreground">{source.category}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Neuen Artikel erstellen Button */}
      <Card>
        <CardContent className="p-4">
          <Button 
            onClick={onCreateArticle} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuen Artikel erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
