import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { BarChart3, FileDown, History, Settings, Loader2 } from "lucide-react";

interface FormState {
  report_costs_frequency: string;
  report_policy_frequency: string;
  report_co2_frequency: string;
  report_budget_frequency: string;
  audit_log_enabled: boolean;
  audit_retention_days: number;
  auto_export_enabled: boolean;
  export_format: string;
  compliance_reporting: boolean;
  executive_dashboard: boolean;
}

export default function ReportingAuditTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    report_costs_frequency: 'monthly',
    report_policy_frequency: 'weekly',
    report_co2_frequency: 'quarterly',
    report_budget_frequency: 'daily',
    audit_log_enabled: true,
    audit_retention_days: 365,
    auto_export_enabled: false,
    export_format: 'pdf',
    compliance_reporting: true,
    executive_dashboard: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        report_costs_frequency: getValue('report_costs_frequency', 'monthly') as string,
        report_policy_frequency: getValue('report_policy_frequency', 'weekly') as string,
        report_co2_frequency: getValue('report_co2_frequency', 'quarterly') as string,
        report_budget_frequency: getValue('report_budget_frequency', 'daily') as string,
        audit_log_enabled: getValue('audit_log_enabled', true) as boolean,
        audit_retention_days: getValue('audit_retention_days', 365) as number,
        auto_export_enabled: getValue('auto_export_enabled', false) as boolean,
        export_format: getValue('export_format', 'pdf') as string,
        compliance_reporting: getValue('compliance_reporting', true) as boolean,
        executive_dashboard: getValue('executive_dashboard', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Reporting konfiguriert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const reports = [
    { key: 'report_costs_frequency', name: 'Kosten nach Abteilung', format: 'PDF' },
    { key: 'report_policy_frequency', name: 'Policy-Verstöße', format: 'CSV' },
    { key: 'report_co2_frequency', name: 'CO₂-Bericht', format: 'Excel' },
    { key: 'report_budget_frequency', name: 'Budget-Übersicht', format: 'Dashboard' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-600" />
            Standardberichte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{report.name}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <Select 
                    value={formState[report.key as keyof FormState] as string}
                    onValueChange={(value) => setFormState(prev => ({...prev, [report.key]: value}))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="quarterly">Quartalsweise</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary">{report.format}</Badge>
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-sky-600" />
            Audit & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Audit-Log aktivieren</Label>
                  <p className="text-sm text-muted-foreground">Alle Änderungen protokollieren</p>
                </div>
                <Switch 
                  checked={formState.audit_log_enabled}
                  onCheckedChange={(checked) => setFormState(prev => ({...prev, audit_log_enabled: checked}))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Compliance-Reporting</Label>
                  <p className="text-sm text-muted-foreground">Automatische Compliance-Berichte</p>
                </div>
                <Switch 
                  checked={formState.compliance_reporting}
                  onCheckedChange={(checked) => setFormState(prev => ({...prev, compliance_reporting: checked}))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Executive Dashboard</Label>
                  <p className="text-sm text-muted-foreground">Zusammenfassung für Führungskräfte</p>
                </div>
                <Switch 
                  checked={formState.executive_dashboard}
                  onCheckedChange={(checked) => setFormState(prev => ({...prev, executive_dashboard: checked}))}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <Label className="font-medium">Aufbewahrungsdauer (Tage)</Label>
                <Input 
                  type="number"
                  className="mt-2"
                  value={formState.audit_retention_days}
                  onChange={(e) => setFormState(prev => ({...prev, audit_retention_days: Number(e.target.value)}))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Auto-Export</Label>
                  <p className="text-sm text-muted-foreground">Automatischer Export der Berichte</p>
                </div>
                <Switch 
                  checked={formState.auto_export_enabled}
                  onCheckedChange={(checked) => setFormState(prev => ({...prev, auto_export_enabled: checked}))}
                />
              </div>
              {formState.auto_export_enabled && (
                <div className="p-3 border rounded-lg">
                  <Label className="font-medium">Export-Format</Label>
                  <Select 
                    value={formState.export_format}
                    onValueChange={(value) => setFormState(prev => ({...prev, export_format: value}))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Reporting konfigurieren
        </Button>
      </div>
    </div>
  );
}
