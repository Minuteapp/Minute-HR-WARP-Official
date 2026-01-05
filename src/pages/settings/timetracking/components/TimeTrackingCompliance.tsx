import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Shield, FileText, Calendar, AlertTriangle, Eye, Download } from "lucide-react";

const TimeTrackingCompliance = () => {
  return (
    <div className="space-y-6">
      {/* Audit-Protokollierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit-Protokollierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Vollständige Audit-Logs aktiviert</p>
              <p className="text-sm text-muted-foreground">
                Jede Zeiterfassungs-Aktion wird revisionssicher protokolliert
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Aktiv
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aufbewahrungsdauer (Jahre)</Label>
              <Select defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Jahr</SelectItem>
                  <SelectItem value="2">2 Jahre (DE Standard)</SelectItem>
                  <SelectItem value="5">5 Jahre</SelectItem>
                  <SelectItem value="10">10 Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Archivierungs-Format</Label>
              <Select defaultValue="encrypted">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="encrypted">Verschlüsselt</SelectItem>
                  <SelectItem value="signed">Digital signiert</SelectItem>
                  <SelectItem value="both">Verschlüsselt + Signiert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DSGVO-Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            DSGVO & Datenschutz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Automatische Löschfristen</p>
                <p className="text-sm text-muted-foreground">Nach gesetzlichen Vorgaben</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Recht auf Vergessenwerden</p>
                <p className="text-sm text-muted-foreground">Mitarbeiter-Daten löschen</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Einwilligungs-Management</p>
                <p className="text-sm text-muted-foreground">Digitale Zustimmung erforderlich</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Datenportabilität</p>
                <p className="text-sm text-muted-foreground">Export für Mitarbeiter</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arbeitsrecht-Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Arbeitsrecht-Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">🇩🇪 Deutschland (ArbZG)</h4>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Konform
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Max. Arbeitszeit/Tag</p>
                  <p className="font-medium">10 Stunden</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Min. Ruhezeit</p>
                  <p className="font-medium">11 Stunden</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pausenregelung</p>
                  <p className="font-medium">30 Min ab 6h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Wochenarbeitszeit</p>
                  <p className="font-medium">48 Stunden</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">🇨🇭 Schweiz (ArG)</h4>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Konform
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Wochenarbeitszeit</p>
                  <p className="font-medium">45/50 Stunden</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tagesarbeitszeit</p>
                  <p className="font-medium">9 Stunden</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pausenregelung</p>
                  <p className="font-medium">15 Min ab 5.5h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ruhezeit</p>
                  <p className="font-medium">11 Stunden</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">🇦🇹 Österreich (AZG)</h4>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Konform
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Normalarbeitszeit</p>
                  <p className="font-medium">8 Stunden/Tag</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Max. täglich</p>
                  <p className="font-medium">12 Stunden</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Wochenarbeitszeit</p>
                  <p className="font-medium">48 Stunden</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ruhezeit</p>
                  <p className="font-medium">11 Stunden</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance-Berichte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Compliance-Berichte & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
              <Download className="h-6 w-6 mb-2" />
              <span>Arbeitszeit-Verstöße</span>
              <span className="text-xs text-muted-foreground">Letzter Monat</span>
            </Button>

            <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
              <FileText className="h-6 w-6 mb-2" />
              <span>DSGVO-Report</span>
              <span className="text-xs text-muted-foreground">Quartalsbericht</span>
            </Button>

            <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span>Compliance-Alerts</span>
              <span className="text-xs text-muted-foreground">7 neue Meldungen</span>
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="font-medium mb-2">Automatische Compliance-Checks</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tägliche Überstunden-Prüfung</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Aktiv
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Ruhezeiten-Kontrolle</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Aktiv
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Pausenregelung-Überwachung</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Aktiv
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Wochenarbeitszeit-Analyse</span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Aktiv
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sonderregelungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sonderregelungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="special-rules">Bereichsspezifische Regelungen</Label>
            <Textarea
              id="special-rules"
              placeholder="z.B. Sonderregeln für Sicherheitskräfte, Polizei, Feuerwehr, Rettungsdienst..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Öffentliche Sicherheit (Polizei/Feuerwehr)</p>
              <p className="text-sm text-muted-foreground">
                Abweichende Arbeitszeitregelungen gemäß Sondergesetzen
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Betriebsrat-Integration</p>
              <p className="text-sm text-muted-foreground">
                Automatische Benachrichtigung bei relevanten Änderungen
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingCompliance;