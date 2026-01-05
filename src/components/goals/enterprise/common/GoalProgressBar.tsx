import { cn } from "@/lib/utils";

interface GoalProgressBarProps {
  progress: number;
  targetProgress?: number;
  className?: string;
  showTarget?: boolean;
}

export const GoalProgressBar = ({ 
  progress, 
  targetProgress = 100, 
  className,
  showTarget = true 
}: GoalProgressBarProps) => {
  const isOnTrack = progress >= (targetProgress * 0.9);
  const progressColor = isOnTrack ? 'bg-green-500' : progress >= (targetProgress * 0.7) ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className={cn("relative h-2 bg-muted rounded-full overflow-hidden", className)}>
      {showTarget && targetProgress < 100 && (
        <div 
          className="absolute h-full bg-gray-300"
          style={{ width: `${targetProgress}%` }}
        />
      )}
      <div 
        className={cn("absolute h-full rounded-full transition-all", progressColor)}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};
