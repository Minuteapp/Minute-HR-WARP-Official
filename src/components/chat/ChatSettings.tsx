
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Moon, 
  Download, 
  Lock, 
  LayoutGrid,
  Star,
  X,
  Check
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSettings = ({ isOpen, onClose }: ChatSettingsProps) => {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [messagesPerPage, setMessagesPerPage] = useState(50);

  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [compactViewEnabled, setCompactViewEnabled] = useState(false);
  
  const handleSaveSettings = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Chat-Einstellungen wurden aktualisiert."
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-lg shadow-lg transition-all ${isOpen ? 'scale-100' : 'scale-95'} w-full max-w-xl max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Chat-Einstellungen</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="notifications" className="px-4 py-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
            <TabsTrigger value="appearance">Darstellung</TabsTrigger>
            <TabsTrigger value="privacy">Privatsphäre</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="notifications" className="space-y-4 pb-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">Benachrichtigungen & Alarme</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Bell className="w-4 h-4 mr-2 text-primary" />
                      <Label htmlFor="notifications">Benachrichtigungen</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Benachrichtigungen für neue Nachrichten</p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 mr-2 text-primary" />
                      ) : (
                        <VolumeX className="w-4 h-4 mr-2 text-primary" />
                      )}
                      <Label htmlFor="sound">Benachrichtigungston</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Ton bei neuen Nachrichten</p>
                  </div>
                  <Switch 
                    id="sound" 
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Moon className="w-4 h-4 mr-2 text-primary" />
                      <Label htmlFor="dnd">Nicht stören</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Alle Benachrichtigungen pausieren</p>
                  </div>
                  <Switch 
                    id="dnd" 
                    checked={doNotDisturb}
                    onCheckedChange={setDoNotDisturb}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="messagesPerPage">Anzahl der Nachrichten pro Seite</Label>
                  <Input 
                    id="messagesPerPage" 
                    type="number" 
                    value={messagesPerPage} 
                    onChange={(e) => setMessagesPerPage(parseInt(e.target.value))}
                    min={10}
                    max={200}
                  />
                </div>
                
                <h3 className="font-medium text-sm text-gray-500 mt-6 mb-2">Benachrichtigungen für Chats</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="important" />
                    <Label htmlFor="important">Nur wichtige Chats</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mentions" defaultChecked />
                    <Label htmlFor="mentions">Nur Erwähnungen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="all" />
                    <Label htmlFor="all">Alle Nachrichten</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4 pb-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">Darstellung & Layout</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <LayoutGrid className="w-4 h-4 mr-2 text-primary" />
                      <Label htmlFor="compactView">Kompakte Ansicht</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Mehr Nachrichten auf einen Blick</p>
                  </div>
                  <Switch 
                    id="compactView" 
                    checked={compactViewEnabled}
                    onCheckedChange={setCompactViewEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Farbschema</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Card className="cursor-pointer border-primary">
                      <CardContent className="p-2 flex justify-center items-center h-12 bg-primary/5">
                        <div className="w-4 h-4 rounded-full bg-primary" />
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer">
                      <CardContent className="p-2 flex justify-center items-center h-12">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer">
                      <CardContent className="p-2 flex justify-center items-center h-12">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Schriftgröße</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">Klein</Button>
                    <Button variant="default" size="sm">Mittel</Button>
                    <Button variant="outline" size="sm">Groß</Button>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium text-sm text-gray-500 mt-6 mb-2">Chat-Vorschau</h3>
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <Badge>Vorschau</Badge>
                  <span className="text-xs text-gray-500">10:30</span>
                </div>
                <div className="flex justify-end mb-2">
                  <div className="bg-primary text-white px-3 py-2 rounded-lg max-w-[80%]">
                    <p className={`${compactViewEnabled ? 'text-sm' : 'text-base'}`}>Hallo! Wie geht es dir heute?</p>
                  </div>
                </div>
                <div className="flex mb-2">
                  <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg max-w-[80%]">
                    <p className={`${compactViewEnabled ? 'text-sm' : 'text-base'}`}>Mir geht es gut, danke der Nachfrage!</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4 pb-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">Sicherheit & Datenschutz</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-primary" />
                      <Label htmlFor="encryption">Ende-zu-Ende-Verschlüsselung</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Mehr Sicherheit für Ihre Nachrichten</p>
                  </div>
                  <Switch 
                    id="encryption" 
                    checked={encryptionEnabled}
                    onCheckedChange={setEncryptionEnabled}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-2 text-primary" />
                      <Label htmlFor="autoDownload">Automatischer Download</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Medien automatisch herunterladen</p>
                  </div>
                  <Switch 
                    id="autoDownload" 
                    checked={autoDownloadEnabled}
                    onCheckedChange={setAutoDownloadEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gesperrte Kontakte</Label>
                  <div className="space-y-2 border rounded-md p-3">
                    <div className="text-center text-gray-500 text-sm py-2">
                      Keine gesperrten Kontakte
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Datenschutz</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="readReceipts" defaultChecked />
                      <Label htmlFor="readReceipts">Lesebestätigungen senden</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="onlineStatus" defaultChecked />
                      <Label htmlFor="onlineStatus">Online-Status anzeigen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="typingIndicator" defaultChecked />
                      <Label htmlFor="typingIndicator">Tippindikator anzeigen</Label>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: "Chat-Verlauf exportiert",
                      description: "Ihr Chat-Verlauf wurde exportiert."
                    });
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Chat-Verlauf exportieren
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSaveSettings}>
            <Check className="mr-2 h-4 w-4" />
            Speichern
          </Button>
        </div>
      </div>
    </div>
  );
};
