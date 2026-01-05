import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  FileText, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Shield,
  Brain,
  BarChart3,
  RefreshCw,
  Filter
} from "lucide-react";

export default function MonitoringAudit() {
  const auditStats = {
    totalEvents: 156789,
    todayEvents: 8234,
    criticalAlerts: 7,
    anomaliesDetected: 23,
    complianceScore: 96
  };

  const recentAuditEvents = [
    {
      id: "AE001",
      timestamp: "2024-01-19 14:23:45",
      user: "admin@company.com",
      action: "Benutzer erstellt",
      resource: "Max Müller (ID: 8765)",
      ipAddress: "192.168.1.100",
      status: "Erfolgreich",
      risk: "Niedrig"
    },
    {
      id: "AE002", 
      timestamp: "2024-01-19 14:20:12",
      user: "hr.manager@company.com", 
      action: "Massendatenexport",
      resource: "Mitarbeiterliste (2500 Datensätze)",
      ipAddress: "10.0.1.45",
      status: "Erfolgreich",
      risk: "Mittel"
    },
    {
      id: "AE003",
      timestamp: "2024-01-19 14:15:33",
      user: "unknown",
      action: "Login-Versuch fehlgeschlagen",
      resource: "Admin-Panel",
      ipAddress: "203.45.67.89", 
      status: "Blockiert",
      risk: "Hoch"
    }
  ];

  const securityAlerts = [
    {
      id: "SA001",
      type: "Ungewöhnliche Anmeldezeit",
      description: "Login außerhalb Arbeitszeit von Max Müller",
      severity: "Mittel",
      user: "max.mueller@company.com",
      time: "03:22",
      status: "Unter Beobachtung"
    },
    {
      id: "SA002",
      type: "Parallele Logins",
      description: "Gleichzeitiger Login von 2 verschiedenen IPs",
      severity: "Hoch", 
      user: "anna.schmidt@company.com",
      time: "14:15",
      status: "Eskaliert"
    },
    {
      id: "SA003",
      type: "Mehrfacher Fehlversuch",
      description: "5 fehlgeschlagene Login-Versuche in 10 Minuten",
      severity: "Kritisch",
      user: "Unbekannt",
      time: "13:45",
      status: "Automatisch blockiert"
    }
  ];

  const anomalyPatterns = [
    { 
      pattern: "Mitarbeiter lädt große Datenmengen nachts herunter",
      confidence: 87,
      occurrences: 3,
      lastSeen: "Heute, 02:45"
    },
    {
      pattern: "Login aus neuem Land ohne Reisemeldung", 
      confidence: 94,
      occurrences: 1,
      lastSeen: "Heute, 14:20"
    },
    {
      pattern: "API-Calls außerhalb üblicher Muster",
      confidence: 72,
      occurrences: 15,
      lastSeen: "Heute, 15:10"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Alle protokollierten Aktionen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.todayEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Neue Events heute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritische Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Sofortmaßnahme erforderlich</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KI-Anomalien</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.anomaliesDetected}</div>
            <p className="text-xs text-muted-foreground">Ungewöhnliche Muster</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance-Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats.complianceScore}%</div>
            <Progress value={auditStats.complianceScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Audit-Log Konfiguration</CardTitle>
            <CardDescription>
              Revisionssichere Protokollierung aller sicherheitsrelevanten Aktionen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Protokollierungsebenen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Login/Logout-Ereignisse</div>
                    <div className="text-sm text-muted-foreground">Alle Anmelde- und Abmeldeversuche</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Datenänderungen</div>
                    <div className="text-sm text-muted-foreground">Alle Create, Update, Delete-Operationen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Datenexporte</div>
                    <div className="text-sm text-muted-foreground">Downloads und API-Zugriffe</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Systemkonfiguration</div>
                    <div className="text-sm text-muted-foreground">Änderungen an Einstellungen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Berechtigungsänderungen</div>
                    <div className="text-sm text-muted-foreground">Rollenzuweisungen und Rechtemodifikationen</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-retention">Log-Aufbewahrungszeit</Label>
                <Select defaultValue="7years">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1year">1 Jahr</SelectItem>
                    <SelectItem value="3years">3 Jahre</SelectItem>
                    <SelectItem value="7years">7 Jahre (Standard)</SelectItem>
                    <SelectItem value="10years">10 Jahre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-compression">Komprimierung nach</Label>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 Tagen</SelectItem>
                    <SelectItem value="30days">30 Tagen</SelectItem>
                    <SelectItem value="90days">90 Tagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Security Dashboard</CardTitle>
            <CardDescription>
              Echtzeitübersicht sicherheitsrelevanter Ereignisse und Bedrohungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Aktuelle Sicherheitswarnungen</h4>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aktualisieren
                </Button>
              </div>
              
              <div className="space-y-3">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{alert.type}</div>
                        <div className="text-sm text-muted-foreground">{alert.description}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Benutzer: {alert.user} • Zeit: {alert.time}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={
                            alert.severity === 'Kritisch' ? 'destructive' : 
                            alert.severity === 'Hoch' ? 'secondary' : 'outline'
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{alert.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-lg font-bold text-green-600">8,210</div>
                  <div className="text-xs text-green-600">Normale Events</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-lg font-bold text-yellow-600">23</div>
                  <div className="text-xs text-yellow-600">Warnungen</div>
                </div>
                <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-lg font-bold text-red-600">7</div>
                  <div className="text-xs text-red-600">Kritisch</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KI-basierte Anomalie-Erkennung</CardTitle>
          <CardDescription>
            Intelligente Erkennung ungewöhnlicher Muster und verdächtiger Aktivitäten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Erkannte Anomalie-Muster</h4>
              
              <div className="space-y-3">
                {anomalyPatterns.map((pattern, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{pattern.pattern}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {pattern.occurrences} Vorkommen • Zuletzt: {pattern.lastSeen}
                        </div>
                      </div>
                      <Badge variant="outline">{pattern.confidence}% Konfidenz</Badge>
                    </div>
                    <Progress value={pattern.confidence} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">KI-Konfiguration</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Maschinelles Lernen</div>
                    <div className="text-sm text-muted-foreground">Automatische Mustererkennung</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Verhaltensanalyse</div>
                    <div className="text-sm text-muted-foreground">Nutzerverhalten über Zeit analysieren</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Echzeit-Scoring</div>
                    <div className="text-sm text-muted-foreground">Live-Risikobewertung aller Aktionen</div>
                  </div>
                  <Switch checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische Alerts</div>
                    <div className="text-sm text-muted-foreground">Benachrichtigungen bei Anomalien</div>
                  </div>
                  <Switch checked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensitivity">Erkennungsempfindlichkeit</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="paranoid">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learning-period">Lernzeitraum</Label>
                <Select defaultValue="90days">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 Tage</SelectItem>
                    <SelectItem value="90days">90 Tage</SelectItem>
                    <SelectItem value="180days">180 Tage</SelectItem>
                    <SelectItem value="365days">1 Jahr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit-Log Einträge</CardTitle>
          <CardDescription>
            Detaillierte Übersicht aller protokollierten Aktionen mit Filteroptionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Select defaultValue="today">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Heute</SelectItem>
                    <SelectItem value="week">Diese Woche</SelectItem>
                    <SelectItem value="month">Dieser Monat</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  CSV Export
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Report
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitstempel</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>IP-Adresse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risiko</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAuditEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-sm">{event.timestamp}</TableCell>
                    <TableCell>{event.user}</TableCell>
                    <TableCell>{event.action}</TableCell>
                    <TableCell className="max-w-xs truncate">{event.resource}</TableCell>
                    <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'Erfolgreich' ? 'outline' : 'destructive'}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          event.risk === 'Niedrig' ? 'outline' : 
                          event.risk === 'Mittel' ? 'secondary' : 'destructive'
                        }
                      >
                        {event.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <Eye className="h-4 w-4 inline mr-2" />
                <strong>Monitoring-Status:</strong> Das Audit-System protokolliert kontinuierlich alle 
                Aktionen revisionssicher. KI-basierte Anomalie-Erkennung analysiert Verhaltensmuster 
                und warnt automatisch vor verdächtigen Aktivitäten. Alle Logs sind exportierbar für 
                Compliance-Prüfungen.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}