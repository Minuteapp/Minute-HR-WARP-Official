import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, Moon, AlertTriangle, Plus } from "lucide-react";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function BreaksRestPeriodsTab() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Automatische Pausen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <CardTitle>Automatische Pausenabzüge</CardTitle>
          </div>
          <CardDescription>
            Konfiguration der automatischen Pausenberechnung nach gesetzlichen Vorgaben
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Pausenabzüge aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Pausen werden automatisch basierend auf Arbeitszeit abgezogen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Manuelle Pausenerfassung erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter können Pausen manuell erfassen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pflichtpausen erzwingen</Label>
              <p className="text-sm text-muted-foreground">
                Gesetzliche Mindestpausen werden erzwungen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Pausenstaffel */}
      <Card>
        <CardHeader>
          <CardTitle>Pausenstaffel (gesetzlich)</CardTitle>
          <CardDescription>
            Definition der Mindestpausen nach Arbeitsdauer gemäß ArbZG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ab 6 Stunden Arbeitszeit</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="30" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Minuten</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ab 9 Stunden Arbeitszeit</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="45" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Minuten</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Maximale Pause ohne Unterbrechung</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="15" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Minuten min.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pausensplitting erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Pausen können in mehrere Blöcke aufgeteilt werden (min. 15 Min.)
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Pausentypen */}
      <Card>
        <CardHeader>
          <CardTitle>Pausentypen</CardTitle>
          <CardDescription>
            Definition verschiedener Pausenarten und deren Behandlung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Mittagspause</Badge>
                <span className="text-sm text-muted-foreground">Standard-Pause</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Unbezahlt</span>
                <Switch disabled={!canManage} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Bildschirmpause</Badge>
                <span className="text-sm text-muted-foreground">5 Min. pro Stunde</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Bezahlt</span>
                <Switch disabled={!canManage} defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Raucherpause</Badge>
                <span className="text-sm text-muted-foreground">Separat erfassen</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Unbezahlt</span>
                <Switch disabled={!canManage} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Stillpause</Badge>
                <span className="text-sm text-muted-foreground">Gesetzlich geschützt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Bezahlt</span>
                <Switch disabled={!canManage} defaultChecked />
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" disabled={!canManage}>
            <Plus className="h-4 w-4 mr-2" />
            Pausentyp hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Ruhezeiten */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            <CardTitle>Ruhezeiten zwischen Arbeitstagen</CardTitle>
          </div>
          <CardDescription>
            Konfiguration der Mindest-Ruhezeiten gemäß Arbeitszeitgesetz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mindest-Ruhezeit zwischen Arbeitstagen</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="11" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Gesetzliches Minimum: 11 Stunden
              </p>
            </div>
            <div className="space-y-2">
              <Label>Wochenruhezeit</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="35" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Gesetzliches Minimum: 24 + 11 = 35 Stunden
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ruhezeit-Verletzungen automatisch warnen</Label>
              <p className="text-sm text-muted-foreground">
                System warnt bei Unterschreitung der Ruhezeiten
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Buchung bei Ruhezeit-Verletzung verhindern</Label>
              <p className="text-sm text-muted-foreground">
                Zeitbuchungen werden blockiert, wenn Ruhezeit nicht eingehalten
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Nachtarbeit */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Nachtarbeit-Logik</CardTitle>
          </div>
          <CardDescription>
            Definition und Regeln für Nachtarbeitszeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nachtarbeit beginnt um</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="23:00" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="21:00">21:00</SelectItem>
                  <SelectItem value="22:00">22:00</SelectItem>
                  <SelectItem value="23:00">23:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nachtarbeit endet um</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="06:00" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="05:00">05:00</SelectItem>
                  <SelectItem value="06:00">06:00</SelectItem>
                  <SelectItem value="07:00">07:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximale Nachtarbeit pro Tag</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="8" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Maximale Nachtschichten pro Woche</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="5" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Schichten</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nachtarbeitszuschlag automatisch berechnen</Label>
              <p className="text-sm text-muted-foreground">
                Zuschläge werden automatisch auf Nachtarbeitsstunden angewandt
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Bereitschaftszeiten */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Bereitschaftszeiten</CardTitle>
          </div>
          <CardDescription>
            Regelungen für Rufbereitschaft und Arbeitsbereitschaft
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bereitschaftszeit-Anrechnung</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Anrechnungsmodus wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">100% als Arbeitszeit</SelectItem>
                <SelectItem value="partial">50% als Arbeitszeit</SelectItem>
                <SelectItem value="none">Nicht als Arbeitszeit</SelectItem>
                <SelectItem value="on-call">Nur bei Einsatz als Arbeitszeit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pauschale Bereitschaftsvergütung</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="50" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">€/Schicht</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reaktionszeit bei Rufbereitschaft</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="30" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Minuten</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bereitschaftszeit auf Ruhezeit anrechnen</Label>
              <p className="text-sm text-muted-foreground">
                Bereitschaftszeiten unterbrechen die Ruhezeit nicht
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Speichern */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Verwerfen</Button>
        <Button disabled={!canManage}>Einstellungen speichern</Button>
      </div>
    </div>
  );
}
