import { EmployeeGoalsSection } from "./EmployeeGoalsSection";

interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: string;
  due_date?: string;
  employee_id: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position?: string;
}

interface GoalsByEmployeeListProps {
  goals: Goal[];
  employees: Employee[];
  onViewGoal: (goal: Goal) => void;
}

export const GoalsByEmployeeList = ({
  goals,
  employees,
  onViewGoal
}: GoalsByEmployeeListProps) => {
  // Group goals by employee
  const goalsByEmployee = employees
    .map(employee => {
      const empGoals = goals.filter(g => g.employee_id === employee.id);
      const avgProgress = empGoals.length > 0
        ? Math.round(empGoals.reduce((sum, g) => sum + g.progress, 0) / empGoals.length)
        : 0;
      return {
        employee,
        goals: empGoals,
        averageProgress: avgProgress
      };
    })
    .filter(group => group.goals.length > 0);

  if (goalsByEmployee.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Keine Ziele gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {goalsByEmployee.map(({ employee, goals, averageProgress }) => (
        <EmployeeGoalsSection
          key={employee.id}
          employee={employee}
          goals={goals}
          averageProgress={averageProgress}
          onViewGoal={onViewGoal}
        />
      ))}
    </div>
  );
};
