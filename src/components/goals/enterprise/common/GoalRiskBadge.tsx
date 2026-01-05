import { Badge } from "@/components/ui/badge";

interface GoalRiskBadgeProps {
  risk: string;
}

export const GoalRiskBadge = ({ risk }: GoalRiskBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    low: { label: 'Niedrig', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    medium: { label: 'Mittel', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
    high: { label: 'Hoch', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  };

  const { label, className } = config[risk] || config.low;

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
};
