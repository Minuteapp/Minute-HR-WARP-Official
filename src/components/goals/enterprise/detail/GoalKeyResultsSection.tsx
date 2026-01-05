import { CheckCircle } from "lucide-react";
import { GoalKeyResultCard } from "./GoalKeyResultCard";

interface KeyResult {
  id: string;
  title: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
  measurement_type?: string;
}

interface GoalKeyResultsSectionProps {
  keyResults: KeyResult[];
}

export const GoalKeyResultsSection = ({ keyResults }: GoalKeyResultsSectionProps) => {
  if (keyResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Key Results ({keyResults.length})</span>
      </div>
      
      <div className="space-y-3">
        {keyResults.map((kr) => (
          <GoalKeyResultCard key={kr.id} keyResult={kr} />
        ))}
      </div>
    </div>
  );
};
