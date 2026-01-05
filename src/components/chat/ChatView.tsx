import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Hash,
  MoreVertical,
  Pin,
  Search,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Send,
  Reply,
  MoreHorizontal,
  Mic,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Channel, Message } from "./types";
import { AudioMessage } from "./AudioMessage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface ChatViewProps {
  channel: Channel;
  messages: Message[];
  onShowDetails: () => void;
  showDetails: boolean;
}

export function ChatView({ channel, messages, onShowDetails, showDetails }: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending
      console.log("Sending message:", newMessage);
      setNewMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChannelIcon = (type: Channel["type"]) => {
    switch (type) {
      case "project":
        return <Hash className="w-5 h-5 text-[#6366F1]" />;
      case "shift":
        return <Hash className="w-5 h-5 text-[#10B981]" />;
      case "hr-confidential":
        return <Hash className="w-5 h-5 text-[#F59E0B]" />;
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border px-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          {channel.type === "dm" ? (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {channel.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              {channel.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-card rounded-full" />
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              {getChannelIcon(channel.type)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{channel.name}</h3>
            <p className="text-xs text-muted-foreground">
              {channel.type === "dm"
                ? channel.isOnline
                  ? "Online"
                  : "Offline"
                : `${channel.participants?.length || 0} Mitglieder`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onShowDetails}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const showAvatar =
              index === 0 || messages[index - 1].sender !== message.sender;

            return (
              <div key={message.id}>
                {/* Regular Messages */}
                {message.type === "text" && (
                  <div
                    className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-1"} group hover:bg-accent/30 -mx-2 px-2 py-1 rounded transition-colors`}
                  >
                    <div className="w-10 flex-shrink-0">
                      {showAvatar && (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {message.senderAvatar}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm text-foreground">
                            {message.sender}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border max-w-sm"
                            >
                              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                                <Paperclip className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.size}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {message.reactions.map((reaction, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 gap-1"
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-xs">{reaction.count}</span>
                            </Button>
                          ))}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Smile className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Message actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Reply className="w-4 h-4 mr-2" />
                            Antworten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="w-4 h-4 mr-2" />
                            Anpinnen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}

                {/* Audio Messages */}
                {message.type === "audio" && message.attachments?.[0] && (
                  <div className="flex gap-3 mt-4 group">
                    <div className="w-10 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {message.senderAvatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-semibold text-sm text-foreground">
                          {message.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <AudioMessage
                        duration={message.attachments[0].duration || 0}
                        audioUrl={message.attachments[0].url || ""}
                      />
                    </div>
                  </div>
                )}

                {/* Action Cards */}
                {message.type === "action-card" && message.actionCard && (
                  <div className="flex gap-3 mt-4">
                    <div className="w-10 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {message.senderAvatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-semibold text-sm text-foreground">
                          {message.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <div className="border border-border rounded-lg p-4 bg-card max-w-md">
                        <h4 className="font-semibold mb-3">
                          {message.actionCard.title}
                        </h4>
                        <div className="space-y-2 mb-4">
                          {message.actionCard.fields.map((field, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {field.label}:
                              </span>
                              <span className="font-medium">{field.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {message.actionCard.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant={
                                action.variant === "approve"
                                  ? "default"
                                  : action.variant === "reject"
                                    ? "destructive"
                                    : "default"
                              }
                              size="sm"
                              className="flex-1"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Messages */}
                {message.type === "system" && (
                  <div className="flex justify-center my-4">
                    <div className="bg-muted px-4 py-2 rounded-full text-xs text-muted-foreground">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder={`Nachricht an ${channel.name}...`}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={handleKeyDown}
                className="min-h-[44px] max-h-32 resize-none pr-24"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
                  </PopoverContent>
                </Popover>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-11 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
