import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Users, Zap, Shield } from "lucide-react";
import { toast } from "sonner";

const SupportSettingsTab = () => {
  const [notifications, setNotifications] = useState({
    newTickets: true,
    slaWarnings: true,
    criticalTickets: true,
    ticketUpdates: false,
  });

  const [automation, setAutomation] = useState({
    aiCategorization: true,
    similarTickets: true,
    knowledgeBaseSuggestions: true,
    autoResponses: false,
  });

  const [security, setSecurity] = useState({
    scanAttachments: true,
    encryptSensitiveData: true,
  });

  const [teamSettings, setTeamSettings] = useState({
    defaultAssignment: "auto-module",
    escalation: "team-lead",
  });

  const [dataRetention, setDataRetention] = useState("12");

  const handleSave = () => {
    toast.success("Einstellungen wurden gespeichert");
  };

  return (
    <div className="space-y-6">
      {/* Benachrichtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Bell className="w-5 h-5 text-muted-foreground" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Neue Tickets</p>
              <p className="text-sm text-muted-foreground">Benachrichtigung bei neuen Support-Tickets</p>
            </div>
            <Checkbox 
              checked={notifications.newTickets}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newTickets: !!checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SLA-Warnungen</p>
              <p className="text-sm text-muted-foreground">Warnung bei SLA-Risiko</p>
            </div>
            <Checkbox 
              checked={notifications.slaWarnings}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, slaWarnings: !!checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Kritische Tickets</p>
              <p className="text-sm text-muted-foreground">Sofortige Benachrichtigung bei kritischen Tickets</p>
            </div>
            <Checkbox 
              checked={notifications.criticalTickets}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, criticalTickets: !!checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ticket-Updates</p>
              <p className="text-sm text-muted-foreground">Benachrichtigung bei Ticket-Änderungen</p>
            </div>
            <Checkbox 
              checked={notifications.ticketUpdates}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, ticketUpdates: !!checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-Mail-Vorlagen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Mail className="w-5 h-5 text-muted-foreground" />
            E-Mail-Vorlagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <p className="font-medium text-sm">Ticket erstellt</p>
              <p className="text-sm text-muted-foreground mt-1">Bestätigung für Kunden nach Ticket-Erstellung</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <p className="font-medium text-sm">Ticket aktualisiert</p>
              <p className="text-sm text-muted-foreground mt-1">Benachrichtigung bei Status-Änderung</p>
            </div>
            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <p className="font-medium text-sm">Ticket gelöst</p>
              <p className="text-sm text-muted-foreground mt-1">Abschluss-Benachrichtigung mit Feedback-Anfrage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team & Zuweisungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Users className="w-5 h-5 text-muted-foreground" />
            Team & Zuweisungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Standard-Zuweisung für neue Tickets</label>
              <Select value={teamSettings.defaultAssignment} onValueChange={(value) => setTeamSettings(prev => ({ ...prev, defaultAssignment: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-module">Automatisch nach Modul</SelectItem>
                  <SelectItem value="round-robin">Round-Robin</SelectItem>
                  <SelectItem value="manual">Manuelle Zuweisung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Eskalation bei SLA-Risiko</label>
              <Select value={teamSettings.escalation} onValueChange={(value) => setTeamSettings(prev => ({ ...prev, escalation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team-lead">Team Lead benachrichtigen</SelectItem>
                  <SelectItem value="manager">Manager benachrichtigen</SelectItem>
                  <SelectItem value="all">Alle benachrichtigen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatisierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Zap className="w-5 h-5 text-muted-foreground" />
            Automatisierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">KI-Kategorisierung</p>
              <p className="text-sm text-muted-foreground">Automatische Kategorisierung durch KI</p>
            </div>
            <Checkbox 
              checked={automation.aiCategorization}
              onCheckedChange={(checked) => setAutomation(prev => ({ ...prev, aiCategorization: !!checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ähnliche Tickets erkennen</p>
              <p className="text-sm text-muted-foreground">Automatische Vorschläge bei ähnlichen Problemen</p>
            </div>
            <Checkbox 
              checked={automation.similarTickets}
              onCheckedChange={(checked) => setAutomation(prev => ({ ...prev, similarTickets: !!checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Wissensdatenbank-Vorschläge</p>
              <p className="text-sm text-muted-foreground">Automatische Artikel-Empfehlungen</p>
            </div>
            <Checkbox 
              checked={automation.knowledgeBaseSuggestions}
              onCheckedChange={(checked) => setAutomation(prev => ({ ...prev, knowledgeBaseSuggestions: !!checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-Antworten bei bekannten Problemen</p>
              <p className="text-sm text-muted-foreground">Automatische Lösungsvorschläge senden</p>
            </div>
            <Checkbox 
              checked={automation.autoResponses}
              onCheckedChange={(checked) => setAutomation(prev => ({ ...prev, autoResponses: !!checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sicherheit & Datenschutz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Shield className="w-5 h-5 text-muted-foreground" />
            Sicherheit & Datenschutz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ticket-Datenaufbewahrung</label>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Monate</SelectItem>
                <SelectItem value="12">12 Monate</SelectItem>
                <SelectItem value="24">24 Monate</SelectItem>
                <SelectItem value="36">36 Monate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Anhänge automatisch scannen</p>
              <p className="text-sm text-muted-foreground">Sicherheitsprüfung für hochgeladene Dateien</p>
            </div>
            <Checkbox 
              checked={security.scanAttachments}
              onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, scanAttachments: !!checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sensible Daten verschlüsseln</p>
              <p className="text-sm text-muted-foreground">End-to-End-Verschlüsselung für Ticket-Inhalte</p>
            </div>
            <Checkbox 
              checked={security.encryptSensitiveData}
              onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, encryptSensitiveData: !!checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default SupportSettingsTab;
