import { AlertCircle } from "lucide-react";
import { CriticalGoalCard } from "./CriticalGoalCard";

interface CriticalGoal {
  id: string;
  title: string;
  owner_name: string;
  goal_level: string;
  progress: number;
  target_progress: number;
}

interface CriticalGoalsSectionProps {
  goals: CriticalGoal[];
}

export const CriticalGoalsSection = ({ goals }: CriticalGoalsSectionProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold">
          Top 5 Kritische Ziele (größte Abweichungen)
        </h3>
      </div>
      
      <div className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Keine kritischen Ziele gefunden.
          </p>
        ) : (
          goals.map((goal) => (
            <CriticalGoalCard
              key={goal.id}
              title={goal.title}
              ownerName={goal.owner_name || 'Nicht zugewiesen'}
              level={goal.goal_level || 'individual'}
              currentProgress={goal.progress || 0}
              targetProgress={goal.target_progress || 100}
            />
          ))
        )}
      </div>
    </div>
  );
};
