import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { 
  Settings, 
  User, 
  FileText, 
  Calendar, 
  Clock, 
  FolderOpen, 
  Receipt, 
  DollarSign,
  Plane,
  MapPin,
  Hotel,
  Car,
  CheckCircle,
  Loader2
} from "lucide-react";

interface FormState {
  // Travel Types
  travel_type_domestic: boolean;
  travel_type_eu: boolean;
  travel_type_non_eu: boolean;
  travel_type_project: boolean;
  travel_type_training: boolean;
  travel_type_customer: boolean;
  // Required Fields
  required_purpose: boolean;
  required_customer: boolean;
  required_cost_center: boolean;
  required_timeframe: boolean;
  required_destination: boolean;
  required_transport: boolean;
  required_accommodation: boolean;
  // Data Flows
  dataflow_calendar: boolean;
  dataflow_time_tracking: boolean;
  dataflow_documents: boolean;
  dataflow_expenses: boolean;
  dataflow_payroll: boolean;
}

export default function GeneralProfilesTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    travel_type_domestic: true,
    travel_type_eu: true,
    travel_type_non_eu: true,
    travel_type_project: true,
    travel_type_training: true,
    travel_type_customer: true,
    required_purpose: true,
    required_customer: true,
    required_cost_center: true,
    required_timeframe: true,
    required_destination: true,
    required_transport: true,
    required_accommodation: true,
    dataflow_calendar: true,
    dataflow_time_tracking: true,
    dataflow_documents: true,
    dataflow_expenses: true,
    dataflow_payroll: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        travel_type_domestic: getValue('travel_type_domestic', true) as boolean,
        travel_type_eu: getValue('travel_type_eu', true) as boolean,
        travel_type_non_eu: getValue('travel_type_non_eu', true) as boolean,
        travel_type_project: getValue('travel_type_project', true) as boolean,
        travel_type_training: getValue('travel_type_training', true) as boolean,
        travel_type_customer: getValue('travel_type_customer', true) as boolean,
        required_purpose: getValue('required_purpose', true) as boolean,
        required_customer: getValue('required_customer', true) as boolean,
        required_cost_center: getValue('required_cost_center', true) as boolean,
        required_timeframe: getValue('required_timeframe', true) as boolean,
        required_destination: getValue('required_destination', true) as boolean,
        required_transport: getValue('required_transport', true) as boolean,
        required_accommodation: getValue('required_accommodation', true) as boolean,
        dataflow_calendar: getValue('dataflow_calendar', true) as boolean,
        dataflow_time_tracking: getValue('dataflow_time_tracking', true) as boolean,
        dataflow_documents: getValue('dataflow_documents', true) as boolean,
        dataflow_expenses: getValue('dataflow_expenses', true) as boolean,
        dataflow_payroll: getValue('dataflow_payroll', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Konfiguration gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const profileFields = [
    { id: 'seatPreference', label: 'Sitzpräferenz', type: 'dropdown', options: ['Fenster', 'Gang', 'Keine Präferenz'] },
    { id: 'railCard', label: 'BahnCard/ÖBB Vorteilscard', type: 'text' },
    { id: 'frequentFlyer', label: 'Vielflieger-Programme', type: 'multi-text' },
    { id: 'hotelPreferences', label: 'Hotelpräferenzen', type: 'multi-select', options: ['Nichtraucher', 'Klimaanlage', 'WLAN', 'Fitness', 'Pool'] },
    { id: 'accessibility', label: 'Barrierefreiheit', type: 'checkbox-group', options: ['Rollstuhlgerecht', 'Hörunterstützung', 'Sehbehinderung', 'Spezielle Verpflegung'] }
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
      {/* Travel Types Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-600" />
            Reisearten aktivieren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'travel_type_domestic', label: 'Inland', icon: MapPin },
              { key: 'travel_type_eu', label: 'EU', icon: MapPin },
              { key: 'travel_type_non_eu', label: 'Non-EU', icon: MapPin },
              { key: 'travel_type_project', label: 'Projektreise', icon: FolderOpen },
              { key: 'travel_type_training', label: 'Schulung', icon: FileText },
              { key: 'travel_type_customer', label: 'Kundenbesuch', icon: User }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={key}>{label}</Label>
                </div>
                <Switch
                  id={key}
                  checked={formState[key as keyof FormState] as boolean}
                  onCheckedChange={(checked) => 
                    setFormState(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standard Profile Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-sky-600" />
            Standard-Reiseprofilfelder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">{field.label}</Label>
                  <p className="text-sm text-muted-foreground">Typ: {field.type}</p>
                </div>
                <Badge variant="secondary">{field.type}</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4">
            <Settings className="h-4 w-4 mr-2" />
            Felder konfigurieren
          </Button>
        </CardContent>
      </Card>

      {/* Required Travel Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-600" />
            Erforderliche Pflichtangaben je Reise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'required_purpose', label: 'Anlass', icon: FileText },
              { key: 'required_customer', label: 'Kunde/Projekt', icon: User },
              { key: 'required_cost_center', label: 'Kostenstelle', icon: DollarSign },
              { key: 'required_timeframe', label: 'Zeitraum', icon: Calendar },
              { key: 'required_destination', label: 'Ziel', icon: MapPin },
              { key: 'required_transport', label: 'Transportmittel', icon: Car },
              { key: 'required_accommodation', label: 'Unterkunft', icon: Hotel }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={key}>{label}</Label>
                </div>
                <Switch
                  id={key}
                  checked={formState[key as keyof FormState] as boolean}
                  onCheckedChange={(checked) => 
                    setFormState(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-600" />
            Standard-Datenflüsse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {[
              { 
                key: 'dataflow_calendar', 
                label: 'Kalender', 
                description: 'Reiseblocker & Termine automatisch eintragen',
                icon: Calendar 
              },
              { 
                key: 'dataflow_time_tracking', 
                label: 'Zeiterfassung', 
                description: 'Reisezeiten/Arbeitszeiten verknüpfen',
                icon: Clock 
              },
              { 
                key: 'dataflow_documents', 
                label: 'Dokumente', 
                description: 'Tickets/Belege/Policy-Bestätigungen ablegen',
                icon: FolderOpen 
              },
              { 
                key: 'dataflow_expenses', 
                label: 'Ausgaben', 
                description: 'Automatische Anlage von Spesen-Reports',
                icon: Receipt 
              },
              { 
                key: 'dataflow_payroll', 
                label: 'Payroll', 
                description: 'Steuerrelevante Spesen übertragen',
                icon: DollarSign 
              }
            ].map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="font-medium">{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {formState[key as keyof FormState] && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <Switch
                    checked={formState[key as keyof FormState] as boolean}
                    onCheckedChange={(checked) => 
                      setFormState(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Konfiguration speichern
        </Button>
      </div>
    </div>
  );
}
