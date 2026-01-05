import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, FileText, Globe, Lock, FileCheck } from "lucide-react";

export default function CompliancePrivacySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            DSGVO-Konformität
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Opt-in für Mitarbeiter aktivieren</Label>
                <p className="text-sm text-muted-foreground">Explizite Zustimmung für jede Benachrichtigungsart</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Opt-out Möglichkeit bereitstellen</Label>
                <p className="text-sm text-muted-foreground">Jederzeit widerrufbare Einstellungen</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Datenminimierung</Label>
                <p className="text-sm text-muted-foreground">Nur notwendige Daten in Benachrichtigungen</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Pseudonymisierung aktivieren</Label>
                <p className="text-sm text-muted-foreground">Anonymisierung sensibler Daten in Logs</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Benachrichtigungs-Historie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Historie speichern</Label>
              <p className="text-sm text-muted-foreground">Nachweis über versendete Benachrichtigungen</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aufbewahrungsdauer (Jahre)</Label>
              <Input placeholder="7" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Speicherort</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Speicherort wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu-central">EU-Central (Frankfurt)</SelectItem>
                  <SelectItem value="eu-west">EU-West (Irland)</SelectItem>
                  <SelectItem value="local">Lokaler Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Länderregelungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇩🇪 Deutschland</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>DSGVO-Konformität</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>BetrVG-Compliance</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Mitbestimmungsrechte</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇨🇭 Schweiz</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>nDSG-Konformität</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Arbeitsgesetz-Compliance</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Sonntagsarbeit-Meldung</span>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇦🇹 Österreich</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>DSGVO-Konformität</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Arbeitszeitgesetz</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Kollektivvertrag-Regeln</span>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇺🇸 USA</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>CCPA-Konformität</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>FLSA-Compliance</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>State-specific Rules</span>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Sicherheitsrelevante Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Polizei & Strafverfolgung</Label>
                <p className="text-sm text-muted-foreground">Spezielle Datenschutzregeln für Ermittlungsverfahren</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Feuerwehr & Rettungsdienste</Label>
                <p className="text-sm text-muted-foreground">Notfall-Benachrichtigungen ohne Opt-out</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Bundeswehr & Verteidigung</Label>
                <p className="text-sm text-muted-foreground">Verschärfte Sicherheitsbestimmungen</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Kritische Infrastruktur</Label>
                <p className="text-sm text-muted-foreground">KRITIS-Meldepflichten</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Audit-Log & Nachweisführung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Vollständiges Audit-Log</Label>
              <p className="text-sm text-muted-foreground">Alle versendeten Benachrichtigungen protokollieren</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Log-Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Level wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="detailed">Detailliert</SelectItem>
                  <SelectItem value="forensic">Forensisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Backup-Häufigkeit</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Häufigkeit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Verschlüsselung</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Verschlüsselung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aes256">AES-256</SelectItem>
                  <SelectItem value="rsa2048">RSA-2048</SelectItem>
                  <SelectItem value="ecc">ECC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance-Berichte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <span className="font-medium">DSGVO-Bericht</span>
              <span className="text-sm text-muted-foreground">Monatlicher Datenschutzbericht</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <span className="font-medium">Audit-Zusammenfassung</span>
              <span className="text-sm text-muted-foreground">Quartalsweise Compliance-Übersicht</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Zurücksetzen</Button>
        <Button>Einstellungen speichern</Button>
      </div>
    </div>
  );
}