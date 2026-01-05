import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { 
  Shield, 
  Plane, 
  Train, 
  Car, 
  Hotel, 
  AlertTriangle, 
  Globe, 
  Settings,
  Loader2
} from "lucide-react";

interface FormState {
  enforcement_mode: 'hard' | 'soft';
  train_class: string;
  train_first_class_threshold_hours: number;
  flight_class: string;
  flight_min_distance_km: number;
  car_class: string;
  hotel_max_price: number;
  hotel_min_safety: string;
  booking_min_advance_days: number;
  booking_require_justification: boolean;
  de_max_hotel: number;
  de_per_diem: number;
  at_max_hotel: number;
  at_per_diem: number;
  ch_max_hotel: number;
  ch_per_diem: number;
  policy_version: string;
  policy_valid_since: string;
}

export default function TravelPoliciesTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    enforcement_mode: 'soft',
    train_class: '2',
    train_first_class_threshold_hours: 4,
    flight_class: 'economy',
    flight_min_distance_km: 500,
    car_class: 'compact',
    hotel_max_price: 150,
    hotel_min_safety: '24h_reception',
    booking_min_advance_days: 14,
    booking_require_justification: true,
    de_max_hotel: 150,
    de_per_diem: 24,
    at_max_hotel: 140,
    at_per_diem: 26,
    ch_max_hotel: 180,
    ch_per_diem: 35,
    policy_version: 'v2.1',
    policy_valid_since: '2024-01-01',
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        enforcement_mode: getValue('enforcement_mode', 'soft') as 'hard' | 'soft',
        train_class: getValue('train_class', '2') as string,
        train_first_class_threshold_hours: getValue('train_first_class_threshold_hours', 4) as number,
        flight_class: getValue('flight_class', 'economy') as string,
        flight_min_distance_km: getValue('flight_min_distance_km', 500) as number,
        car_class: getValue('car_class', 'compact') as string,
        hotel_max_price: getValue('hotel_max_price', 150) as number,
        hotel_min_safety: getValue('hotel_min_safety', '24h_reception') as string,
        booking_min_advance_days: getValue('booking_min_advance_days', 14) as number,
        booking_require_justification: getValue('booking_require_justification', true) as boolean,
        de_max_hotel: getValue('de_max_hotel', 150) as number,
        de_per_diem: getValue('de_per_diem', 24) as number,
        at_max_hotel: getValue('at_max_hotel', 140) as number,
        at_per_diem: getValue('at_per_diem', 26) as number,
        ch_max_hotel: getValue('ch_max_hotel', 180) as number,
        ch_per_diem: getValue('ch_per_diem', 35) as number,
        policy_version: getValue('policy_version', 'v2.1') as string,
        policy_valid_since: getValue('policy_valid_since', '2024-01-01') as string,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Richtlinien gespeichert");
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
      {/* Policy Enforcement Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sky-600" />
            Policy-Durchsetzung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="hard-stop" 
                name="enforcement"
                checked={formState.enforcement_mode === 'hard'}
                onChange={() => setFormState(prev => ({ ...prev, enforcement_mode: 'hard' }))}
              />
              <Label htmlFor="hard-stop" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Hard Stop (blockieren)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="soft-warning" 
                name="enforcement"
                checked={formState.enforcement_mode === 'soft'}
                onChange={() => setFormState(prev => ({ ...prev, enforcement_mode: 'soft' }))}
              />
              <Label htmlFor="soft-warning" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Soft Warnung (begründungspflichtig)
              </Label>
            </div>
          </div>
          <Badge variant={formState.enforcement_mode === 'hard' ? 'destructive' : 'secondary'}>
            {formState.enforcement_mode === 'hard' ? 'Strikte Durchsetzung' : 'Flexible Durchsetzung'}
          </Badge>
        </CardContent>
      </Card>

      {/* Policy Categories */}
      <Tabs defaultValue="transport" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="accommodation">Hotel</TabsTrigger>
          <TabsTrigger value="booking">Buchung</TabsTrigger>
          <TabsTrigger value="exceptions">Ausnahmen</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        {/* Transport Policies */}
        <TabsContent value="transport" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Train className="h-5 w-5 text-green-600" />
                Bahnreisen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="train-class">Standardklasse</Label>
                  <Select value={formState.train_class} onValueChange={(value) => 
                    setFormState(prev => ({...prev, train_class: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2. Klasse</SelectItem>
                      <SelectItem value="1">1. Klasse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="train-upgrade">1. Klasse erlaubt ab (Stunden)</Label>
                  <Input 
                    type="number"
                    value={formState.train_first_class_threshold_hours}
                    onChange={(e) => setFormState(prev => ({...prev, train_first_class_threshold_hours: Number(e.target.value)}))}
                    placeholder="4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600" />
                Flugreisen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="flight-class">Standardklasse</Label>
                  <Select value={formState.flight_class} onValueChange={(value) => 
                    setFormState(prev => ({...prev, flight_class: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="flight-min-distance">Flug erst ab (km)</Label>
                  <Input 
                    type="number"
                    value={formState.flight_min_distance_km}
                    onChange={(e) => setFormState(prev => ({...prev, flight_min_distance_km: Number(e.target.value)}))}
                    placeholder="500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-gray-600" />
                Mietwagen & Taxi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="car-class">Fahrzeugklasse</Label>
                  <Select value={formState.car_class} onValueChange={(value) => 
                    setFormState(prev => ({...prev, car_class: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Kompaktklasse</SelectItem>
                      <SelectItem value="mid">Mittelklasse</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bevorzugte Anbieter</Label>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Hertz</Badge>
                    <Badge variant="secondary">Avis</Badge>
                    <Badge variant="secondary">Sixt</Badge>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accommodation Policies */}
        <TabsContent value="accommodation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-purple-600" />
                Hotel-Richtlinien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-price">Preisdeckel pro Nacht (€)</Label>
                  <Input 
                    type="number"
                    value={formState.hotel_max_price}
                    onChange={(e) => setFormState(prev => ({...prev, hotel_max_price: Number(e.target.value)}))}
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="safety-standard">Mindest-Sicherheitsstandard</Label>
                  <Select value={formState.hotel_min_safety} onValueChange={(value) => 
                    setFormState(prev => ({...prev, hotel_min_safety: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h_reception">24/7 Rezeption</SelectItem>
                      <SelectItem value="security">Sicherheitsdienst</SelectItem>
                      <SelectItem value="cctv">Videoüberwachung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Policies */}
        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                Buchungsfristen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-advance">Mindestvorlauf (Tage)</Label>
                  <Input 
                    type="number"
                    value={formState.booking_min_advance_days}
                    onChange={(e) => setFormState(prev => ({...prev, booking_min_advance_days: Number(e.target.value)}))}
                    placeholder="14"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="require-justification"
                    checked={formState.booking_require_justification}
                    onCheckedChange={(checked) => 
                      setFormState(prev => ({...prev, booking_require_justification: checked}))
                    }
                  />
                  <Label htmlFor="require-justification">
                    Begründungspflicht bei Unterschreitung
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exceptions */}
        <TabsContent value="exceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Sonderfälle & Ausnahmen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  { role: 'Vorstand', description: 'Automatisch Business Class bei Flügen >2h' },
                  { role: 'Kundeneskalation', description: 'Kurzfristige Buchungen ohne Vorlauf' },
                  { role: 'Notfall', description: 'Alle Beschränkungen aufgehoben' }
                ].map((exception, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">{exception.role}</Label>
                      <p className="text-sm text-muted-foreground">{exception.description}</p>
                    </div>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                ))}
              </div>
              <Button variant="outline">
                Neue Ausnahme hinzufügen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Rules */}
        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Regionale Regeln (DE/AT/CH)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Deutschland</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Max. Hotel:</span>
                        <Input 
                          type="number"
                          className="w-20"
                          value={formState.de_max_hotel}
                          onChange={(e) => setFormState(prev => ({...prev, de_max_hotel: Number(e.target.value)}))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tagegeld:</span>
                        <Input 
                          type="number"
                          className="w-20"
                          value={formState.de_per_diem}
                          onChange={(e) => setFormState(prev => ({...prev, de_per_diem: Number(e.target.value)}))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Österreich</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Max. Hotel:</span>
                        <Input 
                          type="number"
                          className="w-20"
                          value={formState.at_max_hotel}
                          onChange={(e) => setFormState(prev => ({...prev, at_max_hotel: Number(e.target.value)}))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tagegeld:</span>
                        <Input 
                          type="number"
                          className="w-20"
                          value={formState.at_per_diem}
                          onChange={(e) => setFormState(prev => ({...prev, at_per_diem: Number(e.target.value)}))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Schweiz</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Max. Hotel:</span>
                        <Input 
                          type="number"
                          className="w-20"
                          value={formState.ch_max_hotel}
                          onChange={(e) => setFormState(prev => ({...prev, ch_max_hotel: Number(e.target.value)}))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tagegeld:</span>
                        <Input 
                          type="number"
                          className="w-20"
                          value={formState.ch_per_diem}
                          onChange={(e) => setFormState(prev => ({...prev, ch_per_diem: Number(e.target.value)}))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Policy Versioning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-sky-600" />
            Versionierung & Rollout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Aktuelle Version</Label>
              <p className="text-sm text-muted-foreground">{formState.policy_version} - Gültig seit {formState.policy_valid_since}</p>
            </div>
            <Badge variant="secondary">Aktiv</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
          Richtlinien speichern
        </Button>
      </div>
    </div>
  );
}
