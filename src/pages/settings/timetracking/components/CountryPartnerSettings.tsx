import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { Globe, MapPin, Calendar, DollarSign } from "lucide-react";

export default function CountryPartnerSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Standortabhängige Regeln */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Standortabhängige Regeln
          </CardTitle>
          <CardDescription>
            Automatische Anwendung länderspezifischer Arbeitszeitgesetze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-rules">Standortbasierte Regeln</Label>
              <p className="text-sm text-muted-foreground">
                Arbeitszeitgesetze automatisch nach Standort anwenden
              </p>
            </div>
            <Switch id="location-rules" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-4">
            {/* Deutschland */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-black"></div>
                  <div className="w-6 h-4 bg-red-500"></div>
                  <div className="w-6 h-4 bg-yellow-400"></div>
                  <div>
                    <h4 className="font-medium">Deutschland</h4>
                    <p className="text-sm text-muted-foreground">3 Standorte</p>
                  </div>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Max. Arbeitszeit:</span>
                  <p>8h/Tag (10h mit Ausgleich)</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ruhezeit:</span>
                  <p>11 Stunden</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pausenregelung:</span>
                  <p>30 Min (6-9h), 45 Min ({'>'}9h)</p>
                </div>
              </div>
            </div>

            {/* Schweiz */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-red-500"></div>
                  <div className="w-6 h-4 bg-white border"></div>
                  <div className="w-6 h-4 bg-red-500"></div>
                  <div>
                    <h4 className="font-medium">Schweiz</h4>
                    <p className="text-sm text-muted-foreground">1 Standort</p>
                  </div>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Arbeitszeit:</span>
                  <p>45h/Woche (Büro), 50h/Woche (andere)</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sonntagsarbeit:</span>
                  <p>Nur mit Bewilligung</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Währung:</span>
                  <p>CHF</p>
                </div>
              </div>
            </div>

            {/* Österreich */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-red-500"></div>
                  <div className="w-6 h-4 bg-white border"></div>
                  <div className="w-6 h-4 bg-red-500"></div>
                  <div>
                    <h4 className="font-medium">Österreich</h4>
                    <p className="text-sm text-muted-foreground">2 Standorte</p>
                  </div>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Max. Arbeitszeit:</span>
                  <p>12h/Tag, 60h/Woche</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Besonderheit:</span>
                  <p>13. & 14. Monatsgehalt</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Währung:</span>
                  <p>EUR</p>
                </div>
              </div>
            </div>
          </div>

          <Button disabled={!canManage}>Neues Land hinzufügen</Button>
        </CardContent>
      </Card>

      {/* Partnerländer Schweiz & Österreich */}
      <Card>
        <CardHeader>
          <CardTitle>Partnerländer Integration</CardTitle>
          <CardDescription>
            Spezielle Integration für Schweiz und Österreich
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Schweiz */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium">Schweiz</h4>
                <Badge variant="secondary">Partner</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="ch-holidays" defaultChecked disabled={!canManage} />
                  <Label htmlFor="ch-holidays" className="text-sm">Schweizer Feiertage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="ch-currency" defaultChecked disabled={!canManage} />
                  <Label htmlFor="ch-currency" className="text-sm">CHF-Abrechnung</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="ch-sunday-premium" disabled={!canManage} />
                  <Label htmlFor="ch-sunday-premium" className="text-sm">Sonntagszuschlag</Label>
                </div>
              </div>
            </div>

            {/* Österreich */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium">Österreich</h4>
                <Badge variant="secondary">Partner</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="at-holidays" defaultChecked disabled={!canManage} />
                  <Label htmlFor="at-holidays" className="text-sm">Österr. Feiertage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="at-13th-14th" disabled={!canManage} />
                  <Label htmlFor="at-13th-14th" className="text-sm">13./14. Monatsgehalt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="at-eur" defaultChecked disabled={!canManage} />
                  <Label htmlFor="at-eur" className="text-sm">EUR-Abrechnung</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatische Feiertagskalender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Automatische Feiertagskalender
          </CardTitle>
          <CardDescription>
            Integration offizieller Feiertagskalender via APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-holiday-sync">Automatische Synchronisation</Label>
              <p className="text-sm text-muted-foreground">
                Feiertage automatisch über offizielle APIs importieren
              </p>
            </div>
            <Switch id="auto-holiday-sync" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Feiertagsquellen</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">Deutschland - Feiertage.net</span>
                  <p className="text-sm text-muted-foreground">Bundesweite und landesspezifische Feiertage</p>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">Schweiz - Admin.ch</span>
                  <p className="text-sm text-muted-foreground">Offizielle Schweizer Feiertage</p>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">Österreich - Data.gv.at</span>
                  <p className="text-sm text-muted-foreground">Österreichische Feiertage</p>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sync-frequency">Sync-Häufigkeit</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Häufigkeit wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="next-sync">Nächste Synchronisation</Label>
              <Input
                id="next-sync"
                type="date"
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Währungseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Währungseinstellungen
          </CardTitle>
          <CardDescription>
            Länderspezifische Währungen und Abrechnungsmodalitäten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Deutschland</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="de-currency">Währung</Label>
                  <Input
                    id="de-currency"
                    value="EUR (€)"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="de-min-wage">Mindestlohn (€/h)</Label>
                  <Input
                    id="de-min-wage"
                    type="number"
                    placeholder="12.00"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Schweiz</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ch-currency">Währung</Label>
                  <Input
                    id="ch-currency"
                    value="CHF (Fr.)"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ch-exchange-rate">Wechselkurs (EUR→CHF)</Label>
                  <Input
                    id="ch-exchange-rate"
                    type="number"
                    placeholder="1.08"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Österreich</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="at-currency">Währung</Label>
                  <Input
                    id="at-currency"
                    value="EUR (€)"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="at-special-payment">Sonderzahlungen</Label>
                  <Select disabled={!canManage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Konfiguration..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">13. & 14. Monatsgehalt</SelectItem>
                      <SelectItem value="13th-only">Nur 13. Monatsgehalt</SelectItem>
                      <SelectItem value="none">Keine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-exchange">Automatische Wechselkurse</Label>
              <p className="text-sm text-muted-foreground">
                Wechselkurse täglich über Finanz-APIs aktualisieren
              </p>
            </div>
            <Switch id="auto-exchange" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* EU & Internationale Erweiterung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            EU & Internationale Erweiterung
          </CardTitle>
          <CardDescription>
            Vorbereitung für weitere EU-Länder und internationale Märkte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Geplante Länder-Erweiterungen</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">EU-Länder</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Frankreich</Badge>
                  <Badge variant="outline">Italien</Badge>
                  <Badge variant="outline">Niederlande</Badge>
                  <Badge variant="outline">Spanien</Badge>
                  <Badge variant="outline">Polen</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">International</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Vereinigtes Königreich</Badge>
                  <Badge variant="outline">USA</Badge>
                  <Badge variant="outline">Kanada</Badge>
                  <Badge variant="outline">Australien</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority-country">Priorität für nächste Erweiterung</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Land wählen..." />
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gdpr-compliance">DSGVO-Compliance</Label>
              <p className="text-sm text-muted-foreground">
                Alle neuen Länder automatisch DSGVO-konform konfigurieren
              </p>
            </div>
            <Switch id="gdpr-compliance" defaultChecked disabled={!canManage} />
          </div>

          <Button variant="outline" disabled={!canManage}>
            Länder-Template erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}