import { User } from "lucide-react";
import { EmployeeGoalsList } from "./EmployeeGoalsList";

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
}

interface EmployeeCardProps {
  name: string;
  goalCount: number;
  averageProgress: number;
  goals?: Goal[];
  showGoals?: boolean;
}

export const EmployeeCard = ({ 
  name, 
  goalCount, 
  averageProgress, 
  goals = [],
  showGoals = false 
}: EmployeeCardProps) => {
  return (
    <div className="p-3 bg-background rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-full">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{name}</p>
          {showGoals && (
            <p className="text-xs text-muted-foreground">
              {goalCount} Ziele · Ø {averageProgress}%
            </p>
          )}
        </div>
      </div>
      {showGoals && goals.length > 0 && (
        <div className="mt-3 pl-10">
          <EmployeeGoalsList goals={goals} />
        </div>
      )}
    </div>
  );
};
