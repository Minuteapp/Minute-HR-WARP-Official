import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedNewChannelDialog } from './EnhancedNewChannelDialog';
import ChatSettingsMenu from './ChatSettingsMenu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Send, 
  Smile,
  Paperclip,
  Star,
  Image,
  FileText,
  Download,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  type: 'text' | 'file';
  files?: Array<{
    name: string;
    type: 'pdf' | 'doc' | 'zip' | 'txt';
    size?: string;
  }>;
}

interface FileItem {
  id: string;
  name: string;
  type: string;
  size?: string;
  color: string;
}

const ThreeColumnChatLayout = () => {
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [message, setMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    starred: false,
    media: false,
    files: true,
    information: false
  });

  // Chat-Funktionalität aus dem Hook verwenden
  const {
    channels,
    messages,
    loading,
    sendMessage,
    createChannel
  } = useChat(); // Aktuell ausgewählten Channel verwenden
  
  const { toast } = useToast();
  
  // Aktueller ausgewählter Channel
  const selectedChannelData = channels.find(c => c.id === selectedContact);

  // Chat auswählen - wird die Nachrichten für den Channel laden
  const handleSelectContact = (contactId: string) => {
    setSelectedContact(contactId);
    // Hook wird automatisch die Nachrichten laden wenn selectedContact sich ändert
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <div className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center text-xs font-bold">PDF</div>;
      case 'doc':
        return <div className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-bold">DOC</div>;
      case 'zip':
        return <div className="w-8 h-8 bg-yellow-500 text-white rounded flex items-center justify-center text-xs font-bold">ZIP</div>;
      case 'txt':
        return <div className="w-8 h-8 bg-purple-500 text-white rounded flex items-center justify-center text-xs font-bold">TXT</div>;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChannelData) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Sie müssen angemeldet sein",
        });
        return;
      }

      // Optimistische UI-Aktualisierung - Nachricht sofort anzeigen
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: message.trim(),
        sender_id: user.id,
        channel_id: selectedChannelData.id,
        message_type: 'text' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_edited: false,
        metadata: null
      };

      // Nachricht sofort in der UI anzeigen
      setMessage('');
      
      // Verwende den sendMessage aus dem useChat Hook für bessere Integration
      try {
        await sendMessage(optimisticMessage.content);
      } catch (error) {
        console.error('Fehler beim Senden über useChat Hook:', error);
        
        // Fallback: Direkt in Datenbank speichern
        const { data: newMessage, error: dbError } = await supabase
          .from('messages')
          .insert([{
            content: optimisticMessage.content,
            sender_id: user.id,
            channel_id: selectedChannelData.id,
            message_type: 'text'
          }])
          .select()
          .single();

        if (dbError) throw dbError;
      }
      
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      toast({
        variant: "destructive", 
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden",
      });
    }
  };

  // Neuen Channel erstellen
  const handleCreateChannel = async (name: string, type: string, isPublic: boolean, description?: string) => {
    try {
      await createChannel(name, type, !isPublic);
    } catch (error) {
      console.error('Fehler beim Erstellen des Channels:', error);
    }
  };

  // Erweiterten Channel erstellen mit KI und Automation
  const handleEnhancedCreateChannel = async (channelData: any) => {
    try {
      console.log('Erstelle neuen Channel:', channelData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Nicht angemeldet');
      }

      // 1. Channel in Datenbank erstellen
      const { data: newChannel, error: channelError } = await supabase
        .from('channels')
        .insert([{
          name: channelData.name,
          description: channelData.description,
          type: channelData.type,
          is_public: channelData.isPublic,
          created_by: user.id,
          metadata: {
            aiEnabled: channelData.aiEnabled,
            autoCreateProjects: channelData.autoCreateProjects,
            autoCreateTasks: channelData.autoCreateTasks,
            autoDelegateTasks: channelData.autoDelegateTasks,
            projectTemplate: channelData.projectTemplate,
            urgency: channelData.urgency
          }
        }])
        .select()
        .single();

      if (channelError) throw channelError;

      console.log('Channel erfolgreich erstellt:', newChannel);
      
      // 2. Creator als Owner hinzufügen (da RLS deaktiviert ist)
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert([{
          channel_id: newChannel.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) {
        console.warn('Mitglieder-Eintrag Fehler (kann ignoriert werden wenn Trigger aktiv):', memberError);
      }

      // 3. Teilnehmer hinzufügen
      if (channelData.participants && channelData.participants.length > 0) {
        const memberInserts = channelData.participants.map((participantId: string) => ({
          channel_id: newChannel.id,
          user_id: participantId,
          role: 'member'
        }));

        const { error: participantsError } = await supabase
          .from('channel_members')
          .insert(memberInserts);

        if (participantsError) {
          console.warn('Teilnehmer konnten nicht hinzugefügt werden:', participantsError);
        }
      }

      // Channel wird automatisch durch Realtime-Subscription hinzugefügt
      // Neuen Channel auswählen
      handleSelectContact(newChannel.id);

      console.log('Erweiterte Chat-Erstellung abgeschlossen');

    } catch (error) {
      console.error('Fehler beim Erstellen des erweiterten Channels:', error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Linke Sidebar - Kontakte */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Chat</h1>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          
          {/* Create New Button */}
          <EnhancedNewChannelDialog onCreateChannel={handleEnhancedCreateChannel} />

          {/* Suchfeld */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Chats durchsuchen..." 
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Kontaktliste */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Lade Chats...
            </div>
          ) : channels.length > 0 ? (
            channels.map((channel) => (
              <div 
                key={channel.id}
                onClick={() => handleSelectContact(channel.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                  selectedContact === channel.id 
                    ? 'bg-blue-50 border-l-blue-500' 
                    : 'border-l-transparent'
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/lovable-uploads/company-logo.png`} alt={channel.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {channel.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {channel.is_public && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{channel.name}</h3>
                  <p className="text-sm text-gray-500">{channel.type === 'direct' ? 'Direktnachricht' : channel.type}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Keine Chats vorhanden
            </div>
          )}
        </div>
      </div>

      {/* Mittlerer Bereich - Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        {selectedChannelData && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/lovable-uploads/company-logo.png`} alt={selectedChannelData.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedChannelData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{selectedChannelData.name}</h2>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">
                    {selectedChannelData.type === 'direct' ? 'Direktnachricht' : 'Gruppe'}
                  </span>
                </div>
              </div>
              <ChatSettingsMenu 
                channel={selectedChannelData}
                onDeleteChannel={(channelId) => {
                  setSelectedContact('');
                  // TODO: Implement actual channel deletion
                }}
                onArchiveChannel={(channelId) => {
                  // TODO: Implement actual channel archiving
                }}
                onInviteUsers={(channelId) => {
                  // TODO: Implement user invitation
                }}
              />
            </div>
          </div>
        )}

        {/* Nachrichten */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">
              Lade Nachrichten...
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === selectedChannelData?.created_by ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md ${msg.sender_id === 'current-user' ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`p-4 rounded-3xl ${
                      msg.sender_id === selectedChannelData?.created_by
                        ? 'bg-blue-500 text-white rounded-br-lg'
                        : 'bg-gray-100 text-gray-900 rounded-bl-lg'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {msg.sender_id !== selectedChannelData?.created_by && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`/lovable-uploads/company-logo.png`} />
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {msg.sender_id?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs opacity-75">
                        {new Date(msg.created_at).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : selectedChannelData ? (
            <div className="text-center text-gray-500">
              Noch keine Nachrichten in diesem Chat
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Wählen Sie einen Chat aus, um Nachrichten anzuzeigen
            </div>
          )}
        </div>

        {/* Eingabebereich */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Nachricht eingeben..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="pr-12 bg-gray-50 border-gray-200"
                disabled={!selectedChannelData}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || !selectedChannelData}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Rechte Sidebar - Benutzerinfo */}
      <div className="w-80 bg-white border-l border-gray-200">
        {selectedChannelData && (
          <div className="p-6">
            {/* Channel-Header */}
            <div className="text-center mb-6">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={`/lovable-uploads/company-logo.png`} alt={selectedChannelData.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {selectedChannelData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-gray-900">{selectedChannelData.name}</h2>
              <p className="text-sm text-gray-500">{selectedChannelData.description || selectedChannelData.type}</p>
            </div>

            {/* Erweiterbarer Bereich */}
            <div className="space-y-4">
              {/* Starred Messages */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('starred')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">Starred Messages</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedSections.starred ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.starred && (
                  <div className="p-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Keine markierten Nachrichten</p>
                  </div>
                )}
              </div>

              {/* Media */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('media')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-pink-500" />
                    <span className="font-medium text-gray-900">Media (43)</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedSections.media ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.media && (
                  <div className="p-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Keine Medien verfügbar</p>
                  </div>
                )}
              </div>

              {/* Files & Docs */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('files')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-900">Files & Docs (5)</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedSections.files ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.files && (
                  <div className="p-3 border-t border-gray-200 space-y-3">
                    <div className="text-sm text-gray-500">
                      Keine Dateien verfügbar
                    </div>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('information')}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-gray-900">Information</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedSections.information ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.information && (
                  <div className="p-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <p className="mb-2"><strong>Typ:</strong> {selectedChannelData.type}</p>
                      <p className="mb-2"><strong>Erstellt:</strong> {new Date(selectedChannelData.created_at).toLocaleDateString('de-DE')}</p>
                      <p className="mb-2"><strong>Sichtbarkeit:</strong> {selectedChannelData.is_public ? 'Öffentlich' : 'Privat'}</p>
                      {selectedChannelData.description && (
                        <p><strong>Beschreibung:</strong> {selectedChannelData.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeColumnChatLayout;