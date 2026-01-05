
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PayrollPeriodSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    payrollFrequency: "monthly",
    paymentDay: 15,
    advancePaymentEnabled: false,
    advancePaymentDay: 1,
    advancePaymentPercentage: 50,
    yearEndBonusMonth: 12,
    yearEndBonusEnabled: true,
    vacationPayoutMonth: 6,
    cutoffDay: 25,
    processLeadDays: 5
  });

  const handleSave = () => {
    toast({
      title: "Lohnperioden gespeichert",
      description: "Die Einstellungen wurden erfolgreich aktualisiert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lohnperioden-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lohnabrechnungsfrequenz</Label>
              <Select value={settings.payrollFrequency} onValueChange={(value) => 
                setSettings(prev => ({...prev, payrollFrequency: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="biweekly">Alle 2 Wochen</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Auszahlungstag im Monat</Label>
              <Input 
                type="number" 
                min="1" 
                max="28"
                value={settings.paymentDay}
                onChange={(e) => setSettings(prev => ({...prev, paymentDay: parseInt(e.target.value)}))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stichtag für Erfassung</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={settings.cutoffDay}
                onChange={(e) => setSettings(prev => ({...prev, cutoffDay: parseInt(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Verarbeitungsvorlauf (Tage)</Label>
              <Input 
                type="number" 
                min="1" 
                max="15"
                value={settings.processLeadDays}
                onChange={(e) => setSettings(prev => ({...prev, processLeadDays: parseInt(e.target.value)}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vorschuss & Sonderzahlungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Gehaltsvorschuss ermöglichen</Label>
            <Switch 
              checked={settings.advancePaymentEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, advancePaymentEnabled: checked}))}
            />
          </div>

          {settings.advancePaymentEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vorschuss-Auszahlungstag</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="15"
                  value={settings.advancePaymentDay}
                  onChange={(e) => setSettings(prev => ({...prev, advancePaymentDay: parseInt(e.target.value)}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Vorschuss-Prozentsatz (%)</Label>
                <Input 
                  type="number" 
                  min="10" 
                  max="80"
                  value={settings.advancePaymentPercentage}
                  onChange={(e) => setSettings(prev => ({...prev, advancePaymentPercentage: parseInt(e.target.value)}))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jahressonderzahlungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Jahresendbonus aktivieren</Label>
            <Switch 
              checked={settings.yearEndBonusEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, yearEndBonusEnabled: checked}))}
            />
          </div>

          {settings.yearEndBonusEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bonus-Auszahlungsmonat</Label>
                <Select value={settings.yearEndBonusMonth.toString()} onValueChange={(value) => 
                  setSettings(prev => ({...prev, yearEndBonusMonth: parseInt(value)}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2024, month - 1).toLocaleDateString('de-DE', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urlaubsgeld-Monat</Label>
                <Select value={settings.vacationPayoutMonth.toString()} onValueChange={(value) => 
                  setSettings(prev => ({...prev, vacationPayoutMonth: parseInt(value)}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2024, month - 1).toLocaleDateString('de-DE', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default PayrollPeriodSettings;
