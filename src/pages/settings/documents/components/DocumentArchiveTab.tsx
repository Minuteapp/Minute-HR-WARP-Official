import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Download, FileX, Users, Lock, Database, Calendar, AlertTriangle } from "lucide-react";

export default function DocumentArchiveTab() {
  return (
    <div className="space-y-6">
      {/* GoBD-konformes Archiv */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            GoBD-konformes Archiv
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">GoBD-Archivierung</Label>
                <Badge variant="default">Zertifiziert</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Unveränderbare Langzeitspeicherung nach GoBD-Standards
              </p>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Eigenschaften:</div>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Manipulationsschutz durch Blockchain</li>
                  <li>• Qualifizierte Zeitstempel</li>
                  <li>• Redundante Speicherung</li>
                  <li>• Automatische Integritätsprüfung</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Prüflogik</Label>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">
                Kontinuierliche Überwachung der Archivintegrität
              </p>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Prüfungen:</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Hash-Verifikation</span>
                    <Badge variant="outline" className="text-xs">Täglich</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Zeitstempel-Validierung</span>
                    <Badge variant="outline" className="text-xs">Wöchentlich</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Vollständigkeitsprüfung</span>
                    <Badge variant="outline" className="text-xs">Monatlich</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium text-sm mb-2">Archiv-Status</div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Archivierte Dokumente</div>
                <div className="font-medium">15.437</div>
              </div>
              <div>
                <div className="text-muted-foreground">Speicherkapazität</div>
                <div className="font-medium">847 GB</div>
              </div>
              <div>
                <div className="text-muted-foreground">Letzte Prüfung</div>
                <div className="font-medium">Heute 06:00</div>
              </div>
              <div>
                <div className="text-muted-foreground">Integrität</div>
                <div className="font-medium text-green-600">100%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DSGVO-Löschfristen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5 text-primary" />
            DSGVO-Löschfristen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Automatische DSGVO-Löschung</Label>
              <p className="text-sm text-muted-foreground">Konfigurierbare Löschfristen je Dokumenttyp</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Löschfristen-Konfiguration</Label>
            <div className="space-y-3">
              {[
                {
                  type: 'Bewerbungsunterlagen (abgelehnt)',
                  retention: '6 Monate',
                  action: 'Automatische Löschung',
                  nextDeletion: '15 Dokumente am 31.08.2024',
                  status: 'Aktiv'
                },
                {
                  type: 'Bewerbungsunterlagen (eingestellt)',
                  retention: 'Ende Beschäftigung + 3 Jahre',
                  action: 'Archivierung dann Löschung',
                  nextDeletion: 'Keine anstehend',
                  status: 'Aktiv'
                },
                {
                  type: 'Krankmeldungen',
                  retention: '5 Jahre nach Kalenderjahr',
                  action: 'Pseudonymisierung dann Löschung',
                  nextDeletion: '23 Dokumente am 31.12.2024',
                  status: 'Aktiv'
                },
                {
                  type: 'Arbeitsverträge (gekündigt)',
                  retention: '30 Jahre',
                  action: 'Langzeitarchivierung',
                  nextDeletion: 'Keine vor 2052',
                  status: 'Aktiv'
                },
                {
                  type: 'Gehaltsabrechnungen',
                  retention: '6 Jahre',
                  action: 'Pseudonymisierung',
                  nextDeletion: '156 Dokumente am 31.12.2024',
                  status: 'Aktiv'
                }
              ].map((rule, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{rule.type}</div>
                    <Badge variant={rule.status === 'Aktiv' ? 'default' : 'secondary'}>
                      {rule.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Frist: {rule.retention}</div>
                    <div>Aktion: {rule.action}</div>
                    <div className="font-medium mt-1">{rule.nextDeletion}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                    <Button variant="ghost" size="sm">Vorschau</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm text-yellow-800">Anstehende Löschungen</div>
                <div className="text-xs text-yellow-700 mt-1">
                  In den nächsten 30 Tagen werden 194 Dokumente automatisch gelöscht. 
                  Letzte Überprüfung empfohlen.
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Löschvorschau anzeigen
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rollenbasierte Zugriffsrechte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Rollenbasierte Zugriffsrechte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              {
                role: 'Mitarbeiter',
                permissions: ['Eigene Dokumente einsehen', 'Dokumente hochladen', 'Freigaben beantragen'],
                restrictions: ['Keine fremden Dokumente', 'Kein Export möglich'],
                users: 145
              },
              {
                role: 'Teamleiter',
                permissions: ['Team-Dokumente verwalten', 'Freigaben erteilen', 'Team-Reports'],
                restrictions: ['Nur zugewiesene Teams', 'Begrenzte Historien'],
                users: 23
              },
              {
                role: 'HR-Manager',
                permissions: ['Vollzugriff Personalakten', 'Compliance-Reports', 'Audit-Logs'],
                restrictions: ['Keine Finanzdokumente'],
                users: 8
              },
              {
                role: 'Admin',
                permissions: ['Systemkonfiguration', 'Alle Dokumente', 'Archiv-Verwaltung'],
                restrictions: ['Keine Löschung ohne Approval'],
                users: 3
              },
              {
                role: 'C-Level',
                permissions: ['Aggregierte Reports', 'Strategie-Dokumente', 'Compliance-Übersicht'],
                restrictions: ['Keine Einzeldokumente', 'Nur Executive Summary'],
                users: 5
              }
            ].map((role, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{role.role}</div>
                  <Badge variant="outline">{role.users} Benutzer</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium text-green-700 mb-1">Berechtigungen</div>
                    <ul className="text-xs space-y-1">
                      {role.permissions.map((permission, pIndex) => (
                        <li key={pIndex}>• {permission}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-red-700 mb-1">Einschränkungen</div>
                    <ul className="text-xs space-y-1">
                      {role.restrictions.map((restriction, rIndex) => (
                        <li key={rIndex}>• {restriction}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">Berechtigungen bearbeiten</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export & Prüfreports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export & Prüfreports für Audits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">DATEV-Export</Label>
              <p className="text-sm text-muted-foreground">
                Steuerrelevante Dokumente für DATEV
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Automatischer Export</span>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Export-Zeitplan</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Manueller Export
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Betriebsprüfung</Label>
              <p className="text-sm text-muted-foreground">
                Vollständige Dokumentation für Auditoren
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit-Ready Export</span>
                  <Switch />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Zeitraum</Label>
                  <div className="flex gap-2">
                    <Input type="date" className="text-sm" />
                    <Input type="date" className="text-sm" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Prüfreport erstellen
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Vorgefertigte Reports</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg text-center">
                <div className="font-medium text-sm mb-1">Vollständigkeitsprüfung</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Lückenloser Nachweis aller Dokumente
                </div>
                <Button variant="outline" size="sm">Erstellen</Button>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="font-medium text-sm mb-1">Workflow-Protokoll</div>
                <div className="text-xs text-muted-foreground mb-2">
                  Alle Freigaben und Änderungen
                </div>
                <Button variant="outline" size="sm">Erstellen</Button>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="font-medium text-sm mb-1">Compliance-Report</div>
                <div className="text-xs text-muted-foreground mb-2">
                  DSGVO und GoBD Konformität
                </div>
                <Button variant="outline" size="sm">Erstellen</Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium text-sm mb-2">Letzte Exports</div>
            <div className="space-y-2">
              {[
                { type: 'DATEV Export August 2024', date: '01.09.2024', size: '247 MB', status: 'Erfolgreich' },
                { type: 'Compliance Report Q2', date: '30.06.2024', size: '12 MB', status: 'Erfolgreich' },
                { type: 'Betriebsprüfung 2023', date: '15.01.2024', size: '1.2 GB', status: 'Erfolgreich' }
              ].map((export_, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{export_.type}</div>
                    <div className="text-xs text-muted-foreground">{export_.date} • {export_.size}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{export_.status}</Badge>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archiv-Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Archiv-Monitoring & Statistiken
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold">98.7%</div>
              <div className="text-sm text-muted-foreground">Verfügbarkeit</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold">{"<"}0.01%</div>
              <div className="text-sm text-muted-foreground">Fehlerrate</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold">2.1s</div>
              <div className="text-sm text-muted-foreground">Ø Abrufzeit</div>
            </div>
            <div className="p-3 text-center border rounded-lg">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-muted-foreground">Integrität</div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Speicherverbrauch</Label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Aktive Dokumente</span>
                <span>847 GB (65%)</span>
              </div>
              <Progress value={65} className="w-full" />
              <div className="flex justify-between text-sm">
                <span>Archivierte Dokumente</span>
                <span>432 GB (33%)</span>
              </div>
              <Progress value={33} className="w-full" />
              <div className="flex justify-between text-sm">
                <span>Backup & Redundanz</span>
                <span>26 GB (2%)</span>
              </div>
              <Progress value={2} className="w-full" />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Archivierungsrate</Label>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Heute</div>
                <div className="font-medium">23 Dokumente</div>
              </div>
              <div>
                <div className="text-muted-foreground">Diese Woche</div>
                <div className="font-medium">167 Dokumente</div>
              </div>
              <div>
                <div className="text-muted-foreground">Diesen Monat</div>
                <div className="font-medium">742 Dokumente</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}