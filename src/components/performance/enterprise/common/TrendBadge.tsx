import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  trend: "rising" | "falling" | "stable";
  showLabel?: boolean;
  className?: string;
}

export function TrendBadge({ trend, showLabel = true, className }: TrendBadgeProps) {
  const config = {
    rising: {
      icon: TrendingUp,
      label: "Aufwärtstrend",
      className: "bg-green-100 text-green-700 border-green-200"
    },
    falling: {
      icon: TrendingDown,
      label: "Abwärtstrend",
      className: "bg-red-100 text-red-700 border-red-200"
    },
    stable: {
      icon: Minus,
      label: "Stabil",
      className: "bg-gray-100 text-gray-700 border-gray-200"
    }
  };

  const { icon: Icon, label, className: badgeClassName } = config[trend];

  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1 font-normal", badgeClassName, className)}
    >
      <Icon className="h-3 w-3" />
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}
