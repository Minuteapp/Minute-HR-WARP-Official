import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function TimeTrackingGeneralSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Arbeitszeitmodelle */}
      <Card>
        <CardHeader>
          <CardTitle>Standard-Arbeitszeitmodelle</CardTitle>
          <CardDescription>
            Definition der verfügbaren Arbeitszeitmodelle für Mitarbeiter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-model">Standard-Modell</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Arbeitszeitmodell wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="40h-week">40-Stunden-Woche</SelectItem>
                <SelectItem value="38h-week">38-Stunden-Woche</SelectItem>
                <SelectItem value="35h-week">35-Stunden-Woche</SelectItem>
                <SelectItem value="flextime">Gleitzeit</SelectItem>
                <SelectItem value="parttime">Teilzeit</SelectItem>
                <SelectItem value="shift">Schichtarbeit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Verfügbare Arbeitszeitmodelle</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>40h-Vollzeit</Badge>
              <Badge>Teilzeit 20h</Badge>
              <Badge>Gleitzeit 38h</Badge>
              <Badge>Schichtdienst</Badge>
              <Badge>Homeoffice-Hybrid</Badge>
            </div>
            <Button variant="outline" size="sm" disabled={!canManage}>
              Modell hinzufügen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-hours">Regelarbeitszeit pro Tag (h)</Label>
              <Input
                id="daily-hours"
                type="number"
                placeholder="8"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-hours">Wochenarbeitszeit (h)</Label>
              <Input
                id="weekly-hours"
                type="number"
                placeholder="40"
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pausenregelungen */}
      <Card>
        <CardHeader>
          <CardTitle>Pausenregelungen</CardTitle>
          <CardDescription>
            Konfiguration der gesetzlichen und betrieblichen Pausenzeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="automatic-breaks">Automatische Pausenberechnung</Label>
              <p className="text-sm text-muted-foreground">
                Pausen automatisch nach gesetzlichen Vorgaben berechnen
              </p>
            </div>
            <Switch id="automatic-breaks" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="break-6h">Pause nach 6h (Min.)</Label>
              <Input
                id="break-6h"
                type="number"
                placeholder="30"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-9h">Pause nach 9h (Min.)</Label>
              <Input
                id="break-9h"
                type="number"
                placeholder="45"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="paid-breaks">Bezahlte Pausen</Label>
              <p className="text-sm text-muted-foreground">
                Pausen werden als Arbeitszeit gewertet
              </p>
            </div>
            <Switch id="paid-breaks" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Arbeitszeitkonten */}
      <Card>
        <CardHeader>
          <CardTitle>Arbeitszeitkonten</CardTitle>
          <CardDescription>
            Verwaltung von Überstunden- und Gleitzeitkonten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="overtime-account" disabled={!canManage} />
              <Label htmlFor="overtime-account">Überstundenkonto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="flextime-account" disabled={!canManage} />
              <Label htmlFor="flextime-account">Gleitzeitkonto</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overtime-limit">Max. Überstunden (h/Monat)</Label>
              <Input
                id="overtime-limit"
                type="number"
                placeholder="50"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flextime-range">Gleitzeit-Spanne (+/- h)</Label>
              <Input
                id="flextime-range"
                type="number"
                placeholder="20"
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carryover-limit">Übertragungsgrenze (h)</Label>
            <Input
              id="carryover-limit"
              type="number"
              placeholder="40"
              disabled={!canManage}
            />
            <p className="text-sm text-muted-foreground">
              Maximale Stunden, die ins nächste Jahr übertragen werden können
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feiertage */}
      <Card>
        <CardHeader>
          <CardTitle>Feiertage & Kalender</CardTitle>
          <CardDescription>
            Automatischer Import von Feiertagen nach Standorten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-holidays">Automatischer Feiertagsimport</Label>
              <p className="text-sm text-muted-foreground">
                Feiertage automatisch über API importieren
              </p>
            </div>
            <Switch id="auto-holidays" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holiday-region">Standard-Region</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Region für Feiertage wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de-bw">Deutschland - Baden-Württemberg</SelectItem>
                <SelectItem value="de-by">Deutschland - Bayern</SelectItem>
                <SelectItem value="de-be">Deutschland - Berlin</SelectItem>
                <SelectItem value="de-br">Deutschland - Brandenburg</SelectItem>
                <SelectItem value="ch">Schweiz</SelectItem>
                <SelectItem value="at">Österreich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekend-work">Wochenendarbeit erlaubt</Label>
              <p className="text-sm text-muted-foreground">
                Arbeit an Samstagen und Sonntagen genehmigen
              </p>
            </div>
            <Switch id="weekend-work" disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Schichtmodelle */}
      <Card>
        <CardHeader>
          <CardTitle>Schichtmodelle</CardTitle>
          <CardDescription>
            Verknüpfung von Schichtplanung mit Zeiterfassung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shift-integration">Schichtplan-Integration</Label>
              <p className="text-sm text-muted-foreground">
                Geplante Schichten mit Zeiterfassung abgleichen
              </p>
            </div>
            <Switch id="shift-integration" disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label>Verfügbare Schichtmodelle</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">Frühschicht (06:00-14:00)</Badge>
              <Badge variant="secondary">Spätschicht (14:00-22:00)</Badge>
              <Badge variant="secondary">Nachtschicht (22:00-06:00)</Badge>
              <Badge variant="secondary">Bereitschaftsdienst</Badge>
            </div>
            <Button variant="outline" size="sm" disabled={!canManage}>
              Schichtmodell hinzufügen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="night-bonus">Nachtzuschlag (%)</Label>
              <Input
                id="night-bonus"
                type="number"
                placeholder="25"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekend-bonus">Wochenendzuschlag (%)</Label>
              <Input
                id="weekend-bonus"
                type="number"
                placeholder="50"
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}