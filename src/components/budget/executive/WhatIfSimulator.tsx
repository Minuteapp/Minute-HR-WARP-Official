import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Save, 
  Star, 
  StarOff, 
  Play,
  RotateCcw,
  Copy
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { budgetExecutiveService } from '@/services/budgetExecutiveService';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { BudgetWhatIfScenario } from '@/types/budgetExecutive';

interface WhatIfSimulatorProps {
  scenarios: BudgetWhatIfScenario[];
  onScenarioUpdate: (scenario: BudgetWhatIfScenario) => void;
}

export const WhatIfSimulator = ({ scenarios, onScenarioUpdate }: WhatIfSimulatorProps) => {
  const [currentScenario, setCurrentScenario] = useState<BudgetWhatIfScenario | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, any>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const { toast } = useToast();

  // Lade echte Budget-Basisdaten aus der Datenbank
  const { data: baseValues } = useQuery({
    queryKey: ['budget-base-values'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return getDefaultBaseValues();

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return getDefaultBaseValues();

      // Hole aktive Budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('total_amount, spent_amount, category')
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      if (!budgets || budgets.length === 0) return getDefaultBaseValues();

      // Aggregiere nach Kategorien
      const revenue = budgets
        .filter(b => b.category === 'revenue' || b.category === 'Umsatz')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      const personnelCosts = budgets
        .filter(b => b.category === 'personnel' || b.category === 'Personalkosten')
        .reduce((sum, b) => sum + (b.spent_amount || b.total_amount || 0), 0);

      const operatingCosts = budgets
        .filter(b => b.category === 'operating' || b.category === 'Betriebskosten')
        .reduce((sum, b) => sum + (b.spent_amount || b.total_amount || 0), 0);

      const materialCosts = budgets
        .filter(b => b.category === 'material' || b.category === 'Materialkosten')
        .reduce((sum, b) => sum + (b.spent_amount || b.total_amount || 0), 0);

      const otherCosts = budgets
        .filter(b => !['revenue', 'Umsatz', 'personnel', 'Personalkosten', 'operating', 'Betriebskosten', 'material', 'Materialkosten'].includes(b.category || ''))
        .reduce((sum, b) => sum + (b.spent_amount || b.total_amount || 0), 0);

      // Falls keine Daten vorhanden, verwende Gesamtsummen
      const totalBudget = budgets.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const totalSpent = budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);

      return {
        revenue: revenue || totalBudget || 0,
        personnel_costs: personnelCosts || Math.round(totalSpent * 0.4) || 0,
        operating_costs: operatingCosts || Math.round(totalSpent * 0.15) || 0,
        material_costs: materialCosts || Math.round(totalSpent * 0.3) || 0,
        other_costs: otherCosts || Math.round(totalSpent * 0.15) || 0
      };
    }
  });

  const getDefaultBaseValues = () => ({
    revenue: 0,
    personnel_costs: 0,
    operating_costs: 0,
    material_costs: 0,
    other_costs: 0
  });

  const categoryLabels = {
    revenue: 'Umsatz',
    personnel_costs: 'Personalkosten',
    operating_costs: 'Betriebskosten',
    material_costs: 'Materialkosten',
    other_costs: 'Sonstige Kosten'
  };

  const handleAdjustmentChange = (category: string, type: 'percentage' | 'fixed', value: number) => {
    setAdjustments(prev => ({
      ...prev,
      [category]: { type, value, category }
    }));
  };

  const runSimulation = async () => {
    if (!adjustments || Object.keys(adjustments).length === 0) {
      toast({
        title: "Keine Anpassungen",
        description: "Bitte nehmen Sie mindestens eine Anpassung vor.",
        variant: "destructive"
      });
      return;
    }

    setIsSimulating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newScenario = await budgetExecutiveService.createWhatIfScenario({
        scenario_name: scenarioName || `Szenario ${Date.now()}`,
        adjustments
      });
      
      setCurrentScenario(newScenario);
      
      toast({
        title: "Simulation abgeschlossen",
        description: "Die Auswirkungen wurden berechnet."
      });
    } catch (error) {
      toast({
        title: "Simulationsfehler",
        description: "Die Berechnung konnte nicht durchgeführt werden.",
        variant: "destructive"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const saveScenario = async () => {
    if (!currentScenario) return;
    
    try {
      await onScenarioUpdate(currentScenario);
      toast({
        title: "Szenario gespeichert",
        description: "Das Szenario wurde erfolgreich gespeichert."
      });
    } catch (error) {
      toast({
        title: "Speicherfehler",
        description: "Das Szenario konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const loadScenario = (scenario: BudgetWhatIfScenario) => {
    setCurrentScenario(scenario);
    setAdjustments(scenario.adjustments);
    setScenarioName(scenario.scenario_name);
  };

  const resetSimulation = () => {
    setAdjustments({});
    setCurrentScenario(null);
    setScenarioName('');
  };

  const duplicateScenario = async (scenario: BudgetWhatIfScenario) => {
    try {
      const newScenario = await budgetExecutiveService.createWhatIfScenario({
        scenario_name: `${scenario.scenario_name} (Kopie)`,
        adjustments: scenario.adjustments
      });
      
      loadScenario(newScenario);
      
      toast({
        title: "Szenario kopiert",
        description: "Das Szenario wurde erfolgreich dupliziert."
      });
    } catch (error) {
      toast({
        title: "Kopierfehler",
        description: "Das Szenario konnte nicht kopiert werden.",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async (scenario: BudgetWhatIfScenario) => {
    try {
      await budgetExecutiveService.toggleScenarioFavorite(scenario.id, !scenario.is_favorite);
      toast({
        title: scenario.is_favorite ? "Favorit entfernt" : "Favorit hinzugefügt",
        description: "Die Änderung wurde gespeichert."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Änderung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const currentBaseValues = baseValues || getDefaultBaseValues();
  const hasData = Object.values(currentBaseValues).some(v => v > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Was-wäre-wenn Simulator</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSimulation}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
        </div>
      </div>

      {!hasData && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <p className="font-medium">Keine Budget-Daten verfügbar</p>
          <p className="text-sm">Erstellen Sie zuerst Budgets, um die Simulation zu nutzen.</p>
        </div>
      )}

      <Tabs defaultValue="simulation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="scenarios">Gespeicherte Szenarien</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Eingabe-Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Szenario-Parameter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="scenario-name">Szenario-Name</Label>
                  <Input
                    id="scenario-name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="z.B. Personalkosten +10%"
                  />
                </div>

                {Object.entries(categoryLabels).map(([category, label]) => (
                  <div key={category} className="space-y-3">
                    <Label>{label}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={adjustments[category]?.type || ''}
                        onValueChange={(value) => 
                          handleAdjustmentChange(category, value as 'percentage' | 'fixed', adjustments[category]?.value || 0)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Typ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Prozent</SelectItem>
                          <SelectItem value="fixed">Fest</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="number"
                        placeholder="Wert"
                        value={adjustments[category]?.value || ''}
                        onChange={(e) => 
                          handleAdjustmentChange(
                            category, 
                            adjustments[category]?.type || 'percentage', 
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    
                    {currentBaseValues[category as keyof typeof currentBaseValues] > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Basis: €{currentBaseValues[category as keyof typeof currentBaseValues].toLocaleString()}
                        {adjustments[category]?.type === 'percentage' && adjustments[category]?.value && (
                          <span> → Anpassung: {adjustments[category].value > 0 ? '+' : ''}{adjustments[category].value}%</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <Button 
                  onClick={runSimulation} 
                  disabled={isSimulating || Object.keys(adjustments).length === 0 || !hasData}
                  className="w-full"
                >
                  {isSimulating ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      Berechnung läuft...
                    </div>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Simulation starten
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Ergebnis-Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Simulationsergebnisse</CardTitle>
              </CardHeader>
              <CardContent>
                {currentScenario ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">
                          €{(currentScenario.calculated_results.revenue || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">Umsatz</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">
                          €{(currentScenario.calculated_results.ebit || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">EBIT</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900">
                          {(currentScenario.calculated_results.margin || 0).toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-600">Marge</div>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className={`text-2xl font-bold ${
                          (currentScenario.calculated_results.impact || 0) >= 0 ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {(currentScenario.calculated_results.impact || 0) >= 0 ? '+' : ''}
                          €{(currentScenario.calculated_results.impact || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-orange-600">Impact vs. Basis</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveScenario} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Szenario speichern
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Starten Sie eine Simulation, um die Ergebnisse zu sehen.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gespeicherte Szenarien</CardTitle>
            </CardHeader>
            <CardContent>
              {scenarios.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Keine gespeicherten Szenarien vorhanden.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{scenario.scenario_name}</h4>
                          {scenario.is_favorite && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          <Badge variant={scenario.scenario_status === 'active' ? 'default' : 'secondary'}>
                            {scenario.scenario_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          EBIT: €{(scenario.calculated_results.ebit || 0).toLocaleString()}
                          {scenario.calculated_results.impact && (
                            <span className={`ml-2 ${
                              scenario.calculated_results.impact >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ({scenario.calculated_results.impact >= 0 ? '+' : ''}
                              €{scenario.calculated_results.impact.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleFavorite(scenario)}>
                          {scenario.is_favorite ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => duplicateScenario(scenario)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => loadScenario(scenario)}>
                          Laden
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
