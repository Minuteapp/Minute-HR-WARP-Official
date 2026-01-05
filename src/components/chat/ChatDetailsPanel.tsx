import { X, Bell, Archive, UserPlus, Languages, Edit, LogOut, Phone, Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguagePreferences } from "@/hooks/useLanguagePreferences";
import { useChatArchive } from "@/hooks/useChatArchive";
import { useChannelSettings } from "@/hooks/useChannelSettings";
import { CommandHistoryPanel } from "./CommandHistoryPanel";
import { useToast } from "@/hooks/use-toast";
import ChannelFilesPanel from "./ChannelFilesPanel";
import { useState } from "react";
import { useChannelMembers } from "@/hooks/useChannelMembers";
import EditChannelDialog from "./EditChannelDialog";

interface ChatDetailsPanelProps {
  channelName: string;
  memberCount: number;
  members: any[];
  channelId: string;
  channelDescription?: string;
  onClose: () => void;
}

export default function ChatDetailsPanel({ 
  channelName, 
  memberCount, 
  members, 
  channelId, 
  channelDescription,
  onClose 
}: ChatDetailsPanelProps) {
  const { preference, updateLanguage, toggleAutoTranslate } = useLanguagePreferences();
  const { archiveChannel } = useChatArchive();
  const { settings, updateSetting } = useChannelSettings(channelId);
  const { toast } = useToast();
  const { members: channelMembers, loading: membersLoading, leaveChannel, deleteChannel, canDeleteChannel } = useChannelMembers(channelId);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Prüfen ob Benutzer löschen darf
  useState(() => {
    canDeleteChannel().then(setCanDelete);
  });

  const handleLeaveChannel = async () => {
    try {
      await leaveChannel();
      toast({ 
        title: 'Kanal verlassen',
        description: 'Du hast den Kanal erfolgreich verlassen.'
      });
      onClose();
    } catch (error) {
      toast({ 
        title: 'Fehler',
        description: 'Kanal konnte nicht verlassen werden.',
        variant: 'destructive'
      });
    }
  };

  const handleCall = (type: 'phone' | 'video') => {
    toast({
      title: 'Funktion in Entwicklung',
      description: `${type === 'phone' ? 'Telefon' : 'Video'}-Anrufe werden in Kürze verfügbar sein.`,
    });
  };

  return (
    <div className="w-96 border-l bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Details</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleCall('phone')} title="Anrufen">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleCall('video')} title="Videoanruf">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Channel Info */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-primary">
                {channelName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h4 className="font-semibold text-lg">{channelName}</h4>
            <p className="text-sm text-muted-foreground">{memberCount} Mitglieder</p>
          </div>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members">Mitglieder</TabsTrigger>
              <TabsTrigger value="files">Dateien</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold">Mitglieder ({channelMembers.length})</h5>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Hinzufügen
                </Button>
              </div>

              {membersLoading ? (
                <div className="text-center text-muted-foreground py-4">Laden...</div>
              ) : channelMembers.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">Keine Mitglieder</div>
              ) : (
                <div className="space-y-2">
                  {channelMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.user?.full_name?.substring(0, 2).toUpperCase() || 
                             member.user?.username?.substring(0, 2).toUpperCase() || 
                             '?'}
                          </AvatarFallback>
                        </Avatar>
                        {member.user?.presence?.status === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {member.user?.full_name || member.user?.username || 'Unbekannt'}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <ChannelFilesPanel channelId={channelId} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Benachrichtigungen Sektion */}
              <div>
                <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Benachrichtigungen
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <div className="text-sm font-medium">Alle Nachrichten</div>
                      <div className="text-xs text-muted-foreground">
                        Bei jeder neuen Nachricht benachrichtigen
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notify_all} 
                      onCheckedChange={(value) => updateSetting('notify_all', value)} 
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <div className="text-sm font-medium">Nur Erwähnungen</div>
                      <div className="text-xs text-muted-foreground">
                        Nur bei @Erwähnungen benachrichtigen
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notify_mentions} 
                      onCheckedChange={(value) => updateSetting('notify_mentions', value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Kanal-Einstellungen */}
              <div className="border-t pt-6">
                <h5 className="text-sm font-semibold mb-3">Kanal-Einstellungen</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="text-sm font-medium">An Seitenleiste anheften</div>
                    <Switch 
                      checked={settings.pinned} 
                      onCheckedChange={(value) => updateSetting('pinned', value)} 
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="text-sm font-medium">Thread-Benachrichtigungen</div>
                    <Switch 
                      checked={settings.thread_notifications} 
                      onCheckedChange={(value) => updateSetting('thread_notifications', value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Übersetzungen */}
              <div className="border-t pt-6">
                <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Übersetzungen
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="text-sm font-medium">Automatisch übersetzen</div>
                    <Switch 
                      checked={preference?.auto_translate || false}
                      onCheckedChange={toggleAutoTranslate}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Bevorzugte Sprache</div>
                    <Select 
                      value={preference?.language || 'de'} 
                      onValueChange={updateLanguage}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Kanal verwalten */}
              <div className="border-t pt-6">
                <h5 className="text-sm font-semibold mb-3">Kanal verwalten</h5>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Kanal bearbeiten
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={async () => {
                      try {
                        await archiveChannel(channelId, 'Manuell archiviert');
                        toast({ 
                          title: 'Kanal archiviert',
                          description: 'Der Kanal wurde erfolgreich archiviert.'
                        });
                        onClose();
                      } catch (error) {
                        toast({ 
                          title: 'Fehler',
                          description: 'Kanal konnte nicht archiviert werden.',
                          variant: 'destructive'
                        });
                      }
                    }}
                  >
                    <Archive className="w-4 h-4" />
                    Kanal archivieren
                  </Button>
                </div>
              </div>

              {/* Command-Historie */}
              <div className="border-t pt-6">
                <h5 className="text-sm font-semibold mb-3">Command-Historie</h5>
                <CommandHistoryPanel />
              </div>

              {/* Gefahrenzone */}
              <div className="border-t pt-6 border-destructive/20">
                <h5 className="text-sm font-semibold mb-3 text-destructive">Gefahrenzone</h5>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={handleLeaveChannel}
                  >
                    <LogOut className="w-4 h-4" />
                    Kanal verlassen
                  </Button>
                  
                  {canDelete && (
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start gap-2"
                      disabled={isDeleting}
                      onClick={async () => {
                        if (!confirm('Bist du sicher, dass du diesen Kanal löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                          return;
                        }
                        setIsDeleting(true);
                        try {
                          await deleteChannel();
                          toast({ 
                            title: 'Kanal gelöscht',
                            description: 'Der Kanal wurde erfolgreich gelöscht.'
                          });
                          onClose();
                        } catch (error) {
                          toast({ 
                            title: 'Fehler',
                            description: error instanceof Error ? error.message : 'Kanal konnte nicht gelöscht werden.',
                            variant: 'destructive'
                          });
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Wird gelöscht...' : 'Kanal löschen'}
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Edit Channel Dialog */}
      <EditChannelDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        channelId={channelId}
        channelName={channelName}
        channelDescription={channelDescription}
      />
    </div>
  );
}
