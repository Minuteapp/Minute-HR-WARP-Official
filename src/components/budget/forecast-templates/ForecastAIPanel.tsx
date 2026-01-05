
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Zap,
  Target,
  ShieldAlert,
  BarChart3
} from "lucide-react";
import {
  useForecastAIRecommendations,
  useGenerateAIRecommendations,
  useForecastRiskAssessments,
  useAssessForecastRisks,
  useForecastAISettings,
  useUpdateForecastAISettings
} from '@/hooks/useForecastAdvanced';
import { WithPermission } from '@/components/auth/WithPermission';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ForecastAIPanelProps {
  forecastInstanceId?: string;
}

export const ForecastAIPanel = ({ forecastInstanceId }: ForecastAIPanelProps) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  
  const { data: recommendations = [], isLoading: loadingRecommendations } = useForecastAIRecommendations(forecastInstanceId);
  const { data: risks = [], isLoading: loadingRisks } = useForecastRiskAssessments(forecastInstanceId);
  const { data: aiSettings } = useForecastAISettings();
  
  const generateRecommendations = useGenerateAIRecommendations();
  const assessRisks = useAssessForecastRisks();
  const updateAISettings = useUpdateForecastAISettings();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleGenerateRecommendations = () => {
    if (forecastInstanceId) {
      generateRecommendations.mutate(forecastInstanceId);
    }
  };

  const handleAssessRisks = () => {
    if (forecastInstanceId) {
      assessRisks.mutate(forecastInstanceId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            KI-Unterstützte Forecast-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="recommendations" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Empfehlungen
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" />
                Risiken
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Szenarien
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Einstellungen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">KI-Empfehlungen</h3>
                <WithPermission permission="forecast_ai_generate">
                  <Button 
                    onClick={handleGenerateRecommendations}
                    disabled={generateRecommendations.isPending || !forecastInstanceId}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {generateRecommendations.isPending ? 'Generiere...' : 'Empfehlungen generieren'}
                  </Button>
                </WithPermission>
              </div>

              {loadingRecommendations ? (
                <div className="text-center py-8">Lade KI-Empfehlungen...</div>
              ) : recommendations.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Keine KI-Empfehlungen verfügbar
                    </h3>
                    <p className="text-gray-500">
                      Generieren Sie KI-basierte Empfehlungen für diesen Forecast.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((recommendation) => (
                    <Card key={recommendation.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{recommendation.title}</h4>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{recommendation.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Vertrauen:</span>
                            <span className="ml-2 font-medium">{recommendation.confidence_score}%</span>
                          </div>
                          {recommendation.estimated_impact && (
                            <div>
                              <span className="text-gray-500">Geschätzter Impact:</span>
                              <span className="ml-2 font-medium text-green-600">
                                €{recommendation.estimated_impact.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {recommendation.ai_reasoning && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>KI-Begründung:</strong> {recommendation.ai_reasoning}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Target className="h-4 w-4 mr-1" />
                            Akzeptieren
                          </Button>
                          <Button size="sm" variant="outline">
                            Details anzeigen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Risikobewertung</h3>
                <WithPermission permission="forecast_risk_assess">
                  <Button 
                    onClick={handleAssessRisks}
                    disabled={assessRisks.isPending || !forecastInstanceId}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {assessRisks.isPending ? 'Analysiere...' : 'Risiken bewerten'}
                  </Button>
                </WithPermission>
              </div>

              {loadingRisks ? (
                <div className="text-center py-8">Lade Risikobewertung...</div>
              ) : risks.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <ShieldAlert className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Keine Risiken identifiziert
                    </h3>
                    <p className="text-gray-500">
                      Führen Sie eine Risikobewertung für diesen Forecast durch.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {risks.map((risk) => (
                    <Card key={risk.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{risk.risk_type.replace('_', ' ')}</h4>
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{risk.impact_description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Wahrscheinlichkeit:</span>
                            <span className="ml-2 font-medium">{risk.probability}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className="ml-2 font-medium">{risk.status}</span>
                          </div>
                        </div>

                        {risk.mitigation_strategy && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm">
                              <strong>Risikominderung:</strong> {risk.mitigation_strategy}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  KI-Szenarien-Generator
                </h3>
                <p className="text-gray-500 mb-4">
                  Automatische Generierung verschiedener Forecast-Szenarien basierend auf historischen Daten.
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <h3 className="text-lg font-semibold">KI-Einstellungen</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">KI-Empfehlungen aktivieren</Label>
                    <p className="text-sm text-gray-500">
                      Automatische Generierung von KI-basierten Empfehlungen
                    </p>
                  </div>
                  <Switch 
                    checked={aiSettings?.ai_recommendations_enabled ?? true}
                    onCheckedChange={(checked) => 
                      updateAISettings.mutate({ ai_recommendations_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Automatische Szenario-Generierung</Label>
                    <p className="text-sm text-gray-500">
                      Automatisches Erstellen von Best/Worst-Case Szenarien
                    </p>
                  </div>
                  <Switch 
                    checked={aiSettings?.auto_scenario_generation ?? false}
                    onCheckedChange={(checked) => 
                      updateAISettings.mutate({ auto_scenario_generation: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risiko-Analyse Sensitivität</Label>
                  <Select 
                    value={aiSettings?.risk_analysis_sensitivity ?? 'medium'}
                    onValueChange={(value) => 
                      updateAISettings.mutate({ risk_analysis_sensitivity: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bevorzugter Forecast-Horizont</Label>
                  <Select 
                    value={aiSettings?.preferred_forecast_horizon ?? '12_months'}
                    onValueChange={(value) => 
                      updateAISettings.mutate({ preferred_forecast_horizon: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3_months">3 Monate</SelectItem>
                      <SelectItem value="6_months">6 Monate</SelectItem>
                      <SelectItem value="12_months">12 Monate</SelectItem>
                      <SelectItem value="24_months">24 Monate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
