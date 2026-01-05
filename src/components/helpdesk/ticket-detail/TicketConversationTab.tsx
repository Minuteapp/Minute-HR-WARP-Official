import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Send, FileText, Download, Sparkles, Check } from "lucide-react";

interface TicketConversationTabProps {
  ticket: any;
}

export const TicketConversationTab: React.FC<TicketConversationTabProps> = ({ ticket }) => {
  const [newMessage, setNewMessage] = useState('');

  // Mock Konversations-Daten - angepasst an Design-Bild
  const messages = [
    {
      id: '1',
      type: 'user',
      author: 'Mitarbeiter 1',
      avatar: 'M1',
      avatarBg: 'bg-blue-100 text-blue-700',
      content: 'Hallo, ich möchte gerne vom 1. bis 14. August Urlaub beantragen. Ist das möglich?',
      timestamp: 'Heute, 10:23',
      attachments: [],
    },
    {
      id: '2',
      type: 'ai',
      author: 'KI-Assistent',
      avatar: 'AI',
      avatarBg: 'bg-violet-600 text-white',
      content: 'Basierend auf der Anfrage habe ich folgende Informationen gefunden:',
      aiChecklist: [
        { text: 'Resturlaub verfügbar: 18 Tage', checked: true },
        { text: 'Teamabdeckung: Ausreichend', checked: true },
        { text: 'Vorgeschlagene Aktion: Genehmigung empfohlen', checked: true },
      ],
      timestamp: 'Heute, 10:25',
      attachments: [],
      isAI: true,
    },
    {
      id: '3',
      type: 'agent',
      author: 'Sarah Schmidt',
      avatar: 'SS',
      avatarBg: 'bg-green-100 text-green-700',
      content: 'Hallo, ich habe Ihre Anfrage geprüft. Der Urlaub kann genehmigt werden. Ich leite die formale Genehmigung ein.',
      timestamp: 'Heute, 11:45',
      attachments: [
        { name: 'Urlaubsgenehmigung_August.pdf', size: '124 KB' }
      ],
    },
    {
      id: '4',
      type: 'user',
      author: 'Mitarbeiter 1',
      avatar: 'M1',
      avatarBg: 'bg-blue-100 text-blue-700',
      content: 'Vielen Dank! Das freut mich sehr.',
      timestamp: 'Heute, 12:00',
      attachments: [],
    },
  ];

  const handleSend = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className={message.avatarBg}>
                    {message.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.author}</span>
                    {message.isAI && (
                      <Badge className="bg-violet-100 text-violet-700 text-xs flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        KI
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  
                  {/* Regular content */}
                  {message.content && (
                    <p className="text-sm text-foreground leading-relaxed">
                      {message.content}
                    </p>
                  )}

                  {/* AI Checklist */}
                  {message.aiChecklist && (
                    <div className="space-y-1.5 mt-1">
                      {message.aiChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((file, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 p-2.5 bg-muted rounded-lg w-fit"
                        >
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{file.size}</div>
                          </div>
                          <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
        <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nachricht..."
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        
        <Button 
          onClick={handleSend}
          disabled={!newMessage.trim()}
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          Senden
        </Button>
      </div>
    </div>
  );
};
