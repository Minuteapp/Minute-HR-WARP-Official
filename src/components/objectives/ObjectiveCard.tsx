import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import type { Objective } from '@/types/objectives';

interface ObjectiveCardProps {
  objective: Objective;
}

export const ObjectiveCard = ({ objective }: ObjectiveCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'default';
      case 'on_hold': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-success';
    if (riskScore < 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <Badge variant="outline">{objective.objective_type.toUpperCase()}</Badge>
          </div>
          <Badge variant={getStatusColor(objective.status)}>
            {objective.status}
          </Badge>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="font-semibold mb-1">{objective.title}</h3>
          {objective.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {objective.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fortschritt</span>
            <span className="font-medium">{objective.progress}%</span>
          </div>
          <Progress value={objective.progress} />
        </div>

        {/* Risk & Key Results */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className={`font-medium ${getRiskColor(objective.risk_score)}`}>
              {objective.risk_score}% Risiko
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{objective.key_results?.length || 0} Key Results</span>
          </div>
        </div>

        {/* Period */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(objective.period_start).toLocaleDateString()} - 
            {new Date(objective.period_end).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Details
          </Button>
          <Button variant="outline" size="sm">
            Bearbeiten
          </Button>
        </div>
      </div>
    </Card>
  );
};