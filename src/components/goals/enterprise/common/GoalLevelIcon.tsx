import { Building2, Users, UsersRound, User } from "lucide-react";

interface GoalLevelIconProps {
  level: string;
  className?: string;
}

export const GoalLevelIcon = ({ level, className = "h-5 w-5" }: GoalLevelIconProps) => {
  switch (level) {
    case 'company':
      return <Building2 className={`text-purple-600 ${className}`} />;
    case 'department':
      return <Users className={`text-blue-600 ${className}`} />;
    case 'team':
      return <UsersRound className={`text-green-600 ${className}`} />;
    case 'individual':
    default:
      return <User className={`text-gray-600 ${className}`} />;
  }
};
