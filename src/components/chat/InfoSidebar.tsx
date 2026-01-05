import React, { useState } from 'react';
import { Users, Pin, FileText, Star, Download, Settings, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtendedChannel } from '@/types/chat-extended';

interface InfoSidebarProps {
  channel: ExtendedChannel | null;
}

const InfoSidebar = ({ channel }: InfoSidebarProps) => {
  const [notes, setNotes] = useState('');

  if (!channel) {
    return (
      <div className="h-full border-l bg-card p-4">
        <div className="text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2" />
          <p>Keine Kanalinformationen verfügbar</p>
        </div>
      </div>
    );
  }

  const mockMembers: { id: string; name: string; role: string; online: boolean; avatar: null }[] = [];

  const mockFiles: { id: string; name: string; size: string; uploadedBy: string; date: string }[] = [];

  const mockPinnedMessages: { id: string; content: string; author: string }[] = [];

  return (
    <div className="h-full border-l bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{channel.name}</h3>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {channel.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {channel.description}
          </p>
        )}

        <div className="flex gap-2">
          <Badge variant={channel.is_public ? "secondary" : "outline"}>
            {channel.is_public ? 'Öffentlich' : 'Privat'}
          </Badge>
          <Badge variant="outline">
            {channel.type === 'group' ? 'Gruppe' : 
             channel.type === 'announcement' ? 'Ankündigung' : 
             channel.type === 'direct' ? 'Direkt' : 'System'}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 m-2">
          <TabsTrigger value="members" className="text-xs">
            <Users className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="pinned" className="text-xs">
            <Pin className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs">
            <FileText className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            <Star className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mitglieder ({mockMembers.length})</span>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </div>

              {mockMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {member.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </span>
                      {member.online && (
                        <span className="text-xs text-green-600">online</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Pinned Messages Tab */}
        <TabsContent value="pinned" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Angepinnte Nachrichten</span>
                <Pin className="h-4 w-4 text-muted-foreground" />
              </div>

              {mockPinnedMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Keine angepinnten Nachrichten</p>
                </div>
              ) : (
                mockPinnedMessages.map((message) => (
                  <Card key={message.id} className="p-3">
                    <p className="text-sm mb-2">{message.content}</p>
                    <p className="text-xs text-muted-foreground">- {message.author}</p>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dateien ({mockFiles.length})</span>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>

              {mockFiles.map((file) => (
                <Card key={file.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.size} • von {file.uploadedBy}
                      </p>
                      <p className="text-xs text-muted-foreground">{file.date}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 mt-0">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Persönliche Notizen</span>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>

            <textarea
              className="flex-1 w-full p-3 text-sm border rounded-md bg-background resize-none"
              placeholder="Notizen zu diesem Kanal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Button variant="outline" size="sm" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Konversation exportieren
        </Button>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1">
            <Bell className="h-4 w-4 mr-2" />
            Stumm
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Shield className="h-4 w-4 mr-2" />
            Melden
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfoSidebar;