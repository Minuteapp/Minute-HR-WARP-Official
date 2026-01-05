import { cn } from "@/lib/utils";

interface PerformanceProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PerformanceProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = "md",
  className
}: PerformanceProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const getBarColor = (percent: number) => {
    if (percent >= 75) return "bg-green-500";
    if (percent >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div 
          className={cn("h-full rounded-full transition-all", getBarColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium min-w-[3rem] text-right">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
