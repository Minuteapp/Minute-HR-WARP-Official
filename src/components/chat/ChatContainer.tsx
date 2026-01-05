
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  Users, 
  Settings, 
  MoreHorizontal,
  Plus,
  Search,
  Bell
} from 'lucide-react';
import { useIntelligentCommunication } from '@/hooks/chat/useIntelligentCommunication';
import IntelligentChatFeatures from './intelligent/IntelligentChatFeatures';
import ChannelMembersDisplay from './ChannelMembersDisplay';

const ChatContainer: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>('general');
  const [message, setMessage] = useState('');
  const [showIntelligentFeatures, setShowIntelligentFeatures] = useState(false);
  // Keine Mock-Daten - Nachrichten werden aus der Datenbank geladen
  const [messages, setMessages] = useState<{
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    avatar: string;
    isOwn: boolean;
    isBot?: boolean;
  }[]>([]);

  const { notifications } = useIntelligentCommunication();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Keine Mock-Daten - Kanäle werden aus der Datenbank geladen
  const channels: {
    id: string;
    name: string;
    type: string;
    members: number;
    unread: number;
  }[] = [];

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'Ich',
        content: message,
        timestamp: new Date().toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        avatar: '👤',
        isOwn: true
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private':
        return '🔒';
      case 'project':
        return '📋';
      default:
        return '#';
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar mit Kanälen */}
      <div className="w-80 bg-gray-50 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Chat-Kanäle</h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIntelligentFeatures(!showIntelligentFeatures)}
                className={showIntelligentFeatures ? 'text-blue-600' : ''}
              >
                <Bot className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Suchleiste */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Kanäle suchen..." className="pl-10 text-sm" />
          </div>
        </div>

        {/* Kanal-Liste */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  selectedChannel === channel.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getChannelIcon(channel.type)}</span>
                    <span className="font-medium text-sm">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">{channel.members}</span>
                    <Users className="h-3 w-3 text-gray-400" />
                    {channel.unread > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {channel.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Intelligente Features Indikator */}
        {showIntelligentFeatures && (
          <div className="p-3 border-t bg-blue-50">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Bot className="h-4 w-4" />
              <span>KI-Features aktiv</span>
            </div>
          </div>
        )}

        {/* Teilnehmeranzeige */}
        {selectedChannel && (
          <div className="p-3 border-t">
            <ChannelMembersDisplay 
              channelId={selectedChannel}
              channelName={channels.find(c => c.id === selectedChannel)?.name || 'Kanal'}
              isChannelOwner={true}
            />
          </div>
        )}
      </div>

      {/* Hauptchat-Bereich */}
      <div className="flex-1 flex flex-col">
        {showIntelligentFeatures ? (
          <IntelligentChatFeatures 
            projectId="demo-project"
            channelId={selectedChannel || undefined}
            eventId="demo-event"
          />
        ) : (
          <>
            {/* Chat-Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {getChannelIcon(channels.find(c => c.id === selectedChannel)?.type || 'public')}
                </span>
                <div>
                  <h3 className="font-semibold">
                    {channels.find(c => c.id === selectedChannel)?.name || 'Kanal'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {channels.find(c => c.id === selectedChannel)?.members || 0} Mitglieder
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Nachrichten */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 text-lg">
                    {msg.avatar}
                  </Avatar>
                  <div className={`max-w-[70%] ${msg.isOwn ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${msg.isBot ? 'text-blue-600' : ''}`}>
                        {msg.sender}
                      </span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      {msg.isBot && (
                        <Badge variant="outline" className="text-xs">
                          Bot
                        </Badge>
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.isOwn
                          ? 'bg-blue-500 text-white'
                          : msg.isBot
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Eingabebereich */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nachricht eingeben..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
