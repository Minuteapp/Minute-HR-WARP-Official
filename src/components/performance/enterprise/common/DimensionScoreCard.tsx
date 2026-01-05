import { Target, CheckSquare, MessageSquare, GraduationCap, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DimensionScoreCardProps {
  dimension: "goals" | "tasks" | "feedback" | "development";
  score: number;
  weight?: number;
  description?: string;
  count?: number;
  showProgress?: boolean;
  className?: string;
}

const dimensionConfig: Record<string, { icon: LucideIcon; label: string; color: string; bgColor: string }> = {
  goals: {
    icon: Target,
    label: "Ziele",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  tasks: {
    icon: CheckSquare,
    label: "Aufgaben",
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  },
  feedback: {
    icon: MessageSquare,
    label: "Feedback",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100"
  },
  development: {
    icon: GraduationCap,
    label: "Entwicklung",
    color: "text-green-600",
    bgColor: "bg-green-100"
  }
};

export function DimensionScoreCard({
  dimension,
  score,
  weight,
  description,
  count,
  showProgress = true,
  className
}: DimensionScoreCardProps) {
  const config = dimensionConfig[dimension];
  const Icon = config.icon;

  const getProgressColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("bg-card border rounded-lg p-4", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{config.label}</span>
            {weight !== undefined && (
              <span className="text-xs text-muted-foreground">({weight}%)</span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold">{Math.round(score)}%</span>
          {count !== undefined && (
            <p className="text-xs text-muted-foreground">{count} Einträge</p>
          )}
        </div>
      </div>
      
      {showProgress && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all", getProgressColor(score))}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
