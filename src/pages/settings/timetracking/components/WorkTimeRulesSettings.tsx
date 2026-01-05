import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function WorkTimeRulesSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Deutschland - BetrVG/ArbZG */}
      <Card>
        <CardHeader>
          <CardTitle>Deutschland - Betriebsverfassungsgesetz (BetrVG) / Arbeitszeitgesetz (ArbZG)</CardTitle>
          <CardDescription>
            Gesetzliche Arbeitszeitregeln nach deutschem Recht
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="de-enabled">Deutsche Gesetze anwenden</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Überwachung der deutschen Arbeitszeitgesetze
              </p>
            </div>
            <Switch id="de-enabled" defaultChecked disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="de-max-daily">Max. Arbeitszeit pro Tag (h)</Label>
              <Input
                id="de-max-daily"
                type="number"
                value="8"
                disabled={!canManage}
              />
              <p className="text-sm text-muted-foreground">Erweiterbar auf 10h bei Ausgleich</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="de-rest-time">Mind. Ruhezeit (h)</Label>
              <Input
                id="de-rest-time"
                type="number"
                value="11"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pausenregelung</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">6-9 Stunden Arbeitszeit</h4>
                <p className="text-sm text-muted-foreground">Mindestens 30 Minuten Pause</p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">Über 9 Stunden Arbeitszeit</h4>
                <p className="text-sm text-muted-foreground">Mindestens 45 Minuten Pause</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="de-10h-extension">10h-Erweiterung erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Arbeitszeit auf 10h ausweiten bei entsprechendem Ausgleich
              </p>
            </div>
            <Switch id="de-10h-extension" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Sonderregelungen öffentliche Sicherheit */}
      <Card>
        <CardHeader>
          <CardTitle>Sonderregelungen - Öffentliche Sicherheit</CardTitle>
          <CardDescription>
            Spezielle Regeln für Polizei, Feuerwehr, Rettungsdienste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emergency-rules">Sonderregelungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Abweichungen für Einsatzkräfte und Notdienste
              </p>
            </div>
            <Switch id="emergency-rules" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency-departments">Betroffene Abteilungen</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>Polizei</Badge>
              <Badge>Feuerwehr</Badge>
              <Badge>Rettungsdienst</Badge>
              <Badge>Katastrophenschutz</Badge>
              <Badge>Sicherheitsdienst</Badge>
            </div>
            <Button variant="outline" size="sm" disabled={!canManage}>
              Abteilung hinzufügen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency-rest-time">Verkürzte Ruhezeit (h)</Label>
              <Input
                id="emergency-rest-time"
                type="number"
                placeholder="8"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-max-hours">Max. Einsatzzeit (h)</Label>
              <Input
                id="emergency-max-hours"
                type="number"
                placeholder="12"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-emergency-time">Einsatzzeiten automatisch markieren</Label>
              <p className="text-sm text-muted-foreground">
                Einsätze werden automatisch als Sonderzeit erfasst
              </p>
            </div>
            <Switch id="auto-emergency-time" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Schweiz */}
      <Card>
        <CardHeader>
          <CardTitle>Schweiz - Arbeitsgesetz (ArG)</CardTitle>
          <CardDescription>
            Schweizerische Arbeitszeitbestimmungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ch-enabled">Schweizer Gesetze anwenden</Label>
              <p className="text-sm text-muted-foreground">
                Arbeitszeitgesetze nach schweizerischem Recht
              </p>
            </div>
            <Switch id="ch-enabled" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ch-industry-hours">Industrie/Büro (h/Woche)</Label>
              <Input
                id="ch-industry-hours"
                type="number"
                value="45"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-other-hours">Andere Branchen (h/Woche)</Label>
              <Input
                id="ch-other-hours"
                type="number"
                value="50"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ch-sunday-work">Sonntagsarbeit mit Bewilligung</Label>
              <p className="text-sm text-muted-foreground">
                Sonntagsarbeit automatisch kennzeichnen
              </p>
            </div>
            <Switch id="ch-sunday-work" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ch-branch">Branche/Sektor</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Branche wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="industry">Industrie</SelectItem>
                <SelectItem value="office">Bürotätigkeit</SelectItem>
                <SelectItem value="retail">Einzelhandel</SelectItem>
                <SelectItem value="gastronomy">Gastronomie</SelectItem>
                <SelectItem value="healthcare">Gesundheitswesen</SelectItem>
                <SelectItem value="other">Andere</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Österreich */}
      <Card>
        <CardHeader>
          <CardTitle>Österreich - Arbeitszeitgesetz (AZG)</CardTitle>
          <CardDescription>
            Österreichische Arbeitszeitbestimmungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="at-enabled">Österreichische Gesetze anwenden</Label>
              <p className="text-sm text-muted-foreground">
                Arbeitszeitgesetze nach österreichischem Recht
              </p>
            </div>
            <Switch id="at-enabled" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="at-max-daily">Max. Normalarbeitszeit (h/Tag)</Label>
              <Input
                id="at-max-daily"
                type="number"
                value="12"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="at-max-weekly">Max. Arbeitszeit (h/Woche)</Label>
              <Input
                id="at-max-weekly"
                type="number"
                value="60"
                disabled={!canManage}
              />
              <p className="text-sm text-muted-foreground">Bei entsprechendem Ausgleich</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="at-13th-14th-salary">13. & 14. Monatsgehalt</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Berechnung in Zeitwirtschaft
              </p>
            </div>
            <Switch id="at-13th-14th-salary" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Tarifverträge */}
      <Card>
        <CardHeader>
          <CardTitle>Tarifverträge & Betriebsvereinbarungen</CardTitle>
          <CardDescription>
            Integration von Tarifverträgen und betriebsspezifischen Regelungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="collective-agreements">Tarifverträge aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Anbindung an Tarif-Datenbanken
              </p>
            </div>
            <Switch id="collective-agreements" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tariff-database">Tarif-Datenbank</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Datenbank wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ig-metall">IG Metall</SelectItem>
                <SelectItem value="verdi">Ver.di</SelectItem>
                <SelectItem value="ig-bce">IG BCE</SelectItem>
                <SelectItem value="tvl">TVL (Länder)</SelectItem>
                <SelectItem value="tvoed">TVöD (Öffentlicher Dienst)</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-rules">Betriebsvereinbarungen</Label>
            <Textarea
              id="company-rules"
              placeholder="Spezielle betriebliche Regelungen eingeben..."
              disabled={!canManage}
            />
          </div>

          <Button variant="outline" disabled={!canManage}>
            Tarifvertrag importieren
          </Button>
        </CardContent>
      </Card>

      {/* Globales Template-System */}
      <Card>
        <CardHeader>
          <CardTitle>Globales Template-System</CardTitle>
          <CardDescription>
            Vorbereitung für weitere Länder und internationale Expansion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Verfügbare Länder-Templates</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">Deutschland</Badge>
              <Badge variant="secondary">Schweiz</Badge>
              <Badge variant="secondary">Österreich</Badge>
              <Badge>Frankreich (Vorbereitung)</Badge>
              <Badge>Italien (Vorbereitung)</Badge>
              <Badge>Niederlande (Vorbereitung)</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="future-countries">Zukünftige Länder</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Land für Vorbereitung wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Frankreich</SelectItem>
                <SelectItem value="it">Italien</SelectItem>
                <SelectItem value="nl">Niederlande</SelectItem>
                <SelectItem value="es">Spanien</SelectItem>
                <SelectItem value="uk">Vereinigtes Königreich</SelectItem>
                <SelectItem value="us">USA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" disabled={!canManage}>
            Neues Länder-Template erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}