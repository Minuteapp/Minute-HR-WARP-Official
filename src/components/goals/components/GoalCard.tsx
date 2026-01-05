import { GoalCardData } from '@/types/goals-statistics';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, Edit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: GoalCardData;
  onEdit?: (goalId: string) => void;
  onCheckIn?: (goalId: string) => void;
}

export const GoalCard = ({ goal, onEdit, onCheckIn }: GoalCardProps) => {
  const statusColors = {
    'on-track': 'bg-green-100 text-green-700',
    'at-risk': 'bg-yellow-100 text-yellow-700',
    'behind': 'bg-red-100 text-red-700',
    'completed': 'bg-blue-100 text-blue-700',
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-700',
    'medium': 'bg-blue-100 text-blue-700',
    'high': 'bg-purple-100 text-purple-700',
  };

  const statusLabels = {
    'on-track': 'On Track',
    'at-risk': 'At Risk',
    'behind': 'Behind',
    'completed': 'Abgeschlossen',
  };

  const priorityLabels = {
    'low': 'Niedrig',
    'medium': 'Mittel',
    'high': 'Hoch',
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground text-lg flex-1 pr-2">{goal.title}</h3>
        <div className="flex gap-1">
          <Badge className={statusColors[goal.status]}>
            {statusLabels[goal.status]}
          </Badge>
          <Badge className={priorityColors[goal.priority]}>
            {priorityLabels[goal.priority]}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {goal.description}
      </p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Fortschritt</span>
          <span className="text-xs font-semibold text-foreground">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{goal.owner}</span>
          <span className="text-muted-foreground/60">•</span>
          <span>{goal.department}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <Calendar className="h-3 w-3" />
        <span>Frist: {new Date(goal.dueDate).toLocaleDateString('de-DE')}</span>
      </div>

      {goal.keyResults.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-foreground mb-2">
            Key Results ({goal.keyResults.length}):
          </p>
          <div className="space-y-1">
            {goal.keyResults.slice(0, 2).map((kr) => (
              <div key={kr.id} className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>{kr.title}: {kr.currentValue}/{kr.targetValue}{kr.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {goal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {goal.tags.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit?.(goal.id)}
          className="flex-1"
        >
          <Edit className="h-3 w-3 mr-1" />
          Bearbeiten
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onCheckIn?.(goal.id)}
          className="flex-1"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Check-in
        </Button>
      </div>
    </div>
  );
};
