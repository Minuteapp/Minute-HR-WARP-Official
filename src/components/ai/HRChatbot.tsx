import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarAssistant from "../calendar/CalendarAssistant";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Badge } from "@/components/ui/badge";
import { Message, BotResponse } from "@/types/chatbot-actions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface HRChatbotProps {
  calendarEnabled?: boolean;
}

export const HRChatbot = ({ calendarEnabled = false }: HRChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setIsLoading(true);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('hr-chat', {
        body: { message: messageText }
      });

      if (functionError) {
        throw functionError;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: functionData.response || functionData.actionData?.shortAnswer || "Keine Antwort erhalten.",
        sender: "bot",
        timestamp: new Date(),
        actionData: functionData.actionData as BotResponse
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Fallback mit Action
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Es ist ein Fehler aufgetreten.",
        sender: "bot",
        timestamp: new Date(),
        actionData: {
          shortAnswer: "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
          primaryAction: {
            id: "error-help",
            type: "navigate",
            label: "Support kontaktieren",
            deepLink: "/helpdesk"
          },
          context: {
            dataSource: "error_handler",
            permission: "helpdesk.view"
          }
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Fehler",
        description: "Entschuldigung, ich konnte keine Antwort generieren.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSend = () => {
    handleSend();
  };

  const chatContent = (
    <div className="h-[350px] flex flex-col">
      <ChatMessages messages={messages} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={handleInputSend}
        isLoading={isLoading}
      />
    </div>
  );

  return (
    <Card className="shadow-lg border-primary/20 hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/15 p-1.5 rounded-full">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg text-primary">HR Assistent</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Link-First KI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {calendarEnabled ? (
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="w-full rounded-none border-b bg-primary/5">
              <TabsTrigger value="chat" className="flex-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                HR Chat
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">
                Kalender Hilfe
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="m-0 p-0">
              {chatContent}
            </TabsContent>
            <TabsContent value="calendar" className="m-0 p-0">
              <div className="h-[350px] overflow-auto">
                <CalendarAssistant events={[]} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          chatContent
        )}
      </CardContent>
    </Card>
  );
};

export default HRChatbot;
