import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Shield, 
  Database, 
  Cloud, 
  Phone,
  MessageSquare,
  Key,
  RotateCcw,
  Zap,
  Clock,
  CheckCircle,
  Settings,
  Download,
  Upload,
  Server
} from "lucide-react";

export default function EmergencyBusinessContinuity() {
  const continuityStats = {
    backupHealth: 98,
    lastBackup: "vor 2 Std.",
    rtoTarget: 4, // Recovery Time Objective in Stunden
    rpoTarget: 15, // Recovery Point Objective in Minuten  
    emergencyTokens: 150,
    failoverReady: true
  };

  const backupSystems = [
    {
      id: "BS001",
      type: "Tägliche Vollsicherung",
      location: "AWS S3 (Frankfurt)",
      lastBackup: "Heute, 02:00",
      size: "2.4 TB",
      encryption: "AES-256",
      status: "Erfolgreich"
    },
    {
      id: "BS002", 
      type: "Kontinuierliche Replikation",
      location: "Azure (Amsterdam)",
      lastBackup: "vor 5 Min.",
      size: "Live-Sync",
      encryption: "End-to-End",
      status: "Aktiv"
    },
    {
      id: "BS003",
      type: "Wöchentliche Archivierung",
      location: "Lokaler Server (München)",
      lastBackup: "Sonntag, 01:00",
      size: "8.7 TB",
      encryption: "Hardware-HSM",
      status: "Erfolgreich"
    }
  ];

  const emergencyContacts = [
    { role: "IT-Administrator", name: "Thomas Weber", phone: "+49 89 1234-5678", status: "Verfügbar" },
    { role: "Sicherheitsbeauftragter", name: "Dr. Sarah Klein", phone: "+49 89 1234-5679", status: "Verfügbar" },
    { role: "Geschäftsführung", name: "Michael Schmidt", phone: "+49 89 1234-5680", status: "Verfügbar" },
    { role: "Externer IT-Support", name: "TechSupport GmbH", phone: "+49 89 9876-5432", status: "24/7" }
  ];

  const incidentPlans = [
    {
      scenario: "Serverausfall",
      priority: "Kritisch",
      rto: "2 Stunden",
      steps: "Automatisches Failover → Benachrichtigung → Statuscheck",
      lastTest: "2024-01-15"
    },
    {
      scenario: "Cyber-Angriff",
      priority: "Kritisch", 
      rto: "1 Stunde",
      steps: "Netzwerk isolieren → Forensik → Wiederherstellung",
      lastTest: "2024-01-10"
    },
    {
      scenario: "Datenverlust",
      priority: "Hoch",
      rto: "4 Stunden",
      steps: "Backup-Wiederherstellung → Integrität prüfen → System starten",
      lastTest: "2024-01-12"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup-Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{continuityStats.backupHealth}%</div>
            <Progress value={continuityStats.backupHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Letztes Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{continuityStats.lastBackup}</div>
            <p className="text-xs text-muted-foreground">Automatisch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO-Ziel</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{continuityStats.rtoTarget}h</div>
            <p className="text-xs text-muted-foreground">Recovery Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RPO-Ziel</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{continuityStats.rpoTarget}min</div>
            <p className="text-xs text-muted-foreground">Max. Datenverlust</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notfall-Token</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{continuityStats.emergencyTokens}</div>
            <p className="text-xs text-muted-foreground">Verfügbar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failover-Bereit</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {continuityStats.failoverReady ? "✓ Ja" : "✗ Nein"}
            </div>
            <p className="text-xs text-muted-foreground">Automatisch</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Recovery</CardTitle>
            <CardDescription>
              Verschlüsselte Datensicherung und geografisch verteilte Wiederherstellung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Aktive Backup-Systeme</h4>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Konfigurieren
                </Button>
              </div>
              
              <div className="space-y-3">
                {backupSystems.map((backup) => (
                  <div key={backup.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{backup.type}</div>
                        <div className="text-sm text-muted-foreground">
                          📍 {backup.location}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {backup.size} • {backup.encryption}
                        </div>
                      </div>
                      <Badge variant="outline">{backup.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Letztes Backup: {backup.lastBackup}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Backups</div>
                    <div className="text-sm text-muted-foreground">Täglich um 2:00 Uhr</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Verschlüsselung im Transit</div>
                    <div className="text-sm text-muted-foreground">TLS 1.3 für alle Transfers</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Backup-Integrität prüfen</div>
                    <div className="text-sm text-muted-foreground">Wöchentliche Validierung</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup-Häufigkeit</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Stündlich</SelectItem>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notfall-Login System</CardTitle>
            <CardDescription>
              Ausfallsichere Zugriffsmöglichkeiten bei Systemausfall oder Notfällen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Notfall-Zugriffsmethoden</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Master-Notfall-Token</div>
                    <div className="text-sm text-muted-foreground">Physische Hardware-Token</div>
                  </div>
                  <Badge variant="outline">5 verfügbar</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Backup-Administratoren</div>
                    <div className="text-sm text-muted-foreground">Notfall-Zugriffsrechte</div>
                  </div>
                  <Badge variant="outline">3 Personen</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Offline-Recovery-Codes</div>
                    <div className="text-sm text-muted-foreground">Einmalige Verwendung</div>
                  </div>
                  <Badge variant="outline">25 Codes</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Backup-Authentifizierung</div>
                    <div className="text-sm text-muted-foreground">Alternativer Login-Server</div>
                  </div>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-validity">Token-Gültigkeit (Stunden)</Label>
                <Input id="token-validity" type="number" defaultValue="24" min="1" max="168" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-escalation">Eskalations-Zeit (Minuten)</Label>
                <Input id="emergency-escalation" type="number" defaultValue="30" min="5" max="120" />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-800">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  <strong>Notfall-Protokoll:</strong> Bei Systemausfall werden automatisch alle 
                  Backup-Administratoren benachrichtigt. Notfall-Token ermöglichen den sofortigen 
                  Systemzugriff auch bei Totalausfall der primären Authentifizierung.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Failover-Systeme</CardTitle>
            <CardDescription>
              Automatisches Umschalten auf redundante Server und Infrastruktur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Redundanz-Konfiguration</h4>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Primärer Server (München)</span>
                    <Badge variant="outline">Online</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Load: 45% • Uptime: 99.9% • Last Check: vor 30 Sek.
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Backup-Server (Frankfurt)</span>
                    <Badge variant="secondary">Standby</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Load: 12% • Sync: Live • Last Check: vor 30 Sek.
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Cloud-Failover (AWS)</span>
                    <Badge variant="secondary">Bereit</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Regions: eu-central-1, eu-west-1 • Auto-Scale: Aktiv
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatisches Failover</div>
                    <div className="text-sm text-muted-foreground">Bei Server-Ausfall innerhalb 2 Min.</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Load Balancing</div>
                    <div className="text-sm text-muted-foreground">Intelligente Lastverteilung</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Health Monitoring</div>
                    <div className="text-sm text-muted-foreground">Kontinuierliche Überwachung</div>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident Response Plan</CardTitle>
            <CardDescription>
              Dokumentierte Abläufe und Reaktionszeiten für verschiedene Notfallszenarien
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Notfallpläne</h4>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="space-y-3">
                {incidentPlans.map((plan, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{plan.scenario}</div>
                        <div className="text-sm text-muted-foreground">{plan.steps}</div>
                      </div>
                      <Badge 
                        variant={plan.priority === 'Kritisch' ? 'destructive' : 'secondary'}
                      >
                        {plan.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>RTO: <strong>{plan.rto}</strong></span>
                      <span>Letzter Test: {plan.lastTest}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="drill-frequency">Übungsfrequenz</Label>
                <Select defaultValue="quarterly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="quarterly">Quartalsweise</SelectItem>
                    <SelectItem value="semiannual">Halbjährlich</SelectItem>
                    <SelectItem value="annual">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Notfall-Übung starten
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Krisenkommunikation</CardTitle>
          <CardDescription>
            Automatische Benachrichtigungssysteme und Kontaktmanagement für Notfälle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Notfall-Kontakte</h4>
              
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{contact.role}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.name} • {contact.phone}
                        </div>
                      </div>
                    </div>
                    <Badge variant={contact.status === '24/7' ? 'outline' : 'secondary'}>
                      {contact.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Benachrichtigungskanäle</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">SMS-Benachrichtigungen</div>
                      <div className="text-sm text-muted-foreground">Kritische Notfälle</div>
                    </div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Automatische Anrufe</div>
                      <div className="text-sm text-muted-foreground">Eskalation nach 10 Min.</div>
                    </div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Push-Benachrichtigungen</div>
                      <div className="text-sm text-muted-foreground">Mobile App Alerts</div>
                    </div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">E-Mail Rundschreiben</div>
                      <div className="text-sm text-muted-foreground">Statusupdates für alle</div>
                    </div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="escalation-delay">Eskalationszeit (Minuten)</Label>
                <Input id="escalation-delay" type="number" defaultValue="10" min="1" max="60" />
              </div>

              <Button className="w-full" variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Notfall-Kommunikation testen
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-800">
              <Shield className="h-4 w-4 inline mr-2" />
              <strong>Business Continuity Status:</strong> Alle Notfallsysteme sind operational und 
              getestet. Backup-Systeme sind synchronisiert, Failover-Mechanismen funktionieren 
              einwandfrei und Notfall-Kommunikationswege sind etabliert. RTO/RPO-Ziele werden eingehalten.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}