import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface ESGGoal {
  id: string;
  name: string;
  status: 'on_track' | 'at_risk' | 'delayed';
  target: string;
  current: string;
  deadline: string;
  progressPercent: number;
}

interface ESGGoalCardProps {
  goal: ESGGoal;
}

export const ESGGoalCard: React.FC<ESGGoalCardProps> = ({ goal }) => {
  const getStatusBadge = (status: ESGGoal['status']) => {
    switch (status) {
      case 'on_track':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">On Track</Badge>;
      case 'at_risk':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Gefährdet</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Verzögert</Badge>;
    }
  };

  const getProgressColor = (status: ESGGoal['status']) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-500';
      case 'at_risk':
        return 'bg-orange-500';
      case 'delayed':
        return 'bg-red-500';
    }
  };

  const getCircleColor = (status: ESGGoal['status']) => {
    switch (status) {
      case 'on_track':
        return 'border-green-500 text-green-600';
      case 'at_risk':
        return 'border-orange-500 text-orange-600';
      case 'delayed':
        return 'border-red-500 text-red-600';
    }
  };

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{goal.name}</h3>
                {getStatusBadge(goal.status)}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                <div>
                  <span className="font-medium">Ziel:</span> {goal.target}
                </div>
                <div>
                  <span className="font-medium">Aktuell:</span> {goal.current}
                </div>
                <div>
                  <span className="font-medium">Deadline:</span> {goal.deadline}
                </div>
              </div>

              <Progress value={goal.progressPercent} className={`h-2 ${getProgressColor(goal.status)}`} />
            </div>
          </div>

          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold ${getCircleColor(goal.status)}`}>
            {goal.progressPercent}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
