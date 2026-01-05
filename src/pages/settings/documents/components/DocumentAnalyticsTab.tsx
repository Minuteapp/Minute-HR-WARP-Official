import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Clock, FileText, TrendingUp, Users, AlertCircle, CheckCircle, Calendar } from "lucide-react";

export default function DocumentAnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Freigabe-Durchlaufzeiten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Freigabe-Durchlaufzeiten & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-green-600">1.2h</div>
              <div className="text-sm text-muted-foreground">Ø Gesamt-Durchlaufzeit</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">23min</div>
              <div className="text-sm text-muted-foreground">Ø je Genehmigungsstufe</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-muted-foreground">Aktuell überfällig</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">94%</div>
              <div className="text-sm text-muted-foreground">SLA-Einhaltung</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Durchlaufzeiten nach Dokumenttyp</Label>
            <div className="space-y-3">
              {[
                { type: 'Arbeitsvertrag', avgTime: '4.2h', trend: '+12%', sla: '24h', status: 'good' },
                { type: 'Rechnung', avgTime: '1.8h', trend: '-8%', sla: '8h', status: 'good' },
                { type: 'Krankmeldung', avgTime: '45min', trend: '+3%', sla: '2h', status: 'good' },
                { type: 'Spesenabrechnung', avgTime: '2.1h', trend: '+15%', sla: '4h', status: 'warning' },
                { type: 'Zertifikat', avgTime: '6.3h', trend: '+25%', sla: '12h', status: 'critical' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{item.type}</div>
                    <div className="text-xs text-muted-foreground">SLA: {item.sla}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{item.avgTime}</div>
                    <div className={`text-xs ${item.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                      {item.trend} vs. Vormonat
                    </div>
                  </div>
                  <Badge variant={
                    item.status === 'good' ? 'default' : 
                    item.status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {item.status === 'good' ? 'OK' : item.status === 'warning' ? 'Achtung' : 'Kritisch'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium text-sm mb-2">Engpässe identifiziert</div>
              <div className="space-y-1 text-sm">
                <div>• Rechtsabteilung: Ø 2.1h Bearbeitung</div>
                <div>• HR-Manager: 15% Überlastung</div>
                <div>• Geschäftsführer: 3 Tage Response-Zeit</div>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium text-sm mb-2">Verbesserungsvorschläge</div>
              <div className="space-y-1 text-sm">
                <div>• Auto-Genehmigung für {"<"}€100 Rechnungen</div>
                <div>• Delegation bei {">"} 24h Wartezeit</div>
                <div>• Parallelisierung HR + Legal</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dokumententypen & Volumen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Dokumententypen & Volumen-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Zeitraum</Label>
              <Select defaultValue="month">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                  <SelectItem value="quarter">Dieses Quartal</SelectItem>
                  <SelectItem value="year">Dieses Jahr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Abteilung</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finanzen</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Status</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="pending">Wartend</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Dokumentenverteilung (August 2024)</Label>
            <div className="space-y-3">
              {[
                { type: 'Rechnungen', count: 1247, percentage: 42, trend: '+15%', avgSize: '2.3 MB' },
                { type: 'Krankmeldungen', count: 89, percentage: 18, trend: '-5%', avgSize: '0.8 MB' },
                { type: 'Arbeitsverträge', count: 23, percentage: 15, trend: '+8%', avgSize: '1.2 MB' },
                { type: 'Spesenbelege', count: 156, percentage: 12, trend: '+22%', avgSize: '1.8 MB' },
                { type: 'Zertifikate', count: 34, percentage: 8, trend: '+3%', avgSize: '3.1 MB' },
                { type: 'Sonstige', count: 67, percentage: 5, trend: '-12%', avgSize: '1.5 MB' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.type}</span>
                    <div className="text-right text-sm">
                      <div>{item.count} Dokumente</div>
                      <div className="text-xs text-muted-foreground">{item.avgSize} Ø</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={item.percentage} className="flex-1" />
                    <span className="text-xs w-10">{item.percentage}%</span>
                    <span className={`text-xs w-12 ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offene Dokumente & Bottlenecks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Offene Dokumente & Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">Kritische Rückstände</Label>
              <div className="space-y-2">
                {[
                  {
                    issue: 'Fehlende Spesenbelege',
                    count: 12,
                    department: 'Vertrieb',
                    overdue: '5 Tage',
                    severity: 'high'
                  },
                  {
                    issue: 'Nicht unterschriebene Verträge',
                    count: 3,
                    department: 'HR',
                    overdue: '8 Tage',
                    severity: 'critical'
                  },
                  {
                    issue: 'Ablaufende Zertifikate',
                    count: 7,
                    department: 'IT',
                    overdue: '2 Tage',
                    severity: 'medium'
                  },
                  {
                    issue: 'Wartende Genehmigungen',
                    count: 23,
                    department: 'Alle',
                    overdue: '1 Tag',
                    severity: 'medium'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{item.issue}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.department} • {item.overdue} überfällig
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.count}</div>
                      <Badge variant={
                        item.severity === 'critical' ? 'destructive' :
                        item.severity === 'high' ? 'secondary' : 'outline'
                      }>
                        {item.severity === 'critical' ? 'Kritisch' :
                         item.severity === 'high' ? 'Hoch' : 'Normal'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Performance-Übersicht</Label>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm mb-2">Bearbeitungsgeschwindigkeit</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Heute</div>
                      <div className="font-medium">47 abgeschlossen</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Ø pro Tag</div>
                      <div className="font-medium">52 abgeschlossen</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm mb-2">Mitarbeiter-Auslastung</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>HR Team</span>
                      <span>85% ausgelastet</span>
                    </div>
                    <Progress value={85} />
                    <div className="flex justify-between text-sm">
                      <span>Legal Team</span>
                      <span>110% überlastet</span>
                    </div>
                    <Progress value={100} className="bg-red-100" />
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm mb-2">Eskalationen</div>
                  <div className="text-sm">
                    <div>• 15 automatische Weiterleitungen</div>
                    <div>• 3 manuelle Eskalationen</div>
                    <div>• 1 Executive-Eingriff erforderlich</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI-Dashboards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            KPI-Dashboards für HR & Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">HR-KPIs</Label>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Personalakten-Vollständigkeit</span>
                    <span className="font-bold text-green-600">94%</span>
                  </div>
                  <Progress value={94} className="mt-1" />
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Onboarding-Dokumente</span>
                    <span className="font-bold text-yellow-600">78%</span>
                  </div>
                  <Progress value={78} className="mt-1" />
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance-Quote</span>
                    <span className="font-bold text-green-600">99%</span>
                  </div>
                  <Progress value={99} className="mt-1" />
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Krankmeldungs-Verarbeitung</span>
                    <span className="font-bold text-green-600">97%</span>
                  </div>
                  <Progress value={97} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Management-KPIs</Label>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gesamt-Effizienz</span>
                    <span className="font-bold text-green-600">91%</span>
                  </div>
                  <Progress value={91} className="mt-1" />
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kosteneinsparung (Automatisierung)</span>
                    <span className="font-bold text-blue-600">€12.4k</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">vs. Vormonat</div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risiko-Score</span>
                    <span className="font-bold text-yellow-600">Niedrig</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">2 offene Compliance-Issues</div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ROI Dokumentenmanagement</span>
                    <span className="font-bold text-green-600">+247%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Jahr-zu-Jahr Vergleich</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Trend-Analysen</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 text-center border rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="font-bold text-green-600">+23%</div>
                <div className="text-xs text-muted-foreground">Digitalisierungsgrad</div>
              </div>
              <div className="p-3 text-center border rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="font-bold text-blue-600">-31%</div>
                <div className="text-xs text-muted-foreground">Bearbeitungszeit</div>
              </div>
              <div className="p-3 text-center border rounded-lg">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="font-bold text-purple-600">+15%</div>
                <div className="text-xs text-muted-foreground">Nutzerzufriedenheit</div>
              </div>
              <div className="p-3 text-center border rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="font-bold text-green-600">-67%</div>
                <div className="text-xs text-muted-foreground">Fehlerrate</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Report planen
            </Button>
            <Button variant="outline" className="flex-1">
              <BarChart className="h-4 w-4 mr-2" />
              Dashboard exportieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automatisierte Berichte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Automatisierte Berichte & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="font-medium">Geplante Berichte</Label>
            <div className="space-y-3">
              {[
                {
                  name: 'Wöchentlicher HR-Report',
                  schedule: 'Montags 8:00',
                  recipients: 'HR-Team, Geschäftsführung',
                  lastSent: '19.08.2024',
                  status: 'Aktiv'
                },
                {
                  name: 'Monatlicher Compliance-Report',
                  schedule: '1. des Monats',
                  recipients: 'Legal, Management',
                  lastSent: '01.08.2024',
                  status: 'Aktiv'
                },
                {
                  name: 'Quartals-Performance-Analyse',
                  schedule: 'Quartalsende',
                  recipients: 'C-Level',
                  lastSent: '30.06.2024',
                  status: 'Aktiv'
                },
                {
                  name: 'Jahres-Audit-Bericht',
                  schedule: '31. Dezember',
                  recipients: 'Wirtschaftsprüfer, Geschäftsführung',
                  lastSent: '31.12.2023',
                  status: 'Geplant'
                }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{report.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {report.schedule} • {report.recipients}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Zuletzt: {report.lastSent}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === 'Aktiv' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                    <Button variant="ghost" size="sm">Bearbeiten</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Alert-Konfiguration</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Kritische Alerts</Label>
                <div className="space-y-1">
                  {[
                    'SLA-Überschreitung ({">"} 24h)',
                    'Compliance-Verstöße',
                    'System-Ausfälle',
                    'Sicherheitsvorfälle'
                  ].map((alert) => (
                    <div key={alert} className="flex items-center justify-between">
                      <span className="text-sm">{alert}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Standard-Alerts</Label>
                <div className="space-y-1">
                  {[
                    'Hohe Workload-Warnung',
                    'Ablaufende Zertifikate',
                    'Backup-Status',
                    'Performance-Degradation'
                  ].map((alert) => (
                    <div key={alert} className="flex items-center justify-between">
                      <span className="text-sm">{alert}</span>
                      <Switch defaultChecked={alert !== 'Performance-Degradation'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Neuen Bericht konfigurieren
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}