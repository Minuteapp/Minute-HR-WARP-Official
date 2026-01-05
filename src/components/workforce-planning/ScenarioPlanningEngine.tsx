
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, PlusCircle, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

interface WorkforceScenario {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  status: 'draft' | 'running' | 'completed';
  departments: string[];
  parameters: {
    growthRate: number;
    turnoverRate: number;
    budgetConstraint: number;
    skillRequirements: string[];
  };
  results?: {
    headcountProjection: number;
    budgetImpact: number;
    riskScore: number;
    recommendations: string[];
  };
  createdAt: string;
}

export const ScenarioPlanningEngine = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Korrektur: useQuery für Abfragen verwenden, nicht für Mutationen
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['workforce-scenarios'],
    queryFn: async (): Promise<WorkforceScenario[]> => {
      // Mock data - würde normalerweise aus API kommen
      return [
        {
          id: '1',
          name: 'Wachstumsszenario 2024',
          description: 'Personalplanung für erwartetes Unternehmenswachstum um 25%',
          timeframe: '12 Monate',
          status: 'completed',
          departments: ['IT', 'Sales', 'Marketing'],
          parameters: {
            growthRate: 25,
            turnoverRate: 12,
            budgetConstraint: 500000,
            skillRequirements: ['React', 'Python', 'Sales']
          },
          results: {
            headcountProjection: 85,
            budgetImpact: 450000,
            riskScore: 3,
            recommendations: [
              'Verstärkung des IT-Teams um 8 Entwickler',
              'Aufbau eines dedizierten Marketing-Teams',
              'Implementierung von Retention-Programmen'
            ]
          },
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Kostensenkungsszenario',
          description: 'Analyse der Personalkosten bei 15% Budgetreduktion',
          timeframe: '6 Monate',
          status: 'running',
          departments: ['Alle'],
          parameters: {
            growthRate: -5,
            turnoverRate: 18,
            budgetConstraint: 300000,
            skillRequirements: ['Cross-Training', 'Automation']
          },
          results: {
            headcountProjection: 62,
            budgetImpact: -150000,
            riskScore: 7,
            recommendations: [
              'Fokus auf Automatisierung wiederkehrender Aufgaben',
              'Cross-Training Programme zur Flexibilität',
              'Überprüfung der Outsourcing-Möglichkeiten'
            ]
          },
          createdAt: '2024-02-01'
        }
      ];
    }
  });

  const createScenario = async (scenarioData: Partial<WorkforceScenario>) => {
    // Mock implementation - würde normalerweise API call machen
    console.log('Creating scenario:', scenarioData);
    // Hier würde die tatsächliche API-Anfrage erfolgen
  };

  const runSimulation = async (scenarioId: string) => {
    // Mock implementation für Simulation
    console.log('Running simulation for scenario:', scenarioId);
    // Hier würde die tatsächliche Simulation gestartet
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Entwurf';
      case 'running':
        return 'Läuft';
      case 'completed':
        return 'Abgeschlossen';
      default:
        return status;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Szenario-Planungs-Engine</h2>
          <p className="text-sm text-gray-500">
            Erstellen und simulieren Sie verschiedene Personalplanungsszenarien
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Neues Szenario
        </Button>
      </div>

      {/* Übersicht Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Szenarien</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scenarios?.filter(s => s.status === 'running').length || 0}
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
                <p className="text-2xl font-bold text-green-600">
                  {scenarios?.filter(s => s.status === 'completed').length || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ø Personalprojektion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scenarios?.length ? Math.round(
                    scenarios
                      .filter(s => s.results)
                      .reduce((acc, s) => acc + (s.results?.headcountProjection || 0), 0) / 
                    scenarios.filter(s => s.results).length
                  ) : 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ø Budget Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scenarios?.length ? Math.round(
                    scenarios
                      .filter(s => s.results)
                      .reduce((acc, s) => acc + (s.results?.budgetImpact || 0), 0) / 
                    scenarios.filter(s => s.results).length / 1000
                  ) : 0}k€
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Szenarien</TabsTrigger>
          <TabsTrigger value="create">Erstellen</TabsTrigger>
          <TabsTrigger value="compare">Vergleichen</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Szenario Liste */}
            <div className="space-y-4">
              {scenarios?.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedScenario === scenario.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{scenario.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {scenario.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(scenario.status)}>
                        {getStatusLabel(scenario.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{scenario.timeframe}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{scenario.departments.join(', ')}</span>
                        </div>
                      </div>
                      {scenario.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            runSimulation(scenario.id);
                          }}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Starten
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Szenario Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Szenario Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedScenario ? (
                    <div className="space-y-6">
                      {(() => {
                        const scenario = scenarios?.find(s => s.id === selectedScenario);
                        if (!scenario) return null;

                        return (
                          <>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">{scenario.name}</h3>
                              <p className="text-sm text-gray-600">{scenario.description}</p>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-800">Parameter</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Wachstumsrate:</span>
                                  <span className="ml-2 font-medium">{scenario.parameters.growthRate}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Fluktuationsrate:</span>
                                  <span className="ml-2 font-medium">{scenario.parameters.turnoverRate}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Budget:</span>
                                  <span className="ml-2 font-medium">{scenario.parameters.budgetConstraint.toLocaleString()}€</span>
                                </div>
                              </div>
                            </div>

                            {scenario.results && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-800">Ergebnisse</h4>
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">Personalprojektion:</span>
                                    <span className="font-semibold text-lg">{scenario.results.headcountProjection}</span>
                                  </div>
                                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">Budget Impact:</span>
                                    <span className={`font-semibold text-lg ${
                                      scenario.results.budgetImpact >= 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {scenario.results.budgetImpact >= 0 ? '+' : ''}{scenario.results.budgetImpact.toLocaleString()}€
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">Risiko-Score:</span>
                                    <span className={`font-semibold text-lg ${getRiskColor(scenario.results.riskScore)}`}>
                                      {scenario.results.riskScore}/10
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h5 className="font-medium text-gray-800">Empfehlungen:</h5>
                                  <ul className="space-y-1">
                                    {scenario.results.recommendations.map((rec, index) => (
                                      <li key={index} className="text-sm text-gray-600 pl-4 relative">
                                        <span className="absolute left-0">•</span>
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Wählen Sie ein Szenario aus, um Details anzuzeigen
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Neues Szenario erstellen</CardTitle>
              <CardDescription>
                Definieren Sie Parameter für ein neues Personalplanungsszenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scenario-name">Szenario Name</Label>
                    <Input id="scenario-name" placeholder="z.B. Expansion Q2 2024" />
                  </div>
                  <div>
                    <Label htmlFor="timeframe">Zeitraum</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Zeitraum wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 Monate</SelectItem>
                        <SelectItem value="6months">6 Monate</SelectItem>
                        <SelectItem value="12months">12 Monate</SelectItem>
                        <SelectItem value="24months">24 Monate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Beschreiben Sie das Szenario..."
                    className="min-h-20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="growth-rate">Wachstumsrate (%)</Label>
                    <Input id="growth-rate" type="number" placeholder="z.B. 15" />
                  </div>
                  <div>
                    <Label htmlFor="turnover-rate">Fluktuationsrate (%)</Label>
                    <Input id="turnover-rate" type="number" placeholder="z.B. 10" />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget (€)</Label>
                    <Input id="budget" type="number" placeholder="z.B. 500000" />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">
                    Abbrechen
                  </Button>
                  <Button onClick={() => createScenario({})}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Szenario erstellen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Szenarien vergleichen</CardTitle>
              <CardDescription>
                Vergleichen Sie verschiedene Szenarien nebeneinander
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Szenario-Vergleich wird entwickelt...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Hier können Sie zukünftig mehrere Szenarien miteinander vergleichen
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
