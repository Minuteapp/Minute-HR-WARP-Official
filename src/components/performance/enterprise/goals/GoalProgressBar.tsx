import { cn } from "@/lib/utils";

interface GoalProgressBarProps {
  progress: number;
  expectedProgress?: number;
  className?: string;
}

export const GoalProgressBar = ({ progress, expectedProgress = 100, className }: GoalProgressBarProps) => {
  const isOnTrack = progress >= (expectedProgress * 0.8);
  
  return (
    <div className={cn("relative h-2 bg-muted rounded-full overflow-hidden", className)}>
      {/* Expected progress indicator */}
      {expectedProgress < 100 && (
        <div 
          className="absolute h-full bg-red-200"
          style={{ width: `${expectedProgress}%` }}
        />
      )}
      {/* Actual progress */}
      <div 
        className={cn(
          "absolute h-full rounded-full transition-all",
          isOnTrack ? "bg-green-500" : "bg-orange-500"
        )}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};
