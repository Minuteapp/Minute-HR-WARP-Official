import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Save, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export const AbsenceGeneralSettings = () => {
  const { toast } = useToast();
  const { hasPermission } = useRolePermissions();
  
  const canEdit = hasPermission('absence_settings');

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die allgemeinen Abwesenheitseinstellungen wurden erfolgreich aktualisiert.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Allgemeine Einstellungen</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Zeiterfassung & Berechnung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="time-unit">Standard-Zeiteinheit</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeiteinheit wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-days">Ganze Tage</SelectItem>
                  <SelectItem value="half-days">Halbtage</SelectItem>
                  <SelectItem value="hours">Stunden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-vacation-days">Max. Urlaubstage pro Jahr</Label>
              <Input
                id="max-vacation-days"
                type="number"
                defaultValue="30"
                disabled={!canEdit}
                placeholder="30"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Automatische Resturlaub-Berechnung</Label>
                <p className="text-sm text-muted-foreground">
                  Resturlaubstage werden automatisch basierend auf dem Eintrittsdatum berechnet
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Feiertage automatisch berücksichtigen</Label>
                <p className="text-sm text-muted-foreground">
                  Standort-/länderspezifische Feiertage werden bei der Berechnung berücksichtigt
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Wochenenden ausschließen</Label>
                <p className="text-sm text-muted-foreground">
                  Samstag und Sonntag werden nicht als Urlaubstage gezählt
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Urlaubsübertrag & Verfallsdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="transfer-deadline">Stichtag für Urlaubsübertrag</Label>
              <Input
                id="transfer-deadline"
                type="date"
                defaultValue="2025-03-31"
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry-date">Verfallsdatum für Resturlaub</Label>
              <Input
                id="expiry-date"
                type="date"
                defaultValue="2025-12-31"
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Automatische Erinnerung vor Verfall</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter werden automatisch vor dem Urlaubsverfall benachrichtigt
              </p>
            </div>
            <Switch disabled={!canEdit} defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Standort & Ländereinstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="default-country">Standard-Land</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Land wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutschland</SelectItem>
                  <SelectItem value="at">Österreich</SelectItem>
                  <SelectItem value="ch">Schweiz</SelectItem>
                  <SelectItem value="fr">Frankreich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-timezone">Standard-Zeitzone</Label>
              <Select disabled={!canEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Zeitzone wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe/berlin">Europa/Berlin</SelectItem>
                  <SelectItem value="europe/vienna">Europa/Wien</SelectItem>
                  <SelectItem value="europe/zurich">Europa/Zürich</SelectItem>
                  <SelectItem value="europe/paris">Europa/Paris</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      )}
    </div>
  );
};