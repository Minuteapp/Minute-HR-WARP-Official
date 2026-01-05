import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, User, Building2 } from "lucide-react";
import { GoalLevelIcon } from "../common/GoalLevelIcon";
import { GoalLevelBadge } from "../common/GoalLevelBadge";
import { GoalTypeBadge } from "../common/GoalTypeBadge";
import { GoalStatusBadge } from "../common/GoalStatusBadge";
import { GoalProgressBar } from "../common/GoalProgressBar";
import { GoalKeyResultRow } from "./GoalKeyResultRow";
import { SubGoalsCounter } from "./SubGoalsCounter";

interface KeyResult {
  id: string;
  title: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  goal_level: string;
  goal_type: string;
  status: string;
  progress: number;
  owner_name?: string;
  department_name?: string;
  is_employee_goal?: boolean;
  key_results?: KeyResult[];
  children?: Goal[];
}

interface HierarchyGoalCardProps {
  goal: Goal;
  level?: number;
  onGoalClick: (goal: Goal) => void;
}

export const HierarchyGoalCard = ({ goal, level = 0, onGoalClick }: HierarchyGoalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = goal.children && goal.children.length > 0;
  const hasKeyResults = goal.key_results && goal.key_results.length > 0;

  return (
    <div className="space-y-2" style={{ marginLeft: level > 0 ? `${level * 24}px` : 0 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {(hasChildren || hasKeyResults) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}
            
            <GoalLevelIcon level={goal.goal_level} className="h-5 w-5 mt-1" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <GoalLevelBadge level={goal.goal_level} />
                <GoalTypeBadge type={goal.goal_type} />
                {goal.is_employee_goal && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    MA-Ziel
                  </Badge>
                )}
              </div>
              
              <button 
                onClick={() => onGoalClick(goal)}
                className="text-left"
              >
                <h4 className="font-medium text-purple-600 hover:underline">
                  {goal.title}
                </h4>
              </button>
              
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {goal.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {goal.owner_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{goal.owner_name}</span>
                  </div>
                )}
                {goal.department_name && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>{goal.department_name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-muted-foreground">Fortschritt</span>
                <GoalProgressBar progress={goal.progress} className="flex-1 max-w-[200px]" />
                <span className="text-sm font-medium">{goal.progress}%</span>
                <GoalStatusBadge status={goal.status} />
              </div>

              {isExpanded && hasKeyResults && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-purple-600 mb-2">
                    Key Results ({goal.key_results!.length}):
                  </p>
                  <div className="space-y-1">
                    {goal.key_results!.map((kr) => (
                      <GoalKeyResultRow key={kr.id} keyResult={kr} />
                    ))}
                  </div>
                </div>
              )}

              {hasChildren && (
                <SubGoalsCounter 
                  count={goal.children!.length} 
                  onClick={() => setIsExpanded(!isExpanded)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {goal.children!.map((child) => (
            <HierarchyGoalCard 
              key={child.id} 
              goal={child} 
              level={level + 1}
              onGoalClick={onGoalClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
