
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sliders, Users, BarChart3, MessageSquare, Settings, Save, Plus, Trash2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { NotificationCategory } from "@/types/notifications";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const NotificationAdminPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  
  // Template-Formular
  const [templateName, setTemplateName] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [templateCategory, setTemplateCategory] = useState<NotificationCategory>("hr");
  const [templatePriority, setTemplatePriority] = useState("medium");
  
  // Template-Liste
  const [templates, setTemplates] = useState([
    { 
      id: "1", 
      name: "Urlaubsgenehmigung", 
      title: "Urlaub genehmigt", 
      content: "Dein Urlaubsantrag für den Zeitraum {startDate} bis {endDate} wurde genehmigt.",
      category: "hr",
      priority: "medium" 
    },
    { 
      id: "2", 
      name: "Neue Dokumente", 
      title: "Neue Dokumente verfügbar", 
      content: "Es wurden neue Dokumente zu deinem Profil hinzugefügt. Bitte überprüfe diese.",
      category: "system",
      priority: "low" 
    },
    { 
      id: "3", 
      name: "Dringende Aufgabe", 
      title: "Dringende Aufgabe", 
      content: "Dir wurde eine dringende Aufgabe mit Frist {dueDate} zugewiesen.",
      category: "task",
      priority: "high" 
    }
  ]);
  
  // Rollenbasierte Nachrichten
  const [roles, setRoles] = useState([
    { id: "1", name: "Administrator", hasAccess: true },
    { id: "2", name: "HR Manager", hasAccess: true },
    { id: "3", name: "Team Leader", hasAccess: true },
    { id: "4", name: "Employee", hasAccess: false },
    { id: "5", name: "Externe", hasAccess: false }
  ]);
  
  // Kanaleinstellungen
  const [channels, setChannels] = useState([
    { id: "in-app", name: "In-App", enabled: true, threshold: "all" },
    { id: "email", name: "E-Mail", enabled: true, threshold: "medium" },
    { id: "push", name: "Push", enabled: true, threshold: "high" },
    { id: "sms", name: "SMS", enabled: false, threshold: "high" },
    { id: "slack", name: "Slack", enabled: false, threshold: "high" }
  ]);
  
  // Statistiken
  const [stats, setStats] = useState({
    total: 1248,
    read: 876,
    unread: 372,
    byCategory: [
      { category: "system", count: 342 },
      { category: "hr", count: 287 },
      { category: "task", count: 421 },
      { category: "approval", count: 98 },
      { category: "calendar", count: 56 },
      { category: "security", count: 44 }
    ],
    byChannel: [
      { channel: "in-app", count: 1248 },
      { channel: "email", count: 876 },
      { channel: "push", count: 324 },
      { channel: "sms", count: 42 },
      { channel: "slack", count: 0 }
    ]
  });
  
  // Template-Verwaltung
  const addTemplate = () => {
    if (!templateName || !templateTitle || !templateContent) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive"
      });
      return;
    }
    
    setTemplates([
      ...templates, 
      {
        id: `${templates.length + 1}`,
        name: templateName,
        title: templateTitle,
        content: templateContent,
        category: templateCategory,
        priority: templatePriority
      }
    ]);
    
    // Formular zurücksetzen
    setTemplateName("");
    setTemplateTitle("");
    setTemplateContent("");
    setTemplateCategory("hr");
    setTemplatePriority("medium");
    
    toast({
      title: "Vorlage erstellt",
      description: "Die Benachrichtigungsvorlage wurde erfolgreich erstellt."
    });
  };
  
  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
    toast({
      title: "Vorlage gelöscht",
      description: "Die Benachrichtigungsvorlage wurde erfolgreich gelöscht."
    });
  };
  
  // Rollenbasierte Zugriffssteuerung
  const toggleRoleAccess = (id: string, hasAccess: boolean) => {
    setRoles(roles.map(role => 
      role.id === id ? { ...role, hasAccess } : role
    ));
  };
  
  // Kanaleinstellungen speichern
  const saveChannelSettings = () => {
    // Hier würde in einer echten App der API-Aufruf erfolgen
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Kanaleinstellungen wurden erfolgreich gespeichert."
    });
  };
  
  // Prioritätsstufen für Dropdown
  const priorities = [
    { value: "low", label: "Niedrig" },
    { value: "medium", label: "Mittel" },
    { value: "high", label: "Hoch" }
  ];
  
  // Kategorien für Dropdown
  const categories = [
    { value: "system", label: "System" },
    { value: "hr", label: "HR" },
    { value: "task", label: "Aufgaben" },
    { value: "approval", label: "Genehmigungen" },
    { value: "feedback", label: "Feedback" },
    { value: "calendar", label: "Kalender" },
    { value: "security", label: "Sicherheit" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Benachrichtigungen Administration</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Vorlagen</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Rollen</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Kanäle</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistiken</span>
          </TabsTrigger>
        </TabsList>

        {/* Vorlagen */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Neue Benachrichtigungsvorlage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Vorlagenname</Label>
                  <Input 
                    id="template-name" 
                    value={templateName} 
                    onChange={(e) => setTemplateName(e.target.value)} 
                    placeholder="z.B. Urlaubsgenehmigung"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-title">Benachrichtigungstitel</Label>
                  <Input 
                    id="template-title" 
                    value={templateTitle} 
                    onChange={(e) => setTemplateTitle(e.target.value)} 
                    placeholder="z.B. Urlaub genehmigt"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-content">Nachrichtentext</Label>
                  <Textarea 
                    id="template-content" 
                    value={templateContent} 
                    onChange={(e) => setTemplateContent(e.target.value)} 
                    placeholder="Nutze {variable} für dynamische Inhalte"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Verfügbare Variablen: {"{userName}"}, {"{startDate}"}, {"{endDate}"}, {"{dueDate}"}, {"{taskName}"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Kategorie</Label>
                    <Select 
                      value={templateCategory} 
                      onValueChange={(value) => setTemplateCategory(value as NotificationCategory)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-priority">Priorität</Label>
                    <Select 
                      value={templatePriority} 
                      onValueChange={setTemplatePriority}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priorität wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="w-full" onClick={addTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Vorlage erstellen
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vorhandene Vorlagen</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Priorität</TableHead>
                        <TableHead className="text-right">Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{categories.find(c => c.value === template.category)?.label || template.category}</TableCell>
                          <TableCell>
                            <Badge variant={template.priority === 'high' ? 'destructive' : template.priority === 'medium' ? 'default' : 'secondary'}>
                              {priorities.find(p => p.value === template.priority)?.label || template.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Rollen */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rollenbasierte Zugriffssteuerung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Lege hier fest, welche Rollen Zugriff auf die verschiedenen Benachrichtigungskategorien haben.
                </p>
                
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {role.hasAccess 
                            ? "Hat Zugriff auf alle Benachrichtigungskategorien" 
                            : "Hat eingeschränkten Zugriff auf Benachrichtigungen"}
                        </p>
                      </div>
                      <Switch 
                        checked={role.hasAccess} 
                        onCheckedChange={(checked) => toggleRoleAccess(role.id, checked)} 
                      />
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Kategoriespezifische Rolleneinstellungen</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {categories.map((category) => (
                      <Card key={category.value} className="p-4 border">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{category.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              Wähle Rollen für Kategorie {category.label}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Rollen verwalten
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Kanäle */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungskanäle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Konfiguriere hier, welche Benachrichtigungskanäle aktiviert sind und bei welcher Prioritätsstufe sie verwendet werden.
                </p>
                
                <div className="space-y-6">
                  {channels.map((channel) => (
                    <div key={channel.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`channel-${channel.id}`} className="font-medium">
                          {channel.name}
                        </Label>
                        <Switch 
                          id={`channel-${channel.id}`}
                          checked={channel.enabled} 
                          onCheckedChange={(checked) => {
                            setChannels(channels.map(c => 
                              c.id === channel.id ? { ...c, enabled: checked } : c
                            ));
                          }} 
                        />
                      </div>
                      
                      {channel.enabled && (
                        <div className="pl-6 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Minimale Priorität</Label>
                            <Select 
                              value={channel.threshold} 
                              onValueChange={(value) => {
                                setChannels(channels.map(c => 
                                  c.id === channel.id ? { ...c, threshold: value } : c
                                ));
                              }}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Alle Nachrichten</SelectItem>
                                <SelectItem value="low">Niedrig & höher</SelectItem>
                                <SelectItem value="medium">Mittel & höher</SelectItem>
                                <SelectItem value="high">Nur hohe Priorität</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {channel.id === 'email' && (
                            <div className="space-y-2">
                              <Label className="text-sm">
                                Maximale Anzahl E-Mails pro Tag
                              </Label>
                              <Input type="number" defaultValue="10" min="1" max="50" />
                            </div>
                          )}
                          
                          {channel.id === 'slack' && (
                            <div className="space-y-2">
                              <Label className="text-sm">Slack Webhook URL</Label>
                              <Input placeholder="https://hooks.slack.com/services/..." />
                            </div>
                          )}
                          
                          {channel.id === 'sms' && (
                            <div className="space-y-2">
                              <Label className="text-sm">Monatliches SMS-Limit</Label>
                              <Input type="number" defaultValue="50" min="0" />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {channel.id !== channels[channels.length-1].id && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
                
                <Button onClick={saveChannelSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Kanaleinstellungen speichern
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Statistiken */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Gesamt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Benachrichtigungen insgesamt</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Gelesen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.read}</div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((stats.read / stats.total) * 100)}% aller Benachrichtigungen
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ungelesen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.unread}</div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((stats.unread / stats.total) * 100)}% aller Benachrichtigungen
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byCategory.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {categories.find(c => c.value === item.category)?.label || item.category}
                        </span>
                        <span>{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${Math.round((item.count / stats.total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Nach Kanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byChannel.map((item) => (
                    <div key={item.channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {channels.find(c => c.id === item.channel)?.name || item.channel}
                        </span>
                        <span>{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${Math.round((item.count / stats.total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Badge Komponente
const Badge = ({ variant, children }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'default':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'secondary':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getVariantClasses()}`}>
      {children}
    </span>
  );
};

export default NotificationAdminPanel;
