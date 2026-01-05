import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Mail, QrCode, Bot, Settings, FileText, Users, Building, FolderOpen } from "lucide-react";

export default function DocumentIncomingTab() {
  return (
    <div className="space-y-6">
      {/* Upload-Kanäle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload-Kanäle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Web-Upload</Label>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">Direkter Upload über Browser</p>
              <div className="space-y-2">
                <Label className="text-xs">Max. Dateigröße</Label>
                <Input type="number" defaultValue="50" className="text-sm" />
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-Mail-Postfach
                </Label>
                <Switch />
              </div>
              <p className="text-sm text-muted-foreground">Dokumente per E-Mail einreichen</p>
              <div className="space-y-2">
                <Label className="text-xs">E-Mail-Adresse</Label>
                <Input placeholder="dokumente@firma.de" className="text-sm" />
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR-Code-Scan
                </Label>
                <Switch />
              </div>
              <p className="text-sm text-muted-foreground">Mobile App mit QR-Scanner</p>
              <Button variant="outline" size="sm" className="w-full">
                QR-Code generieren
              </Button>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">API-Schnittstelle</Label>
                <Switch />
              </div>
              <p className="text-sm text-muted-foreground">DATEV & SevDesk Integration</p>
              <Badge variant="secondary">Konfiguration erforderlich</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KI-OCR & Automatische Erkennung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            KI-OCR & Automatische Erkennung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Smart Detection aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Erkennung von Dokumenttypen</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-medium">Erkennbare Dokumenttypen</Label>
              <div className="space-y-2">
                {[
                  'Arbeitsvertrag',
                  'Krankmeldung/Attest',
                  'Rechnung',
                  'Reisebeleg',
                  'Zertifikat',
                  'Bewerbungsunterlagen'
                ].map((type) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{type}</span>
                    <Switch defaultChecked={type !== 'Bewerbungsunterlagen'} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Automatisches Tagging</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Mitarbeiter-Zuordnung
                  </span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Abteilungs-Zuordnung
                  </span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Projekt-Zuordnung
                  </span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dublettenprüfung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Dublettenprüfung & Zuweisung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Automatische Dublettenprüfung</Label>
              <p className="text-sm text-muted-foreground">Verhindert doppelte Uploads</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Prüfkriterien</Label>
              <Select defaultValue="hash+metadata">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hash">Nur Datei-Hash</SelectItem>
                  <SelectItem value="hash+metadata">Hash + Metadaten</SelectItem>
                  <SelectItem value="content">Inhaltsprüfung (OCR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Toleranzschwelle</Label>
              <Select defaultValue="95">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90% Übereinstimmung</SelectItem>
                  <SelectItem value="95">95% Übereinstimmung</SelectItem>
                  <SelectItem value="99">99% Übereinstimmung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Aktion bei Dublette</Label>
              <Select defaultValue="warn">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Upload blockieren</SelectItem>
                  <SelectItem value="warn">Warnung anzeigen</SelectItem>
                  <SelectItem value="auto">Automatisch ersetzen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Automatische Zuweisung</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm mb-2">Mitarbeiterakte</div>
                <div className="text-xs text-muted-foreground">
                  Verträge, Zeugnisse, Zertifikate
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm mb-2">Abteilungsordner</div>
                <div className="text-xs text-muted-foreground">
                  Abteilungsweite Dokumente
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm mb-2">Globales Archiv</div>
                <div className="text-xs text-muted-foreground">
                  Richtlinien, Handbücher
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eingangsregeln */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Eingangsregeln
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="font-medium">Regelbasierte Verarbeitung</Label>
            <div className="space-y-2">
              {[
                {
                  condition: 'E-Mail von bekannter Domain',
                  action: 'Automatisch annehmen',
                  status: 'Aktiv'
                },
                {
                  condition: 'PDF mit Firmen-Briefkopf',
                  action: 'Priorität: Hoch',
                  status: 'Aktiv'
                },
                {
                  condition: 'Dateigröße {\'>\'}10MB',
                  action: 'Komprimierung',
                  status: 'Aktiv'
                },
                {
                  condition: 'Unbekannter Dokumenttyp',
                  action: 'Manuelle Prüfung',
                  status: 'Inaktiv'
                }
              ].map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{rule.condition}</div>
                    <div className="text-xs text-muted-foreground">{rule.action}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.status === 'Aktiv' ? 'default' : 'secondary'}>
                      {rule.status}
                    </Badge>
                    <Switch defaultChecked={rule.status === 'Aktiv'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Neue Regel erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}