
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/calendar";
import ReactMarkdown from 'react-markdown';

interface CalendarAssistantProps {
  events: CalendarEvent[];
}

const CalendarAssistant = ({ events }: CalendarAssistantProps) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-assistant', {
        body: { prompt: input, events }
      });

      if (error) throw error;
      
      setResponse(data.response);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Fehler",
        description: "Konnte keine Antwort vom Assistenten erhalten",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">KI-Assistent</h3>
      
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-secondary/20 rounded-lg p-4">
        {response ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Fragen Sie mich etwas über Ihre Termine oder Zeitplanung.
            Zum Beispiel:
            - "Analysiere meine Termine diese Woche"
            - "Wann ist der beste Zeitpunkt für ein Meeting morgen?"
            - "Wie kann ich meine Zeit besser einteilen?"
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ihre Frage an den Assistenten..."
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          disabled={isLoading}
        />
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
};

export default CalendarAssistant;
