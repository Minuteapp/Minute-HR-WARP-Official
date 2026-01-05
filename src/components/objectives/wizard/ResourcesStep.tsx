import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Link, TrendingUp } from 'lucide-react';
import type { CreateObjectiveInput, RiskAssessment } from '@/types/objectives';

interface ResourcesStepProps {
  data: Partial<CreateObjectiveInput>;
  riskAssessment?: RiskAssessment;
  onUpdate: (updates: Partial<CreateObjectiveInput>) => void;
}

export const ResourcesStep = ({ data, riskAssessment, onUpdate }: ResourcesStepProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      case 'critical': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Linked Projects */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Verknüpfte Projekte</h4>
        <Card className="p-4 border-dashed">
          <div className="text-center text-muted-foreground">
            <Link className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Keine Projekte verknüpft</p>
          </div>
        </Card>
      </div>

      {/* Linked Budgets */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Verknüpfte Budgets</h4>
        <Card className="p-4 border-dashed">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Keine Budgets verknüpft</p>
          </div>
        </Card>
      </div>

      {/* Risk Assessment */}
      {riskAssessment && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h4 className="text-sm font-medium">KI-Risikobewertung</h4>
            <Badge variant="outline" className={getRiskColor(riskAssessment.level)}>
              {riskAssessment.score}% Risiko
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Risikofaktoren:</p>
              {riskAssessment.factors.map((factor, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{factor.factor}</span>
                  <span className={factor.impact > 0.5 ? 'text-destructive' : 'text-muted-foreground'}>
                    {Math.round(factor.impact * 100)}%
                  </span>
                </div>
              ))}
            </div>
            
            {riskAssessment.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Empfehlungen:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {riskAssessment.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};