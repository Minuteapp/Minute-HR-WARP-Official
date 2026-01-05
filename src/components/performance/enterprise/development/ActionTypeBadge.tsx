import { Badge } from "@/components/ui/badge";

interface ActionTypeBadgeProps {
  type: string;
}

export const ActionTypeBadge = ({ type }: ActionTypeBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    mentoring: { label: 'Mentoring', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    coaching: { label: 'Coaching', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    training: { label: 'Schulung', className: 'bg-green-100 text-green-700 border-green-200' },
    goal_adjustment: { label: 'Zielanpassung', className: 'bg-orange-100 text-orange-700 border-orange-200' }
  };

  const { label, className } = config[type] || { label: type, className: 'bg-gray-100 text-gray-700' };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
