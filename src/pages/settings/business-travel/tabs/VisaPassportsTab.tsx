import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { 
  Globe, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Shield, 
  MapPin,
  Phone,
  GraduationCap,
  Settings,
  Loader2
} from "lucide-react";

interface FormState {
  reminder_90_days: boolean;
  reminder_60_days: boolean;
  reminder_30_days: boolean;
  visa_reminders: boolean;
  block_expired: boolean;
  require_passport: boolean;
  require_id_card: boolean;
  require_license: boolean;
  require_health_cert: boolean;
  require_visa: boolean;
  require_esta: boolean;
  require_invitation: boolean;
  require_vaccination: boolean;
  assistance_provider: string;
  sos_button_enabled: boolean;
  foreign_office_api: boolean;
  travel_warning_on_booking: boolean;
  auto_warning_notifications: boolean;
  training_security_briefing: boolean;
  training_anti_corruption: boolean;
  training_cultural_awareness: boolean;
  training_emergency: boolean;
}

export default function VisaPassportsTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    reminder_90_days: true,
    reminder_60_days: true,
    reminder_30_days: true,
    visa_reminders: true,
    block_expired: false,
    require_passport: true,
    require_id_card: false,
    require_license: false,
    require_health_cert: false,
    require_visa: true,
    require_esta: false,
    require_invitation: false,
    require_vaccination: false,
    assistance_provider: 'sos',
    sos_button_enabled: true,
    foreign_office_api: true,
    travel_warning_on_booking: true,
    auto_warning_notifications: false,
    training_security_briefing: true,
    training_anti_corruption: true,
    training_cultural_awareness: false,
    training_emergency: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        reminder_90_days: getValue('reminder_90_days', true) as boolean,
        reminder_60_days: getValue('reminder_60_days', true) as boolean,
        reminder_30_days: getValue('reminder_30_days', true) as boolean,
        visa_reminders: getValue('visa_reminders', true) as boolean,
        block_expired: getValue('block_expired', false) as boolean,
        require_passport: getValue('require_passport', true) as boolean,
        require_id_card: getValue('require_id_card', false) as boolean,
        require_license: getValue('require_license', false) as boolean,
        require_health_cert: getValue('require_health_cert', false) as boolean,
        require_visa: getValue('require_visa', true) as boolean,
        require_esta: getValue('require_esta', false) as boolean,
        require_invitation: getValue('require_invitation', false) as boolean,
        require_vaccination: getValue('require_vaccination', false) as boolean,
        assistance_provider: getValue('assistance_provider', 'sos') as string,
        sos_button_enabled: getValue('sos_button_enabled', true) as boolean,
        foreign_office_api: getValue('foreign_office_api', true) as boolean,
        travel_warning_on_booking: getValue('travel_warning_on_booking', true) as boolean,
        auto_warning_notifications: getValue('auto_warning_notifications', false) as boolean,
        training_security_briefing: getValue('training_security_briefing', true) as boolean,
        training_anti_corruption: getValue('training_anti_corruption', true) as boolean,
        training_cultural_awareness: getValue('training_cultural_awareness', false) as boolean,
        training_emergency: getValue('training_emergency', false) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Visa & Dokumente gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const riskCountries = [
    { country: 'Afghanistan', level: 'high', color: 'text-red-600', requirements: ['Visa', 'Security Briefing', 'Insurance'] },
    { country: 'China', level: 'medium', color: 'text-yellow-600', requirements: ['Visa', 'Business Letter'] },
    { country: 'USA', level: 'low', color: 'text-green-600', requirements: ['ESTA/Visa'] },
    { country: 'Vereinigtes Königreich', level: 'low', color: 'text-green-600', requirements: ['Passport'] }
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
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="risks">Risikoländer</TabsTrigger>
          <TabsTrigger value="assistance">Assistance</TabsTrigger>
          <TabsTrigger value="training">Schulungen</TabsTrigger>
        </TabsList>

        {/* Travel Documents */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-600" />
                Pflichtfelder für Reisedokumente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">Standarddokumente</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_passport}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_passport: checked}))}
                        />
                        <Label>Reisepass</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_id_card}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_id_card: checked}))}
                        />
                        <Label>Personalausweis</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_license}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_license: checked}))}
                        />
                        <Label>Führerschein</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_health_cert}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_health_cert: checked}))}
                        />
                        <Label>Gesundheitszeugnis</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Zusatzdokumente</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_visa}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_visa: checked}))}
                        />
                        <Label>Visa-Status</Label>
                      </div>
                      <Badge variant={formState.require_visa ? 'default' : 'secondary'}>
                        {formState.require_visa ? 'Pflicht' : 'Optional'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_esta}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_esta: checked}))}
                        />
                        <Label>ESTA/ETIAS</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_invitation}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_invitation: checked}))}
                        />
                        <Label>Einladungsschreiben</Label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.require_vaccination}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, require_vaccination: checked}))}
                        />
                        <Label>Impfnachweis</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Gültigkeits-Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">Erinnerungsintervalle</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label>90 Tage vor Ablauf</Label>
                      <Switch
                        checked={formState.reminder_90_days}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, reminder_90_days: checked}))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label>60 Tage vor Ablauf</Label>
                      <Switch
                        checked={formState.reminder_60_days}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, reminder_60_days: checked}))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label>30 Tage vor Ablauf</Label>
                      <Switch
                        checked={formState.reminder_30_days}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, reminder_30_days: checked}))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Weitere Optionen</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Visa-Erinnerungen aktivieren</Label>
                        <p className="text-sm text-muted-foreground">Für länderspezifische Visa</p>
                      </div>
                      <Switch
                        checked={formState.visa_reminders}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, visa_reminders: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Sperre bei abgelaufenem Dokument</Label>
                        <p className="text-sm text-muted-foreground">Reisebuchung blockieren</p>
                      </div>
                      <Switch
                        checked={formState.block_expired}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, block_expired: checked}))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Countries */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Risikostufen pro Land
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {riskCountries.map((country, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{country.country}</span>
                        <Badge 
                          variant={country.level === 'high' ? 'destructive' : country.level === 'medium' ? 'default' : 'secondary'}
                        >
                          {country.level === 'high' ? 'Hoch' : country.level === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">Bearbeiten</Button>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-muted-foreground">Zusätzliche Anforderungen:</Label>
                      <div className="flex gap-2 mt-2">
                        {country.requirements.map((req, idx) => (
                          <Badge key={idx} variant="outline">{req}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Neues Land hinzufügen
              </Button>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Risikoeinstufungen basieren auf aktuellen Reisewarnungen des Auswärtigen Amts 
              und werden automatisch aktualisiert. Manuelle Anpassungen bleiben bestehen.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Travel Assistance */}
        <TabsContent value="assistance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                Travel Assistance & SOS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">Assistance-Anbieter</Label>
                  <div className="space-y-3 mt-2">
                    <Select 
                      value={formState.assistance_provider}
                      onValueChange={(value) => setFormState(prev => ({...prev, assistance_provider: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Anbieter auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sos">SOS International</SelectItem>
                        <SelectItem value="allianz">Allianz Partners</SelectItem>
                        <SelectItem value="axa">AXA Assistance</SelectItem>
                        <SelectItem value="europ">Europ Assistance</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="p-3 border rounded-lg">
                      <Label className="text-sm font-medium">24/7 Hotline</Label>
                      <p className="text-sm text-muted-foreground">+49 89 1234 5678</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">SOS-Button in Travel-App</Label>
                      </div>
                      <Switch 
                        checked={formState.sos_button_enabled}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, sos_button_enabled: checked}))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Reisewarnungen Integration</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Auswärtiges Amt API</Label>
                        <p className="text-sm text-muted-foreground">Automatische Updates</p>
                      </div>
                      <Switch 
                        checked={formState.foreign_office_api}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, foreign_office_api: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Reisewarnung bei Buchung</Label>
                        <p className="text-sm text-muted-foreground">Warnung anzeigen</p>
                      </div>
                      <Switch 
                        checked={formState.travel_warning_on_booking}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, travel_warning_on_booking: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Automatische Benachrichtigungen</Label>
                        <p className="text-sm text-muted-foreground">Bei neuen Warnungen</p>
                      </div>
                      <Switch 
                        checked={formState.auto_warning_notifications}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, auto_warning_notifications: checked}))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mandatory Training */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Pflicht-Trainings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formState.training_security_briefing}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, training_security_briefing: checked}))}
                      />
                      <div>
                        <Label className="font-medium">Sicherheits-Briefing</Label>
                        <p className="text-sm text-muted-foreground">Risikoländer (High)</p>
                      </div>
                    </div>
                    <Badge variant={formState.training_security_briefing ? 'default' : 'secondary'}>
                      {formState.training_security_briefing ? 'Pflicht' : 'Optional'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formState.training_anti_corruption}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, training_anti_corruption: checked}))}
                      />
                      <div>
                        <Label className="font-medium">Antikorruptions-Schulung</Label>
                        <p className="text-sm text-muted-foreground">Alle Auslandsreisen</p>
                      </div>
                    </div>
                    <Badge variant={formState.training_anti_corruption ? 'default' : 'secondary'}>
                      {formState.training_anti_corruption ? 'Pflicht' : 'Optional'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formState.training_cultural_awareness}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, training_cultural_awareness: checked}))}
                      />
                      <div>
                        <Label className="font-medium">Kulturelle Sensibilisierung</Label>
                        <p className="text-sm text-muted-foreground">Asien, Mittlerer Osten</p>
                      </div>
                    </div>
                    <Badge variant={formState.training_cultural_awareness ? 'default' : 'secondary'}>
                      {formState.training_cultural_awareness ? 'Pflicht' : 'Optional'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={formState.training_emergency}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, training_emergency: checked}))}
                      />
                      <div>
                        <Label className="font-medium">Notfall-Verhalten</Label>
                        <p className="text-sm text-muted-foreground">Erste Auslandsreise</p>
                      </div>
                    </div>
                    <Badge variant={formState.training_emergency ? 'default' : 'secondary'}>
                      {formState.training_emergency ? 'Pflicht' : 'Optional'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button variant="outline">
                <GraduationCap className="h-4 w-4 mr-2" />
                Neues Training hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Duty of Care Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Duty of Care Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <Label className="text-sm text-muted-foreground">Aktive Reisen</Label>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <Label className="text-sm text-muted-foreground">Ablaufende Dokumente</Label>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">1</div>
              <Label className="text-sm text-muted-foreground">Risikoland-Reisen</Label>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">98%</div>
              <Label className="text-sm text-muted-foreground">Training-Compliance</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Visa & Dokumente speichern
        </Button>
      </div>
    </div>
  );
}
