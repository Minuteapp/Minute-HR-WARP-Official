import { ArchivedGoalCard } from "./ArchivedGoalCard";
import { Archive } from "lucide-react";

interface ArchivedGoal {
  id: string;
  title: string;
  description?: string | null;
  level?: string | null;
  progress?: number | null;
  owner_name?: string | null;
  target_date?: string | null;
  archived_at?: string | null;
  status?: string | null;
}

interface ArchivedGoalsListProps {
  goals: ArchivedGoal[];
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ArchivedGoalsList = ({ goals, onRestore, onDelete }: ArchivedGoalsListProps) => {
  if (goals.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center bg-muted/20">
        <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Keine archivierten Ziele</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Abgeschlossene Ziele werden hier archiviert und können jederzeit eingesehen 
          oder wiederhergestellt werden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <ArchivedGoalCard 
          key={goal.id} 
          goal={goal} 
          onRestore={onRestore}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
