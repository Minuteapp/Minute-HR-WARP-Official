import { Badge } from "@/components/ui/badge";

interface GoalLevelBadgeProps {
  level: string;
}

export const GoalLevelBadge = ({ level }: GoalLevelBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    company: { label: 'Unternehmen', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
    department: { label: 'Bereich', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
    team: { label: 'Team', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    individual: { label: 'Individual', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
  };

  const { label, className } = config[level] || config.individual;

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
};
