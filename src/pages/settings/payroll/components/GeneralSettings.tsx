import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Save, Loader2 } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface PayrollGeneralFormState {
  currency: string;
  payroll_type: string;
  pay_period: string;
  auto_calculate_overtime: boolean;
  auto_calculate_bonuses: boolean;
  consider_break_times: boolean;
  consider_holidays: boolean;
  display_mode: string;
  export_pdf: boolean;
  export_xlsx: boolean;
  export_csv: boolean;
  export_xml: boolean;
  gobd_archiving: boolean;
  gdpr_compliance: boolean;
  audit_logging: boolean;
}

const defaultFormState: PayrollGeneralFormState = {
  currency: 'EUR',
  payroll_type: 'monthly',
  pay_period: 'monthly',
  auto_calculate_overtime: true,
  auto_calculate_bonuses: true,
  consider_break_times: true,
  consider_holidays: true,
  display_mode: 'gross',
  export_pdf: true,
  export_xlsx: true,
  export_csv: true,
  export_xml: false,
  gobd_archiving: true,
  gdpr_compliance: true,
  audit_logging: true,
};

const GeneralSettings: React.FC = () => {
  const { toast } = useToast();
  const { settings, loading, isSaving, getValue, saveSettings } = useEffectiveSettings('payroll');
  const [formState, setFormState] = useState<PayrollGeneralFormState>(defaultFormState);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormState(prev => ({
        ...prev,
        currency: getValue('currency', prev.currency),
        payroll_type: getValue('payroll_type', prev.payroll_type),
        pay_period: getValue('pay_period', prev.pay_period),
        auto_calculate_overtime: getValue('auto_calculate_overtime', prev.auto_calculate_overtime),
        auto_calculate_bonuses: getValue('auto_calculate_bonuses', prev.auto_calculate_bonuses),
        consider_break_times: getValue('consider_break_times', prev.consider_break_times),
        consider_holidays: getValue('consider_holidays', prev.consider_holidays),
        display_mode: getValue('display_mode', prev.display_mode),
        export_pdf: getValue('export_pdf', prev.export_pdf),
        export_xlsx: getValue('export_xlsx', prev.export_xlsx),
        export_csv: getValue('export_csv', prev.export_csv),
        export_xml: getValue('export_xml', prev.export_xml),
        gobd_archiving: getValue('gobd_archiving', prev.gobd_archiving),
        gdpr_compliance: getValue('gdpr_compliance', prev.gdpr_compliance),
        audit_logging: getValue('audit_logging', prev.audit_logging),
      }));
    }
  }, [settings, getValue]);

  const updateFormField = <K extends keyof PayrollGeneralFormState>(key: K, value: PayrollGeneralFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die allgemeinen Lohn-Einstellungen wurden erfolgreich in der Datenbank aktualisiert.",
        });
      } else {
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellungen konnten nicht gespeichert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Allgemeine Einstellungen
        </h2>
        <p className="text-sm text-muted-foreground">
          Grundlegende Konfiguration für Lohn- und Gehaltsabrechnung
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Währung & Einheiten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Währung</Label>
              <Select 
                value={formState.currency}
                onValueChange={(v) => updateFormField('currency', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Währung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">US-Dollar ($)</SelectItem>
                  <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                  <SelectItem value="GBP">Britisches Pfund (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payroll-type">Standard-Gehaltstyp</Label>
              <Select 
                value={formState.payroll_type}
                onValueChange={(v) => updateFormField('payroll_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gehaltstyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatsgehalt</SelectItem>
                  <SelectItem value="hourly">Stundenlohn</SelectItem>
                  <SelectItem value="daily">Tageshonorar</SelectItem>
                  <SelectItem value="yearly">Jahresgehalt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-period">Standard-Lohnperiode</Label>
              <Select 
                value={formState.pay_period}
                onValueChange={(v) => updateFormField('pay_period', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lohnperiode auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="biweekly">14-tägig</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Automatische Berechnungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Überstunden automatisch berechnen</Label>
                <p className="text-sm text-muted-foreground">Aus Zeiterfassung</p>
              </div>
              <Switch 
                checked={formState.auto_calculate_overtime}
                onCheckedChange={(v) => updateFormField('auto_calculate_overtime', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Zuschläge automatisch berechnen</Label>
                <p className="text-sm text-muted-foreground">Aus Schichtplanung</p>
              </div>
              <Switch 
                checked={formState.auto_calculate_bonuses}
                onCheckedChange={(v) => updateFormField('auto_calculate_bonuses', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pausenzeiten berücksichtigen</Label>
                <p className="text-sm text-muted-foreground">Bei Lohnberechnung</p>
              </div>
              <Switch 
                checked={formState.consider_break_times}
                onCheckedChange={(v) => updateFormField('consider_break_times', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Feiertage berücksichtigen</Label>
                <p className="text-sm text-muted-foreground">Automatische Erkennung</p>
              </div>
              <Switch 
                checked={formState.consider_holidays}
                onCheckedChange={(v) => updateFormField('consider_holidays', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Darstellung & Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-mode">Standarddarstellung</Label>
              <Select 
                value={formState.display_mode}
                onValueChange={(v) => updateFormField('display_mode', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Darstellung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross">Brutto-Darstellung</SelectItem>
                  <SelectItem value="net">Netto-Darstellung</SelectItem>
                  <SelectItem value="both">Brutto & Netto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Verfügbare Exportformate</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formState.export_pdf}
                    onCheckedChange={(v) => updateFormField('export_pdf', v)}
                  />
                  <Label className="text-sm">PDF</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formState.export_xlsx}
                    onCheckedChange={(v) => updateFormField('export_xlsx', v)}
                  />
                  <Label className="text-sm">Excel (XLSX)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formState.export_csv}
                    onCheckedChange={(v) => updateFormField('export_csv', v)}
                  />
                  <Label className="text-sm">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formState.export_xml}
                    onCheckedChange={(v) => updateFormField('export_xml', v)}
                  />
                  <Label className="text-sm">XML</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance & Archivierung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>GoBD-konforme Archivierung</Label>
                <p className="text-sm text-muted-foreground">10 Jahre Aufbewahrung</p>
              </div>
              <Switch 
                checked={formState.gobd_archiving}
                onCheckedChange={(v) => updateFormField('gobd_archiving', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>DSGVO-konforme Verarbeitung</Label>
                <p className="text-sm text-muted-foreground">Datenschutz-Compliance</p>
              </div>
              <Switch 
                checked={formState.gdpr_compliance}
                onCheckedChange={(v) => updateFormField('gdpr_compliance', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit-Protokollierung</Label>
                <p className="text-sm text-muted-foreground">Alle Änderungen dokumentieren</p>
              </div>
              <Switch 
                checked={formState.audit_logging}
                onCheckedChange={(v) => updateFormField('audit_logging', v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
