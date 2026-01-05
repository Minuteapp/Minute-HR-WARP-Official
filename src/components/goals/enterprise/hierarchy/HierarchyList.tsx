import { HierarchyGoalCard } from "./HierarchyGoalCard";

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
  parent_goal_id?: string;
}

interface HierarchyListProps {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
}

export const HierarchyList = ({ goals, onGoalClick }: HierarchyListProps) => {
  // Build hierarchy from flat list
  const buildHierarchy = (goals: Goal[]): Goal[] => {
    const goalMap = new Map<string, Goal>();
    const rootGoals: Goal[] = [];

    // First pass: create map
    goals.forEach(goal => {
      goalMap.set(goal.id, { ...goal, children: [] });
    });

    // Second pass: build tree
    goals.forEach(goal => {
      const currentGoal = goalMap.get(goal.id)!;
      if (goal.parent_goal_id && goalMap.has(goal.parent_goal_id)) {
        const parent = goalMap.get(goal.parent_goal_id)!;
        parent.children = parent.children || [];
        parent.children.push(currentGoal);
      } else {
        rootGoals.push(currentGoal);
      }
    });

    return rootGoals;
  };

  const hierarchicalGoals = buildHierarchy(goals);

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Keine Ziele vorhanden. Erstellen Sie Ihr erstes Ziel, um die Hierarchie aufzubauen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hierarchicalGoals.map((goal) => (
        <HierarchyGoalCard 
          key={goal.id} 
          goal={goal}
          onGoalClick={onGoalClick}
        />
      ))}
    </div>
  );
};
