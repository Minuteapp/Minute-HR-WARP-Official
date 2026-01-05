import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Bell, 
  Zap, 
  Shield,
  Layers,
  Users,
  Calendar,
  Star,
  CheckCircle
} from "lucide-react";

const integrations = [
  {
    title: "Performance & Feedback",
    description: "Verknüpfung mit Leistungsbewertungen",
    icon: Users,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    active: true
  },
  {
    title: "Innovation Hub",
    description: "Ideen aus Umfragen übernehmen",
    icon: Zap,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    active: true
  },
  {
    title: "Roadmap & Projekte",
    description: "Maßnahmen als Projekte anlegen",
    icon: Calendar,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    active: false
  },
  {
    title: "Compliance & ESG",
    description: "ESG-relevante Kennzahlen",
    icon: Shield,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    active: true
  }
];

export const SurveySettingsTab = () => {
  // General Settings
  const [anonymityLevel, setAnonymityLevel] = useState("full");
  const [minParticipants, setMinParticipants] = useState("5");
  const [defaultScale, setDefaultScale] = useState("1-5");
  const [multiLanguage, setMultiLanguage] = useState(true);

  // Reminder Settings
  const [autoReminders, setAutoReminders] = useState(true);
  const [firstReminderDays, setFirstReminderDays] = useState("3");
  const [reminderRepeat, setReminderRepeat] = useState("2");
  const [finalReminder, setFinalReminder] = useState(true);

  // AI Settings
  const [sentimentAnalysis, setSentimentAnalysis] = useState(true);
  const [topicClustering, setTopicClustering] = useState(true);
  const [riskDetection, setRiskDetection] = useState(true);
  const [actionSuggestions, setActionSuggestions] = useState(true);
  const [driverAnalysis, setDriverAnalysis] = useState(true);

  // Privacy Settings
  const [autoDeleteMonths, setAutoDeleteMonths] = useState("24");
  const [auditLogs, setAuditLogs] = useState(true);
  const [gdprCheck, setGdprCheck] = useState(true);

  // Notification Settings
  const [notifySurveyStarted, setNotifySurveyStarted] = useState(true);
  const [notifySurveyCompleted, setNotifySurveyCompleted] = useState(true);
  const [notifyCriticalResults, setNotifyCriticalResults] = useState(true);
  const [notifyOverdueActions, setNotifyOverdueActions] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">Konfigurieren Sie das Umfragen-Modul</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded bg-orange-100">
                <Settings className="h-4 w-4 text-orange-600" />
              </div>
              Allgemeine Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Standard-Anonymitätslevel</Label>
              <Select value={anonymityLevel} onValueChange={setAnonymityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Voll anonym</SelectItem>
                  <SelectItem value="pseudo">Pseudonymisiert</SelectItem>
                  <SelectItem value="open">Offen (namentlich)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mindestteilnehmerzahl</Label>
              <Input 
                type="number" 
                value={minParticipants} 
                onChange={(e) => setMinParticipants(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Standard-Skala</Label>
              <Select value={defaultScale} onValueChange={setDefaultScale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 Likert</SelectItem>
                  <SelectItem value="1-10">1-10 Skala</SelectItem>
                  <SelectItem value="nps">NPS (0-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Mehrsprachigkeit aktivieren</Label>
              <Switch checked={multiLanguage} onCheckedChange={setMultiLanguage} />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded bg-orange-100">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              Reminder-Logik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Automatische Erinnerungen</Label>
              <Switch checked={autoReminders} onCheckedChange={setAutoReminders} />
            </div>
            <div className="space-y-2">
              <Label>Erste Erinnerung nach (Tage)</Label>
              <Input 
                type="number" 
                value={firstReminderDays} 
                onChange={(e) => setFirstReminderDays(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Wiederholungen</Label>
              <Input 
                type="number" 
                value={reminderRepeat} 
                onChange={(e) => setReminderRepeat(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Abschlusserinnerung 24h vor Ende</Label>
              <Switch checked={finalReminder} onCheckedChange={setFinalReminder} />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded bg-orange-100">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
              KI-Funktionen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Sentiment-Analyse</Label>
              <Switch checked={sentimentAnalysis} onCheckedChange={setSentimentAnalysis} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Themen-Clustering</Label>
              <Switch checked={topicClustering} onCheckedChange={setTopicClustering} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Risikoerkennung</Label>
              <Switch checked={riskDetection} onCheckedChange={setRiskDetection} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Maßnahmenvorschläge</Label>
              <Switch checked={actionSuggestions} onCheckedChange={setActionSuggestions} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Treiberanalysen</Label>
              <Switch checked={driverAnalysis} onCheckedChange={setDriverAnalysis} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded bg-violet-100">
                <Shield className="h-4 w-4 text-violet-600" />
              </div>
              Datenschutz & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Automatische Löschung nach (Monate)</Label>
              <Input 
                type="number" 
                value={autoDeleteMonths} 
                onChange={(e) => setAutoDeleteMonths(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Zugriffsbeschränkungen</Label>
              <button className="text-red-600 hover:underline text-sm font-medium">Konfigurieren</button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Audit-Logs</Label>
              <Switch checked={auditLogs} onCheckedChange={setAuditLogs} />
            </div>
            <div className="flex items-center justify-between">
              <Label>DSGVO-Konformität prüfen</Label>
              <Switch checked={gdprCheck} onCheckedChange={setGdprCheck} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded bg-orange-100">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              Benachrichtigungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Umfrage gestartet</Label>
              <Switch checked={notifySurveyStarted} onCheckedChange={setNotifySurveyStarted} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Umfrage abgeschlossen</Label>
              <Switch checked={notifySurveyCompleted} onCheckedChange={setNotifySurveyCompleted} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Kritische Ergebnisse</Label>
              <Switch checked={notifyCriticalResults} onCheckedChange={setNotifyCriticalResults} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Maßnahmen überfällig</Label>
              <Switch checked={notifyOverdueActions} onCheckedChange={setNotifyOverdueActions} />
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded bg-violet-100">
                <Layers className="h-4 w-4 text-violet-600" />
              </div>
              Integrationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                <div className={`p-2 rounded ${integration.iconBg}`}>
                  <integration.icon className={`h-4 w-4 ${integration.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{integration.title}</p>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={integration.active ? "text-green-600 border-green-600" : "text-gray-400 border-gray-300"}
                >
                  {integration.active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline">Zurücksetzen</Button>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};
