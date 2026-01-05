import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Settings, 
  UserPlus, 
  Info, 
  Archive, 
  Trash2, 
  Bot, 
  Users,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Channel } from '@/types/chat';

interface ChatSettingsMenuProps {
  channel: Channel;
  onDeleteChannel?: (channelId: string) => void;
  onArchiveChannel?: (channelId: string) => void;
  onInviteUsers?: (channelId: string) => void;
}

const ChatSettingsMenu: React.FC<ChatSettingsMenuProps> = ({
  channel,
  onDeleteChannel,
  onArchiveChannel,
  onInviteUsers
}) => {
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const { toast } = useToast();

  const handleDeleteChannel = () => {
    if (onDeleteChannel) {
      onDeleteChannel(channel.id);
    }
    toast({
      title: "Chat gelöscht",
      description: `${channel.name} wurde erfolgreich gelöscht.`,
    });
  };

  const handleArchiveChannel = () => {
    if (onArchiveChannel) {
      onArchiveChannel(channel.id);
    }
    toast({
      title: "Chat archiviert",
      description: `${channel.name} wurde erfolgreich archiviert.`,
    });
  };

  const handleInviteUsers = () => {
    if (onInviteUsers) {
      onInviteUsers(channel.id);
    }
    toast({
      title: "Einladung versendet",
      description: "Benutzer wurden erfolgreich eingeladen.",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={() => setShowInfoDialog(true)}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            Chat-Informationen anzeigen
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowAIDialog(true)}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            KI-Zusammenfassung
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleInviteUsers}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Benutzer einladen
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Chat-Einstellungen
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleArchiveChannel}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Chat archivieren
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleDeleteChannel}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Chat löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Chat-Informationen Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat-Informationen
            </DialogTitle>
            <DialogDescription>
              Details und Einstellungen für {channel.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Grundinformationen */}
            <div className="space-y-3">
              <h3 className="font-medium">Grundinformationen</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{channel.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Typ:</span>
                  <p className="font-medium">
                    <Badge variant="outline">
                       {channel.type === 'direct' ? 'Direktnachricht' : 
                        channel.is_public ? 'Öffentlich' : 
                        channel.type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Erstellt:</span>
                  <p className="font-medium">
                    {new Date(channel.created_at).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sichtbarkeit:</span>
                  <p className="font-medium">
                    {channel.is_public ? 'Öffentlich' : 'Privat'}
                  </p>
                </div>
              </div>
              
              {channel.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Beschreibung:</span>
                  <p className="text-sm mt-1">{channel.description}</p>
                </div>
              )}
            </div>

            {/* Mitglieder */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mitglieder
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aktive Mitglieder:</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Administratoren:</span>
                  <span className="font-medium">1</span>
                </div>
              </div>
            </div>

            {/* Aktivität */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Aktivität
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nachrichten heute:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Letzte Aktivität:</span>
                  <span className="font-medium">vor 5 Minuten</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* KI-Zusammenfassung Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              KI-Zusammenfassung
            </DialogTitle>
            <DialogDescription>
              Automatisch generierte Zusammenfassung der letzten Unterhaltungen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Zusammenfassung */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Gesprächsthemen (letzte 24h)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Diskussion über das neue Dashboard-Design</li>
                <li>• Integration von KI-Features wurde besprochen</li>
                <li>• Automatische Projektbenachrichtigungen implementiert</li>
              </ul>
            </div>

            {/* Wichtige Nachrichten */}
            <div className="space-y-3">
              <h4 className="font-medium">Wichtige Erkenntnisse</h4>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">Entscheidung</Badge>
                    <span className="text-xs text-muted-foreground">vor 2 Stunden</span>
                  </div>
                  <p className="text-sm">Das neue Design wurde von allen Teammitgliedern genehmigt.</p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">Aufgabe</Badge>
                    <span className="text-xs text-muted-foreground">vor 1 Stunde</span>
                  </div>
                  <p className="text-sm">KI-Features sollen bis Freitag implementiert werden.</p>
                </div>
              </div>
            </div>

            {/* Aktionsempfehlungen */}
            <div className="space-y-3">
              <h4 className="font-medium">KI-Empfehlungen</h4>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Basierend auf der Unterhaltung könnten folgende Aktionen hilfreich sein:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-700">
                  <li>• Ein Projektboard für das Dashboard-Design erstellen</li>
                  <li>• Deadline-Erinnerung für KI-Features einrichten</li>
                  <li>• Statusmeeting für nächste Woche planen</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatSettingsMenu;