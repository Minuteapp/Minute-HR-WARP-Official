import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatContainer from '@/components/chat/ChatContainer';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Star, 
  Bell, 
  Archive,
  ChevronLeft,
  Languages,
  Settings,
  RotateCcw,
  File,
  FileText,
  Image,
  Phone,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { HRChatbot } from '@/components/ai/HRChatbot';
import AIChat from '@/components/ai/AIChat';
import { useChatArchive } from '@/hooks/useChatArchive';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const chatCategories = [
  {
    title: "Alle Chats",
    icon: MessageSquare,
    value: "all",
    description: "Übersicht aller Konversationen"
  },
  {
    title: "Direkte Nachrichten",
    icon: Users,
    value: "direct",
    description: "Private Unterhaltungen"
  },
  {
    title: "Wichtige Nachrichten",
    icon: Star,
    value: "starred",
    description: "Markierte wichtige Chats"
  },
  {
    title: "Erwähnungen",
    icon: Bell,
    value: "mentions",
    description: "Ihre Erwähnungen"
  },
  {
    title: "Anrufe",
    icon: Phone,
    value: "calls",
    description: "Anrufverlauf"
  },
  {
    title: "Dateien",
    icon: File,
    value: "files",
    description: "Geteilte Dateien"
  },
  {
    title: "Archiv",
    icon: Archive,
    value: "archive",
    description: "Archivierte Konversationen"
  }
];

const AllChatsPage = () => {
  const [currentTab, setCurrentTab] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useRolePermissions();
  const params = useParams();
  const { archivedChannels, loading: archiveLoading, restoreChannel } = useChatArchive();

  useEffect(() => {
    const tab = params.tab || 'all';
    if (chatCategories.some(cat => cat.value === tab)) {
      setCurrentTab(tab.toString());
    }
  }, [params]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    navigate(`/chat/${value}`);
  };

  const handleBackToLegacy = () => {
    navigate('/chat');
  };

  const handleLanguageSettings = () => {
    toast({
      title: "Spracheinstellungen",
      description: "Hier können Sie die Anzeigesprache und Übersetzungsoptionen anpassen."
    });
  };

  const handleRestore = async (archiveId: string, channelName: string) => {
    try {
      await restoreChannel(archiveId);
      toast({
        title: 'Kanal wiederhergestellt',
        description: `Der Kanal "${channelName}" wurde aus dem Archiv wiederhergestellt.`
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Kanal konnte nicht wiederhergestellt werden.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleBackToLegacy} className="shadow-sm hover:shadow">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Chat</h1>
              <p className="text-muted-foreground">
                Kommunizieren Sie mit Ihren Kollegen und Teams
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLanguageSettings} className="shadow-sm hover:shadow-md transition-shadow">
              <Languages className="h-4 w-4 mr-2" />
              Sprache
            </Button>
            {isAdmin && (
              <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
                <Settings className="h-4 w-4 mr-2" />
                Einstellungen
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 flex flex-wrap shadow-md rounded-xl">
            {chatCategories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="flex items-center gap-1 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
              >
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6 min-h-[600px]">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Chat-Konversationen</h3>
                    <p className="text-muted-foreground text-sm">
                      Hier werden Ihre Chat-Nachrichten angezeigt
                    </p>
                  </div>
                  <ChatContainer />
                </Card>
              </div>
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <HRChatbot />
                  <AIChat />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="direct" className="m-0">
            <Card className="p-6 min-h-[600px]">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Direkte Nachrichten</h3>
                <p className="text-muted-foreground text-sm">
                  Ihre privaten Unterhaltungen
                </p>
              </div>
              <ChatContainer />
            </Card>
          </TabsContent>

          <TabsContent value="starred" className="m-0">
            <Card className="p-8 text-center shadow-lg border-primary/10 hover:shadow-xl transition-shadow rounded-xl min-h-[400px] flex flex-col justify-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Wichtige Nachrichten</h3>
              <p className="text-muted-foreground mb-4">Markierte wichtige Chats</p>
              <Button onClick={() => toast({
                title: "Funktion in Entwicklung",
                description: "Die Wichtige Nachrichten-Ansicht wird in Kürze verfügbar sein."
              })} className="shadow hover:shadow-md mx-auto">
                Anzeigen
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="mentions" className="m-0">
            <Card className="p-8 text-center shadow-lg border-primary/10 hover:shadow-xl transition-shadow rounded-xl min-h-[400px] flex flex-col justify-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Erwähnungen</h3>
              <p className="text-muted-foreground mb-4">Ihre Erwähnungen</p>
              <Button onClick={() => toast({
                title: "Funktion in Entwicklung",
                description: "Die Erwähnungen-Ansicht wird in Kürze verfügbar sein."
              })} className="shadow hover:shadow-md mx-auto">
                Anzeigen
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="calls" className="m-0">
            <Card className="p-6 min-h-[400px]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Anrufe</h3>
                <p className="text-muted-foreground text-sm">
                  Ihr Anrufverlauf
                </p>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h4 className="text-lg font-medium mb-2">Anruffunktion in Entwicklung</h4>
                <p className="text-muted-foreground max-w-md">
                  Telefon- und Videoanrufe werden in einer zukünftigen Version verfügbar sein. 
                  Dies erfordert eine WebRTC-Integration.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="m-0">
            <Card className="p-6 min-h-[400px]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Geteilte Dateien</h3>
                <p className="text-muted-foreground text-sm">
                  Alle Dateien aus Ihren Chats
                </p>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Image className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <File className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h4 className="text-lg font-medium mb-2">Funktion in Entwicklung</h4>
                <p className="text-muted-foreground max-w-md">
                  Eine globale Datei-Übersicht über alle Chats wird in Kürze verfügbar sein.
                  Aktuell können Sie Dateien in den einzelnen Chat-Details einsehen.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="archive" className="m-0">
            <Card className="p-6 min-h-[400px]">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Archivierte Kanäle</h3>
                <p className="text-muted-foreground text-sm">
                  Wiederherstellung archivierter Konversationen
                </p>
              </div>
              
              {archiveLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : archivedChannels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">Keine archivierten Kanäle</h4>
                  <p className="text-muted-foreground max-w-md">
                    Wenn Sie einen Kanal archivieren, erscheint er hier und kann wiederhergestellt werden.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {archivedChannels.map((archive) => (
                    <div 
                      key={archive.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Archive className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {archive.channel?.name || 'Unbenannter Kanal'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Archiviert am {format(new Date(archive.archive_date), 'dd.MM.yyyy', { locale: de })}
                            {archive.message_count && ` • ${archive.message_count} Nachrichten`}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestore(archive.id, archive.channel?.name || 'Kanal')}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Wiederherstellen
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AllChatsPage;
