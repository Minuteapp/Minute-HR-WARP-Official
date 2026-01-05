import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Car, 
  MapPin, 
  Navigation, 
  Calculator, 
  Save,
  Smartphone,
  Route,
  Fuel
} from "lucide-react";
import { toast } from "sonner";

interface MileageCalculatorProps {
  tripId: string;
}

const MileageCalculator = ({ tripId }: MileageCalculatorProps) => {
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [formData, setFormData] = useState({
    startAddress: "",
    endAddress: "",
    vehicleType: "car",
    countryCode: "DE",
    kilometers: 0,
    ratePerKm: 0.30,
    totalAmount: 0,
    purpose: "",
    passengers: 1
  });

  // Kilometerpauschalen je Land und Fahrzeugtyp
  const mileageRates = {
    DE: { car: 0.30, motorcycle: 0.20, bicycle: 0.05 },
    AT: { car: 0.42, motorcycle: 0.24, bicycle: 0.05 },
    CH: { car: 0.70, motorcycle: 0.35, bicycle: 0.10 }
  } as const;

  useEffect(() => {
    const rate = mileageRates[formData.countryCode as keyof typeof mileageRates][formData.vehicleType as keyof typeof mileageRates.DE];
    const total = formData.kilometers * rate;
    
    setFormData(prev => ({
      ...prev,
      ratePerKm: rate,
      totalAmount: total
    }));
  }, [formData.countryCode, formData.vehicleType, formData.kilometers]);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolokalisierung wird von diesem Browser nicht unterstützt");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      setCurrentLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });

      // Reverse Geocoding - in einer echten App würde hier eine API genutzt
      // Vorerst wird der Standort nur erfasst, Adresse muss manuell eingegeben werden
      toast.info("GPS-Standort erfasst. Bitte Startadresse manuell eingeben.");

      setGpsEnabled(true);
      toast.success("Standort erfolgreich ermittelt!");
    } catch (error) {
      toast.error("Standort konnte nicht ermittelt werden");
      console.error("GPS Error:", error);
    }
  };

  const calculateRoute = async () => {
    if (!formData.startAddress || !formData.endAddress) {
      toast.error("Bitte Start- und Zieladresse eingeben");
      return;
    }

    // Routenberechnung - erfordert eine Routing-API Integration
    // Vorerst muss die Entfernung manuell eingegeben werden
    toast.info("Routenberechnung noch nicht verfügbar. Bitte Kilometer manuell eingeben.");
  };

  const saveExpense = async () => {
    if (formData.kilometers === 0) {
      toast.error("Bitte Kilometer eingeben oder Route berechnen");
      return;
    }

    // Mock API call to save expense
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Kilometerpauschale als Ausgabe gespeichert!");
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        startAddress: "",
        endAddress: "",
        kilometers: 0,
        totalAmount: 0,
        purpose: ""
      }));
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Kilometerpauschale berechnen
          </CardTitle>
          <CardDescription>
            Automatische Berechnung der Kilometerpauschale nach geltenden Sätzen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* GPS und Standort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="font-medium">GPS-Tracking</span>
                </div>
                <Switch
                  checked={gpsEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      requestLocation();
                    } else {
                      setGpsEnabled(false);
                      setCurrentLocation(null);
                    }
                  }}
                />
              </div>
              {gpsEnabled && currentLocation && (
                <div className="text-sm text-green-600">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Standort aktiv
                </div>
              )}
              {!gpsEnabled && (
                <p className="text-sm text-gray-500">
                  Aktivieren für automatische Standortermittlung
                </p>
              )}
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  <span className="font-medium">Einstellungen</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Land</Label>
                    <Select 
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DE">Deutschland</SelectItem>
                        <SelectItem value="AT">Österreich</SelectItem>
                        <SelectItem value="CH">Schweiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Fahrzeug</Label>
                    <Select 
                      value={formData.vehicleType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">PKW</SelectItem>
                        <SelectItem value="motorcycle">Motorrad</SelectItem>
                        <SelectItem value="bicycle">Fahrrad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Adresseingabe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAddress">Startadresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="startAddress"
                  className="pl-10"
                  placeholder="z.B. Hauptbahnhof Hamburg"
                  value={formData.startAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, startAddress: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endAddress">Zieladresse</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="endAddress"
                  className="pl-10"
                  placeholder="z.B. München Hauptbahnhof"
                  value={formData.endAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, endAddress: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Route berechnen */}
          <div className="flex justify-center">
            <Button 
              onClick={calculateRoute}
              variant="outline"
              disabled={!formData.startAddress || !formData.endAddress}
            >
              <Route className="mr-2 h-4 w-4" />
              Route berechnen
            </Button>
          </div>

          {/* Manuelle Eingabe oder Ergebnis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kilometers">Kilometer</Label>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="kilometers"
                  type="number"
                  min="0"
                  step="0.1"
                  className="pl-10"
                  value={formData.kilometers || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, kilometers: parseFloat(e.target.value) || 0 }))}
                  placeholder="Entfernung in km"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Pauschale pro km</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-gray-50">
                <span className="text-sm">
                  {formData.ratePerKm.toFixed(2)} €
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Gesamtbetrag</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-blue-50 text-blue-900 font-medium">
                <span>
                  {formData.totalAmount.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Zusätzliche Angaben */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Zweck der Fahrt</Label>
              <Input
                id="purpose"
                placeholder="z.B. Kundenbesuch, Tagung, Schulung"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passengers">Mitfahrer</Label>
                <Select 
                  value={formData.passengers.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, passengers: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nur Fahrer</SelectItem>
                    <SelectItem value="2">1 Mitfahrer</SelectItem>
                    <SelectItem value="3">2 Mitfahrer</SelectItem>
                    <SelectItem value="4">3 Mitfahrer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={saveExpense}
                  disabled={formData.totalAmount === 0}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Als Ausgabe speichern
                </Button>
              </div>
            </div>
          </div>

          {/* Hinweise */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Hinweise zur Kilometerpauschale</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Bei Nutzung des privaten PKW: {mileageRates[formData.countryCode as keyof typeof mileageRates].car.toFixed(2)} € pro km</li>
              <li>• Fahrtkosten umfassen Sprit, Abnutzung und anteilige Fixkosten</li>
              <li>• Belege für Parkgebühren und Maut separat einreichen</li>
              <li>• Bei Mitfahrern können höhere Sätze gelten</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Aktuelle Fahrten */}
      <Card>
        <CardHeader>
          <CardTitle>Erfasste Fahrten</CardTitle>
          <CardDescription>Übersicht Ihrer eingetragenen Kilometerpauschalen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Keine Fahrten erfasst. Berechnen Sie eine Kilometerpauschale und speichern Sie diese als Ausgabe.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MileageCalculator;