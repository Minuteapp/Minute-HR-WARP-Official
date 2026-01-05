import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Phone, 
  MessageSquare, 
  Monitor,
  Link2,
  Zap,
  Moon,
  Clock,
  Sparkles,
  Volume2,
  Send,
  Shield,
  MessageCircle,
  CheckSquare,
  Briefcase,
  FileCheck,
  Calendar,
  FileText,
  Users
} from "lucide-react";
import { useState } from "react";

const NotificationSettings = () => {
  const [activeChannel, setActiveChannel] = useState("email");

  const channels = [
    { id: "inapp", icon: Bell, label: "In-App" },
    { id: "email", icon: Mail, label: "E-Mail" },
    { id: "push", icon: Smartphone, label: "Push" },
    { id: "sms", icon: Phone, label: "SMS" },
    { id: "slack", icon: MessageSquare, label: "Slack" },
    { id: "teams", icon: Monitor, label: "Teams" },
    { id: "webhook", icon: Link2, label: "Webhook" },
  ];

  const notificationTypes = [
    { id: "system", icon: Shield, label: "System", description: "E-Mail bei system", enabled: true, color: "bg-green-100" },
    { id: "chat", icon: MessageCircle, label: "Chat & Nachrichten", description: "E-Mail bei chat & nachrichten", enabled: true, color: "bg-green-100" },
    { id: "tasks", icon: CheckSquare, label: "Aufgaben", description: "E-Mail bei aufgaben", enabled: true, color: "bg-green-100" },
    { id: "projects", icon: Briefcase, label: "Projekte", description: "E-Mail bei projekte", enabled: false, color: "bg-gray-100" },
    { id: "workflows", icon: FileCheck, label: "Freigaben & Workflows", description: "E-Mail bei freigaben & workflows", enabled: true, color: "bg-green-100" },
    { id: "calendar", icon: Calendar, label: "Kalender & Termine", description: "E-Mail bei kalender & termine", enabled: true, color: "bg-green-100" },
    { id: "documents", icon: FileText, label: "Dokumente", description: "E-Mail bei dokumente", enabled: false, color: "bg-gray-100" },
    { id: "team", icon: Users, label: "Team & Personal", description: "E-Mail bei team & personal", enabled: true, color: "bg-green-100" },
    { id: "ai", icon: Sparkles, label: "KI-Insights & Analysen", description: "E-Mail bei ki-insights & analysen", enabled: true, color: "bg-green-100" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Schnelleinstellungen */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Schnelleinstellungen</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Moon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <Label className="font-semibold">Nicht stören</Label>
                  <p className="text-xs text-muted-foreground">Alle Benachrichtigungen pausieren</p>
                </div>
              </div>
              <Switch />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Label className="font-semibold">Stille Stunden</Label>
                  <p className="text-xs text-muted-foreground">20:00 - 08:00 Uhr</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <Label className="font-semibold">KI-Priorisierung</Label>
                  <p className="text-xs text-muted-foreground">Intelligente Sortierung</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Volume2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <Label className="font-semibold">Benachrichtigungston</Label>
                  <p className="text-xs text-muted-foreground">Akustisches Signal</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        </div>
      </div>

      {/* Benachrichtigungskanäle */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Benachrichtigungskanäle</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Konfigurieren Sie alle Kommunikationskanäle für Ihre Benachrichtigungen
        </p>
        
        <div className="grid grid-cols-7 gap-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isActive = activeChannel === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-background hover:bg-accent'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {channel.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* E-Mail Benachrichtigungen */}
      {activeChannel === "email" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">E-Mail Benachrichtigungen</h2>
              <p className="text-sm text-muted-foreground">Benachrichtigungen per E-Mail versenden</p>
            </div>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Test senden
            </Button>
          </div>

          {/* E-Mail Konfiguration */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">E-Mail Konfiguration</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Versand-Modus</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Täglich - Morgens 8:00 Uhr</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Absender-Name</Label>
                    <Input defaultValue="MINUTE Notifications" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Template-Stil</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                    <span className="text-sm">Modern & Minimalistisch</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benachrichtigungstypen */}
          <div className="space-y-3">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <Label className="font-semibold">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={type.enabled} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Push Benachrichtigungen */}
      {activeChannel === "push" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Push Benachrichtigungen</h2>
              <p className="text-sm text-muted-foreground">Benachrichtigungen auf Desktop und Mobilgeräten</p>
            </div>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Test senden
            </Button>
          </div>

          {/* Push Konfiguration */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Push Konfiguration</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="font-semibold">Desktop Benachrichtigungen</Label>
                    <p className="text-xs text-muted-foreground">System-Benachrichtigungen anzeigen</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Benachrichtigungston</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                    <span className="text-sm">⚠️ Standard</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Badge-Zähler</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                    <span className="text-sm">Nur ungelesene anzeigen</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benachrichtigungstypen */}
          <div className="space-y-3 mb-6">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <Label className="font-semibold">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">Push bei {type.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={type.enabled} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Eskalationsregeln */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold">Eskalationsregeln</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Automatische Benachrichtigungs-Eskalation bei fehlender Reaktion
            </p>

            <div className="space-y-3">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Wenn nach 15 Minuten nicht gelesen</Label>
                      <p className="text-xs text-muted-foreground">Aktion: E-Mail senden</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">15 Min</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Wenn nach 1 Stunde nicht bearbeitet</Label>
                      <p className="text-xs text-muted-foreground">Aktion: SMS + Push senden</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">60 Min</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Kritische Benachrichtigungen</Label>
                      <p className="text-xs text-muted-foreground">Aktion: Alle Kanäle sofort</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Sofort</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* SMS Benachrichtigungen */}
      {activeChannel === "sms" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">SMS Benachrichtigungen</h2>
              <p className="text-sm text-muted-foreground">Kritische Benachrichtigungen per SMS</p>
            </div>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Test senden
            </Button>
          </div>

          {/* SMS Konfiguration */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">SMS Konfiguration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Mobilnummer</Label>
                  <Input defaultValue="+49 170 1234567" placeholder="+49" />
                  <p className="text-xs text-muted-foreground mt-1">Ihre Nummer für SMS-Benachrichtigungen</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">SMS Provider</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                    <span className="text-sm">Twilio</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hinweis */}
          <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-yellow-50 border border-yellow-200">
            <span className="text-yellow-600 mt-0.5">⚠️</span>
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Hinweis:</strong> SMS-Benachrichtigungen werden nur für kritische Ereignisse verwendet. Kosten: ~€0.08 pro SMS
              </p>
            </div>
          </div>

          {/* Benachrichtigungstypen */}
          <div className="space-y-3 mb-6">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              const isOrange = ['system', 'chat', 'workflows', 'calendar'].includes(type.id);
              return (
                <Card key={type.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isOrange ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-5 w-5 ${isOrange ? 'text-orange-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <Label className="font-semibold">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">SMS bei {type.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={isOrange} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Eskalationsregeln */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold">Eskalationsregeln</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Automatische Benachrichtigungs-Eskalation bei fehlender Reaktion
            </p>

            <div className="space-y-3">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Wenn nach 15 Minuten nicht gelesen</Label>
                      <p className="text-xs text-muted-foreground">Aktion: E-Mail senden</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">15 Min</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Wenn nach 1 Stunde nicht bearbeitet</Label>
                      <p className="text-xs text-muted-foreground">Aktion: SMS + Push senden</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">60 Min</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Kritische Benachrichtigungen</Label>
                      <p className="text-xs text-muted-foreground">Aktion: Alle Kanäle sofort</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Sofort</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Slack Integration */}
      {activeChannel === "slack" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Slack Integration</h2>
              <p className="text-sm text-muted-foreground">Benachrichtigungen in Slack-Channels posten</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                <CheckSquare className="h-4 w-4 mr-2" />
                Verbunden
              </Button>
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Test senden
              </Button>
            </div>
          </div>

          {/* Slack Konfiguration */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Slack Konfiguration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Workspace</Label>
                  <Input defaultValue="minute-hr" disabled className="bg-muted" />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Standard Channel</Label>
                  <Input defaultValue="#notifications" />
                  <p className="text-xs text-muted-foreground mt-1">Channel für allgemeine Benachrichtigungen</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Nachrichtenformat</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                    <span className="text-sm">Rich Blocks (mit Buttons)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benachrichtigungstypen */}
          <div className="space-y-3">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <Label className="font-semibold">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">In Slack bei {type.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={type.enabled} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Microsoft Teams Integration */}
      {activeChannel === "teams" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Microsoft Teams Integration</h2>
              <p className="text-sm text-muted-foreground">Benachrichtigungen in Teams-Channels posten</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                <CheckSquare className="h-4 w-4 mr-2" />
                Verbunden
              </Button>
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Test senden
              </Button>
            </div>
          </div>

          {/* Teams Konfiguration */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Teams Konfiguration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Webhook URL</Label>
                  <Input 
                    defaultValue="https://outlook.office.com/webhook/..." 
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Incoming Webhook URL für Ihren Teams Channel</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Kartentyp</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                    <span className="text-sm">Adaptive Card (empfohlen)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label className="font-semibold">Erwähnungen aktivieren</Label>
                    <p className="text-xs text-muted-foreground">@mentions in Benachrichtigungen</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benachrichtigungstypen */}
          <div className="space-y-3 mb-6">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Label className="font-semibold">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">In Teams bei {type.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={type.enabled} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Eskalationsregeln */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold">Eskalationsregeln</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Automatische Benachrichtigungs-Eskalation bei fehlender Reaktion
            </p>

            <div className="space-y-3 mb-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Wenn nach 15 Minuten nicht gelesen</Label>
                      <p className="text-xs text-muted-foreground">Aktion: E-Mail senden</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">15 Min</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Wenn nach 1 Stunde nicht bearbeitet</Label>
                      <p className="text-xs text-muted-foreground">Aktion: SMS + Push senden</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">60 Min</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <Label className="font-semibold">Kritische Benachrichtigungen</Label>
                      <p className="text-xs text-muted-foreground">Aktion: Alle Kanäle sofort</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Sofort</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </div>

            <Button variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Neue Regel hinzufügen
            </Button>
          </div>
        </div>
      )}

      {/* Webhook Integration */}
      {activeChannel === "webhook" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Webhook Integration</h2>
              <p className="text-sm text-muted-foreground">Benachrichtigungen an externe Systeme senden</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                <CheckSquare className="h-4 w-4 mr-2" />
                Aktiv
              </Button>
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Test senden
              </Button>
            </div>
          </div>

          {/* Webhook Konfiguration */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Webhook Konfiguration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Webhook URL</Label>
                  <Input 
                    defaultValue="https://api.yourcompany.com/notifications" 
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Endpoint für POST-Requests</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Secret Key (optional)</Label>
                  <Input 
                    type="password"
                    defaultValue="sk_test_51234567890abcdef"
                    placeholder="Geheimer Schlüssel"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Für HMAC-SHA256 Signaturverifizierung</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Methode</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                      <span className="text-sm">POST</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Content-Type</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                      <span className="text-sm">application/json</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Custom Headers (JSON)</Label>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-lg border bg-background font-mono text-sm"
                    defaultValue={`{
  "Authorization": "Bearer token",
  "X-Custom-Header": "value"
}`}
                  />
                </div>

                {/* Payload Format Info */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-blue-600 mt-0.5">ℹ️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Payload Format</p>
                      <p className="text-xs text-blue-800 mb-3">
                        Benachrichtigungen werden als JSON mit folgender Struktur gesendet:
                      </p>
                      <pre className="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto">
{`{
  "event": "notification.created",
  "type": "task",
  "priority": "high",
  "title": "...",
  "description": "...",
  "timestamp": "2025-10-13T16:30:00Z",
  "user": { ... },
  "metadata": { ... }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benachrichtigungstypen */}
          <div className="space-y-3">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <Label className="font-semibold">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">Webhook bei {type.label.toLowerCase()}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={type.enabled} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
