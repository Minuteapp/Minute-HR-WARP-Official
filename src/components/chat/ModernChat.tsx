import React, { useState } from 'react';
import { ArrowLeft, Search, Video, Phone, MoreVertical, Smile, Mic, Send, Plus, Filter, Hash, MessageSquare, AtSign, Info } from 'lucide-react';
import ChatDetailsPanel from '@/components/chat/ChatDetailsPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { SlashCommandMenu } from '@/components/chat/SlashCommandMenu';
import { ChatInteractiveCard } from '@/components/chat/ChatInteractiveCard';
import { ChatVoiceButton } from '@/components/chat/ChatVoiceButton';

const ModernChat = () => {
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'dms' | 'mentions'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandFilter, setCommandFilter] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    channels,
    activeChannel,
    messages,
    loading,
    sendMessage,
    selectChannel,
    createChannel,
    commands,
    handleSlashCommand,
    submitCard
  } = useChat();

  const getFilteredChannels = () => {
    switch (activeTab) {
      case 'channels':
        return channels.filter(ch => ch.type === 'group' || ch.type === 'announcement');
      case 'dms':
        return channels.filter(ch => ch.type === 'direct');
      case 'mentions':
        return channels.filter(ch => (ch.unread_count || 0) > 0);
      default:
        return channels;
    }
  };

  const filteredChannels = getFilteredChannels();

  const handleChannelSelect = (channel: any) => {
    selectChannel(channel);
    setCurrentView('chat');
  };

  const handleBackToList = () => {
    setCurrentView('list');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);
    
    // Slash-Command-Menü anzeigen
    if (value.startsWith('/')) {
      setShowCommandMenu(true);
      setCommandFilter(value.slice(1).toLowerCase());
    } else {
      setShowCommandMenu(false);
    }
  };

  const handleSelectCommand = async (trigger: string) => {
    setShowCommandMenu(false);
    setMessageInput('');
    
    if (!activeChannel) return;
    
    try {
      await handleSlashCommand(trigger, activeChannel.id);
    } catch (error) {
      console.error('Command failed:', error);
      toast({
        title: "Fehler",
        description: "Befehl konnte nicht ausgeführt werden",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    await sendMessage(messageInput);
    setMessageInput('');
  };

  const handleNewChat = async () => {
    const channelName = prompt('Neuer Kanal-Name:');
    if (!channelName) return;
    
    await createChannel(channelName, 'group', false);
    toast({
      title: "Kanal erstellt",
      description: `Kanal "${channelName}" wurde erfolgreich erstellt`,
    });
  };

  const tabs = [
    { key: 'all' as const, label: 'Alle', icon: MessageSquare },
    { key: 'channels' as const, label: 'Kanäle', icon: Hash },
    { key: 'dms' as const, label: 'DMs', icon: MessageSquare },
    { key: 'mentions' as const, label: 'Erwähnungen', icon: AtSign },
  ];

  if (currentView === 'chat' && activeChannel) {
    return (
      <div className="h-screen bg-background flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-card px-4 py-3 border-b flex items-center gap-3 flex-shrink-0 z-10">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback>{activeChannel.type === 'direct' ? '💬' : '#️⃣'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{activeChannel.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{activeChannel.description || 'Keine Beschreibung'}</p>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Phone className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground">Laden...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-8">
                Noch keine Nachrichten. Schreibe die erste Nachricht!
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                
                // Interactive Card?
                if (message.message_type === 'hr_card' && message.metadata?.card_id) {
                  return (
                    <div key={message.id} className="my-4">
                      <ChatInteractiveCard
                        card={{
                          id: message.metadata.card_id,
                          card_type: message.metadata.card_type || 'form',
                          card_data: message.metadata.card_data || {},
                          status: message.metadata.status || 'pending',
                          submitted_at: message.metadata.submitted_at
                        }}
                        onSubmit={(cardId, formData) => submitCard(cardId, formData)}
                        readOnly={!isOwn || message.metadata.status !== 'pending'}
                      />
                    </div>
                  );
                }
                
                // Normale Nachricht
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${
                      isOwn 
                        ? 'bg-primary text-primary-foreground rounded-l-2xl rounded-tr-2xl' 
                        : 'bg-card text-card-foreground rounded-r-2xl rounded-tl-2xl border'
                    } p-3 shadow-sm`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="bg-card p-4 border-t flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Nachricht oder /befehl eingeben..."
                  className="rounded-full pr-12"
                  onKeyPress={(e) => e.key === 'Enter' && !showCommandMenu && handleSendMessage()}
                />
                
                {/* Slash-Command-Menü */}
                {showCommandMenu && commands.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
                    <SlashCommandMenu
                      commands={commands.filter(cmd => 
                        commandFilter === '' || 
                        cmd.command_triggers.some(t => t.includes(commandFilter)) ||
                        (cmd.label['de'] || '').toLowerCase().includes(commandFilter)
                      )}
                      onSelect={handleSelectCommand}
                      open={showCommandMenu}
                      onOpenChange={setShowCommandMenu}
                    />
                  </div>
                )}
                
                {/* Voice-Button */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <ChatVoiceButton
                    onTranscription={(text, intentData) => {
                      if (intentData?.command_key) {
                        handleSelectCommand(intentData.command_triggers[0]);
                      } else {
                        setMessageInput(text);
                      }
                    }}
                    disabled={!activeChannel}
                  />
                </div>
              </div>
              <Button 
                size="icon" 
                className="bg-primary hover:bg-primary/90 rounded-full flex-shrink-0"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {showDetails && (
          <ChatDetailsPanel
            channelName={activeChannel.name}
            memberCount={activeChannel.member_count || 0}
            members={[]}
            channelId={activeChannel.id}
            onClose={() => setShowDetails(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b flex-shrink-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-[100]">
                <DropdownMenuLabel>Filter</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Ungelesen
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Archiviert
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={handleNewChat}
              className="bg-primary hover:bg-primary/90 rounded-full px-4 gap-2"
            >
              <Plus className="h-4 w-4" />
              Neuer Chat
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Laden...</div>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p>Keine Chats gefunden</p>
            <Button 
              onClick={handleNewChat}
              variant="outline"
              className="mt-4"
            >
              Neuen Chat erstellen
            </Button>
          </div>
        ) : (
          <div className="px-6 py-4">
            <div className="space-y-2">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  className="w-full flex items-center gap-3 p-3 bg-card rounded-lg hover:shadow-md hover:border-primary border border-transparent transition-all cursor-pointer text-left"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {channel.type === 'direct' ? '💬' : '#️⃣'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">
                        {channel.type !== 'direct' ? '# ' : ''}{channel.name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {channel.last_activity ? new Date(channel.last_activity).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {channel.last_message || channel.description || 'Keine Nachrichten'}
                    </p>
                  </div>
                  {(channel.unread_count || 0) > 0 && (
                    <Badge className="bg-primary hover:bg-primary/90 min-w-[1.5rem] h-6 rounded-full flex-shrink-0">
                      {channel.unread_count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernChat;
