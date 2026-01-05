import React, { useState } from 'react';
import { Search, Hash, Users, Megaphone, Settings, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExtendedChannel } from '@/types/chat-extended';
import { cn } from '@/lib/utils';

interface ChannelSidebarProps {
  channels: ExtendedChannel[];
  activeChannel: ExtendedChannel | null;
  onSelectChannel: (channel: ExtendedChannel) => void;
  onJoinChannel: (channelId: string) => void;
  loading: boolean;
}

const ChannelSidebar = ({ 
  channels, 
  activeChannel, 
  onSelectChannel, 
  onJoinChannel,
  loading 
}: ChannelSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getChannelIcon = (channel: ExtendedChannel) => {
    switch (channel.type) {
      case 'direct':
        return <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{channel.name.charAt(0)}</AvatarFallback></Avatar>;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      case 'system_feed':
        return <Settings className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const filterChannels = (type: string) => {
    return channels
      .filter(channel => {
        if (type === 'direct' && channel.type !== 'direct') return false;
        if (type === 'groups' && !['group', 'system_feed'].includes(channel.type)) return false;
        if (type === 'announcements' && channel.type !== 'announcement') return false;
        
        return channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        // Sort by last activity or alphabetically
        if (a.last_activity && b.last_activity) {
          return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
        }
        return a.name.localeCompare(b.name);
      });
  };

  const ChannelList = ({ channelType }: { channelType: string }) => {
    const filteredChannels = filterChannels(channelType);

    if (loading) {
      return (
        <div className="space-y-2 p-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      );
    }

    return (
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-1 p-2">
          {filteredChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className={cn(
                "flex items-center gap-3 w-full p-2 text-left rounded-md transition-colors",
                activeChannel?.id === channel.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
            >
              {getChannelIcon(channel)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">
                    {channel.type !== 'direct' && '#'}{channel.name}
                  </span>
                  {channel.unread_count && channel.unread_count > 0 && (
                    <Badge variant="default" className="ml-1 h-5 text-xs">
                      {channel.unread_count}
                    </Badge>
                  )}
                </div>
                
                {channel.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {channel.last_message}
                  </p>
                )}
              </div>
            </button>
          ))}
          
          {filteredChannels.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery ? 'Keine Kanäle gefunden' : 'Keine Kanäle vorhanden'}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="h-full border-r bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Chat</h2>
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kanäle durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="groups" className="flex-1">
        <TabsList className="grid w-full grid-cols-3 m-2">
          <TabsTrigger value="direct" className="text-xs">Direkt</TabsTrigger>
          <TabsTrigger value="groups" className="text-xs">Gruppen</TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs">News</TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="mt-0">
          <ChannelList channelType="direct" />
        </TabsContent>
        
        <TabsContent value="groups" className="mt-0">
          <ChannelList channelType="groups" />
        </TabsContent>
        
        <TabsContent value="announcements" className="mt-0">
          <ChannelList channelType="announcements" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelSidebar;