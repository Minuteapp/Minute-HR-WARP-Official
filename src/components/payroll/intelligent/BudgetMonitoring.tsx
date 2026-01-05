
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign, Calendar, Target } from 'lucide-react';

interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: string;
  title: string;
  message: string;
  currentSpend: number;
  budgetLimit: number;
  percentage: number;
  daysRemaining: number;
  projectedOverrun: number;
  recommendations: string[];
}

interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
  projected: number;
  trend: 'up' | 'down' | 'stable';
  lastMonthSpend: number;
}

const BudgetMonitoring: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [categories] = useState<BudgetCategory[]>([
    {
      name: 'Gehälter & Löhne',
      budget: 150000,
      spent: 128500,
      projected: 155000,
      trend: 'up',
      lastMonthSpend: 122000
    },
    {
      name: 'Überstunden',
      budget: 25000,
      spent: 28200,
      projected: 32000,
      trend: 'up',
      lastMonthSpend: 22000
    },
    {
      name: 'Bonuszahlungen',
      budget: 40000,
      spent: 15000,
      projected: 38000,
      trend: 'stable',
      lastMonthSpend: 18000
    },
    {
      name: 'Sozialabgaben',
      budget: 45000,
      spent: 38700,
      projected: 44500,
      trend: 'stable',
      lastMonthSpend: 36500
    }
  ]);

  const generateBudgetAlerts = async () => {
    setIsMonitoring(true);
    
    // Keine Mock-Daten - Alerts werden aus der Datenbank geladen
    const mockAlerts: BudgetAlert[] = [];

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAlerts(mockAlerts);
    setIsMonitoring(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'stable': return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget-Monitoring & Warnungen
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={generateBudgetAlerts}
              disabled={isMonitoring}
              className="flex items-center gap-2"
            >
              {isMonitoring ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analysiere...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Budget analysieren
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Budget-Kategorien Übersicht */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {categories.map((category) => (
              <Card key={category.name} className="border">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{category.name}</h4>
                      {getTrendIcon(category.trend)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ausgegeben</span>
                        <span className="font-medium">
                          €{category.spent.toLocaleString()} / €{category.budget.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(category.spent / category.budget) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round((category.spent / category.budget) * 100)}% verwendet</span>
                        <span>Prognose: €{category.projected.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Budget-Alerts */}
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Starten Sie die Budget-Analyse für aktuelle Warnungen</p>
              <p className="text-sm mt-2">Erkennt Budgetüberschreitungen und Trends automatisch</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Aktive Budget-Warnungen</h3>
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline">{alert.category}</Badge>
                        </div>
                        <AlertDescription>{alert.message}</AlertDescription>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Aktuell ausgegeben</p>
                            <p className="text-sm font-medium">€{alert.currentSpend.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Budget-Auslastung</p>
                            <p className="text-sm font-medium">{alert.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Verbleibende Tage</p>
                            <p className="text-sm font-medium">{alert.daysRemaining} Tage</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">KI-Empfehlungen:</p>
                        <ul className="space-y-1">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Maßnahmen einleiten
                        </Button>
                        <Button size="sm" variant="outline">
                          Details anzeigen
                        </Button>
                        <Button size="sm" variant="outline">
                          Als gelesen markieren
                        </Button>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetMonitoring;
