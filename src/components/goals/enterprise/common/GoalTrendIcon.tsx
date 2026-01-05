import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface GoalTrendIconProps {
  trend: string;
  className?: string;
}

export const GoalTrendIcon = ({ trend, className = "h-4 w-4" }: GoalTrendIconProps) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className={`text-green-500 ${className}`} />;
    case 'down':
      return <TrendingDown className={`text-red-500 ${className}`} />;
    case 'stable':
    default:
      return <Minus className={`text-gray-500 ${className}`} />;
  }
};
