import { GoalCardData } from '@/types/goals-statistics';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';

interface GoalDetailPanelProps {
  goal: GoalCardData | null;
}

export const GoalDetailPanel = ({ goal }: GoalDetailPanelProps) => {
  if (!goal) {
    return (
      <div className="bg-card rounded-xl p-8 shadow-sm border h-full flex items-center justify-center">
        <p className="text-muted-foreground text-center">
          Wählen Sie ein Ziel aus, um Details anzuzeigen
        </p>
      </div>
    );
  }

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-700',
    'medium': 'bg-blue-100 text-blue-700',
    'high': 'bg-purple-100 text-purple-700',
  };

  const priorityLabels = {
    'low': 'Niedrig',
    'medium': 'Mittel',
    'high': 'Hoch',
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border h-full overflow-y-auto">
      <h3 className="text-xl font-bold text-foreground mb-2">
        Zieldetails: {goal.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-6">
        {goal.description}
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Zeitraum:</span>
          <span className="font-medium text-foreground">
            {new Date(goal.dueDate).toLocaleDateString('de-DE')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Priorität:</span>
          <Badge className={priorityColors[goal.priority]}>
            {priorityLabels[goal.priority]}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Verantwortlich:</span>
          <span className="font-medium text-foreground">{goal.owner}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{goal.department}</span>
        </div>
      </div>

      {goal.keyResults.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-4">Key Results:</h4>
          <div className="space-y-4">
            {goal.keyResults.map((kr) => (
              <div key={kr.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {kr.title}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {kr.currentValue}/{kr.targetValue} {kr.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={kr.progress} className="h-2 flex-1" />
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {kr.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {goal.tags.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-foreground mb-2">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {goal.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
