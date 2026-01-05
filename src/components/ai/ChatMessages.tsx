import { Message, BotResponse } from "@/types/chatbot-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatActionCard } from "./ChatActionCard";

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
    <ScrollArea className="flex-1 pr-1">
      <div className="space-y-4 p-4">
        {messages.map((message) => {
          const isBot = message.sender === "bot" || message.sender === "ai";
          const isUser = message.sender === "user";
          
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {isBot && (
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <div className="bg-primary/15 h-full w-full flex items-center justify-center rounded-full border border-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </Avatar>
                )}
                
                {/* Bot-Nachricht mit Action Card */}
                {isBot && message.actionData ? (
                  <div className="flex flex-col gap-1">
                    <ChatActionCard 
                      shortAnswer={message.actionData.shortAnswer}
                      primaryAction={message.actionData.primaryAction}
                      secondaryAction={message.actionData.secondaryAction}
                      context={message.actionData.context}
                    />
                    <span className="text-xs text-muted-foreground ml-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ) : isBot ? (
                  /* Bot-Nachricht ohne Action (Fallback) */
                  <div className="flex flex-col gap-1">
                    <div className="p-3 rounded-xl shadow-sm bg-primary/5 border border-primary/15 text-foreground">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ) : (
                  /* User-Nachricht */
                  <div
                    className={cn(
                      "p-3 rounded-xl shadow-sm transition-all",
                      "bg-primary text-primary-foreground shadow-primary/20"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                {isUser && (
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <div className="bg-primary/20 h-full w-full flex items-center justify-center rounded-full border border-primary/30">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </Avatar>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
