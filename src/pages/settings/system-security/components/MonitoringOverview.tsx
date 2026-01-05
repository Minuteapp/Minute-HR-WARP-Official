import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Shield, AlertTriangle, Activity, Download, Search, Clock } from "lucide-react";

export default function MonitoringOverview() {
  const recentActivities = [
    { id: "1", user: "admin@company.com", action: "Benutzer erstellt", resource: "Max Müller", timestamp: "vor 2 Min", risk: "low" },
    { id: "2", user: "hr@company.com", action: "Dokument eingesehen", resource: "Arbeitsvertrag_123.pdf", timestamp: "vor 5 Min", risk: "medium" },
    { id: "3", user: "unknown", action: "Login-Versuch fehlgeschlagen", resource: "admin@company.com", timestamp: "vor 8 Min", risk: "high" },
    { id: "4", user: "manager@company.com", action: "Rolle geändert", resource: "Anna Schmidt", timestamp: "vor 12 Min", risk: "medium" },
    { id: "5", user: "system", action: "Backup erstellt", resource: "Vollsicherung", timestamp: "vor 15 Min", risk: "low" }
  ];

  const securityEvents = [
    { id: "SE001", type: "Brute Force", description: "5 fehlgeschlagene Login-Versuche", severity: "high", timestamp: "14:23", status: "investigating" },
    { id: "SE002", type: "Anomalie", description: "Login aus ungewöhnlichem Land (Russland)", severity: "medium", timestamp: "13:45", status: "resolved" },
    { id: "SE003", type: "Berechtigung", description: "Zugriff auf Admin-Bereich ohne Berechtigung", severity: "critical", timestamp: "12:30", status: "blocked" }
  ];

  const systemMetrics = {
    totalLogins: 2847,
    failedLogins: 23,
    activeUsers: 1205,
    suspiciousActivities: 7,
    blockedIPs: 12,
    securityScore: 94
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins heute</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalLogins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% vs. gestern</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fehlversuche</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">-8% vs. gestern</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Nutzer</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Aktuell online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verdächtige Aktivitäten</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Heute erkannt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockierte IPs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">Automatisch blockiert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.securityScore}%</div>
            <p className="text-xs text-green-600">Sehr gut</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Echtzeit-Dashboard</CardTitle>
            <CardDescription>
              Live-Übersicht sicherheitsrelevanter Ereignisse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Sicherheitsereignisse</h4>
              <Button size="sm" variant="outline">
                Alle anzeigen
              </Button>
            </div>

            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline"
                        className={
                          event.severity === 'critical' ? 'text-red-600' :
                          event.severity === 'high' ? 'text-orange-600' :
                          'text-yellow-600'
                        }
                      >
                        {event.severity === 'critical' ? 'Kritisch' :
                         event.severity === 'high' ? 'Hoch' : 'Mittel'}
                      </Badge>
                      <div>
                        <div className="font-medium">{event.type}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{event.timestamp}</div>
                      <Badge 
                        variant="outline"
                        className={
                          event.status === 'blocked' ? 'text-red-600' :
                          event.status === 'resolved' ? 'text-green-600' :
                          'text-blue-600'
                        }
                      >
                        {event.status === 'blocked' ? 'Blockiert' :
                         event.status === 'resolved' ? 'Gelöst' : 'Untersucht'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Benachrichtigungseinstellungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Echtzeit-Benachrichtigungen</div>
                    <div className="text-sm text-muted-foreground">Sofortige Alerts bei kritischen Ereignissen</div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">E-Mail-Reports</div>
                    <div className="text-sm text-muted-foreground">Tägliche Zusammenfassung per E-Mail</div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">KI-Anomalie-Erkennung</div>
                    <div className="text-sm text-muted-foreground">Automatische Erkennung ungewöhnlicher Muster</div>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit-Log</CardTitle>
            <CardDescription>
              Detaillierte Protokollierung aller Systemaktivitäten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Suche in Logs..." className="flex-1" />
              <Button size="icon" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="user">Benutzer</SelectItem>
                  <SelectItem value="document">Dokument</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="today">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Heute</SelectItem>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Zeit</TableHead>
                  <TableHead>Risiko</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-sm">{activity.user}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{activity.action}</div>
                        <div className="text-xs text-muted-foreground">{activity.resource}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{activity.timestamp}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          activity.risk === 'high' ? 'text-red-600' :
                          activity.risk === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }
                      >
                        {activity.risk === 'high' ? 'Hoch' :
                         activity.risk === 'medium' ? 'Mittel' : 'Niedrig'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                CSV Export
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KI-basierte Anomalie-Erkennung</CardTitle>
          <CardDescription>
            Intelligente Überwachung und automatische Erkennung verdächtiger Aktivitäten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Zeitbasierte Anomalien</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ungewöhnliche Login-Zeiten</li>
                <li>• Aktivitäten außerhalb der Arbeitszeit</li>
                <li>• Mehrfache gleichzeitige Logins</li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aktiviert</span>
                <Switch checked />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium">Verhaltensbasierte Analyse</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ungewöhnliche Datenzugriffe</li>
                <li>• Abweichende Nutzungsmuster</li>
                <li>• Verdächtige Berechtigungsanfragen</li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aktiviert</span>
                <Switch checked />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Geografische Anomalien</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Logins aus fremden Ländern</li>
                <li>• Standort-Sprünge</li>
                <li>• VPN/Proxy-Erkennung</li>
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-sm">Aktiviert</span>
                <Switch checked />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="sensitivity">KI-Sensitivität</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig (weniger False Positives)</SelectItem>
                  <SelectItem value="medium">Mittel (ausgewogen)</SelectItem>
                  <SelectItem value="high">Hoch (maximale Sicherheit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response">Automatische Reaktion</Label>
              <Select defaultValue="alert">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">Nur Benachrichtigung</SelectItem>
                  <SelectItem value="block">Benutzer blockieren</SelectItem>
                  <SelectItem value="require-mfa">MFA anfordern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}