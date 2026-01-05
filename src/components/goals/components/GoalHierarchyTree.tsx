import { useState } from 'react';
import { GoalCardData } from '@/types/goals-statistics';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface GoalHierarchyTreeProps {
  goals: GoalCardData[];
  onSelectGoal?: (goal: GoalCardData) => void;
  selectedGoalId?: string;
}

interface GoalTreeItemProps {
  goal: GoalCardData;
  level: number;
  onSelectGoal?: (goal: GoalCardData) => void;
  selectedGoalId?: string;
}

const GoalTreeItem = ({ goal, level, onSelectGoal, selectedGoalId }: GoalTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;

  const statusColors = {
    'on-track': 'bg-green-100 text-green-700',
    'at-risk': 'bg-yellow-100 text-yellow-700',
    'behind': 'bg-red-100 text-red-700',
    'completed': 'bg-blue-100 text-blue-700',
  };

  const statusLabels = {
    'on-track': 'On Track',
    'at-risk': 'At Risk',
    'behind': 'Behind',
    'completed': 'Abgeschlossen',
  };

  return (
    <div style={{ marginLeft: `${level * 24}px` }}>
      <div
        className={cn(
          "rounded-lg p-4 mb-2 cursor-pointer transition-colors border",
          selectedGoalId === goal.id
            ? "bg-primary/5 border-primary"
            : "bg-card hover:bg-muted/50 border-border"
        )}
        onClick={() => onSelectGoal?.(goal)}
      >
        <div className="flex items-start gap-3">
          {hasSubGoals && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-foreground">{goal.title}</h4>
              <Badge className={statusColors[goal.status]}>
                {statusLabels[goal.status]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <span>{goal.owner}</span>
              <span>•</span>
              <span>{goal.department}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Progress value={goal.progress} className="h-1.5 flex-1" />
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                {goal.progress}%
              </span>
            </div>
            
            {hasSubGoals && (
              <p className="text-xs text-muted-foreground mt-2">
                {goal.subGoals!.length} Unterziele
              </p>
            )}
          </div>
        </div>
      </div>

      {hasSubGoals && isExpanded && (
        <div>
          {goal.subGoals!.map((subGoal) => (
            <GoalTreeItem
              key={subGoal.id}
              goal={subGoal}
              level={level + 1}
              onSelectGoal={onSelectGoal}
              selectedGoalId={selectedGoalId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const GoalHierarchyTree = ({ goals, onSelectGoal, selectedGoalId }: GoalHierarchyTreeProps) => {
  return (
    <div className="space-y-2">
      {goals.map((goal) => (
        <GoalTreeItem
          key={goal.id}
          goal={goal}
          level={0}
          onSelectGoal={onSelectGoal}
          selectedGoalId={selectedGoalId}
        />
      ))}
    </div>
  );
};
