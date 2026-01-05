import { useState } from "react";
import { Bell, Users, FileText, Star, Download, Plus, Sparkles, Search, MessageSquare, MoreHorizontal, Settings, Brain, Languages, Zap, TrendingUp, Shield, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  type: 'direct' | 'group' | 'public';
  status?: string;
  position?: string;
  email?: string;
  phone?: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: string;
  type?: 'text' | 'file' | 'image';
  fileName?: string;
  fileUrl?: string;
}

interface DetailsSidebarProps {
  contact: Contact | undefined;
  messages?: Message[];
  isMobile?: boolean;
}

export function DetailsSidebar({ contact, messages = [], isMobile = false }: DetailsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [importContactsModal, setImportContactsModal] = useState(false);
  const [aiSettingsModal, setAiSettingsModal] = useState(false);
  const [aiTranslationEnabled, setAiTranslationEnabled] = useState(true);
  const [smartRepliesEnabled, setSmartRepliesEnabled] = useState(true);
  const [sentimentAnalysisEnabled, setSentimentAnalysisEnabled] = useState(true);
  const [advancedAiModal, setAdvancedAiModal] = useState(false);

  const notifications = [
    {
      id: '1',
      user: 'Ankit',
      action: 'hat Sie erwähnt in',
      context: '"Projekt Reise"',
      time: 'vor 1 Min',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '2',
      user: 'Prakash Singh',
      action: 'hat Sie zur Gruppe hinzugefügt',
      context: '"Studium"',
      time: 'vor 2 Min',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '3',
      user: 'Anirudh',
      action: 'hat Sie aus der Gruppe entfernt',
      context: '"Fahrer"',
      time: 'vor 5 Min',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '4',
      user: 'Amit',
      action: 'hat Sie erwähnt im',
      context: 'öffentlichen Chat',
      time: 'vor 8 Min',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '5',
      user: 'Ankita',
      action: 'hat Sie erwähnt in',
      context: '"College Gang"',
      time: 'vor 10 Min',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    {
      id: '6',
      user: 'Vikash Singh',
      action: 'hat Sie zur Gruppe hinzugefügt',
      context: '"Designer"',
      time: 'vor 12 Min',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    }
  ];

  const handleSearchMessages = () => {
    if (!searchQuery.trim()) {
      toast.error("Bitte geben Sie einen Suchbegriff ein");
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      const results = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
      
      if (results.length > 0) {
        toast.success(`${results.length} Nachrichten gefunden`);
      } else {
        toast.error("Keine Nachrichten gefunden");
      }
    }, 1000);
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.error("Keine Nachrichten zum Exportieren vorhanden");
      return;
    }
    
    const chatData = {
      contact: contact?.name,
      messages: messages,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${contact?.name.replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Chat wurde erfolgreich exportiert!");
  };

  const handleImportContacts = () => {
    setImportContactsModal(true);
  };

  const fileMessages = messages.filter(msg => msg.type === 'file');

  return (
    <div className={`${isMobile ? 'w-full' : 'w-80'} bg-card ${!isMobile ? 'border-l border-border' : ''} flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Details & Tools</h2>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
            onClick={handleImportContacts}
          >
            <Plus className="w-3 h-3" />
            <span>Import</span>
          </Button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Aktuelle Benachrichtigungen</h3>
        </div>
        
        {/* Notifications List */}
        <div className={`space-y-3 ${isMobile ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3">
              <Avatar className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                <AvatarImage src={notification.avatar} alt={notification.user} />
                <AvatarFallback>{notification.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground`}>
                  <span className="font-medium">@{notification.user}</span> {notification.action}{' '}
                  <span className="font-medium">{notification.context}</span>
                </p>
                <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details & AI Features */}
      {contact && (
        <div className="flex-1 p-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className={`grid w-full grid-cols-4 bg-muted mb-4 ${isMobile ? 'h-10' : ''}`}>
              <TabsTrigger value="info" className={`text-xs ${isMobile ? 'p-1 flex flex-col' : 'p-2'}`}>
                <Users className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                {isMobile && <span className="text-[10px] mt-1">Info</span>}
              </TabsTrigger>
              <TabsTrigger value="search" className={`text-xs ${isMobile ? 'p-1 flex flex-col' : 'p-2'}`}>
                <Search className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                {isMobile && <span className="text-[10px] mt-1">Suche</span>}
              </TabsTrigger>
              <TabsTrigger value="files" className={`text-xs ${isMobile ? 'p-1 flex flex-col' : 'p-2'}`}>
                <Download className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                {isMobile && <span className="text-[10px] mt-1">Dateien</span>}
              </TabsTrigger>
              <TabsTrigger value="ai" className={`text-xs ${isMobile ? 'p-1 flex flex-col' : 'p-2'}`}>
                <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                {isMobile && <span className="text-[10px] mt-1">KI</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{contact.position || 'Team Member'}</p>
                    
                    <div className="space-y-3 text-left">
                      {contact.email && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-Mail</label>
                          <p className="text-sm text-foreground">{contact.email}</p>
                        </div>
                      )}
                      {contact.phone && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefon</label>
                          <p className="text-sm text-foreground">{contact.phone}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                        <p className="text-sm text-foreground">{contact.status || 'Online'}</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleExportChat}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      Chat exportieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Nachrichten durchsuchen..." 
                          className="pl-10"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchMessages()}
                          disabled={isSearching}
                        />
                      </div>
                      <Button 
                        onClick={handleSearchMessages}
                        disabled={isSearching || !searchQuery.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSearching ? '...' : <Search className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    {searchResults.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        <h4 className="text-sm font-medium">Suchergebnisse ({searchResults.length})</h4>
                        {searchResults.map((result) => (
                          <div key={result.id} className="p-2 bg-muted rounded text-sm">
                            <p className="font-medium text-xs text-muted-foreground">{result.sender} - {result.timestamp}</p>
                            <p className="text-foreground">{result.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery && !isSearching ? (
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Keine Ergebnisse gefunden</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Suchen Sie in {messages.length} Nachrichten</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  {fileMessages.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Geteilte Dateien ({fileMessages.length})</h4>
                      {fileMessages.map((msg) => (
                        <div key={msg.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
                          <Download className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{msg.fileName}</p>
                            <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Download className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Keine geteilten Dateien</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>KI-Assistenten</span>
                      </h4>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>KI-Einstellungen</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setAiSettingsModal(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            KI-Features konfigurieren
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAdvancedAiModal(true)}>
                            <Brain className="w-4 h-4 mr-2" />
                            Erweiterte KI-Funktionen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast.success("KI-Modell wird aktualisiert...")}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Modell aktualisieren
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("KI-Verlauf wird gelöscht...")}>
                            <Shield className="w-4 h-4 mr-2" />
                            KI-Verlauf löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => toast.success("Nachrichtenzusammenfassung wird erstellt...")}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat zusammenfassen
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => toast.success("KI-Übersetzung aktiviert")}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Auto-Übersetzung
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => toast.success("Smart Reply Vorschläge werden generiert...")}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Smart Replies
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-700">
                        <strong>Stimmungsanalyse:</strong> Freundlich und kollaborativ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Import Contacts Modal */}
      <Dialog open={importContactsModal} onOpenChange={setImportContactsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Kontakte & Daten importieren</span>
            </DialogTitle>
            <DialogDescription>
              Erweitern Sie Ihre Chat-Anwendung durch Import von Kontakten, Chat-Verläufen und Einstellungen aus verschiedenen Quellen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="contacts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="contacts">Kontakte</TabsTrigger>
                <TabsTrigger value="chats">Chat-Verläufe</TabsTrigger>
                <TabsTrigger value="settings">Einstellungen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contacts" className="mt-4 space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("📊 247 Kontakte aus CSV importiert!", {
                      description: "Alle Kontakte wurden erfolgreich hinzugefügt"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">CSV/Excel-Datei</div>
                    <div className="text-xs text-muted-foreground">Importiert Namen, E-Mails, Positionen</div>
                  </div>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("🔗 Google Kontakte werden synchronisiert...", {
                      description: "OAuth-Authentifizierung wird gestartet"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Google Workspace</div>
                    <div className="text-xs text-muted-foreground">Synchronisiert mit Google Kontakte</div>
                  </div>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("📧 Outlook-Integration wird aktiviert...", {
                      description: "Microsoft Graph API-Verbindung wird hergestellt"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <Users className="w-4 h-4 mr-2 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">Microsoft Outlook</div>
                    <div className="text-xs text-muted-foreground">Importiert Outlook-Kontakte und Teams</div>
                  </div>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("🏢 LDAP-Verzeichnis wird durchsucht...", {
                      description: "Unternehmens-Verzeichnis wird abgerufen"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Unternehmens-LDAP</div>
                    <div className="text-xs text-muted-foreground">Alle Mitarbeiter aus dem AD importieren</div>
                  </div>
                </Button>
              </TabsContent>
              
              <TabsContent value="chats" className="mt-4 space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("💬 WhatsApp-Chats werden importiert...", {
                      description: "Chat-Verläufe werden konvertiert und importiert"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">WhatsApp Business</div>
                    <div className="text-xs text-muted-foreground">Importiert Chat-Verläufe und Medien</div>
                  </div>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("💻 Slack-Workspace wird migriert...", {
                      description: "Kanäle, Nachrichten und Dateien werden übertragen"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <Hash className="w-4 h-4 mr-2 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Slack Workspace</div>
                    <div className="text-xs text-muted-foreground">Migriert Kanäle und Direktnachrichten</div>
                  </div>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("🎯 Teams-Chats werden importiert...", {
                      description: "Microsoft Teams-Verläufe werden konvertiert"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Microsoft Teams</div>
                    <div className="text-xs text-muted-foreground">Importiert Team-Chats und Meetings</div>
                  </div>
                </Button>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-4 space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("⚙️ Backup-Datei wird wiederhergestellt...", {
                      description: "Alle Einstellungen werden importiert"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium">Backup-Datei</div>
                    <div className="text-xs text-muted-foreground">Stellt Einstellungen und Präferenzen wieder her</div>
                  </div>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("🎨 Design-Theme wird angewendet...", {
                      description: "Unternehmens-Branding wird aktiviert"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <Star className="w-4 h-4 mr-2 text-yellow-600" />
                  <div className="text-left">
                    <div className="font-medium">Corporate Design</div>
                    <div className="text-xs text-muted-foreground">Wendet Unternehmens-Theme an</div>
                  </div>
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    toast.success("🤖 KI-Modell wird konfiguriert...", {
                      description: "Benutzerdefinierte KI-Einstellungen werden geladen"
                    });
                    setImportContactsModal(false);
                  }}
                >
                  <Brain className="w-4 h-4 mr-2 text-indigo-600" />
                  <div className="text-left">
                    <div className="font-medium">KI-Konfiguration</div>
                    <div className="text-xs text-muted-foreground">Lädt gespeicherte KI-Einstellungen</div>
                  </div>
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Settings Modal */}
      <Dialog open={aiSettingsModal} onOpenChange={setAiSettingsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>KI-Features konfigurieren</span>
            </DialogTitle>
            <DialogDescription>
              Passen Sie die KI-Funktionen nach Ihren Bedürfnissen an.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-green-600" />
                  <span>Auto-Übersetzung</span>
                </h4>
                <p className="text-sm text-muted-foreground">Nachrichten automatisch übersetzen</p>
              </div>
              <Switch 
                checked={aiTranslationEnabled}
                onCheckedChange={setAiTranslationEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span>Smart Replies</span>
                </h4>
                <p className="text-sm text-muted-foreground">Intelligente Antwortvorschläge</p>
              </div>
              <Switch 
                checked={smartRepliesEnabled}
                onCheckedChange={setSmartRepliesEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Stimmungsanalyse</span>
                </h4>
                <p className="text-sm text-muted-foreground">Gesprächsstimmung analysieren</p>
              </div>
              <Switch 
                checked={sentimentAnalysisEnabled}
                onCheckedChange={setSentimentAnalysisEnabled}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setAiSettingsModal(false)}>
              Abbrechen
            </Button>
            <Button onClick={() => {
              toast.success("KI-Einstellungen wurden gespeichert!");
              setAiSettingsModal(false);
            }}>
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advanced AI Modal */}
      <Dialog open={advancedAiModal} onOpenChange={setAdvancedAiModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>Erweiterte KI-Funktionen</span>
            </DialogTitle>
            <DialogDescription>
              Professionelle KI-Tools für erweiterte Analyse und Automatisierung.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium">Gesprächsanalyse</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tiefgreifende Analyse von Gesprächsmustern und Kommunikationsstilen.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast.success("Gesprächsanalyse wird gestartet...")}
                  >
                    Analyse starten
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium">Produktivitäts-Insights</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Erhalten Sie Einblicke in Ihre Kommunikationseffizienz.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast.success("Produktivitäts-Report wird erstellt...")}
                  >
                    Report erstellen
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Languages className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium">Multi-Language Support</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unterstützung für über 50 Sprachen mit Kontexterkennung.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast.success("Sprachmodell wird konfiguriert...")}
                  >
                    Sprachen einrichten
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium">Compliance Check</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatische Überprüfung auf DSGVO und Unternehmensrichtlinien.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast.success("Compliance-Scan wird durchgeführt...")}
                  >
                    Scan starten
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}