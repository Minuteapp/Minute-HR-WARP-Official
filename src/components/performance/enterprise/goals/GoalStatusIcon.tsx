import { Target, Clock, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

interface GoalStatusIconProps {
  status: string;
  className?: string;
}

export const GoalStatusIcon = ({ status, className = "" }: GoalStatusIconProps) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className={`h-5 w-5 text-green-500 ${className}`} />;
    case 'on_track':
    case 'in_progress':
      return <TrendingUp className={`h-5 w-5 text-blue-500 ${className}`} />;
    case 'at_risk':
      return <AlertTriangle className={`h-5 w-5 text-orange-500 ${className}`} />;
    case 'overdue':
      return <Clock className={`h-5 w-5 text-red-500 ${className}`} />;
    default:
      return <Target className={`h-5 w-5 text-gray-500 ${className}`} />;
  }
};
