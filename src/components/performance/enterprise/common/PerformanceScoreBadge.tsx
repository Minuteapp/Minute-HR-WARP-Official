import { cn } from "@/lib/utils";

interface PerformanceScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showBar?: boolean;
  className?: string;
}

export function PerformanceScoreBadge({ 
  score, 
  size = "md", 
  showBar = true,
  className 
}: PerformanceScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const sizeClasses = {
    sm: "text-xl font-bold",
    md: "text-3xl font-bold",
    lg: "text-5xl font-bold"
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span className={cn(sizeClasses[size], getScoreColor(score))}>
        {Math.round(score)}
      </span>
      {showBar && (
        <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all", getBarColor(score))}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
