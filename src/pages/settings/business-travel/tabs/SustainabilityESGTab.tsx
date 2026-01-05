import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { Leaf, Settings, Loader2 } from "lucide-react";

interface FormState {
  co2_budget_per_employee: number;
  co2_project_based: boolean;
  prefer_train_under_km: number;
  prefer_public_transport: boolean;
  prefer_electric_vehicles: boolean;
  esg_reporting_enabled: boolean;
  carbon_offset_enabled: boolean;
  sustainability_scoring: boolean;
  green_hotel_preference: boolean;
  co2_tracking_mandatory: boolean;
}

export default function SustainabilityESGTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    co2_budget_per_employee: 2.5,
    co2_project_based: true,
    prefer_train_under_km: 800,
    prefer_public_transport: true,
    prefer_electric_vehicles: true,
    esg_reporting_enabled: true,
    carbon_offset_enabled: false,
    sustainability_scoring: true,
    green_hotel_preference: true,
    co2_tracking_mandatory: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        co2_budget_per_employee: getValue('co2_budget_per_employee', 2.5) as number,
        co2_project_based: getValue('co2_project_based', true) as boolean,
        prefer_train_under_km: getValue('prefer_train_under_km', 800) as number,
        prefer_public_transport: getValue('prefer_public_transport', true) as boolean,
        prefer_electric_vehicles: getValue('prefer_electric_vehicles', true) as boolean,
        esg_reporting_enabled: getValue('esg_reporting_enabled', true) as boolean,
        carbon_offset_enabled: getValue('carbon_offset_enabled', false) as boolean,
        sustainability_scoring: getValue('sustainability_scoring', true) as boolean,
        green_hotel_preference: getValue('green_hotel_preference', true) as boolean,
        co2_tracking_mandatory: getValue('co2_tracking_mandatory', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("ESG-Einstellungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

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
            <Leaf className="h-5 w-5 text-green-600" />
            CO₂-Budget & Nachhaltigkeitsrichtlinien
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">CO₂-Budgets</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Jahresbudget pro Mitarbeiter (t CO₂)</span>
                  <Input 
                    type="number"
                    step="0.1"
                    className="w-20"
                    value={formState.co2_budget_per_employee}
                    onChange={(e) => setFormState(prev => ({...prev, co2_budget_per_employee: Number(e.target.value)}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Projektbasierte Budgets</span>
                  <Switch 
                    checked={formState.co2_project_based}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, co2_project_based: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>CO₂-Tracking verpflichtend</span>
                  <Switch 
                    checked={formState.co2_tracking_mandatory}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, co2_tracking_mandatory: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Carbon Offset aktivieren</span>
                  <Switch 
                    checked={formState.carbon_offset_enabled}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, carbon_offset_enabled: checked}))}
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Präferenzmatrix</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>Bahn vor Flug bis</span>
                    <Input 
                      type="number"
                      className="w-20"
                      value={formState.prefer_train_under_km}
                      onChange={(e) => setFormState(prev => ({...prev, prefer_train_under_km: Number(e.target.value)}))}
                    />
                    <span>km</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>ÖPNV vor Taxi bevorzugen</span>
                  <Switch 
                    checked={formState.prefer_public_transport}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, prefer_public_transport: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>E-Fahrzeuge bevorzugt</span>
                  <Switch 
                    checked={formState.prefer_electric_vehicles}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, prefer_electric_vehicles: checked}))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Grüne Hotels bevorzugen</span>
                  <Switch 
                    checked={formState.green_hotel_preference}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, green_hotel_preference: checked}))}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            ESG-Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">ESG-Reporting aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Berichte für Nachhaltigkeitsziele</p>
            </div>
            <Switch 
              checked={formState.esg_reporting_enabled}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, esg_reporting_enabled: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Nachhaltigkeits-Scoring</Label>
              <p className="text-sm text-muted-foreground">Bewertung jeder Reise nach CO₂-Effizienz</p>
            </div>
            <Switch 
              checked={formState.sustainability_scoring}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, sustainability_scoring: checked}))}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">Bahn vor Flug bis {formState.prefer_train_under_km}km</Badge>
            {formState.prefer_public_transport && <Badge variant="secondary">ÖPNV vor Taxi</Badge>}
            {formState.prefer_electric_vehicles && <Badge variant="secondary">E-Fahrzeuge bevorzugt</Badge>}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          ESG-Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
