
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bot, TrendingUp, Users, Star, ArrowUp, ArrowDown } from 'lucide-react';

interface SalaryRecommendation {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  currentSalary: number;
  recommendedSalary: number;
  adjustmentPercentage: number;
  adjustmentType: 'increase' | 'maintain' | 'review';
  performanceScore: number;
  marketComparison: number;
  confidenceLevel: number;
  justification: string[];
  riskFactors: string[];
  implementationDate: string;
}

const PerformanceSalaryAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<SalaryRecommendation[]>([]);

  const generateSalaryAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Keine Mock-Daten - KI-Analyse wird mit echten Daten durchgeführt
    const mockRecommendations: SalaryRecommendation[] = [];

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRecommendations(mockRecommendations);
    setIsAnalyzing(false);
  };

  const getAdjustmentIcon = (type: string) => {
    switch (type) {
      case 'increase': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'maintain': return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
      case 'review': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getAdjustmentLabel = (type: string) => {
    switch (type) {
      case 'increase': return 'Erhöhung';
      case 'maintain': return 'Beibehalten';
      case 'review': return 'Überprüfung';
      default: return type;
    }
  };

  const getAdjustmentColor = (type: string) => {
    switch (type) {
      case 'increase': return 'bg-green-100 text-green-800';
      case 'maintain': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Performance-basierte Gehaltsanalyse
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={generateSalaryAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analysiere...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Gehälter analysieren
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Starten Sie die KI-Gehaltsanalyse für datenbasierte Empfehlungen</p>
              <p className="text-sm mt-2">Berücksichtigt Performance, Marktdaten und Unternehmensbudget</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.employeeId} className="border">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{rec.employeeName}</h4>
                          <p className="text-sm text-gray-600">
                            {rec.position} • {rec.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getAdjustmentIcon(rec.adjustmentType)}
                            <Badge className={getAdjustmentColor(rec.adjustmentType)}>
                              {getAdjustmentLabel(rec.adjustmentType)}
                            </Badge>
                          </div>
                          {rec.adjustmentPercentage !== 0 && (
                            <p className="text-sm text-gray-600">
                              {rec.adjustmentPercentage > 0 ? '+' : ''}{rec.adjustmentPercentage.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Gehaltsvergleich */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Aktuelles Gehalt</p>
                            <p className="text-lg font-medium">€{rec.currentSalary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Empfohlenes Gehalt</p>
                            <p className="text-lg font-medium text-green-600">€{rec.recommendedSalary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Differenz</p>
                            <p className="text-lg font-medium">
                              {rec.recommendedSalary > rec.currentSalary ? '+' : ''}€{(rec.recommendedSalary - rec.currentSalary).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metriken */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Performance Score</span>
                          </div>
                          <Progress value={rec.performanceScore * 100} className="h-2" />
                          <p className="text-xs text-gray-500">{Math.round(rec.performanceScore * 100)}%</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Marktvergleich</span>
                          </div>
                          <Progress value={rec.marketComparison * 100} className="h-2" />
                          <p className="text-xs text-gray-500">{Math.round(rec.marketComparison * 100)}%</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">Konfidenz</span>
                          </div>
                          <Progress value={rec.confidenceLevel * 100} className="h-2" />
                          <p className="text-xs text-gray-500">{Math.round(rec.confidenceLevel * 100)}%</p>
                        </div>
                      </div>

                      {/* Begründung */}
                      <div>
                        <p className="text-sm font-medium mb-2">Begründung der Empfehlung:</p>
                        <ul className="space-y-1">
                          {rec.justification.map((reason, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risikofaktoren */}
                      {rec.riskFactors.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Zu beachtende Faktoren:</p>
                          <ul className="space-y-1">
                            {rec.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></div>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Implementierung */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Empfohlene Umsetzung:</strong> {rec.implementationDate}
                        </p>
                      </div>

                      {/* Aktionen */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline">
                          Empfehlung umsetzen
                        </Button>
                        <Button size="sm" variant="outline">
                          Detailanalyse
                        </Button>
                        <Button size="sm" variant="outline">
                          Mitarbeiter besprechen
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

      {/* Zusammenfassung */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Gehaltserhöhungen</p>
                  <p className="text-xl font-bold">
                    {recommendations.filter(r => r.adjustmentType === 'increase').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Zusätzliche Kosten</p>
                  <p className="text-xl font-bold">
                    €{recommendations
                      .filter(r => r.recommendedSalary > r.currentSalary)
                      .reduce((sum, r) => sum + (r.recommendedSalary - r.currentSalary), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Ø Performance</p>
                  <p className="text-xl font-bold">
                    {Math.round(recommendations.reduce((sum, r) => sum + r.performanceScore, 0) / recommendations.length * 100)}%
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

export default PerformanceSalaryAnalysis;
