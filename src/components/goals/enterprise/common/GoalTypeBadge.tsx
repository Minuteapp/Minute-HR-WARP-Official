import { Badge } from "@/components/ui/badge";

interface GoalTypeBadgeProps {
  type: string;
}

export const GoalTypeBadge = ({ type }: GoalTypeBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    strategic: { label: 'Strategisch', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
    operational: { label: 'Operativ', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
    project: { label: 'Projektbezogen', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    okr: { label: 'OKR', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
  };

  const { label, className } = config[type] || config.operational;

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
};
