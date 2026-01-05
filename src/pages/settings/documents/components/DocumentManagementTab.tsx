import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Clock, Search, Tags, Archive, Database, Calendar, FileText } from "lucide-react";

export default function DocumentManagementTab() {
  return (
    <div className="space-y-6">
      {/* Revisionssichere Ablage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Revisionssichere Ablage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">GoBD-Konformität</Label>
                <Badge variant="default">Aktiv</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Unveränderbare Speicherung nach GoBD-Standards
              </p>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Eigenschaften:</div>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Unveränderbarkeit garantiert</li>
                  <li>• Digitale Signatur bei Upload</li>
                  <li>• Zeitstempel-Service</li>
                  <li>• Integritätsprüfung</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">DSGVO-Compliance</Label>
                <Badge variant="default">Aktiv</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Datenschutz-konforme Dokumentenverwaltung
              </p>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Eigenschaften:</div>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Automatische Pseudonymisierung</li>
                  <li>• Löschfristen-Management</li>
                  <li>• Zugriffskontrolle</li>
                  <li>• Audit-Trail</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium text-sm mb-2">Speicher-Status</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Verfügbar</div>
                <div className="font-medium">2.5 TB</div>
              </div>
              <div>
                <div className="text-muted-foreground">Belegt</div>
                <div className="font-medium">845 GB</div>
              </div>
              <div>
                <div className="text-muted-foreground">Dokumente</div>
                <div className="font-medium">47.832</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Versionierung & Audit-Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Versionierung & Audit-Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Automatische Versionierung</Label>
              <p className="text-sm text-muted-foreground">Alle Änderungen werden protokolliert</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Max. Versionen pro Dokument</Label>
              <Select defaultValue="10">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Versionen</SelectItem>
                  <SelectItem value="10">10 Versionen</SelectItem>
                  <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Versionierung für</Label>
              <div className="space-y-1">
                {['Inhalt', 'Metadaten', 'Freigaben', 'Kommentare'].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Audit-Trail Einstellungen</Label>
            <div className="space-y-2">
              {[
                { action: 'Dokument hochgeladen', track: true },
                { action: 'Metadaten geändert', track: true },
                { action: 'Freigabe erteilt/verweigert', track: true },
                { action: 'Dokument heruntergeladen', track: false },
                { action: 'Dokument angezeigt', track: false },
                { action: 'Kommentar hinzugefügt', track: true }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.action}</span>
                  <Switch defaultChecked={item.track} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lebenszyklus-Regeln */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Lebenszyklus-Regeln
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="font-medium">Automatische Archivierung & Löschung</Label>
            <div className="space-y-3">
              {[
                {
                  type: 'Bewerbungsunterlagen',
                  retention: '6 Monate',
                  action: 'Automatische Löschung',
                  status: 'Aktiv'
                },
                {
                  type: 'Arbeitsverträge',
                  retention: '30 Jahre',
                  action: 'Langzeitarchiv',
                  status: 'Aktiv'
                },
                {
                  type: 'Krankmeldungen',
                  retention: '5 Jahre',
                  action: 'Archivierung',
                  status: 'Aktiv'
                },
                {
                  type: 'Rechnungen',
                  retention: '10 Jahre',
                  action: 'Revisionssicher archivieren',
                  status: 'Aktiv'
                },
                {
                  type: 'Zertifikate',
                  retention: 'Individuell',
                  action: 'Verlängerungserinnerung',
                  status: 'Aktiv'
                }
              ].map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{rule.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {rule.retention} → {rule.action}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.status === 'Aktiv' ? 'default' : 'secondary'}>
                      {rule.status}
                    </Badge>
                    <Button variant="ghost" size="sm">Bearbeiten</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Neue Lebenszyklus-Regel
          </Button>
        </CardContent>
      </Card>

      {/* Metadaten & Kategorisierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            Metadaten & Kategorisierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">Pflicht-Metadaten</Label>
              <div className="space-y-2">
                {[
                  'Dokumenttyp',
                  'Erstellungsdatum',
                  'Mitarbeiter-Zuordnung',
                  'Abteilung',
                  'Status'
                ].map((field) => (
                  <div key={field} className="flex items-center justify-between">
                    <span className="text-sm">{field}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Optionale Metadaten</Label>
              <div className="space-y-2">
                {[
                  'Verfallsdatum',
                  'Kostenstelle',
                  'Projekt-ID',
                  'Externe Referenz',
                  'Priorität'
                ].map((field) => (
                  <div key={field} className="flex items-center justify-between">
                    <span className="text-sm">{field}</span>
                    <Switch defaultChecked={field === 'Verfallsdatum'} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Benutzerdefinierte Kategorien</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['HR-Dokumente', 'Finanzen', 'Legal', 'IT-Assets', 'Projekte'].map((category) => (
                <div key={category} className="p-2 border rounded text-sm text-center">
                  {category}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Tags className="h-4 w-4 mr-2" />
              Kategorie hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schnellsuche & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Schnellsuche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Volltext-Suche (OCR)</Label>
              <p className="text-sm text-muted-foreground">Suche im Dokumentinhalt</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">Suchindizierung</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">PDF-Textextraktion</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bild-OCR (Deutsch)</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Handschrifterkennung</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mehrsprachige OCR</span>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Standard-Filter</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nach Datum</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nach Mitarbeiter</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nach Abteilung</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nach Status</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium text-sm mb-2">Such-Performance</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Indexierte Dokumente</div>
                <div className="font-medium">47.298 / 47.832</div>
              </div>
              <div>
                <div className="text-muted-foreground">Ø Suchzeit</div>
                <div className="font-medium">{"<"}0.2s</div>
              </div>
              <div>
                <div className="text-muted-foreground">OCR-Genauigkeit</div>
                <div className="font-medium">97.3%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}