import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { BarChart, Download } from "lucide-react";

export default function ReportingExportSettings() {
  const { hasPermission } = usePermissionContext();
  const canManage = hasPermission('timetracking', 'manage');

  return (
    <div className="space-y-6">
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="attendance-reports">Anwesenheitslisten</Label>
              <p className="text-sm text-muted-foreground">
                Tägliche und monatliche Übersichten
              </p>
            </div>
            <Switch id="attendance-reports" defaultChecked disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>
    </div>
  );
}