import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { 
  Calculator, 
  MapPin, 
  Car, 
  Utensils, 
  Receipt, 
  Scan,
  Settings,
  Coffee,
  UtensilsCrossed,
  Loader2
} from "lucide-react";

interface FormState {
  per_diem_de: number;
  per_diem_at: number;
  per_diem_ch: number;
  per_diem_us: number;
  per_diem_uk: number;
  meal_reduction_breakfast: number;
  meal_reduction_lunch: number;
  meal_reduction_dinner: number;
  mileage_car: number;
  mileage_motorcycle: number;
  mileage_bicycle: number;
  require_logbook: boolean;
  auto_route_calculation: boolean;
  fuel_receipts_optional: boolean;
  receipt_hotel: boolean;
  receipt_flight: boolean;
  receipt_public_transport: boolean;
  receipt_public_transport_threshold: number;
  receipt_taxi: boolean;
  receipt_taxi_threshold: number;
  receipt_rental_car: boolean;
  receipt_restaurant: boolean;
  receipt_restaurant_threshold: number;
  ocr_read_amount: boolean;
  ocr_read_date: boolean;
  ocr_read_tax: boolean;
  ocr_read_vendor: boolean;
  tip_max_percent: number;
  tip_max_absolute: number;
  city_tax_reimbursable: boolean;
  toll_reimbursable: boolean;
  parking_reimbursable: boolean;
}

export default function PerDiemsRulesTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    per_diem_de: 24,
    per_diem_at: 26,
    per_diem_ch: 35,
    per_diem_us: 45,
    per_diem_uk: 32,
    meal_reduction_breakfast: 20,
    meal_reduction_lunch: 40,
    meal_reduction_dinner: 40,
    mileage_car: 0.30,
    mileage_motorcycle: 0.20,
    mileage_bicycle: 0.05,
    require_logbook: true,
    auto_route_calculation: true,
    fuel_receipts_optional: false,
    receipt_hotel: true,
    receipt_flight: true,
    receipt_public_transport: false,
    receipt_public_transport_threshold: 10,
    receipt_taxi: true,
    receipt_taxi_threshold: 25,
    receipt_rental_car: true,
    receipt_restaurant: false,
    receipt_restaurant_threshold: 15,
    ocr_read_amount: true,
    ocr_read_date: true,
    ocr_read_tax: true,
    ocr_read_vendor: false,
    tip_max_percent: 15,
    tip_max_absolute: 50,
    city_tax_reimbursable: true,
    toll_reimbursable: true,
    parking_reimbursable: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        per_diem_de: getValue('per_diem_de', 24) as number,
        per_diem_at: getValue('per_diem_at', 26) as number,
        per_diem_ch: getValue('per_diem_ch', 35) as number,
        per_diem_us: getValue('per_diem_us', 45) as number,
        per_diem_uk: getValue('per_diem_uk', 32) as number,
        meal_reduction_breakfast: getValue('meal_reduction_breakfast', 20) as number,
        meal_reduction_lunch: getValue('meal_reduction_lunch', 40) as number,
        meal_reduction_dinner: getValue('meal_reduction_dinner', 40) as number,
        mileage_car: getValue('mileage_car', 0.30) as number,
        mileage_motorcycle: getValue('mileage_motorcycle', 0.20) as number,
        mileage_bicycle: getValue('mileage_bicycle', 0.05) as number,
        require_logbook: getValue('require_logbook', true) as boolean,
        auto_route_calculation: getValue('auto_route_calculation', true) as boolean,
        fuel_receipts_optional: getValue('fuel_receipts_optional', false) as boolean,
        receipt_hotel: getValue('receipt_hotel', true) as boolean,
        receipt_flight: getValue('receipt_flight', true) as boolean,
        receipt_public_transport: getValue('receipt_public_transport', false) as boolean,
        receipt_public_transport_threshold: getValue('receipt_public_transport_threshold', 10) as number,
        receipt_taxi: getValue('receipt_taxi', true) as boolean,
        receipt_taxi_threshold: getValue('receipt_taxi_threshold', 25) as number,
        receipt_rental_car: getValue('receipt_rental_car', true) as boolean,
        receipt_restaurant: getValue('receipt_restaurant', false) as boolean,
        receipt_restaurant_threshold: getValue('receipt_restaurant_threshold', 15) as number,
        ocr_read_amount: getValue('ocr_read_amount', true) as boolean,
        ocr_read_date: getValue('ocr_read_date', true) as boolean,
        ocr_read_tax: getValue('ocr_read_tax', true) as boolean,
        ocr_read_vendor: getValue('ocr_read_vendor', false) as boolean,
        tip_max_percent: getValue('tip_max_percent', 15) as number,
        tip_max_absolute: getValue('tip_max_absolute', 50) as number,
        city_tax_reimbursable: getValue('city_tax_reimbursable', true) as boolean,
        toll_reimbursable: getValue('toll_reimbursable', true) as boolean,
        parking_reimbursable: getValue('parking_reimbursable', false) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Spesen-Regeln gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const countries = [
    { code: 'DE', name: 'Deutschland', key: 'per_diem_de', currency: 'EUR' },
    { code: 'AT', name: 'Österreich', key: 'per_diem_at', currency: 'EUR' },
    { code: 'CH', name: 'Schweiz', key: 'per_diem_ch', currency: 'CHF' },
    { code: 'US', name: 'USA', key: 'per_diem_us', currency: 'USD' },
    { code: 'UK', name: 'Großbritannien', key: 'per_diem_uk', currency: 'GBP' }
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
      <Tabs defaultValue="perdiem" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perdiem">Tagegelder</TabsTrigger>
          <TabsTrigger value="mileage">Kilometerpauschalen</TabsTrigger>
          <TabsTrigger value="receipts">Belege</TabsTrigger>
          <TabsTrigger value="ocr">Smart OCR</TabsTrigger>
        </TabsList>

        {/* Per-Diem Rules */}
        <TabsContent value="perdiem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-sky-600" />
                Per-Diem Regelungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.map((country) => (
                  <Card key={country.code}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{country.name}</h4>
                        <Badge variant="outline">{country.code}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Tagegeld:</span>
                          <div className="flex items-center gap-1">
                            <Input 
                              type="number"
                              className="w-16"
                              value={formState[country.key as keyof FormState] as number}
                              onChange={(e) => setFormState(prev => ({...prev, [country.key]: Number(e.target.value)}))}
                            />
                            <span>{country.currency}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                Mahlzeitenkürzung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Coffee className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-semibold mb-1">Frühstück</h4>
                      <div className="flex items-center justify-center gap-2">
                        <Input 
                          type="number"
                          className="w-16 text-center"
                          value={formState.meal_reduction_breakfast}
                          onChange={(e) => setFormState(prev => ({...prev, meal_reduction_breakfast: Number(e.target.value)}))}
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Utensils className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-semibold mb-1">Mittagessen</h4>
                      <div className="flex items-center justify-center gap-2">
                        <Input 
                          type="number"
                          className="w-16 text-center"
                          value={formState.meal_reduction_lunch}
                          onChange={(e) => setFormState(prev => ({...prev, meal_reduction_lunch: Number(e.target.value)}))}
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-semibold mb-1">Abendessen</h4>
                      <div className="flex items-center justify-center gap-2">
                        <Input 
                          type="number"
                          className="w-16 text-center"
                          value={formState.meal_reduction_dinner}
                          onChange={(e) => setFormState(prev => ({...prev, meal_reduction_dinner: Number(e.target.value)}))}
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mileage Rules */}
        <TabsContent value="mileage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-green-600" />
                Kilometerpauschalen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">Pauschalen (€/km)</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">PKW</span>
                      <Input 
                        type="number"
                        step="0.01"
                        className="w-20"
                        value={formState.mileage_car}
                        onChange={(e) => setFormState(prev => ({...prev, mileage_car: Number(e.target.value)}))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Motorrad</span>
                      <Input 
                        type="number"
                        step="0.01"
                        className="w-20"
                        value={formState.mileage_motorcycle}
                        onChange={(e) => setFormState(prev => ({...prev, mileage_motorcycle: Number(e.target.value)}))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Fahrrad</span>
                      <Input 
                        type="number"
                        step="0.01"
                        className="w-20"
                        value={formState.mileage_bicycle}
                        onChange={(e) => setFormState(prev => ({...prev, mileage_bicycle: Number(e.target.value)}))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Nachweise & Dokumentation</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Fahrtenbuch erforderlich</Label>
                        <p className="text-sm text-muted-foreground">Bei regelmäßiger Nutzung</p>
                      </div>
                      <Switch 
                        checked={formState.require_logbook}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, require_logbook: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Route automatisch berechnen</Label>
                        <p className="text-sm text-muted-foreground">Via Maps API</p>
                      </div>
                      <Switch 
                        checked={formState.auto_route_calculation}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, auto_route_calculation: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Tankbelege optional</Label>
                        <p className="text-sm text-muted-foreground">Pauschale gilt</p>
                      </div>
                      <Switch 
                        checked={formState.fuel_receipts_optional}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, fuel_receipts_optional: checked}))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Requirements */}
        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-purple-600" />
                Belegpflicht & Kategorien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">Belegpflichtige Kategorien</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.receipt_hotel}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, receipt_hotel: checked}))}
                        />
                        <span className="font-medium">Hotel</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.receipt_flight}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, receipt_flight: checked}))}
                        />
                        <span className="font-medium">Flug/Bahn</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.receipt_public_transport}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, receipt_public_transport: checked}))}
                        />
                        <span className="font-medium">ÖPNV</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">ab</span>
                        <Input 
                          type="number"
                          className="w-16"
                          value={formState.receipt_public_transport_threshold}
                          onChange={(e) => setFormState(prev => ({...prev, receipt_public_transport_threshold: Number(e.target.value)}))}
                        />
                        <span className="text-sm">€</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.receipt_taxi}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, receipt_taxi: checked}))}
                        />
                        <span className="font-medium">Taxi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">ab</span>
                        <Input 
                          type="number"
                          className="w-16"
                          value={formState.receipt_taxi_threshold}
                          onChange={(e) => setFormState(prev => ({...prev, receipt_taxi_threshold: Number(e.target.value)}))}
                        />
                        <span className="text-sm">€</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.receipt_rental_car}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, receipt_rental_car: checked}))}
                        />
                        <span className="font-medium">Mietwagen</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={formState.receipt_restaurant}
                          onCheckedChange={(checked) => setFormState(prev => ({...prev, receipt_restaurant: checked}))}
                        />
                        <span className="font-medium">Restaurants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">ab</span>
                        <Input 
                          type="number"
                          className="w-16"
                          value={formState.receipt_restaurant_threshold}
                          onChange={(e) => setFormState(prev => ({...prev, receipt_restaurant_threshold: Number(e.target.value)}))}
                        />
                        <span className="text-sm">€</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Zusätzliche Spesenregeln</Label>
                  <div className="space-y-3 mt-2">
                    <div className="p-3 border rounded-lg">
                      <Label className="font-medium">Trinkgelder</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            className="w-16"
                            value={formState.tip_max_percent}
                            onChange={(e) => setFormState(prev => ({...prev, tip_max_percent: Number(e.target.value)}))}
                          />
                          <span className="text-sm">% max</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            className="w-16"
                            value={formState.tip_max_absolute}
                            onChange={(e) => setFormState(prev => ({...prev, tip_max_absolute: Number(e.target.value)}))}
                          />
                          <span className="text-sm">€ max</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="text-sm">City-Tax erstattungsfähig</Label>
                      <Switch 
                        checked={formState.city_tax_reimbursable}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, city_tax_reimbursable: checked}))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="text-sm">Maut/Vignetten</Label>
                      <Switch 
                        checked={formState.toll_reimbursable}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, toll_reimbursable: checked}))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="text-sm">Parkgebühren</Label>
                      <Switch 
                        checked={formState.parking_reimbursable}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, parking_reimbursable: checked}))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart OCR */}
        <TabsContent value="ocr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-indigo-600" />
                Smart OCR & Automatisierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium">OCR-Funktionen</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Betrag automatisch lesen</Label>
                        <p className="text-sm text-muted-foreground">Rechnungsgesamtbetrag erkennen</p>
                      </div>
                      <Switch 
                        checked={formState.ocr_read_amount}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, ocr_read_amount: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Datum extrahieren</Label>
                        <p className="text-sm text-muted-foreground">Rechnungs- und Fälligkeitsdatum</p>
                      </div>
                      <Switch 
                        checked={formState.ocr_read_date}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, ocr_read_date: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Steuerinformationen lesen</Label>
                        <p className="text-sm text-muted-foreground">MwSt.-Sätze und Beträge</p>
                      </div>
                      <Switch 
                        checked={formState.ocr_read_tax}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, ocr_read_tax: checked}))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Lieferant/Händler erkennen</Label>
                        <p className="text-sm text-muted-foreground">Automatische Kategorisierung</p>
                      </div>
                      <Switch 
                        checked={formState.ocr_read_vendor}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, ocr_read_vendor: checked}))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Länderspezifische MwSt.-Sätze</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { country: 'Deutschland', standard: '19%', reduced: '7%' },
                      { country: 'Österreich', standard: '20%', reduced: '10%' },
                      { country: 'Schweiz', standard: '7,7%', reduced: '2,5%' },
                      { country: 'Frankreich', standard: '20%', reduced: '5,5%' }
                    ].map((country, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{country.country}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">{country.standard}</Badge>
                            <Badge variant="secondary">{country.reduced}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" className="mt-3">
                    MwSt.-Sätze verwalten
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Spesen-Regeln speichern
        </Button>
      </div>
    </div>
  );
}
