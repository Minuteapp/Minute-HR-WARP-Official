import { Card, CardContent } from "@/components/ui/card";
import { Link2 } from "lucide-react";

interface RelatedGoal {
  id: string;
  title: string;
  progress: number;
}

interface GoalHierarchySectionProps {
  parentGoal?: RelatedGoal;
  childGoals: RelatedGoal[];
  onGoalClick: (goalId: string) => void;
}

export const GoalHierarchySection = ({
  parentGoal,
  childGoals,
  onGoalClick
}: GoalHierarchySectionProps) => {
  if (!parentGoal && childGoals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Zielhierarchie</span>
      </div>
      
      {parentGoal && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">↗ Übergeordnetes Ziel:</p>
          <Card 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onGoalClick(parentGoal.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-600 hover:underline font-medium text-sm">
                  {parentGoal.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {parentGoal.progress}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {childGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            ↳ Untergeordnete Ziele ({childGoals.length}):
          </p>
          <div className="space-y-2">
            {childGoals.map((goal) => (
              <Card 
                key={goal.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onGoalClick(goal.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-600 hover:underline font-medium text-sm">
                      {goal.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {goal.progress}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
