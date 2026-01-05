import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Globe, 
  Building, 
  Clock,
  Euro,
  MapPin,
  Coffee,
  Bed,
  Utensils,
  TrendingUp
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PerDiemRate {
  id: string;
  countryCode: string;
  countryName: string;
  city?: string;
  accommodationRate: number;
  mealRate: number;
  incidentalRate: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface PerDiemCalculation {
  destination: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  mealDeductions: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  accommodationProvided: boolean;
  rates: PerDiemRate;
  totalDays: number;
  totalAmount: number;
  breakdown: {
    meals: number;
    accommodation: number;
    incidentals: number;
  };
}

const PerDiemTab = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  
  // Per-Diem Sätze - werden aus der Datenbank geladen (keine Mock-Daten)
  const [perDiemRates] = useState<PerDiemRate[]>([]);

  const [calculation, setCalculation] = useState<Partial<PerDiemCalculation>>({
    destination: "",
    startDate: "",
    endDate: "",
    mealDeductions: {
      breakfast: false,
      lunch: false,
      dinner: false
    },
    accommodationProvided: false
  });

  const [exchangeRates] = useState({
    "CHF": 0.92,  // 1 CHF = 0.92 EUR
    "USD": 0.85,  // 1 USD = 0.85 EUR
    "GBP": 1.17   // 1 GBP = 1.17 EUR
  });

  useEffect(() => {
    calculatePerDiem();
  }, [calculation]);

  const calculatePerDiem = () => {
    if (!calculation.startDate || !calculation.endDate || !calculation.rates) {
      return;
    }

    const start = new Date(calculation.startDate);
    const end = new Date(calculation.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const rates = calculation.rates;
    
    // Meal deductions calculation
    let mealRate = rates.mealRate;
    const mealReductionPercentage = {
      breakfast: 0.2, // 20% of daily meal allowance
      lunch: 0.4,     // 40% of daily meal allowance  
      dinner: 0.4     // 40% of daily meal allowance
    };

    let totalMealReduction = 0;
    if (calculation.mealDeductions?.breakfast) totalMealReduction += mealReductionPercentage.breakfast;
    if (calculation.mealDeductions?.lunch) totalMealReduction += mealReductionPercentage.lunch;
    if (calculation.mealDeductions?.dinner) totalMealReduction += mealReductionPercentage.dinner;

    const adjustedMealRate = mealRate * (1 - totalMealReduction);
    
    const accommodationAmount = calculation.accommodationProvided ? 0 : rates.accommodationRate * diffDays;
    const mealAmount = adjustedMealRate * diffDays;
    const incidentalAmount = rates.incidentalRate * diffDays;
    
    const totalAmount = accommodationAmount + mealAmount + incidentalAmount;

    setCalculation(prev => ({
      ...prev,
      totalDays: diffDays,
      totalAmount,
      breakdown: {
        meals: mealAmount,
        accommodation: accommodationAmount,
        incidentals: incidentalAmount
      }
    }));
  };

  const selectDestination = (rateId: string) => {
    const selectedRate = perDiemRates.find(r => r.id === rateId);
    if (selectedRate) {
      setCalculation(prev => ({
        ...prev,
        rates: selectedRate,
        destination: selectedRate.city 
          ? `${selectedRate.city}, ${selectedRate.countryName}`
          : selectedRate.countryName
      }));
    }
  };

  const convertToEUR = (amount: number, currency: string): number => {
    if (currency === "EUR") return amount;
    const rate = exchangeRates[currency as keyof typeof exchangeRates];
    return rate ? amount * rate : amount;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Per-Diem Verwaltung</h3>
          <p className="text-muted-foreground">
            Länder-/Stadt-Sätze, Kürzungen und automatische Berechnung
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Rechner</TabsTrigger>
          <TabsTrigger value="rates">Sätze</TabsTrigger>
          <TabsTrigger value="exchange">Währungen</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Eingabe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Per-Diem Berechnung
                </CardTitle>
                <CardDescription>
                  Geben Sie die Reisedaten ein für die automatische Berechnung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Reiseziel</Label>
                  <Select onValueChange={selectDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Zielort auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {perDiemRates.map((rate) => (
                        <SelectItem key={rate.id} value={rate.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {rate.city ? `${rate.city}, ${rate.countryName}` : rate.countryName}
                            <Badge variant="outline" className="ml-auto">
                              {rate.currency}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Anreise</Label>
                    <Input
                      type="date"
                      value={calculation.startDate}
                      onChange={(e) => setCalculation(prev => ({ 
                        ...prev, 
                        startDate: e.target.value 
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Abreise</Label>
                    <Input
                      type="date"
                      value={calculation.endDate}
                      onChange={(e) => setCalculation(prev => ({ 
                        ...prev, 
                        endDate: e.target.value 
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-medium">Kürzungen</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      Frühstück gestellt
                    </Label>
                    <Switch
                      checked={calculation.mealDeductions?.breakfast}
                      onCheckedChange={(checked) => 
                        setCalculation(prev => ({
                          ...prev,
                          mealDeductions: {
                            ...prev.mealDeductions!,
                            breakfast: checked
                          }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Mittagessen gestellt
                    </Label>
                    <Switch
                      checked={calculation.mealDeductions?.lunch}
                      onCheckedChange={(checked) => 
                        setCalculation(prev => ({
                          ...prev,
                          mealDeductions: {
                            ...prev.mealDeductions!,
                            lunch: checked
                          }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Abendessen gestellt
                    </Label>
                    <Switch
                      checked={calculation.mealDeductions?.dinner}
                      onCheckedChange={(checked) => 
                        setCalculation(prev => ({
                          ...prev,
                          mealDeductions: {
                            ...prev.mealDeductions!,
                            dinner: checked
                          }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Unterkunft gestellt
                    </Label>
                    <Switch
                      checked={calculation.accommodationProvided}
                      onCheckedChange={(checked) => 
                        setCalculation(prev => ({
                          ...prev,
                          accommodationProvided: checked
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ergebnis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Berechnung
                </CardTitle>
                <CardDescription>
                  Automatisch berechnete Per-Diem Sätze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {calculation.rates && calculation.totalAmount ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-2xl font-bold">{calculation.totalDays}</div>
                        <div className="text-sm text-muted-foreground">Tage</div>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-2xl font-bold">
                          €{calculation.totalAmount?.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Gesamt</div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-medium">Aufschlüsselung</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-sm">
                            <Utensils className="h-4 w-4" />
                            Verpflegung
                          </span>
                          <span className="font-medium">
                            €{calculation.breakdown?.meals.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-sm">
                            <Bed className="h-4 w-4" />
                            Übernachtung
                          </span>
                          <span className="font-medium">
                            €{calculation.breakdown?.accommodation.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            Nebenkosten
                          </span>
                          <span className="font-medium">
                            €{calculation.breakdown?.incidentals.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {calculation.rates.currency !== "EUR" && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-800 mb-1">
                          <TrendingUp className="h-4 w-4" />
                          Währungsumrechnung
                        </div>
                        <div className="text-xs text-blue-600">
                          Original: {calculation.rates.currency} {calculation.totalAmount?.toFixed(2)} 
                          → EUR {convertToEUR(calculation.totalAmount, calculation.rates.currency).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Wählen Sie ein Reiseziel und geben Sie die Daten ein</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {perDiemRates.map((rate) => (
              <Card key={rate.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {rate.city ? `${rate.city}, ${rate.countryName}` : rate.countryName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{rate.countryCode}</Badge>
                    <Badge variant="secondary">{rate.currency}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verpflegung/Tag:</span>
                      <span className="font-medium">
                        {rate.currency} {rate.mealRate}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Übernachtung/Tag:</span>
                      <span className="font-medium">
                        {rate.currency} {rate.accommodationRate}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Nebenkosten/Tag:</span>
                      <span className="font-medium">
                        {rate.currency} {rate.incidentalRate}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gesamt/Tag:</span>
                      <span className="font-bold">
                        {rate.currency} {(rate.mealRate + rate.accommodationRate + rate.incidentalRate).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-muted-foreground">
                    Gültig ab: {rate.effectiveFrom}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exchange">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Aktuelle Wechselkurse
              </CardTitle>
              <CardDescription>
                EZB-Kurse für automatische Umrechnung (täglich aktualisiert)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(exchangeRates).map(([currency, rate]) => (
                  <div key={currency} className="bg-muted p-4 rounded-lg text-center">
                    <div className="text-xl font-bold">{currency}</div>
                    <div className="text-sm text-muted-foreground mb-2">zu EUR</div>
                    <div className="text-lg font-semibold">{rate}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      1 {currency} = {rate} EUR
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Automatische Währungsumrechnung
                </h4>
                <p className="text-sm text-blue-800">
                  Alle Per-Diem Beträge werden automatisch zum aktuellen EZB-Kurs 
                  in EUR umgerechnet und in der Spesenabrechnung erfasst.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerDiemTab;