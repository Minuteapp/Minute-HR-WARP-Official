
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useIntelligentFeatures, BudgetAlert } from '@/hooks/business-travel/useIntelligentFeatures';

interface BudgetMonitorProps {
  tripId?: string;
}

const BudgetMonitor: React.FC<BudgetMonitorProps> = ({ tripId }) => {
  const { budgetAlerts, linkTripToBudget } = useIntelligentFeatures(tripId);

  const getAlertColor = (alert: BudgetAlert) => {
    switch (alert.alertType) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'exceeded': return 'text-red-500 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAlertIcon = (alert: BudgetAlert) => {
    switch (alert.alertType) {
      case 'critical':
      case 'exceeded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget-Überwachung
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Budget-Warnungen</p>
              <p className="text-sm">Alle Budgets sind im grünen Bereich</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetAlerts.map((alert) => (
                <Card key={alert.id} className={`border ${getAlertColor(alert)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getAlertIcon(alert)}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{alert.message}</h4>
                            <Badge 
                              variant="outline" 
                              className={getAlertColor(alert)}
                            >
                              {alert.percentage}%
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={alert.percentage} 
                            className="h-2 mb-2"
                          />
                          
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{alert.currentAmount.toLocaleString('de-DE')}€ verbraucht</span>
                            <span>{alert.budgetAmount.toLocaleString('de-DE')}€ Budget</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Budget anpassen
                          </Button>
                          <Button size="sm" variant="outline">
                            Details anzeigen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget-Verknüpfung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reise mit Projektbudget verknüpfen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Verknüpfen Sie diese Reise mit einem Projektbudget für automatische Überwachung.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => linkTripToBudget(tripId || '', 'marketing-budget', 'project-1')}
              >
                Marketing Budget
              </Button>
              <Button 
                variant="outline"
                onClick={() => linkTripToBudget(tripId || '', 'sales-budget', 'project-2')}
              >
                Sales Budget
              </Button>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tipp:</strong> Bei Verknüpfung werden automatisch Benachrichtigungen 
                bei Budgetüberschreitungen gesendet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetMonitor;
