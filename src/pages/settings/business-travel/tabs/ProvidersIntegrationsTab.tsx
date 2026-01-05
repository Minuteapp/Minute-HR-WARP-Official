import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { Plug, Settings, Loader2 } from "lucide-react";

interface FormState {
  amadeus_connected: boolean;
  deutsche_bahn_connected: boolean;
  hrs_connected: boolean;
  sabre_connected: boolean;
  booking_com_connected: boolean;
  expense_integration_enabled: boolean;
  calendar_sync_enabled: boolean;
  payroll_integration_enabled: boolean;
}

export default function ProvidersIntegrationsTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    amadeus_connected: true,
    deutsche_bahn_connected: true,
    hrs_connected: false,
    sabre_connected: false,
    booking_com_connected: false,
    expense_integration_enabled: true,
    calendar_sync_enabled: true,
    payroll_integration_enabled: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        amadeus_connected: getValue('amadeus_connected', true) as boolean,
        deutsche_bahn_connected: getValue('deutsche_bahn_connected', true) as boolean,
        hrs_connected: getValue('hrs_connected', false) as boolean,
        sabre_connected: getValue('sabre_connected', false) as boolean,
        booking_com_connected: getValue('booking_com_connected', false) as boolean,
        expense_integration_enabled: getValue('expense_integration_enabled', true) as boolean,
        calendar_sync_enabled: getValue('calendar_sync_enabled', true) as boolean,
        payroll_integration_enabled: getValue('payroll_integration_enabled', false) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Integration gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const providers = [
    { key: 'amadeus_connected', name: 'Amadeus GDS', type: 'Flug & Hotel' },
    { key: 'deutsche_bahn_connected', name: 'Deutsche Bahn API', type: 'Bahnreisen' },
    { key: 'hrs_connected', name: 'HRS Business', type: 'Hotels' },
    { key: 'sabre_connected', name: 'Sabre GDS', type: 'Flug & Hotel' },
    { key: 'booking_com_connected', name: 'Booking.com Business', type: 'Hotels' },
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
            <Plug className="h-5 w-5 text-sky-600" />
            Buchungssysteme & APIs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {providers.map((provider) => (
              <div key={provider.key} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{provider.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{provider.type}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={formState[provider.key as keyof FormState] ? 'default' : 'secondary'}>
                    {formState[provider.key as keyof FormState] ? 'Verbunden' : 'Nicht verbunden'}
                  </Badge>
                  <Switch 
                    checked={formState[provider.key as keyof FormState] as boolean}
                    onCheckedChange={(checked) => setFormState(prev => ({...prev, [provider.key]: checked}))}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-sky-600" />
            Interne Integrationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Spesen-Integration</Label>
              <p className="text-sm text-muted-foreground">Automatische Übernahme in Spesenmodul</p>
            </div>
            <Switch 
              checked={formState.expense_integration_enabled}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, expense_integration_enabled: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Kalender-Synchronisation</Label>
              <p className="text-sm text-muted-foreground">Reisetermine in Kalender eintragen</p>
            </div>
            <Switch 
              checked={formState.calendar_sync_enabled}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, calendar_sync_enabled: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Payroll-Integration</Label>
              <p className="text-sm text-muted-foreground">Spesen an Lohnbuchhaltung übertragen</p>
            </div>
            <Switch 
              checked={formState.payroll_integration_enabled}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, payroll_integration_enabled: checked}))}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Integration speichern
        </Button>
      </div>
    </div>
  );
}
