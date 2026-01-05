import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { MapPin, Settings, Loader2 } from "lucide-react";

interface FormState {
  geofencing_enabled: boolean;
  realtime_tracking: boolean;
  sos_button_app: boolean;
  location_history_enabled: boolean;
  travel_alerts_enabled: boolean;
  emergency_contacts_required: boolean;
}

export default function SecurityLocationTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    geofencing_enabled: false,
    realtime_tracking: false,
    sos_button_app: true,
    location_history_enabled: false,
    travel_alerts_enabled: true,
    emergency_contacts_required: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        geofencing_enabled: getValue('geofencing_enabled', false) as boolean,
        realtime_tracking: getValue('realtime_tracking', false) as boolean,
        sos_button_app: getValue('sos_button_app', true) as boolean,
        location_history_enabled: getValue('location_history_enabled', false) as boolean,
        travel_alerts_enabled: getValue('travel_alerts_enabled', true) as boolean,
        emergency_contacts_required: getValue('emergency_contacts_required', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Sicherheitseinstellungen gespeichert");
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
            <MapPin className="h-5 w-5 text-red-600" />
            Geofencing & Standort-Sicherheit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Geofencing aktivieren</Label>
                <p className="text-sm text-muted-foreground">Benachrichtigung bei Verlassen definierter Zonen</p>
              </div>
              <Switch 
                checked={formState.geofencing_enabled}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, geofencing_enabled: checked}))}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Echtzeit-Standortverfolgung</Label>
                <p className="text-sm text-muted-foreground">Standort während Auslandsreisen tracken</p>
              </div>
              <Switch 
                checked={formState.realtime_tracking}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, realtime_tracking: checked}))}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">SOS-Button in App</Label>
                <p className="text-sm text-muted-foreground">Notfall-Button für schnelle Hilfe</p>
              </div>
              <Switch 
                checked={formState.sos_button_app}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, sos_button_app: checked}))}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Standortverlauf speichern</Label>
                <p className="text-sm text-muted-foreground">Historische Standortdaten aufbewahren</p>
              </div>
              <Switch 
                checked={formState.location_history_enabled}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, location_history_enabled: checked}))}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Reisewarnungen aktivieren</Label>
                <p className="text-sm text-muted-foreground">Automatische Benachrichtigungen bei Sicherheitsrisiken</p>
              </div>
              <Switch 
                checked={formState.travel_alerts_enabled}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, travel_alerts_enabled: checked}))}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Notfallkontakte erforderlich</Label>
                <p className="text-sm text-muted-foreground">Kontakte müssen vor Reiseantritt hinterlegt sein</p>
              </div>
              <Switch 
                checked={formState.emergency_contacts_required}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, emergency_contacts_required: checked}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Sicherheitseinstellungen speichern
        </Button>
      </div>
    </div>
  );
}
