import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { Brain, AlertTriangle, Coffee, TrendingUp, Lightbulb } from "lucide-react";

export default function AISmartDetectionSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Anomalie-Erkennung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Anomalie-Erkennung
          </CardTitle>
          <CardDescription>
            Automatische Erkennung ungewöhnlicher Zeiterfassungsmuster
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anomaly-detection">Anomalie-Erkennung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                KI-basierte Erkennung ungewöhnlicher Muster
              </p>
            </div>
            <Switch id="anomaly-detection" disabled={!canManage} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Erkennungsempfindlichkeit</Label>
              <Slider
                defaultValue={[70]}
                max={100}
                step={10}
                className="w-full"
                disabled={!canManage}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Niedrig</span>
                <span>Mittel</span>
                <span>Hoch</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Anomalie-Typen</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch id="missing-checkout" disabled={!canManage} />
                  <Label htmlFor="missing-checkout" className="text-sm">Vergessenes Ausstempeln</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="excessive-overtime" disabled={!canManage} />
                  <Label htmlFor="excessive-overtime" className="text-sm">Extreme Überstunden</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="unusual-hours" disabled={!canManage} />
                  <Label htmlFor="unusual-hours" className="text-sm">Ungewöhnliche Arbeitszeiten</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="weekend-work" disabled={!canManage} />
                  <Label htmlFor="weekend-work" className="text-sm">Häufige Wochenendarbeit</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="analysis-period">Analysezeitraum (Tage)</Label>
                <Input
                  id="analysis-period"
                  type="number"
                  placeholder="30"
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold-overtime">Überstunden-Schwellenwert (h)</Label>
                <Input
                  id="threshold-overtime"
                  type="number"
                  placeholder="50"
                  disabled={!canManage}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatische Berechnungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Automatische Berechnungen
          </CardTitle>
          <CardDescription>
            KI-gestützte Berechnung von Zuschlägen und Sonderzeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-calculations">Automatische Berechnungen</Label>
              <p className="text-sm text-muted-foreground">
                Überstunden, Zuschläge automatisch berechnen
              </p>
            </div>
            <Switch id="auto-calculations" defaultChecked disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Überstunden</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="overtime-auto" defaultChecked disabled={!canManage} />
                  <Label htmlFor="overtime-auto" className="text-sm">Automatisch</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="overtime-rate" className="text-sm">Zuschlag (%)</Label>
                  <Input
                    id="overtime-rate"
                    type="number"
                    placeholder="25"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Nachtzuschlag</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="night-auto" defaultChecked disabled={!canManage} />
                  <Label htmlFor="night-auto" className="text-sm">Automatisch</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="night-rate" className="text-sm">Zuschlag (%)</Label>
                  <Input
                    id="night-rate"
                    type="number"
                    placeholder="25"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Sonntagsarbeit</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="sunday-auto" defaultChecked disabled={!canManage} />
                  <Label htmlFor="sunday-auto" className="text-sm">Automatisch</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sunday-rate" className="text-sm">Zuschlag (%)</Label>
                  <Input
                    id="sunday-rate"
                    type="number"
                    placeholder="50"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Feiertagsarbeit</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="holiday-auto" defaultChecked disabled={!canManage} />
                  <Label htmlFor="holiday-auto" className="text-sm">Automatisch</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="holiday-rate" className="text-sm">Zuschlag (%)</Label>
                  <Input
                    id="holiday-rate"
                    type="number"
                    placeholder="100"
                    disabled={!canManage}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart-Pausenerkennung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Smart-Pausenerkennung
          </CardTitle>
          <CardDescription>
            Intelligente Erkennung nicht gestempelter Pausen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smart-breaks">Smart-Pausenerkennung</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Erkennung von Pausen ohne Stempelung
              </p>
            </div>
            <Switch id="smart-breaks" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-break-gap">Min. Pausenlücke (Min.)</Label>
              <Input
                id="min-break-gap"
                type="number"
                placeholder="15"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-break-duration">Max. Pausendauer (Min.)</Label>
              <Input
                id="max-break-duration"
                type="number"
                placeholder="90"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="break-detection-method">Erkennungsmethode</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Methode wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activity-pattern">Aktivitätsmuster</SelectItem>
                <SelectItem value="location-based">Standortbasiert</SelectItem>
                <SelectItem value="time-gaps">Zeitlücken</SelectItem>
                <SelectItem value="combined">Kombiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="suggest-breaks">Pausen vorschlagen</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeitern erkannte Pausen zur Bestätigung vorschlagen
              </p>
            </div>
            <Switch id="suggest-breaks" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Beispiel erkannte Pausen</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">12:00 - 12:30</span>
                  <p className="text-sm text-muted-foreground">Mittagspause (Kantine)</p>
                </div>
                <Badge variant="outline">Vorgeschlagen</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">15:15 - 15:30</span>
                  <p className="text-sm text-muted-foreground">Kaffeepause (Aufenthaltsraum)</p>
                </div>
                <Badge variant="secondary">Bestätigt</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KI für Planung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            KI für Personalplanung
          </CardTitle>
          <CardDescription>
            Predictive Analytics für Personalengpässe und Optimierung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="predictive-analytics">Predictive Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Vorhersage von Personalengpässen basierend auf historischen Daten
              </p>
            </div>
            <Switch id="predictive-analytics" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prediction-horizon">Vorhersagezeitraum (Wochen)</Label>
              <Input
                id="prediction-horizon"
                type="number"
                placeholder="4"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Mindest-Konfidenz (%)</Label>
              <Input
                id="confidence-threshold"
                type="number"
                placeholder="80"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vorhersage-Faktoren</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="seasonal-patterns" disabled={!canManage} />
                <Label htmlFor="seasonal-patterns" className="text-sm">Saisonale Muster</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="absence-trends" disabled={!canManage} />
                <Label htmlFor="absence-trends" className="text-sm">Abwesenheitstrends</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="overtime-patterns" disabled={!canManage} />
                <Label htmlFor="overtime-patterns" className="text-sm">Überstundenmuster</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="workload-history" disabled={!canManage} />
                <Label htmlFor="workload-history" className="text-sm">Arbeitslastverlauf</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Beispiel-Vorhersagen</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded border-orange-200 bg-orange-50">
                <div>
                  <span className="font-medium">KW 15: Personalmangel IT-Abteilung</span>
                  <p className="text-sm text-muted-foreground">Konfidenz: 85% | 3 Mitarbeiter im Urlaub</p>
                </div>
                <Badge variant="outline">Warnung</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded border-blue-200 bg-blue-50">
                <div>
                  <span className="font-medium">KW 18: Hohe Arbeitsbelastung Vertrieb</span>
                  <p className="text-sm text-muted-foreground">Konfidenz: 92% | Messezeit</p>
                </div>
                <Badge variant="outline">Info</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schichtoptimierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Intelligente Schichtoptimierung
          </CardTitle>
          <CardDescription>
            KI-basierte Vorschläge zur Schichtplanung und -optimierung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shift-optimization">Schichtoptimierung</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Vorschläge für optimale Schichtverteilung
              </p>
            </div>
            <Switch id="shift-optimization" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Optimierungsziele</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="minimize-overtime" disabled={!canManage} />
                <Label htmlFor="minimize-overtime" className="text-sm">Überstunden minimieren</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="balance-workload" disabled={!canManage} />
                <Label htmlFor="balance-workload" className="text-sm">Arbeitsbelastung ausgleichen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="reduce-costs" disabled={!canManage} />
                <Label htmlFor="reduce-costs" className="text-sm">Personalkosten reduzieren</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="improve-satisfaction" disabled={!canManage} />
                <Label htmlFor="improve-satisfaction" className="text-sm">Mitarbeiterzufriedenheit verbessern</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="optimization-frequency">Optimierungsfrequenz</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Häufigkeit wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="on-demand">Auf Anfrage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="learning-period">Lernzeitraum (Monate)</Label>
              <Input
                id="learning-period"
                type="number"
                placeholder="6"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Beispiel-Optimierungsvorschläge</Label>
            <div className="space-y-2">
              <div className="p-3 border rounded border-green-200 bg-green-50">
                <span className="font-medium">Frühschicht verstärken</span>
                <p className="text-sm text-muted-foreground">
                  +1 Mitarbeiter → 15% weniger Überstunden, 8% Kosteneinsparung
                </p>
              </div>
              <div className="p-3 border rounded border-blue-200 bg-blue-50">
                <span className="font-medium">Schichtwechsel optimieren</span>
                <p className="text-sm text-muted-foreground">
                  Früh-Spät Rotation alle 2 Wochen → 12% bessere Work-Life-Balance
                </p>
              </div>
            </div>
          </div>

          <Button variant="outline" disabled={!canManage}>
            Optimierung jetzt ausführen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}