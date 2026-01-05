import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, Save, Trash2, Loader2 } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface BonusFormState {
  night_work_enabled: boolean;
  night_work_bonus: number;
  night_work_type: string;
  weekend_work_enabled: boolean;
  saturday_bonus: number;
  sunday_bonus: number;
  holiday_work_enabled: boolean;
  holiday_bonus: number;
  overtime_enabled: boolean;
  overtime_start_hour: number;
  overtime_bonus: number;
  vacation_pay_type: string;
  vacation_pay_value: number;
  vacation_pay_month: string;
  christmas_bonus_type: string;
  christmas_bonus_value: number;
  christmas_bonus_month: string;
}

const defaultFormState: BonusFormState = {
  night_work_enabled: true,
  night_work_bonus: 25,
  night_work_type: 'percent',
  weekend_work_enabled: true,
  saturday_bonus: 50,
  sunday_bonus: 100,
  holiday_work_enabled: true,
  holiday_bonus: 125,
  overtime_enabled: true,
  overtime_start_hour: 8,
  overtime_bonus: 25,
  vacation_pay_type: 'monthly',
  vacation_pay_value: 0.5,
  vacation_pay_month: 'june',
  christmas_bonus_type: 'monthly',
  christmas_bonus_value: 1.0,
  christmas_bonus_month: 'november',
};

const BonusAllowances: React.FC = () => {
  const { toast } = useToast();
  const { settings, loading, isSaving, getValue, saveSettings } = useEffectiveSettings('payroll_bonus');
  const [formState, setFormState] = useState<BonusFormState>(defaultFormState);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormState(prev => ({
        ...prev,
        night_work_enabled: getValue('night_work_enabled', prev.night_work_enabled),
        night_work_bonus: getValue('night_work_bonus', prev.night_work_bonus),
        night_work_type: getValue('night_work_type', prev.night_work_type),
        weekend_work_enabled: getValue('weekend_work_enabled', prev.weekend_work_enabled),
        saturday_bonus: getValue('saturday_bonus', prev.saturday_bonus),
        sunday_bonus: getValue('sunday_bonus', prev.sunday_bonus),
        holiday_work_enabled: getValue('holiday_work_enabled', prev.holiday_work_enabled),
        holiday_bonus: getValue('holiday_bonus', prev.holiday_bonus),
        overtime_enabled: getValue('overtime_enabled', prev.overtime_enabled),
        overtime_start_hour: getValue('overtime_start_hour', prev.overtime_start_hour),
        overtime_bonus: getValue('overtime_bonus', prev.overtime_bonus),
        vacation_pay_type: getValue('vacation_pay_type', prev.vacation_pay_type),
        vacation_pay_value: getValue('vacation_pay_value', prev.vacation_pay_value),
        vacation_pay_month: getValue('vacation_pay_month', prev.vacation_pay_month),
        christmas_bonus_type: getValue('christmas_bonus_type', prev.christmas_bonus_type),
        christmas_bonus_value: getValue('christmas_bonus_value', prev.christmas_bonus_value),
        christmas_bonus_month: getValue('christmas_bonus_month', prev.christmas_bonus_month),
      }));
    }
  }, [settings, getValue]);

  const updateFormField = <K extends keyof BonusFormState>(key: K, value: BonusFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(formState);
      if (success) {
        toast({
          title: "Einstellungen gespeichert",
          description: "Die Zuschläge & Boni wurden erfolgreich in der Datenbank aktualisiert.",
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
          <TrendingUp className="h-5 w-5" />
          Zuschläge & Boni
        </h2>
        <p className="text-sm text-muted-foreground">
          Konfiguration von Zuschlägen, Boni und Sonderzahlungen
        </p>
      </div>

      <div className="grid gap-6">
        {/* Arbeitszeit-Zuschläge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Arbeitszeit-Zuschläge
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Zuschlag hinzufügen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Nachtarbeit (22:00 - 06:00)</Label>
                    <Switch 
                      checked={formState.night_work_enabled}
                      onCheckedChange={(v) => updateFormField('night_work_enabled', v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Zuschlag</Label>
                      <div className="flex">
                        <Input 
                          value={formState.night_work_bonus}
                          onChange={(e) => updateFormField('night_work_bonus', parseInt(e.target.value) || 0)}
                          className="rounded-r-none" 
                        />
                        <Select 
                          value={formState.night_work_type}
                          onValueChange={(v) => updateFormField('night_work_type', v)}
                        >
                          <SelectTrigger className="w-20 rounded-l-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="fixed">€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Steuerbefreit bis</Label>
                      <Input defaultValue="25%" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Wochenendarbeit (Sa/So)</Label>
                    <Switch 
                      checked={formState.weekend_work_enabled}
                      onCheckedChange={(v) => updateFormField('weekend_work_enabled', v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Samstag</Label>
                      <div className="flex">
                        <Input 
                          value={formState.saturday_bonus}
                          onChange={(e) => updateFormField('saturday_bonus', parseInt(e.target.value) || 0)}
                          className="rounded-r-none" 
                        />
                        <Select defaultValue="percent">
                          <SelectTrigger className="w-20 rounded-l-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="fixed">€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Sonntag</Label>
                      <div className="flex">
                        <Input 
                          value={formState.sunday_bonus}
                          onChange={(e) => updateFormField('sunday_bonus', parseInt(e.target.value) || 0)}
                          className="rounded-r-none" 
                        />
                        <Select defaultValue="percent">
                          <SelectTrigger className="w-20 rounded-l-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="fixed">€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Feiertagsarbeit</Label>
                    <Switch 
                      checked={formState.holiday_work_enabled}
                      onCheckedChange={(v) => updateFormField('holiday_work_enabled', v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Zuschlag</Label>
                      <div className="flex">
                        <Input 
                          value={formState.holiday_bonus}
                          onChange={(e) => updateFormField('holiday_bonus', parseInt(e.target.value) || 0)}
                          className="rounded-r-none" 
                        />
                        <Select defaultValue="percent">
                          <SelectTrigger className="w-20 rounded-l-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="fixed">€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Max. pro Jahr</Label>
                      <Input defaultValue="2000" placeholder="€" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Überstunden</Label>
                    <Switch 
                      checked={formState.overtime_enabled}
                      onCheckedChange={(v) => updateFormField('overtime_enabled', v)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Ab Stunde</Label>
                      <Input 
                        value={formState.overtime_start_hour}
                        onChange={(e) => updateFormField('overtime_start_hour', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Zuschlag</Label>
                      <div className="flex">
                        <Input 
                          value={formState.overtime_bonus}
                          onChange={(e) => updateFormField('overtime_bonus', parseInt(e.target.value) || 0)}
                          className="rounded-r-none" 
                        />
                        <Select defaultValue="percent">
                          <SelectTrigger className="w-20 rounded-l-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="fixed">€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leistungsboni */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Leistungsboni & KPI-Boni
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Bonus hinzufügen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Umsatzbonus</Label>
                  <div className="flex gap-2">
                    <Switch defaultChecked />
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-sm">KPI-Quelle</Label>
                    <Select defaultValue="sales">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Umsatz</SelectItem>
                        <SelectItem value="projects">Projekte</SelectItem>
                        <SelectItem value="customers">Kundenzufriedenheit</SelectItem>
                        <SelectItem value="manual">Manuell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Berechnungsart</Label>
                    <Select defaultValue="percent">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Prozentual</SelectItem>
                        <SelectItem value="fixed">Fester Betrag</SelectItem>
                        <SelectItem value="tiered">Stufenmodell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Bonus</Label>
                    <Input defaultValue="2.5%" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Beschreibung</Label>
                  <Textarea 
                    placeholder="2,5% des Umsatzes als Bonus ab Erreichen von 100.000€ Quartalsumsatz"
                    className="h-20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sonderzahlungen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sonderzahlungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Urlaubsgeld</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Berechnungsart</Label>
                      <Select 
                        value={formState.vacation_pay_type}
                        onValueChange={(v) => updateFormField('vacation_pay_type', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monatsgehalt</SelectItem>
                          <SelectItem value="percent">Prozent vom Jahresgehalt</SelectItem>
                          <SelectItem value="fixed">Fester Betrag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Wert</Label>
                      <Input 
                        value={formState.vacation_pay_value}
                        onChange={(e) => updateFormField('vacation_pay_value', parseFloat(e.target.value) || 0)}
                        placeholder="Faktor/Prozent/Betrag" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Auszahlung im</Label>
                    <Select 
                      value={formState.vacation_pay_month}
                      onValueChange={(v) => updateFormField('vacation_pay_month', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="june">Juni</SelectItem>
                        <SelectItem value="july">Juli</SelectItem>
                        <SelectItem value="may">Mai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <Label className="font-medium">Weihnachtsgeld</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Berechnungsart</Label>
                      <Select 
                        value={formState.christmas_bonus_type}
                        onValueChange={(v) => updateFormField('christmas_bonus_type', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monatsgehalt</SelectItem>
                          <SelectItem value="percent">Prozent vom Jahresgehalt</SelectItem>
                          <SelectItem value="fixed">Fester Betrag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Wert</Label>
                      <Input 
                        value={formState.christmas_bonus_value}
                        onChange={(e) => updateFormField('christmas_bonus_value', parseFloat(e.target.value) || 0)}
                        placeholder="Faktor/Prozent/Betrag" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Auszahlung im</Label>
                    <Select 
                      value={formState.christmas_bonus_month}
                      onValueChange={(v) => updateFormField('christmas_bonus_month', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="november">November</SelectItem>
                        <SelectItem value="december">Dezember</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

export default BonusAllowances;
