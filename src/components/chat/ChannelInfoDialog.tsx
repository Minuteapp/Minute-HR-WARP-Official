import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Channel, ChannelMember, Message } from '@/types/chat';
import { 
  Users, 
  Pin, 
  Settings, 
  Plus, 
  Trash, 
  Save, 
  Bell, 
  BellOff,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ChannelInfoDialogProps {
  channel: Channel;
  members: ChannelMember[];
  pinnedMessages: Message[];
  onUpdateChannel: (channelId: string, updates: Partial<Channel>) => Promise<void>;
  onAddMember: (channelId: string, userId: string) => Promise<void>;
  onRemoveMember: (channelId: string, userId: string) => Promise<void>;
  onPinMessage: (messageId: string, pin: boolean) => Promise<boolean>;
}

const ChannelInfoDialog = ({
  channel,
  members,
  pinnedMessages,
  onUpdateChannel,
  onAddMember,
  onRemoveMember,
  onPinMessage
}: ChannelInfoDialogProps) => {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [channelName, setChannelName] = useState(channel.name);
  const [channelDescription, setChannelDescription] = useState(channel.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  const isNotificationsMuted = (): boolean => {
    if (channel.metadata && typeof channel.metadata === 'object' && channel.metadata !== null) {
      return Boolean((channel.metadata as Record<string, unknown>).notifications_muted);
    }
    return false;
  };
  
  const handleSaveChanges = async () => {
    if (!channelName.trim()) {
      toast.error('Der Kanalname darf nicht leer sein');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await onUpdateChannel(channel.id, {
        name: channelName,
        description: channelDescription || null
      });
      
      setEditMode(false);
      toast.success('Kanalinformationen wurden aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kanals:', error);
      toast.error('Die Kanalinformationen konnten nicht aktualisiert werden');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    
    try {
      // TODO: Echte Benutzer-ID basierend auf E-Mail-Adresse ermitteln
      // const userId = await getUserIdByEmail(newMemberEmail);
      
      // Temporär deaktiviert - echte Implementierung erforderlich
      throw new Error('Funktion noch nicht implementiert');
      setNewMemberEmail('');
      toast.success('Mitglied wurde zum Kanal hinzugefügt');
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Mitglieds:', error);
      toast.error('Das Mitglied konnte nicht hinzugefügt werden');
    }
  };
  
  const handleRemoveMember = async (userId: string) => {
    try {
      await onRemoveMember(channel.id, userId);
      toast.success('Mitglied wurde aus dem Kanal entfernt');
    } catch (error) {
      console.error('Fehler beim Entfernen des Mitglieds:', error);
      toast.error('Das Mitglied konnte nicht entfernt werden');
    }
  };
  
  const handleUnpinMessage = async (messageId: string) => {
    try {
      const success = await onPinMessage(messageId, false);
      if (success) {
        toast.success('Nachricht wurde gelöst');
      }
    } catch (error) {
      console.error('Fehler beim Lösen der Nachricht:', error);
      toast.error('Die Nachricht konnte nicht gelöst werden');
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-1">
            <div className="hidden sm:block mr-1">#</div>
            <span>Info</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Mitglieder</span>
            <span className="sm:hidden">({members.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pinned" className="flex items-center gap-1">
            <Pin className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Angeheftet</span>
            <span className="sm:hidden">({pinnedMessages.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 mt-4">
          {editMode ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="channel-name">Kanalname</Label>
                <Input
                  id="channel-name"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Kanalname eingeben"
                />
              </div>
              
              <div>
                <Label htmlFor="channel-description">Beschreibung</Label>
                <Textarea
                  id="channel-description"
                  value={channelDescription}
                  onChange={(e) => setChannelDescription(e.target.value)}
                  placeholder="Beschreibung des Kanals (optional)"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setChannelName(channel.name);
                    setChannelDescription(channel.description || '');
                    setEditMode(false);
                  }}
                  disabled={isUpdating}
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={isUpdating || !channelName.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Kanalname</h3>
                <p className="text-muted-foreground">{channel.name}</p>
              </div>
              
              {channel.description && (
                <div>
                  <h3 className="text-sm font-medium">Beschreibung</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{channel.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium">Erstellt am</h3>
                <p className="text-muted-foreground">
                  {new Date(channel.created_at || '').toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Öffentlicher Kanal</h3>
                <p className="text-muted-foreground">
                  {channel.is_public ? 'Ja' : 'Nein'}
                </p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={() => setEditMode(true)}
                  variant="outline"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Bearbeiten
                </Button>
                
                <Button variant="outline">
                  {isNotificationsMuted() ? (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Aktivieren
                    </>
                  ) : (
                    <>
                      <BellOff className="mr-2 h-4 w-4" />
                      Stummschalten
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="E-Mail-Adresse eingeben" 
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            <Button onClick={handleAddMember} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Hinzufügen
            </Button>
          </div>
          
          <Separator />
          
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-2">
              {members.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {member.profiles?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.profiles?.full_name || 'Unbekannt'}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.role === 'owner' ? 'Besitzer' : 'Mitglied'}
                      </p>
                    </div>
                  </div>
                  
                  {member.role !== 'owner' && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="pinned" className="space-y-4 mt-4">
          {pinnedMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pin className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>Keine angehefteten Nachrichten</p>
              <p className="text-sm">Wichtige Nachrichten können angeheftet werden, um sie leichter zu finden.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {pinnedMessages.map((message) => (
                  <div 
                    key={message.id}
                    className="relative p-3 border rounded-md hover:bg-muted/50"
                  >
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleUnpinMessage(message.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1">
                      Angeheftet am {new Date(message.updated_at || '').toLocaleDateString()}
                    </p>
                    
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelInfoDialog;
