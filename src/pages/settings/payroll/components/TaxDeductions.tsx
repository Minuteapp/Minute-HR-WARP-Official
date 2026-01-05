import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calculator, Save, Plus, Download, Loader2 } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface TaxDeductionsFormState {
  auto_update_rates: boolean;
  church_tax_enabled: boolean;
  church_tax_rate: string;
  company_car_enabled: boolean;
  company_car_calculation: string;
  meal_subsidy_enabled: boolean;
  meal_subsidy_type: string;
  advances_enabled: boolean;
  datev_export_enabled: boolean;
}

const defaultFormState: TaxDeductionsFormState = {
  auto_update_rates: true,
  church_tax_enabled: false,
  church_tax_rate: '9',
  company_car_enabled: true,
  company_car_calculation: '1percent',
  meal_subsidy_enabled: false,
  meal_subsidy_type: 'voucher',
  advances_enabled: false,
  datev_export_enabled: true,
};

const TaxDeductions: React.FC = () => {
  const { toast } = useToast();
  const { settings, loading, isSaving, getValue, saveSettings } = useEffectiveSettings('payroll_tax');
  const [formState, setFormState] = useState<TaxDeductionsFormState>(defaultFormState);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormState(prev => ({
        ...prev,
        auto_update_rates: getValue('auto_update_rates', prev.auto_update_rates),
        church_tax_enabled: getValue('church_tax_enabled', prev.church_tax_enabled),
        church_tax_rate: getValue('church_tax_rate', prev.church_tax_rate),
        company_car_enabled: getValue('company_car_enabled', prev.company_car_enabled),
        company_car_calculation: getValue('company_car_calculation', prev.company_car_calculation),
        meal_subsidy_enabled: getValue('meal_subsidy_enabled', prev.meal_subsidy_enabled),
        meal_subsidy_type: getValue('meal_subsidy_type', prev.meal_subsidy_type),
        advances_enabled: getValue('advances_enabled', prev.advances_enabled),
        datev_export_enabled: getValue('datev_export_enabled', prev.datev_export_enabled),
      }));
    }
  }, [settings, getValue]);

  const updateFormField = <K extends keyof TaxDeductionsFormState>(key: K, value: TaxDeductionsFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Abzüge & Steuern wurden erfolgreich in der Datenbank aktualisiert.",
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
          <Calculator className="h-5 w-5" />
          Abzüge & Steuern
        </h2>
        <p className="text-sm text-muted-foreground">
          Konfiguration von Steuerabzügen, Sozialabgaben und individuellen Abzügen
        </p>
      </div>

      <div className="grid gap-6">
        {/* Sozialabgaben Deutschland */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sozialabgaben (Deutschland)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Rentenversicherung (RV)</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Arbeitnehmer-Anteil</Label>
                      <Input defaultValue="9.3%" readOnly />
                    </div>
                    <div>
                      <Label className="text-sm">Arbeitgeber-Anteil</Label>
                      <Input defaultValue="9.3%" readOnly />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Beitragsbemessungsgrenze 2024</Label>
                    <Input defaultValue="7.550€/Monat" readOnly />
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Krankenversicherung (KV)</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-sm">Allg. Beitragssatz</Label>
                      <Input defaultValue="14.6%" readOnly />
                    </div>
                    <div>
                      <Label className="text-sm">Arbeitnehmer</Label>
                      <Input defaultValue="7.3%" readOnly />
                    </div>
                    <div>
                      <Label className="text-sm">Arbeitgeber</Label>
                      <Input defaultValue="7.3%" readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Zusatzbeitrag (Ø)</Label>
                      <Input defaultValue="1.7%" />
                    </div>
                    <div>
                      <Label className="text-sm">Beitragsbemessungsgrenze</Label>
                      <Input defaultValue="5.175€/Monat" readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Arbeitslosenversicherung (ALV)</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Arbeitnehmer-Anteil</Label>
                      <Input defaultValue="1.3%" readOnly />
                    </div>
                    <div>
                      <Label className="text-sm">Arbeitgeber-Anteil</Label>
                      <Input defaultValue="1.3%" readOnly />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Beitragsbemessungsgrenze</Label>
                    <Input defaultValue="7.550€/Monat" readOnly />
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Pflegeversicherung (PV)</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Allg. Beitragssatz</Label>
                      <Input defaultValue="3.05%" readOnly />
                    </div>
                    <div>
                      <Label className="text-sm">Zusatzbeitrag 23+ kinderlos</Label>
                      <Input defaultValue="0.6%" readOnly />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Beitragsbemessungsgrenze</Label>
                    <Input defaultValue="5.175€/Monat" readOnly />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Automatische Aktualisierung der Beitragssätze</p>
                <p className="text-xs text-muted-foreground">Jährliche Updates zum 1. Januar</p>
              </div>
              <Switch 
                checked={formState.auto_update_rates}
                onCheckedChange={(v) => updateFormField('auto_update_rates', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Steuerklassen & Freibeträge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Steuerklassen & Freibeträge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Standard-Steuerklasse</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Steuerklasse I (ledig)</SelectItem>
                      <SelectItem value="2">Steuerklasse II (alleinerziehend)</SelectItem>
                      <SelectItem value="3">Steuerklasse III (verheiratet, höheres Einkommen)</SelectItem>
                      <SelectItem value="4">Steuerklasse IV (verheiratet, gleiches Einkommen)</SelectItem>
                      <SelectItem value="5">Steuerklasse V (verheiratet, geringeres Einkommen)</SelectItem>
                      <SelectItem value="6">Steuerklasse VI (Zweitjob)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-medium">Grundfreibetrag 2024</Label>
                  <Input defaultValue="11.604€" readOnly />
                </div>

                <div>
                  <Label className="font-medium">Kinderfreibetrag pro Kind</Label>
                  <Input defaultValue="6.384€" readOnly />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Kirchensteuer</Label>
                    <p className="text-xs text-muted-foreground">8% oder 9% je nach Bundesland</p>
                  </div>
                  <Switch 
                    checked={formState.church_tax_enabled}
                    onCheckedChange={(v) => updateFormField('church_tax_enabled', v)}
                  />
                </div>

                <div>
                  <Label className="font-medium">Kirchensteuersatz</Label>
                  <Select 
                    value={formState.church_tax_rate}
                    onValueChange={(v) => updateFormField('church_tax_rate', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8% (Baden-Württemberg, Bayern)</SelectItem>
                      <SelectItem value="9">9% (übrige Bundesländer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-medium">Solidaritätszuschlag</Label>
                  <Input defaultValue="5.5%" readOnly />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individuelle Abzüge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Individuelle Abzüge
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Abzug hinzufügen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Firmenwagen (geldwerter Vorteil)</Label>
                  <Switch 
                    checked={formState.company_car_enabled}
                    onCheckedChange={(v) => updateFormField('company_car_enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-sm">Berechnungsart</Label>
                    <Select 
                      value={formState.company_car_calculation}
                      onValueChange={(v) => updateFormField('company_car_calculation', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1percent">1%-Regel</SelectItem>
                        <SelectItem value="fahrtenbuch">Fahrtenbuch</SelectItem>
                        <SelectItem value="fixed">Fester Betrag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Listenpreis</Label>
                    <Input placeholder="Bruttolistenpreis" />
                  </div>
                  <div>
                    <Label className="text-sm">Entfernung Arbeit (km)</Label>
                    <Input placeholder="einfache Strecke" />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Essenszuschuss</Label>
                  <Switch 
                    checked={formState.meal_subsidy_enabled}
                    onCheckedChange={(v) => updateFormField('meal_subsidy_enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Art</Label>
                    <Select 
                      value={formState.meal_subsidy_type}
                      onValueChange={(v) => updateFormField('meal_subsidy_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voucher">Essensgutscheine</SelectItem>
                        <SelectItem value="canteen">Kantine</SelectItem>
                        <SelectItem value="allowance">Pauschale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Betrag pro Tag</Label>
                    <Input placeholder="max. 8,80€ steuerfrei" />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Vorschüsse/Darlehen</Label>
                  <Switch 
                    checked={formState.advances_enabled}
                    onCheckedChange={(v) => updateFormField('advances_enabled', v)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-sm">Rückzahlungsart</Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="quarterly">Quartalsweise</SelectItem>
                        <SelectItem value="yearly">Jährlich</SelectItem>
                        <SelectItem value="final">Mit Endabrechnung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Rückzahlungsbetrag</Label>
                    <Input placeholder="€ pro Periode" />
                  </div>
                  <div>
                    <Label className="text-sm">Zinssatz</Label>
                    <Input placeholder="% p.a." />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DATEV Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Steuerexport & Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">DATEV-kompatible Exports</Label>
                  <p className="text-sm text-muted-foreground">Automatische Formatierung für Steuerberater</p>
                </div>
                <Switch 
                  checked={formState.datev_export_enabled}
                  onCheckedChange={(v) => updateFormField('datev_export_enabled', v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Lohnsteuer-Export
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Sozialversicherung-Export
                </Button>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Automatische Meldungen</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Lohnsteuer-Anmeldung</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">SV-Meldungen</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm">Unfallversicherung</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm">Berufsgenossenschaft</span>
                  </label>
                </div>
              </div>
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

export default TaxDeductions;
