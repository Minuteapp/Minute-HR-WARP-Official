import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  BellOff, 
  Clock, 
  Sparkles, 
  Volume2, 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Slack, 
  Users, 
  Webhook,
  Shield,
  MessageCircle,
  CheckSquare,
  Briefcase,
  FileCheck,
  Calendar,
  FileText,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Send,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const { toast } = useToast();
  const [activeChannel, setActiveChannel] = useState('in-app');
  
  // Quick Settings
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [quietHours, setQuietHours] = useState(true);
  const [aiPrioritization, setAiPrioritization] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);

  // In-App Categories
  const [categories, setCategories] = useState({
    system: true,
    chat: true,
    tasks: true,
    projects: true,
    approvals: true,
    calendar: true,
    documents: true,
    ai: true,
  });

  // Escalation Rules
  const [escalationRules, setEscalationRules] = useState({
    unread15: true,
    unprocessed60: true,
    critical: true,
  });

  // Advanced Settings
  const [advancedSettings, setAdvancedSettings] = useState({
    showPreview: true,
    groupSimilar: true,
    weekendMode: false,
    autoArchive: true,
  });

  const channels = [
    { id: 'in-app', label: 'In-App', icon: <Bell className="h-4 w-4" /> },
    { id: 'email', label: 'E-Mail', icon: <Mail className="h-4 w-4" /> },
    { id: 'push', label: 'Push', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'sms', label: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'slack', label: 'Slack', icon: <Slack className="h-4 w-4" /> },
    { id: 'teams', label: 'Teams', icon: <Users className="h-4 w-4" /> },
    { id: 'webhook', label: 'Webhook', icon: <Webhook className="h-4 w-4" /> },
  ];

  const categoryList = [
    {
      id: 'system',
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      label: 'System',
      priority: 'high',
      description: 'Kritische Systembenachrichtigungen und Security-Alerts',
    },
    {
      id: 'chat',
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
      label: 'Chat & Nachrichten',
      priority: 'normal',
      description: 'Direkte Nachrichten, Erwähnungen und Gruppenchats',
    },
    {
      id: 'tasks',
      icon: <CheckSquare className="h-5 w-5 text-blue-500" />,
      label: 'Aufgaben',
      priority: 'high',
      description: 'Aufgabenzuweisungen, Deadlines und Statusänderungen',
    },
    {
      id: 'projects',
      icon: <Briefcase className="h-5 w-5 text-blue-500" />,
      label: 'Projekte',
      priority: 'normal',
      description: 'Projekt-Updates, Meilensteine und Änderungen',
    },
    {
      id: 'approvals',
      icon: <FileCheck className="h-5 w-5 text-blue-500" />,
      label: 'Freigaben & Workflows',
      priority: 'high',
      description: 'Genehmigungsanfragen, Workflows und Eskalationen',
    },
    {
      id: 'calendar',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      label: 'Kalender & Termine',
      priority: 'normal',
      description: 'Meetings, Erinnerungen und Terminänderungen',
    },
    {
      id: 'documents',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      label: 'Dokumente',
      priority: 'low',
      description: 'Dokumentenfreigaben, Uploads und Kommentare',
    },
    {
      id: 'ai',
      icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
      label: 'KI-Insights & Analysen',
      priority: 'high',
      description: 'Intelligente Warnungen, Vorhersagen und Empfehlungen',
    },
  ];

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Benachrichtigungseinstellungen wurden erfolgreich aktualisiert.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Einstellungen zurückgesetzt",
      description: "Alle Einstellungen wurden auf die Standardwerte zurückgesetzt.",
    });
  };

  const handleTestNotification = () => {
    toast({
      title: "Test-Benachrichtigung gesendet",
      description: "Eine Test-Benachrichtigung wurde an alle aktiven Kanäle gesendet.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold">Benachrichtigungseinstellungen</h2>
            <p className="text-sm text-muted-foreground">
              Konfigurieren Sie alle Benachrichtigungskanäle und -regeln für Ihre Organisation
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Send className="h-4 w-4 text-blue-500" />
                <span>Heute gesendet</span>
              </div>
              <p className="text-2xl font-bold">1247</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Zustellrate</span>
              </div>
              <p className="text-2xl font-bold">98.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Schnelleinstellungen</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BellOff className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Nicht stören</p>
                  <p className="text-sm text-muted-foreground">Alle Benachrichtigungen pausieren</p>
                </div>
              </div>
              <Switch checked={doNotDisturb} onCheckedChange={setDoNotDisturb} />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Stille Stunden</p>
                  <p className="text-sm text-muted-foreground">20:00 - 08:00 Uhr</p>
                </div>
              </div>
              <Switch checked={quietHours} onCheckedChange={setQuietHours} />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">KI-Priorisierung</p>
                  <p className="text-sm text-muted-foreground">Intelligente Sortierung</p>
                </div>
              </div>
              <Switch checked={aiPrioritization} onCheckedChange={setAiPrioritization} />
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Volume2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Benachrichtigungston</p>
                  <p className="text-sm text-muted-foreground">Akustisches Signal</p>
                </div>
              </div>
              <Switch checked={notificationSound} onCheckedChange={setNotificationSound} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <div>
        <h3 className="font-semibold mb-3">Benachrichtigungskanäle</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Konfigurieren Sie alle Kommunikationskanäle für Ihre Benachrichtigungen
        </p>

        {/* Channel Tabs */}
        <div className="flex gap-2 mb-6 bg-muted p-1 rounded-lg">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeChannel === channel.id
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
            >
              {channel.icon}
              <span className="text-sm font-medium">{channel.label}</span>
            </button>
          ))}
        </div>

        {/* In-App Notifications */}
        {activeChannel === 'in-app' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">In-App Benachrichtigungen</h4>
                  <p className="text-sm text-muted-foreground">Benachrichtigungen direkt in der Anwendung</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  Test senden
                </Button>
              </div>

              <div className="space-y-3">
                {categoryList.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {category.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{category.label}</p>
                          {category.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">Hohe Priorität</Badge>
                          )}
                          {category.priority === 'normal' && (
                            <Badge variant="secondary" className="text-xs">Normal</Badge>
                          )}
                          {category.priority === 'low' && (
                            <Badge variant="outline" className="text-xs">Niedrig</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={categories[category.id]}
                      onCheckedChange={(checked) =>
                        setCategories({ ...categories, [category.id]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* E-Mail Notifications */}
        {activeChannel === 'email' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">E-Mail Benachrichtigungen</h4>
                  <p className="text-sm text-muted-foreground">Benachrichtigungen per E-Mail versenden</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  Test senden
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-800 mb-3">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">E-Mail Konfiguration</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Versand-Modus</Label>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Täglich • Morgens 8:00 Uhr</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Template-Stil</Label>
                      <select className="w-full mt-2 p-2 border rounded-md text-sm">
                        <option>Modern & Minimalistisch</option>
                        <option>Klassisch</option>
                        <option>Corporate</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Absender-Name</Label>
                      <input 
                        type="text" 
                        defaultValue="MINUTE Notifications"
                        className="w-full mt-2 p-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">System</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei system</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Chat & Nachrichten</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei chat & nachrichten</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Aufgaben</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei aufgaben</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Projekte</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei projekte</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Freigaben & Workflows</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei freigaben & workflows</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Kalender & Termine</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei kalender & termine</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">Dokumente</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei dokumente</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Team & Personal</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei team & personal</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">KI-Insights & Analysen</p>
                        <p className="text-xs text-muted-foreground">E-Mail bei ki-insights & analysen</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Push Notifications */}
        {activeChannel === 'push' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Push Benachrichtigungen</h4>
                  <p className="text-sm text-muted-foreground">Benachrichtigungen auf Desktop und Mobilgeräten</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  Test senden
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-purple-800 mb-3">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">Push Konfiguration</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-md">
                      <span className="text-sm font-medium">Desktop Benachrichtigungen</span>
                      <span className="text-sm text-muted-foreground">System-Benachrichtigungen anzeigen</span>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Benachrichtigungston</Label>
                      <select className="w-full mt-2 p-2 border rounded-md bg-white text-sm">
                        <option>Standard</option>
                        <option>Chime</option>
                        <option>Alert</option>
                        <option>Stumm</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Badge-Zähler</Label>
                      <p className="text-xs text-muted-foreground mt-1 mb-2">Nur ungelesene anzeigen</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">System</p>
                        <p className="text-xs text-muted-foreground">Push bei system</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Chat & Nachrichten</p>
                        <p className="text-xs text-muted-foreground">Push bei chat & nachrichten</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Aufgaben</p>
                        <p className="text-xs text-muted-foreground">Push bei aufgaben</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Projekte</p>
                        <p className="text-xs text-muted-foreground">Push bei projekte</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Freigaben & Workflows</p>
                        <p className="text-xs text-muted-foreground">Push bei freigaben & workflows</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Kalender & Termine</p>
                        <p className="text-xs text-muted-foreground">Push bei kalender & termine</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">Dokumente</p>
                        <p className="text-xs text-muted-foreground">Push bei dokumente</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Team & Personal</p>
                        <p className="text-xs text-muted-foreground">Push bei team & personal</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">KI-Insights & Analysen</p>
                        <p className="text-xs text-muted-foreground">Push bei ki-insights & analysen</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SMS Notifications */}
        {activeChannel === 'sms' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">SMS Benachrichtigungen</h4>
                  <p className="text-sm text-muted-foreground">Kritische Benachrichtigungen per SMS</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  Test senden
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-orange-800 mb-3">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">SMS Konfiguration</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Mobilnummer</Label>
                      <input 
                        type="text" 
                        defaultValue="+49 170 1234567"
                        className="w-full mt-2 p-2 border rounded-md text-sm"
                        placeholder="Ihre Nummer für SMS-Benachrichtigungen"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">SMS Provider</Label>
                      <select className="w-full mt-2 p-2 border rounded-md bg-white text-sm">
                        <option>Twilio</option>
                        <option>Amazon SNS</option>
                        <option>Vonage</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      <span className="font-semibold">Hinweis:</span> SMS-Benachrichtigungen werden nur für kritische Ereignisse verwendet. Kosten: ~€0.08 pro SMS
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">System</p>
                        <p className="text-xs text-muted-foreground">SMS bei system</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Chat & Nachrichten</p>
                        <p className="text-xs text-muted-foreground">SMS bei chat & nachrichten</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Aufgaben</p>
                        <p className="text-xs text-muted-foreground">SMS bei aufgaben</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Projekte</p>
                        <p className="text-xs text-muted-foreground">SMS bei projekte</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Freigaben & Workflows</p>
                        <p className="text-xs text-muted-foreground">SMS bei freigaben & workflows</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Kalender & Termine</p>
                        <p className="text-xs text-muted-foreground">SMS bei kalender & termine</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">Dokumente</p>
                        <p className="text-xs text-muted-foreground">SMS bei dokumente</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Team & Personal</p>
                        <p className="text-xs text-muted-foreground">SMS bei team & personal</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">KI-Insights & Analysen</p>
                        <p className="text-xs text-muted-foreground">SMS bei ki-insights & analysen</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slack Notifications */}
        {activeChannel === 'slack' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Slack Integration</h4>
                  <p className="text-sm text-muted-foreground">Benachrichtigungen in Slack-Channels posten</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700 hover:text-white border-green-600">
                    Verbunden
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleTestNotification}>
                    <Send className="h-4 w-4 mr-2" />
                    Test senden
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-purple-800 mb-3">
                    <Slack className="h-4 w-4" />
                    <span className="font-medium">Slack Konfiguration</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Workspace</Label>
                      <input 
                        type="text" 
                        defaultValue="minute-hr"
                        className="w-full mt-2 p-2 border rounded-md text-sm"
                        disabled
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Standard Channel</Label>
                      <input 
                        type="text" 
                        defaultValue="#notifications"
                        className="w-full mt-2 p-2 border rounded-md text-sm"
                        placeholder="Channel für allgemeine Benachrichtigungen"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Nachrichtenformat</Label>
                      <select className="w-full mt-2 p-2 border rounded-md bg-white text-sm">
                        <option>Rich Blocks (mit Buttons)</option>
                        <option>Einfacher Text</option>
                        <option>Markdown</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">System</p>
                        <p className="text-xs text-muted-foreground">In Slack bei system</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Chat & Nachrichten</p>
                        <p className="text-xs text-muted-foreground">In Slack bei chat & nachrichten</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Aufgaben</p>
                        <p className="text-xs text-muted-foreground">In Slack bei aufgaben</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Projekte</p>
                        <p className="text-xs text-muted-foreground">In Slack bei projekte</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Freigaben & Workflows</p>
                        <p className="text-xs text-muted-foreground">In Slack bei freigaben & workflows</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Kalender & Termine</p>
                        <p className="text-xs text-muted-foreground">In Slack bei kalender & termine</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">Dokumente</p>
                        <p className="text-xs text-muted-foreground">In Slack bei dokumente</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Team & Personal</p>
                        <p className="text-xs text-muted-foreground">In Slack bei team & personal</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">KI-Insights & Analysen</p>
                        <p className="text-xs text-muted-foreground">In Slack bei ki-insights & analysen</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teams Notifications */}
        {activeChannel === 'teams' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Microsoft Teams Integration</h4>
                  <p className="text-sm text-muted-foreground">Benachrichtigungen in Teams-Channels posten</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600">
                    Verbunden
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleTestNotification}>
                    <Send className="h-4 w-4 mr-2" />
                    Test senden
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-800 mb-3">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Teams Konfiguration</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Webhook URL</Label>
                      <input 
                        type="text" 
                        defaultValue="https://outlook.office.com/webhook/..."
                        className="w-full mt-2 p-2 border rounded-md text-sm"
                        placeholder="Incoming Webhook URL für Ihren Teams Channel"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Kartentyp</Label>
                      <select className="w-full mt-2 p-2 border rounded-md bg-white text-sm">
                        <option>Adaptive Card (empfohlen)</option>
                        <option>Message Card</option>
                        <option>Hero Card</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-md">
                      <span className="text-sm font-medium">Erwähnungen aktivieren</span>
                      <span className="text-sm text-muted-foreground">@mentions in Benachrichtigungen</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">System</p>
                        <p className="text-xs text-muted-foreground">In Teams bei system</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Chat & Nachrichten</p>
                        <p className="text-xs text-muted-foreground">In Teams bei chat & nachrichten</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Aufgaben</p>
                        <p className="text-xs text-muted-foreground">In Teams bei aufgaben</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Projekte</p>
                        <p className="text-xs text-muted-foreground">In Teams bei projekte</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Freigaben & Workflows</p>
                        <p className="text-xs text-muted-foreground">In Teams bei freigaben & workflows</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Kalender & Termine</p>
                        <p className="text-xs text-muted-foreground">In Teams bei kalender & termine</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">Dokumente</p>
                        <p className="text-xs text-muted-foreground">In Teams bei dokumente</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Team & Personal</p>
                        <p className="text-xs text-muted-foreground">In Teams bei team & personal</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Webhook Notifications */}
        {activeChannel === 'webhook' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Webhook Integration</h4>
                  <p className="text-sm text-muted-foreground">Benachrichtigungen an externe Systeme senden</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700 hover:text-white border-green-600">
                    Aktiv
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleTestNotification}>
                    <Send className="h-4 w-4 mr-2" />
                    Test senden
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-800 mb-3">
                    <Webhook className="h-4 w-4" />
                    <span className="font-medium">Webhook Konfiguration</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Webhook URL</Label>
                      <input 
                        type="text" 
                        defaultValue="https://api.yourcompany.com/notifications"
                        className="w-full mt-2 p-2 border rounded-md text-sm"
                        placeholder="Endpoint für POST-Requests"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Secret Key (optional)</Label>
                      <input 
                        type="password" 
                        defaultValue="••••••••••••••••"
                        className="w-full mt-2 p-2 border rounded-md text-sm"
                        placeholder="Für HMAC-SHA256 Signaturverifizierung"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium">Methode</Label>
                        <select className="w-full mt-2 p-2 border rounded-md bg-white text-sm">
                          <option>POST</option>
                          <option>PUT</option>
                          <option>PATCH</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content-Type</Label>
                        <select className="w-full mt-2 p-2 border rounded-md bg-white text-sm">
                          <option>application/json</option>
                          <option>application/x-www-form-urlencoded</option>
                          <option>multipart/form-data</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Custom Headers (JSON)</Label>
                      <Textarea 
                        defaultValue={`{
  "Authorization": "Bearer token",
  "X-Custom-Header": "*value*"
}`}
                        className="w-full mt-2 font-mono text-xs"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Payload Format</span>
                  </div>
                  <p className="text-xs text-blue-800 mb-3">
                    Benachrichtigungen werden als JSON mit folgender Struktur gesendet:
                  </p>
                  <Textarea 
                    defaultValue={`{
  "event": "notification.created",
  "priority": "high",
  "title": "...",
  "message": "...",
  "timestamp": "2025-10-18T12:35:48+00:00",
  "user": { ... }
}`}
                    className="w-full font-mono text-xs bg-white"
                    rows={9}
                    disabled
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">System</p>
                        <p className="text-xs text-muted-foreground">Webhook bei system</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Chat & Nachrichten</p>
                        <p className="text-xs text-muted-foreground">Webhook bei chat & nachrichten</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Aufgaben</p>
                        <p className="text-xs text-muted-foreground">Webhook bei aufgaben</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Projekte</p>
                        <p className="text-xs text-muted-foreground">Webhook bei projekte</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Freigaben & Workflows</p>
                        <p className="text-xs text-muted-foreground">Webhook bei freigaben & workflows</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Kalender & Termine</p>
                        <p className="text-xs text-muted-foreground">Webhook bei kalender & termine</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">Dokumente</p>
                        <p className="text-xs text-muted-foreground">Webhook bei dokumente</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Escalation Rules */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Eskalationsregeln</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Automatische Benachrichtigungs-Eskalation bei fehlender Reaktion
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Wenn nach 15 Minuten nicht gelesen</p>
                  <p className="text-sm text-muted-foreground">Aktion: E-Mail senden</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">15 Min</span>
                <Switch
                  checked={escalationRules.unread15}
                  onCheckedChange={(checked) =>
                    setEscalationRules({ ...escalationRules, unread15: checked })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Wenn nach 1 Stunde nicht bearbeitet</p>
                  <p className="text-sm text-muted-foreground">Aktion: SMS + Push senden</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">60 Min</span>
                <Switch
                  checked={escalationRules.unprocessed60}
                  onCheckedChange={(checked) =>
                    setEscalationRules({ ...escalationRules, unprocessed60: checked })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Kritische Benachrichtigungen</p>
                  <p className="text-sm text-muted-foreground">Aktion: Alle Kanäle sofort</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Sofort</span>
                <Switch
                  checked={escalationRules.critical}
                  onCheckedChange={(checked) =>
                    setEscalationRules({ ...escalationRules, critical: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Neue Regel hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Benachrichtigungsstatistik</h3>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Gesendet (heute)</p>
              <p className="text-3xl font-bold mb-1">1247</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs. gestern
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Zustellrate</p>
              <p className="text-3xl font-bold mb-2">98.5%</p>
              <Progress value={98.5} className="h-2" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Ø Reaktionszeit</p>
              <p className="text-3xl font-bold mb-1">4.2 min</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                15% schneller
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Ungelesen</p>
              <p className="text-3xl font-bold mb-2">12%</p>
              <Progress value={12} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Erweiterte Einstellungen</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Vorschau anzeigen</p>
                <p className="text-sm text-muted-foreground">Inhalte in Benachrichtigungen</p>
              </div>
              <Switch
                checked={advancedSettings.showPreview}
                onCheckedChange={(checked) =>
                  setAdvancedSettings({ ...advancedSettings, showPreview: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Ähnliche gruppieren</p>
                <p className="text-sm text-muted-foreground">KI-Zusammenfassung</p>
              </div>
              <Switch
                checked={advancedSettings.groupSimilar}
                onCheckedChange={(checked) =>
                  setAdvancedSettings({ ...advancedSettings, groupSimilar: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Wochenend-Modus</p>
                <p className="text-sm text-muted-foreground">Nur Dringendes</p>
              </div>
              <Switch
                checked={advancedSettings.weekendMode}
                onCheckedChange={(checked) =>
                  setAdvancedSettings({ ...advancedSettings, weekendMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Auto-Archivierung</p>
                <p className="text-sm text-muted-foreground">Nach 30 Tagen</p>
              </div>
              <Switch
                checked={advancedSettings.autoArchive}
                onCheckedChange={(checked) =>
                  setAdvancedSettings({ ...advancedSettings, autoArchive: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Auf Standard zurücksetzen
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Vorschau</Button>
          <Button onClick={handleSave}>
            Änderungen speichern
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
