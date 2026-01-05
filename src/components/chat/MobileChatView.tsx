
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Users, 
  Bot,
  Bell,
  Search,
  Phone,
  Video,
  Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntelligentCommunication } from '@/hooks/chat/useIntelligentCommunication';
import ChatContainer from './ChatContainer';
import ChannelFilesPanel from './ChannelFilesPanel';

const MobileChatView: React.FC = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showIntelligentFeatures, setShowIntelligentFeatures] = useState(false);
  const [showFilesSheet, setShowFilesSheet] = useState(false);
  
  const { notifications } = useIntelligentCommunication();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Chats werden aus der Datenbank geladen
  const [chats] = useState<{
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    type: string;
    avatar: string;
  }[]>([]);

  const sendMessage = () => {
    if (message.trim()) {
      console.log('Nachricht gesendet:', message);
      setMessage('');
    }
  };

  if (activeChat) {
    const currentChat = chats.find(c => c.id === activeChat);
    
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveChat(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentChat?.avatar}</span>
              <div>
                <h3 className="font-medium">{currentChat?.name}</h3>
                <p className="text-xs text-gray-500">
                  {currentChat?.type === 'group' ? 'Gruppe' : 'Online'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFilesSheet(true)}>
              <Folder className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat-Nachrichten */}
        <div className="flex-1 p-4">
          <ChatContainer />
        </div>

        {/* Intelligente Features Toggle */}
        {showIntelligentFeatures && (
          <div className="bg-blue-50 border-t border-blue-200 p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Bot className="h-4 w-4" />
              <span>KI-Features aktiv</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} neue Benachrichtigungen
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Eingabebereich */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIntelligentFeatures(!showIntelligentFeatures)}
              className={showIntelligentFeatures ? 'text-blue-600' : ''}
            >
              <Bot className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Nachricht eingeben..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dateien Sheet */}
        <Sheet open={showFilesSheet} onOpenChange={setShowFilesSheet}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Dateien & Medien</SheetTitle>
            </SheetHeader>
            <ChannelFilesPanel channelId={activeChat || ''} />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Chat-Liste
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIntelligentFeatures(!showIntelligentFeatures)}
              className={showIntelligentFeatures ? 'text-blue-600' : ''}
            >
              <Bot className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Intelligente Features Indikator */}
        {showIntelligentFeatures && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Bot className="h-4 w-4" />
              <span>KI-Features aktiviert</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {unreadCount} Benachrichtigungen
              </Badge>
            </div>
          </div>
        )}

        {/* Suchleiste */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Chats durchsuchen..." className="pl-10" />
        </div>
      </div>

      {/* Chat-Liste */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <Card
            key={chat.id}
            className="m-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setActiveChat(chat.id)}
          >
            <div className="p-4 flex items-center gap-3">
              <div className="relative">
                <span className="text-2xl">{chat.avatar}</span>
                {chat.type === 'group' && (
                  <Users className="absolute -bottom-1 -right-1 h-3 w-3 text-gray-500 bg-white rounded-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
              
              {chat.unread > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {chat.unread}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-4 right-4">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-12 w-12"
          onClick={() => navigate('/chat/new')}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MobileChatView;
