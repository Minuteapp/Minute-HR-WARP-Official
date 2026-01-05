import { GoalCard } from "./GoalCard";

interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: string;
  due_date?: string;
}

interface EmployeeGoalsSectionProps {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    position?: string;
  };
  goals: Goal[];
  averageProgress: number;
  onViewGoal: (goal: Goal) => void;
}

export const EmployeeGoalsSection = ({
  employee,
  goals,
  averageProgress,
  onViewGoal
}: EmployeeGoalsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            {employee.first_name} {employee.last_name}
          </h3>
          {employee.position && (
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Durchschnittlicher Fortschritt</p>
          <p className="text-2xl font-bold text-primary">{averageProgress}%</p>
        </div>
      </div>
      
      <div className="space-y-3 pl-4 border-l-2 border-muted">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onView={() => onViewGoal(goal)} />
        ))}
      </div>
    </div>
  );
};
