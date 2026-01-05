import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from 'lucide-react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useToast } from '@/hooks/use-toast';
import { Message, BotResponse } from '@/types/chatbot-actions';
import { supabase } from "@/integrations/supabase/client";

const AIChat = () => {
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

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: functionData.response || functionData.actionData?.shortAnswer || "Keine Antwort erhalten.",
        sender: "bot",
        timestamp: new Date(),
        actionData: functionData.actionData as BotResponse
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Es ist ein Fehler aufgetreten.",
        sender: "bot",
        timestamp: new Date(),
        actionData: {
          shortAnswer: "Beim Generieren einer Antwort ist ein Fehler aufgetreten.",
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
        description: "Beim Generieren einer Antwort ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSend = () => {
    handleSend();
  };

  return (
    <Card className="shadow-lg border-primary/20 hover:shadow-xl transition-shadow rounded-xl overflow-hidden flex flex-col h-[500px]">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/15 p-1.5 rounded-full">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg text-primary">KI-Assistent</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Link-First KI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="h-[350px] flex flex-col flex-1">
          <ChatMessages messages={messages} />
          <ChatInput
            input={input}
            setInput={setInput}
            onSendMessage={handleInputSend}
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
