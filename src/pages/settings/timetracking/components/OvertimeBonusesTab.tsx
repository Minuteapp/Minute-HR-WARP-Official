import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Calendar, DollarSign, ArrowUpDown, Plus } from "lucide-react";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function OvertimeBonusesTab() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Überstunden-Definition */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Überstunden-Definition</CardTitle>
          </div>
          <CardDescription>
            Wann beginnen Überstunden zu zählen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tägliche Überstundenschwelle</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="8" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden/Tag</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ab dieser täglichen Arbeitszeit werden Überstunden gezählt
              </p>
            </div>
            <div className="space-y-2">
              <Label>Wöchentliche Überstundenschwelle</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="40" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden/Woche</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ab dieser wöchentlichen Arbeitszeit werden Überstunden gezählt
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Berechnungsmodus</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Modus wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Nur tägliche Überschreitung</SelectItem>
                <SelectItem value="weekly">Nur wöchentliche Überschreitung</SelectItem>
                <SelectItem value="both">Beides (höherer Wert zählt)</SelectItem>
                <SelectItem value="monthly">Monatliche Betrachtung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gleitzeit-Toleranz berücksichtigen</Label>
              <p className="text-sm text-muted-foreground">
                Gleitzeit-Guthaben wird vor Überstunden-Berechnung verrechnet
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Überstunden-Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Überstunden-Limits</CardTitle>
          </div>
          <CardDescription>
            Maximale Überstunden und Kappungsgrenzen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tageslimit</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="2" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Wochenlimit</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="10" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Monatslimit</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="40" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kappungsgrenze Überstundenkonto</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="100" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Stunden</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Überstunden über dieser Grenze werden gekappt
              </p>
            </div>
            <div className="space-y-2">
              <Label>Verfall nach</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="12" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">Monate</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Überstunden verfallen nach dieser Zeit
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Warnung bei Überschreitung</Label>
              <p className="text-sm text-muted-foreground">
                System warnt bei Erreichen von 80% der Limits
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Zuschläge */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Zuschläge</CardTitle>
          </div>
          <CardDescription>
            Konfiguration der verschiedenen Zuschlagssätze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Überstunden (normal)</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="25" className="w-20" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Nachtarbeit</Badge>
                <span className="text-sm text-muted-foreground">23:00 - 06:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="25" className="w-20" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Samstagsarbeit</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="25" className="w-20" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Sonntagsarbeit</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="50" className="w-20" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge>Feiertagsarbeit</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="100" className="w-20" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Heiligabend/Silvester</Badge>
                <span className="text-sm text-muted-foreground">ab 14:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="100" className="w-20" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" disabled={!canManage}>
            <Plus className="h-4 w-4 mr-2" />
            Zuschlagsart hinzufügen
          </Button>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Zuschläge kumulieren</Label>
              <p className="text-sm text-muted-foreground">
                Mehrere Zuschläge werden addiert (z.B. Nacht + Sonntag)
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Auszahlung vs. Freizeitausgleich */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            <CardTitle>Auszahlung vs. Zeitausgleich</CardTitle>
          </div>
          <CardDescription>
            Wie werden Überstunden ausgeglichen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standard-Ausgleichsmodus</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Modus wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Nur Zeitausgleich</SelectItem>
                <SelectItem value="payout">Nur Auszahlung</SelectItem>
                <SelectItem value="choice">Mitarbeiter wählt</SelectItem>
                <SelectItem value="mixed">Gemischt (bis Limit Zeitausgleich, dann Auszahlung)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Zeitausgleich-Faktor</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="1.0" step="0.1" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">x</span>
              </div>
              <p className="text-xs text-muted-foreground">
                1 Überstunde = X Stunden Freizeit
              </p>
            </div>
            <div className="space-y-2">
              <Label>Auszahlungs-Faktor</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="1.25" step="0.1" disabled={!canManage} />
                <span className="text-sm text-muted-foreground">x Stundenlohn</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mitarbeiter-Wahlrecht</Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter können zwischen Auszahlung und Freizeit wählen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quartalsweise Wahlmöglichkeit</Label>
              <p className="text-sm text-muted-foreground">
                Wahl kann einmal pro Quartal geändert werden
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* Lohnübergabe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Übergabe an Lohn & Gehalt</CardTitle>
          </div>
          <CardDescription>
            Automatische Übertragung an die Lohnabrechnung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Übergabe aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Überstunden werden automatisch an Payroll übertragen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Übergabe-Zeitpunkt</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Zeitpunkt wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Sofort nach Genehmigung</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich (zum 1.)</SelectItem>
                <SelectItem value="payroll">Mit Lohnlauf</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Exportformat</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Format wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="datev">DATEV</SelectItem>
                <SelectItem value="sap">SAP</SelectItem>
                <SelectItem value="csv">CSV (generisch)</SelectItem>
                <SelectItem value="api">API-Integration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prüfung vor Übergabe erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                HR muss Überstunden vor Lohnübergabe bestätigen
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Genehmigung */}
      <Card>
        <CardHeader>
          <CardTitle>Genehmigungspflicht für Überstunden</CardTitle>
          <CardDescription>
            Wann müssen Überstunden genehmigt werden?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vorab-Genehmigung erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Überstunden müssen vor Beginn genehmigt werden
              </p>
            </div>
            <Switch disabled={!canManage} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nachträgliche Genehmigung erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Überstunden müssen nach Entstehung genehmigt werden
              </p>
            </div>
            <Switch disabled={!canManage} defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Automatische Genehmigung bis</Label>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="2" disabled={!canManage} />
              <span className="text-sm text-muted-foreground">Stunden/Woche</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Überstunden unter diesem Wert werden automatisch genehmigt
            </p>
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
