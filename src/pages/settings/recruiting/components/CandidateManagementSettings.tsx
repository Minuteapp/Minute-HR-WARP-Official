import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function CandidateManagementSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('recruiting', 'manage');

  return (
    <div className="space-y-6">
      {/* Kandidatenpool */}
      <Card>
        <CardHeader>
          <CardTitle>Kandidatenpool</CardTitle>
          <CardDescription>
            Verwaltung des Kandidatenpools für zukünftige Stellenausschreibungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-pool">Kandidatenpool aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Abgelehnte Kandidaten für spätere Stellen vormerken
              </p>
            </div>
            <Switch id="enable-pool" disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pool-retention">Speicherdauer (Monate)</Label>
              <Input
                id="pool-retention"
                type="number"
                placeholder="12"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-matching">Automatisches Matching</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skills">Nach Skills</SelectItem>
                  <SelectItem value="experience">Nach Erfahrung</SelectItem>
                  <SelectItem value="both">Skills + Erfahrung</SelectItem>
                  <SelectItem value="none">Deaktiviert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bewertungssystem */}
      <Card>
        <CardHeader>
          <CardTitle>Bewertungssystem</CardTitle>
          <CardDescription>
            Konfiguration der Kandidatenbewertung und des Scorings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scoring-criteria">Bewertungskriterien</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">Fachkompetenz (40%)</Badge>
              <Badge variant="secondary">Berufserfahrung (30%)</Badge>
              <Badge variant="secondary">Soft Skills (20%)</Badge>
              <Badge variant="secondary">Cultural Fit (10%)</Badge>
            </div>
            <Button variant="outline" size="sm" disabled={!canManage}>
              Kriterien anpassen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-score">Mindest-Score für Interview</Label>
              <Input
                id="min-score"
                type="number"
                placeholder="70"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-rejection">Automatische Ablehnung bei</Label>
              <Input
                id="auto-rejection"
                type="number"
                placeholder="30"
                disabled={!canManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tagging & Kategorien */}
      <Card>
        <CardHeader>
          <CardTitle>Tags & Kategorien</CardTitle>
          <CardDescription>
            Benutzerdefinierte Tags für die Kandidatenverwaltung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="standard-tags">Standard-Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>Top-Kandidat</Badge>
              <Badge>Nachrücker</Badge>
              <Badge>Überqualifiziert</Badge>
              <Badge>Junior-Level</Badge>
              <Badge>Senior-Level</Badge>
              <Badge>Quereinsteiger</Badge>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Neues Tag hinzufügen..." disabled={!canManage} />
              <Button size="sm" disabled={!canManage}>Hinzufügen</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-fields">Benutzerdefinierte Felder</Label>
            <Textarea
              id="custom-fields"
              placeholder="Zusätzliche Felder für Kandidatenprofile..."
              disabled={!canManage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Export & Berichte */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Berichte</CardTitle>
          <CardDescription>
            Konfiguration von Datenexporten und Berichten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="export-pdf" disabled={!canManage} />
              <Label htmlFor="export-pdf">PDF-Export</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="export-excel" disabled={!canManage} />
              <Label htmlFor="export-excel">Excel-Export</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="export-csv" disabled={!canManage} />
              <Label htmlFor="export-csv">CSV-Export</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-schedule">Automatische Berichte</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Berichtsintervall wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="none">Deaktiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}