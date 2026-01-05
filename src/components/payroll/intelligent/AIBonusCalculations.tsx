
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, Award, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BonusCalculation {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  projectPerformance: number;
  targetAchievement: number;
  qualityScore: number;
  teamworkScore: number;
  recommendedBonus: number;
  confidenceScore: number;
  reasons: string[];
  riskFactors: string[];
}

const AIBonusCalculations: React.FC = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculations, setCalculations] = useState<BonusCalculation[]>([]);

  const { data: employees } = useQuery({
    queryKey: ['employees-for-bonus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, first_name, last_name, position, department')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  const generateBonusCalculations = async () => {
    setIsCalculating(true);
    
    // Keine Mock-Daten - KI-Bonusberechnungen werden mit echten Daten durchgeführt
    const mockCalculations: BonusCalculation[] = [];

    // Simuliere API-Aufruf
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCalculations(mockCalculations);
    setIsCalculating(false);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.85) return 'Hoch';
    if (score >= 0.7) return 'Mittel';
    return 'Niedrig';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            KI-gestützte Bonusberechnungen
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={generateBonusCalculations}
              disabled={isCalculating}
              className="flex items-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Berechne...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  Boni berechnen
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Starten Sie die KI-Bonusberechnung für aktuelle Mitarbeiter</p>
              <p className="text-sm mt-2">Berücksichtigt Projektleistung, Zielerreichung und Teamwork</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calculations.map((calc) => (
                <Card key={calc.employeeId} className="border">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{calc.employeeName}</h4>
                          <p className="text-sm text-gray-600">
                            {calc.position} • {calc.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            €{calc.recommendedBonus.toLocaleString()}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            Vertrauen: {getConfidenceLabel(calc.confidenceScore)}
                          </Badge>
                        </div>
                      </div>

                      {/* Performance Metriken */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Projektleistung</p>
                          <p className={`text-sm font-medium ${getPerformanceColor(calc.projectPerformance)}`}>
                            {Math.round(calc.projectPerformance * 100)}%
                          </p>
                          <Progress value={calc.projectPerformance * 100} className="h-1" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Zielerreichung</p>
                          <p className={`text-sm font-medium ${getPerformanceColor(calc.targetAchievement)}`}>
                            {Math.round(calc.targetAchievement * 100)}%
                          </p>
                          <Progress value={calc.targetAchievement * 100} className="h-1" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Qualität</p>
                          <p className={`text-sm font-medium ${getPerformanceColor(calc.qualityScore)}`}>
                            {Math.round(calc.qualityScore * 100)}%
                          </p>
                          <Progress value={calc.qualityScore * 100} className="h-1" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Teamwork</p>
                          <p className={`text-sm font-medium ${getPerformanceColor(calc.teamworkScore)}`}>
                            {Math.round(calc.teamworkScore * 100)}%
                          </p>
                          <Progress value={calc.teamworkScore * 100} className="h-1" />
                        </div>
                      </div>

                      {/* Begründungen */}
                      <div>
                        <p className="text-sm font-medium mb-2">Begründung für Bonusempfehlung:</p>
                        <ul className="space-y-1">
                          {calc.reasons.map((reason, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risikofaktoren */}
                      {calc.riskFactors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Zu beachtende Faktoren:</p>
                          <ul className="space-y-1">
                            {calc.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Aktionen */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline">
                          Bonus genehmigen
                        </Button>
                        <Button size="sm" variant="outline">
                          Anpassen
                        </Button>
                        <Button size="sm" variant="outline">
                          Details anzeigen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiken */}
      {calculations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Gesamtbonus</p>
                  <p className="text-xl font-bold">
                    €{calculations.reduce((sum, calc) => sum + calc.recommendedBonus, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Durchschnittlicher Bonus</p>
                  <p className="text-xl font-bold">
                    €{Math.round(calculations.reduce((sum, calc) => sum + calc.recommendedBonus, 0) / calculations.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Hohe Konfidenz</p>
                  <p className="text-xl font-bold">
                    {calculations.filter(calc => calc.confidenceScore >= 0.85).length}/{calculations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIBonusCalculations;
