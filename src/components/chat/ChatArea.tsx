import { useState } from "react";
import { Phone, Video, Search, Info, ArrowLeft, MessageSquare, Reply, SmilePlus, Bookmark, Share2, MoreHorizontal, Download, Play, Check, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ChatInput from "./ChatInput";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: string;
  type?: 'text' | 'file' | 'image' | 'voice' | 'hr_card' | 'system';
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  reactions?: { emoji: string; count: number }[];
  voiceDuration?: string;
  hrData?: {
    type: string;
    title: string;
    fields: { label: string; value: string }[];
    actions: { label: string; variant: 'default' | 'destructive' }[];
  };
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  type: 'direct' | 'group' | 'public';
  status?: string;
  position?: string;
  email?: string;
  phone?: string;
}

interface ChatAreaProps {
  contact: Contact | undefined;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  onOpenContacts: () => void;
  onOpenDetails: () => void;
  isMobile?: boolean;
}

export function ChatArea({ 
  contact, 
  messages, 
  onSendMessage, 
  onFileUpload, 
  onOpenContacts, 
  onOpenDetails,
  isMobile = false 
}: ChatAreaProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Keine Konversation ausgewählt</h3>
          <p className="text-sm text-muted-foreground">Wähle einen Chat oder Kanal aus der Liste</p>
        </div>
      </div>
    );
  }

  const renderMessageContent = (message: Message) => {
    if (message.type === 'file') {
      return (
        <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-between max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
              <Badge variant="secondary" className="text-xs">PDF</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">{message.fileName}</p>
              <p className="text-xs text-muted-foreground">{message.fileSize}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    if (message.type === 'voice') {
      return (
        <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-center space-x-3 max-w-sm">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
            <Play className="w-4 h-4" />
          </Button>
          <div className="flex-1 h-1 bg-primary/20 rounded-full relative">
            <div className="absolute h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
          </div>
          <span className="text-xs text-muted-foreground">{message.voiceDuration || '0:00'}</span>
        </div>
      );
    }

    if (message.type === 'hr_card' && message.hrData) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 max-w-md shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="secondary" className="text-primary">
              {message.hrData.type}
            </Badge>
            <h4 className="font-semibold">{message.hrData.title}</h4>
          </div>
          <div className="space-y-2 mb-4">
            {message.hrData.fields.map((field, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{field.label}:</span>
                <span className="font-medium">{field.value}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            {message.hrData.actions.map((action, idx) => (
              <Button 
                key={idx}
                size="sm"
                variant={action.variant}
                className={action.variant === 'default' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              >
                {action.variant === 'default' ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    if (message.type === 'system') {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 flex items-center space-x-2">
            <span className="text-blue-600 text-sm">{message.content}</span>
            <span className="text-xs text-blue-500">{message.timestamp}</span>
          </div>
        </div>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onOpenContacts}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <Avatar className="w-8 h-8">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold text-base">{contact.name}</h2>
            <p className="text-xs text-muted-foreground flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>5 Mitglieder</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onOpenDetails}>
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            if (message.type === 'system') {
              return <div key={message.id}>{renderMessageContent(message)}</div>;
            }

            return (
              <div key={message.id} className="space-y-1">
                <div className="flex items-start space-x-3">
                  {!message.isOwn && (
                    <Avatar className="w-9 h-9 mt-1">
                      <AvatarImage src={contact.avatar} alt={message.sender} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex-1 space-y-1">
                    {!message.isOwn && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                    )}
                    
                    <div>
                      {renderMessageContent(message)}
                      
                      {message.content && !['hr_card', 'system', 'file', 'voice'].includes(message.type || '') && (
                        <div className={`${
                          message.type === 'text' || !message.type 
                            ? 'hover:bg-muted/50 rounded p-2 -m-2' 
                            : ''
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        {message.reactions.map((reaction, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="px-2 py-0.5 text-xs hover:bg-secondary/80 cursor-pointer"
                          >
                            {reaction.emoji} {reaction.count}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    {!message.isOwn && (
                      <div className="flex items-center space-x-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Reply className="w-3 h-3 mr-1" />
                          Antworten
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <SmilePlus className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Bookmark className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.isOwn && (
                    <Avatar className="w-9 h-9 mt-1">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        Sie
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <ChatInput 
        input={input}
        setInput={setInput}
        onSendMessage={handleSend}
      />
    </div>
  );
}