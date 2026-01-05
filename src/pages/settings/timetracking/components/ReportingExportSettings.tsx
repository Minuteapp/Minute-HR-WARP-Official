import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { FileText, BarChart, Download, Send, Database, Calendar } from "lucide-react";

export default function ReportingExportSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
      {/* Standardberichte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Standardberichte
          </CardTitle>
          <CardDescription>
            Vorkonfigurierte Berichte für häufig benötigte Auswertungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Anwesenheitslisten */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">Anwesenheitslisten</h4>
                  <p className="text-sm text-muted-foreground">Tägliche und monatliche Übersichten</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="attendance-reports" defaultChecked disabled={!canManage} />
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>PDF, Excel</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Frequenz:</span>
                  <p>Täglich, Monatlich</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Empfänger:</span>
                  <p>Teamleiter, HR</p>
                </div>
              </div>
            </div>

            {/* Überstundenübersichten */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">Überstundenübersichten</h4>
                  <p className="text-sm text-muted-foreground">Detaillierte Aufstellung aller Überstunden</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="overtime-reports" defaultChecked disabled={!canManage} />
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>Excel, CSV</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Frequenz:</span>
                  <p>Wöchentlich, Monatlich</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Empfänger:</span>
                  <p>Manager, HR, Payroll</p>
                </div>
              </div>
            </div>

            {/* Gesetzesverstöße */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">Gesetzesverstöße (automatisiert)</h4>
                  <p className="text-sm text-muted-foreground">Compliance-Berichte für Audits</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="compliance-reports" defaultChecked disabled={!canManage} />
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>PDF, Excel</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Frequenz:</span>
                  <p>Bei Verstoß, Monatlich</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Empfänger:</span>
                  <p>HR Manager, Admin</p>
                </div>
              </div>
            </div>
          </div>

          <Button disabled={!canManage}>Neuen Standardbericht erstellen</Button>
        </CardContent>
      </Card>

      {/* Individuelle Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Individuelle Reports</CardTitle>
          <CardDescription>
            Benutzerdefinierte Berichte nach Abteilungen, Standorten und Projekten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-filter">Filterkriterien</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-department">Abteilung</Label>
                <Select disabled={!canManage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Abteilung wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Abteilungen</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="sales">Vertrieb</SelectItem>
                    <SelectItem value="production">Produktion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-location">Standort</Label>
                <Select disabled={!canManage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Standort wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Standorte</SelectItem>
                    <SelectItem value="munich">München</SelectItem>
                    <SelectItem value="berlin">Berlin</SelectItem>
                    <SelectItem value="hamburg">Hamburg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-period">Zeitraum</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Von</Label>
                <Input
                  id="start-date"
                  type="date"
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Bis</Label>
                <Input
                  id="end-date"
                  type="date"
                  disabled={!canManage}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Report-Inhalte</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="include-attendance" defaultChecked disabled={!canManage} />
                <Label htmlFor="include-attendance" className="text-sm">Anwesenheitszeiten</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="include-overtime" defaultChecked disabled={!canManage} />
                <Label htmlFor="include-overtime" className="text-sm">Überstunden</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="include-breaks" disabled={!canManage} />
                <Label htmlFor="include-breaks" className="text-sm">Pausenzeiten</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="include-projects" disabled={!canManage} />
                <Label htmlFor="include-projects" className="text-sm">Projektzuordnung</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="include-costs" disabled={!canManage} />
                <Label htmlFor="include-costs" className="text-sm">Kostenaufstellung</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="include-violations" disabled={!canManage} />
                <Label htmlFor="include-violations" className="text-sm">Gesetzesverstöße</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button disabled={!canManage}>Report generieren</Button>
            <Button variant="outline" disabled={!canManage}>Als Vorlage speichern</Button>
          </div>
        </CardContent>
      </Card>

      {/* Export-Formate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export-Formate
          </CardTitle>
          <CardDescription>
            Verfügbare Ausgabeformate für Zeiterfassungsberichte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="export-csv" defaultChecked disabled={!canManage} />
              <Label htmlFor="export-csv">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="export-excel" defaultChecked disabled={!canManage} />
              <Label htmlFor="export-excel">Excel (.xlsx)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="export-pdf" defaultChecked disabled={!canManage} />
              <Label htmlFor="export-pdf">PDF</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-delimiter">CSV-Trennzeichen</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Trennzeichen wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comma">Komma (,)</SelectItem>
                <SelectItem value="semicolon">Semikolon (;)</SelectItem>
                <SelectItem value="tab">Tabulator</SelectItem>
                <SelectItem value="pipe">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Datumsformat</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Format wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">DD.MM.YYYY (Deutsch)</SelectItem>
                <SelectItem value="us">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="iso">YYYY-MM-DD (ISO)</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-metadata">Metadaten einschließen</Label>
              <p className="text-sm text-muted-foreground">
                Export-Zeitstempel, Benutzer, Filter-Kriterien
              </p>
            </div>
            <Switch id="include-metadata" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      {/* API-Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            API-Export & Integrationen
          </CardTitle>
          <CardDescription>
            Automatische Datenübertragung an externe Systeme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* sevDesk */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">sevDesk</h4>
                  <p className="text-sm text-muted-foreground">Buchhaltungssoftware Integration</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="sevdesk-export" disabled={!canManage} />
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>API, CSV</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Häufigkeit:</span>
                  <p>Täglich, Monatlich</p>
                </div>
              </div>
            </div>

            {/* DATEV */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">DATEV</h4>
                  <p className="text-sm text-muted-foreground">Steuerberater-Software</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="datev-export" disabled={!canManage} />
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>DATEV-ASCII</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Häufigkeit:</span>
                  <p>Monatlich</p>
                </div>
              </div>
            </div>

            {/* Lexoffice */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">Lexoffice</h4>
                  <p className="text-sm text-muted-foreground">Cloud-Buchhaltung</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="lexoffice-export" disabled={!canManage} />
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>API</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Häufigkeit:</span>
                  <p>Echtzeit, Täglich</p>
                </div>
              </div>
            </div>

            {/* BMD */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">BMD (Österreich)</h4>
                  <p className="text-sm text-muted-foreground">Österreichische ERP-Software</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="bmd-export" disabled={!canManage} />
                  <Badge variant="outline">Verfügbar</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <p>XML, CSV</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Häufigkeit:</span>
                  <p>Monatlich</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-endpoint">Benutzerdefinierte API</Label>
            <Input
              id="api-endpoint"
              placeholder="https://api.ihre-domain.de/timetracking"
              disabled={!canManage}
            />
          </div>

          <Button variant="outline" disabled={!canManage}>
            Neue Integration hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Payroll-Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Automatische Payroll-Weiterleitung
          </CardTitle>
          <CardDescription>
            Direkte Übertragung an Lohn- und Gehaltsabrechnungssysteme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="payroll-integration">Payroll-Integration aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Weiterleitung an das Lohn & Gehalt Modul
              </p>
            </div>
            <Switch id="payroll-integration" defaultChecked disabled={!canManage} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payroll-frequency">Übertragungsfrequenz</Label>
            <Select disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="Häufigkeit wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Echtzeit</SelectItem>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="manual">Manuell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Übertragene Daten</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="transfer-hours" defaultChecked disabled={!canManage} />
                <Label htmlFor="transfer-hours" className="text-sm">Arbeitszeiten</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="transfer-overtime" defaultChecked disabled={!canManage} />
                <Label htmlFor="transfer-overtime" className="text-sm">Überstunden</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="transfer-bonuses" defaultChecked disabled={!canManage} />
                <Label htmlFor="transfer-bonuses" className="text-sm">Zuschläge</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="transfer-absences" disabled={!canManage} />
                <Label htmlFor="transfer-absences" className="text-sm">Abwesenheiten</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cutoff-day">Stichtag (Tag im Monat)</Label>
              <Input
                id="cutoff-day"
                type="number"
                placeholder="25"
                min="1"
                max="31"
                disabled={!canManage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validation-rules">Validierungsregeln</Label>
              <Select disabled={!canManage}>
                <SelectTrigger>
                  <SelectValue placeholder="Regeln wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basis-Validierung</SelectItem>
                  <SelectItem value="strict">Strikte Validierung</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-medium text-blue-800 mb-1">Automatische Übertragung</h4>
            <p className="text-sm text-blue-700">
              Nächste Übertragung: 25.12.2024 um 23:59 Uhr
              <br />
              Letzter Export: 25.11.2024 (2.847 Datensätze)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}