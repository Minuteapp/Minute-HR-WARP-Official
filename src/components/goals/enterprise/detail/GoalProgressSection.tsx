import { TrendingUp, AlertTriangle } from "lucide-react";
import { GoalProgressBar } from "../common/GoalProgressBar";

interface GoalProgressSectionProps {
  progress: number;
  targetProgress: number;
}

export const GoalProgressSection = ({ progress, targetProgress }: GoalProgressSectionProps) => {
  const gap = targetProgress - progress;
  const isBelow = gap > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Fortschritt</span>
        </div>
        <span className="text-sm font-medium">{progress}% / {targetProgress}%</span>
      </div>
      
      <GoalProgressBar 
        progress={progress} 
        targetProgress={targetProgress}
        showTarget={true}
        className="h-3"
      />
      
      {isBelow && gap >= 5 && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{gap}% Rückstand zum Soll</span>
        </div>
      )}
    </div>
  );
};
