import React from 'react';
import { Card } from '@/components/ui/card';
import type { Objective } from '@/types/objectives';

interface ObjectivesHeatmapProps {
  objectives: Objective[];
}

export const ObjectivesHeatmap = ({ objectives }: ObjectivesHeatmapProps) => {
  const getHeatmapColor = (progress: number, riskScore: number) => {
    if (progress > 80 && riskScore < 30) return 'bg-success/80';
    if (progress > 60 && riskScore < 50) return 'bg-warning/60';
    if (progress < 40 || riskScore > 70) return 'bg-destructive/60';
    return 'bg-muted';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Heatmap</h3>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {objectives.map((objective) => (
          <div
            key={objective.id}
            className={`aspect-square rounded p-2 text-xs ${getHeatmapColor(objective.progress, objective.risk_score)}`}
            title={`${objective.title} - ${objective.progress}% Fortschritt, ${objective.risk_score}% Risiko`}
          >
            <div className="font-medium truncate">{objective.title}</div>
            <div className="text-xs opacity-75">{objective.progress}%</div>
          </div>
        ))}
      </div>
    </Card>
  );
};