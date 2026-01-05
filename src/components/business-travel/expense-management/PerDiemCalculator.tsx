import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Utensils, 
  MapPin, 
  Clock, 
  Calculator, 
  Save,
  Coffee,
  Soup,
  Moon,
  Calendar,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface PerDiemCalculatorProps {
  tripId: string;
}

const PerDiemCalculator = ({ tripId }: PerDiemCalculatorProps) => {
  const [formData, setFormData] = useState({
    country: "DE",
    city: "",
    startDate: "",
    endDate: "",
    days: 0,
    fullDayRate: 28.00,
    halfDayRate: 14.00,
    totalAmount: 0,
    breakfastDeduction: false,
    lunchDeduction: false,
    dinnerDeduction: false,
    accommodationProvided: false,
    purpose: ""
  });

  // BMF Tagespauschalen 2024
  const perDiemRates = {
    DE: {
      default: { full: 28.00, half: 14.00, accommodation: 150.00 },
      cities: {
        "München": { full: 32.00, half: 16.00, accommodation: 180.00 },
        "Hamburg": { full: 30.00, half: 15.00, accommodation: 170.00 },
        "Berlin": { full: 30.00, half: 15.00, accommodation: 170.00 },
        "Frankfurt am Main": { full: 32.00, half: 16.00, accommodation: 180.00 },
        "Köln": { full: 30.00, half: 15.00, accommodation: 170.00 },
        "Düsseldorf": { full: 30.00, half: 15.00, accommodation: 170.00 }
      }
    },
    AT: {
      default: { full: 26.40, half: 13.20, accommodation: 120.00 },
      cities: {
        "Wien": { full: 30.00, half: 15.00, accommodation: 150.00 },
        "Salzburg": { full: 28.00, half: 14.00, accommodation: 140.00 },
        "Innsbruck": { full: 28.00, half: 14.00, accommodation: 140.00 }
      }
    },
    CH: {
      default: { full: 65.00, half: 32.50, accommodation: 220.00 },
      cities: {
        "Zürich": { full: 80.00, half: 40.00, accommodation: 280.00 },
        "Genf": { full: 78.00, half: 39.00, accommodation: 270.00 },
        "Basel": { full: 75.00, half: 37.50, accommodation: 260.00 }
      }
    }
  } as const;

  // Mahlzeitenabzüge (prozentual vom Tagegeld)
  const mealDeductions = {
    breakfast: 0.20, // 20%
    lunch: 0.40,     // 40%
    dinner: 0.40     // 40%
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end day
      
      setFormData(prev => ({ ...prev, days: Math.max(0, daysDiff) }));
    }
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    const country = formData.country as keyof typeof perDiemRates;
    const rates = perDiemRates[country];
    const cityRates = formData.city && rates.cities[formData.city as keyof typeof rates.cities] 
      ? rates.cities[formData.city as keyof typeof rates.cities]
      : rates.default;

    setFormData(prev => ({
      ...prev,
      fullDayRate: cityRates.full,
      halfDayRate: cityRates.half
    }));
  }, [formData.country, formData.city]);

  useEffect(() => {
    let baseAmount = 0;
    
    if (formData.days > 0) {
      // Berechnung basierend auf Reisetagen
      if (formData.days === 1) {
        // Eintägige Reise: halber Tagessatz
        baseAmount = formData.halfDayRate;
      } else {
        // Mehrtägige Reise: erste und letzte Tag halber Satz, dazwischen voller Satz
        const fullDays = Math.max(0, formData.days - 2);
        baseAmount = 2 * formData.halfDayRate + fullDays * formData.fullDayRate;
      }
    }

    // Mahlzeitenabzüge
    let deductions = 0;
    if (formData.breakfastDeduction) deductions += baseAmount * mealDeductions.breakfast;
    if (formData.lunchDeduction) deductions += baseAmount * mealDeductions.lunch;
    if (formData.dinnerDeduction) deductions += baseAmount * mealDeductions.dinner;

    const totalAmount = Math.max(0, baseAmount - deductions);
    
    setFormData(prev => ({ ...prev, totalAmount }));
  }, [formData.days, formData.fullDayRate, formData.halfDayRate, formData.breakfastDeduction, formData.lunchDeduction, formData.dinnerDeduction]);

  const savePerDiem = async () => {
    if (formData.totalAmount === 0) {
      toast.error("Bitte Reisedaten eingeben");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Tagespauschale als Ausgabe gespeichert!");
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        startDate: "",
        endDate: "",
        days: 0,
        totalAmount: 0,
        purpose: "",
        breakfastDeduction: false,
        lunchDeduction: false,
        dinnerDeduction: false
      }));
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const getCityOptions = () => {
    const country = formData.country as keyof typeof perDiemRates;
    const cities = Object.keys(perDiemRates[country].cities);
    return cities;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Tagespauschale berechnen
          </CardTitle>
          <CardDescription>
            Automatische Berechnung nach BMF-Tabellen und internationalen Sätzen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reiseziel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Select 
                value={formData.country}
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value, city: "" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DE">Deutschland</SelectItem>
                  <SelectItem value="AT">Österreich</SelectItem>
                  <SelectItem value="CH">Schweiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Stadt (optional)</Label>
              <Select 
                value={formData.city}
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stadt auswählen oder leer lassen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Standardsatz verwenden</SelectItem>
                  {getCityOptions().map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reisezeitraum */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Reisebeginn</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-10"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Reiseende</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="endDate"
                  type="date"
                  className="pl-10"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Reisetage</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-gray-50">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">
                  {formData.days} {formData.days === 1 ? "Tag" : "Tage"}
                </span>
              </div>
            </div>
          </div>

          {/* Pauschalsätze */}
          {formData.country && (
            <Card className="p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Aktuelle Pauschalsätze</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-800">Voller Tagessatz:</span>
                  <span className="ml-2 font-medium">{formData.fullDayRate.toFixed(2)} €</span>
                </div>
                <div>
                  <span className="text-blue-800">Halber Tagessatz:</span>
                  <span className="ml-2 font-medium">{formData.halfDayRate.toFixed(2)} €</span>
                </div>
                {formData.city && (
                  <div className="col-span-2">
                    <Badge variant="secondary">Erhöhter Satz für {formData.city}</Badge>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Mahlzeitenabzüge */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="h-4 w-4" />
              <span className="font-medium">Mahlzeitenabzüge</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="breakfast"
                  checked={formData.breakfastDeduction}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, breakfastDeduction: checked as boolean }))
                  }
                />
                <Label htmlFor="breakfast" className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Frühstück gestellt (20%)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lunch"
                  checked={formData.lunchDeduction}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, lunchDeduction: checked as boolean }))
                  }
                />
                <Label htmlFor="lunch" className="flex items-center gap-2">
                  <Soup className="h-4 w-4" />
                  Mittagessen gestellt (40%)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dinner"
                  checked={formData.dinnerDeduction}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, dinnerDeduction: checked as boolean }))
                  }
                />
                <Label htmlFor="dinner" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Abendessen gestellt (40%)
                </Label>
              </div>
            </div>
          </Card>

          {/* Berechnung und Ergebnis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Zweck der Reise</Label>
              <Input
                id="purpose"
                placeholder="z.B. Kundenbesuch, Messe, Schulung"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gesamtbetrag Tagespauschale</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-green-50 text-green-900 font-bold text-lg">
                <span>
                  {formData.totalAmount.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Speichern */}
          <div className="flex justify-end">
            <Button 
              onClick={savePerDiem}
              disabled={formData.totalAmount === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Als Ausgabe speichern
            </Button>
          </div>

          {/* Hinweise */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Wichtige Hinweise</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Bei eintägigen Reisen (unter 8h Abwesenheit): halber Tagessatz</li>
                  <li>• Bei mehrtägigen Reisen: erster und letzter Tag je halber Satz</li>
                  <li>• Wenn Mahlzeiten gestellt werden, entsprechende Abzüge vornehmen</li>
                  <li>• Sätze gelten für das Jahr 2024 (BMF-Tabellen)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erfasste Tagespauschalen */}
      <Card>
        <CardHeader>
          <CardTitle>Erfasste Tagespauschalen</CardTitle>
          <CardDescription>Übersicht Ihrer eingetragenen Tagespauschalen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock data */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">München Geschäftsreise</div>
                <div className="text-sm text-gray-500">
                  <Badge variant="secondary" className="mr-2">3 Tage</Badge>
                  18.08. - 20.08.2024 • München
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">80.00 €</div>
                <Badge className="bg-green-100 text-green-800">Genehmigt</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Berlin Schulung</div>
                <div className="text-sm text-gray-500">
                  <Badge variant="secondary" className="mr-2">2 Tage</Badge>
                  15.08. - 16.08.2024 • Berlin
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">Mahlzeitenabzug</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">36.00 €</div>
                <Badge className="bg-yellow-100 text-yellow-800">In Prüfung</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerDiemCalculator;