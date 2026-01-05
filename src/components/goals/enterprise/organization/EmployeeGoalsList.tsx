import { Progress } from "@/components/ui/progress";
import { GoalStatusBadge } from "../common/GoalStatusBadge";

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
}

interface EmployeeGoalsListProps {
  goals: Goal[];
}

export const EmployeeGoalsList = ({ goals }: EmployeeGoalsListProps) => {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">Keine Ziele zugewiesen</p>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {goals.map((goal) => (
        <div key={goal.id} className="flex items-center gap-3 text-sm">
          <div className="flex-1 min-w-0">
            <p className="truncate">{goal.title}</p>
          </div>
          <Progress value={goal.progress} className="w-20 h-2" />
          <span className="text-xs text-muted-foreground w-10">{goal.progress}%</span>
          <GoalStatusBadge status={goal.status} />
        </div>
      ))}
    </div>
  );
};
