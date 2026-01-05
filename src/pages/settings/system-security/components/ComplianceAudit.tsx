import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileCheck, Shield, Download, Calendar, Trash2, Clock } from "lucide-react";

export default function ComplianceAudit() {
  const complianceStandards = [
    { 
      id: "dsgvo", 
      name: "DSGVO / GDPR", 
      status: "compliant", 
      score: 98, 
      lastAudit: "15.01.2024", 
      nextAudit: "15.04.2024",
      issues: 1
    },
    { 
      id: "iso27001", 
      name: "ISO 27001", 
      status: "compliant", 
      score: 95, 
      lastAudit: "10.01.2024", 
      nextAudit: "10.07.2024",
      issues: 3
    },
    { 
      id: "sox", 
      name: "SOX Compliance", 
      status: "review", 
      score: 87, 
      lastAudit: "20.12.2023", 
      nextAudit: "20.03.2024",
      issues: 7
    },
    { 
      id: "arbeitsschutz", 
      name: "Arbeitsschutzgesetz", 
      status: "compliant", 
      score: 92, 
      lastAudit: "05.01.2024", 
      nextAudit: "05.07.2024",
      issues: 2
    }
  ];

  const retentionPolicies = [
    { type: "Mitarbeiterdaten", period: "10 Jahre", autoDelete: true, lastCleanup: "01.01.2024" },
    { type: "Gehaltsabrechnungen", period: "10 Jahre", autoDelete: true, lastCleanup: "01.01.2024" },
    { type: "Verträge", period: "30 Jahre", autoDelete: false, lastCleanup: "Manuell" },
    { type: "Zeiterfassung", period: "2 Jahre", autoDelete: true, lastCleanup: "15.01.2024" },
    { type: "Audit-Logs", period: "7 Jahre", autoDelete: true, lastCleanup: "01.01.2024" }
  ];

  const dataExports = [
    { id: "EXP001", type: "DSGVO-Auskunft", requestedBy: "Max Müller", date: "14.01.2024", status: "completed" },
    { id: "EXP002", type: "Behördenanfrage", requestedBy: "Arbeitsinspektion", date: "12.01.2024", status: "pending" },
    { id: "EXP003", type: "Audit-Export", requestedBy: "Steuerberater", date: "10.01.2024", status: "completed" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-green-600">Sehr gut</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Issues</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
            <p className="text-xs text-muted-foreground">3 kritisch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nächstes Audit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20.03</div>
            <p className="text-xs text-muted-foreground">SOX Compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Löschvorgänge</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">Diesen Monat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance-Standards</CardTitle>
            <CardDescription>
              Übersicht und Status aller Compliance-Anforderungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Standard</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nächstes Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceStandards.map((standard) => (
                  <TableRow key={standard.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{standard.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {standard.issues} offene Issue(s)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{standard.score}%</div>
                        <Progress value={standard.score} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          standard.status === 'compliant' ? 'text-green-600' :
                          standard.status === 'review' ? 'text-yellow-600' : 'text-red-600'
                        }
                      >
                        {standard.status === 'compliant' ? 'Konform' :
                         standard.status === 'review' ? 'Prüfung' : 'Nicht konform'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {standard.nextAudit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-4">
              <h4 className="font-medium">Automatische Compliance-Checks</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Tägliche DSGVO-Prüfung</div>
                    <div className="text-sm text-muted-foreground">
                      Automatische Überprüfung der Datenschutz-Compliance
                    </div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Wöchentlicher ISO-Scan</div>
                    <div className="text-sm text-muted-foreground">
                      Sicherheitsstandards und Risikobewertung
                    </div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Monatlicher Compliance-Report</div>
                    <div className="text-sm text-muted-foreground">
                      Automatischer Bericht für Management
                    </div>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aufbewahrungsfristen & Löschung</CardTitle>
            <CardDescription>
              Automatische Löschung nach gesetzlichen Aufbewahrungsfristen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datentyp</TableHead>
                  <TableHead>Aufbewahrung</TableHead>
                  <TableHead>Auto-Löschung</TableHead>
                  <TableHead>Letzte Bereinigung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retentionPolicies.map((policy) => (
                  <TableRow key={policy.type}>
                    <TableCell className="font-medium">{policy.type}</TableCell>
                    <TableCell>{policy.period}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={policy.autoDelete ? 'text-green-600' : 'text-gray-600'}>
                        {policy.autoDelete ? 'Aktiviert' : 'Manuell'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{policy.lastCleanup}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-4">
              <h4 className="font-medium">Lösch-Einstellungen</h4>
              
              <div className="space-y-2">
                <Label htmlFor="deletion-time">Löschung ausführen um (Uhrzeit)</Label>
                <Input id="deletion-time" type="time" defaultValue="02:00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warning-days">Warnung vor Löschung (Tage)</Label>
                <Input id="warning-days" type="number" defaultValue="30" min="1" max="90" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="secure-deletion">Sichere Löschung (Überschreibung)</Label>
                <Switch id="secure-deletion" checked />
              </div>

              <Button className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Löschvorgang manuell starten
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datenexport & Behördenzugriff</CardTitle>
            <CardDescription>
              Protokollierung von Datenexporten und behördlichen Anfragen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Exportanfragen</h4>
              <Button size="sm">
                Neue Anfrage
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Typ</TableHead>
                  <TableHead>Angefordert von</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataExports.map((export_) => (
                  <TableRow key={export_.id}>
                    <TableCell className="font-medium">{export_.type}</TableCell>
                    <TableCell>{export_.requestedBy}</TableCell>
                    <TableCell>{export_.date}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={export_.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}
                      >
                        {export_.status === 'completed' ? 'Abgeschlossen' : 'Ausstehend'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-4">
              <h4 className="font-medium">Export-Einstellungen</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatische DSGVO-Auskunft</div>
                    <div className="text-sm text-muted-foreground">
                      Mitarbeiter können ihre Daten selbst anfordern
                    </div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Verschlüsselter Export</div>
                    <div className="text-sm text-muted-foreground">
                      Alle Exporte automatisch verschlüsseln
                    </div>
                  </div>
                  <Switch checked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Export-Protokollierung</div>
                    <div className="text-sm text-muted-foreground">
                      Detaillierte Logs aller Datenexporte
                    </div>
                  </div>
                  <Switch checked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hochrisiko-Jobs & Sondergesetze</CardTitle>
            <CardDescription>
              Spezielle Compliance-Regeln für Sicherheitskräfte und Rettungsdienste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Sicherheitskräfte</span>
                  </div>
                  <Badge variant="outline">248 Mitarbeiter</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Erweiterte Arbeitszeiten (§7 ArbZG)</span>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sonderzugang zu Hochrisikobereichen</span>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Verschärfte Hintergrundprüfung</span>
                    <Switch checked />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Rettungsdienst & Feuerwehr</span>
                  </div>
                  <Badge variant="outline">89 Mitarbeiter</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Bereitschaftszeit-Regelungen</span>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>24h-Schichten (Ausnahme ArbZG)</span>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notfall-Alarmierung</span>
                    <Switch checked />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Bundeswehr & Behörden</span>
                  </div>
                  <Badge variant="outline">34 Mitarbeiter</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Geheimschutz-Bestimmungen</span>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sicherheitsüberprüfung erforderlich</span>
                    <Switch checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auslandsregelung</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-retention">Aufbewahrung Sicherheitsdaten</Label>
              <Select defaultValue="20years">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10years">10 Jahre</SelectItem>
                  <SelectItem value="20years">20 Jahre (empfohlen)</SelectItem>
                  <SelectItem value="30years">30 Jahre</SelectItem>
                  <SelectItem value="permanent">Dauerhaft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              EU-Reporting Export
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}