import { Badge } from "@/components/ui/badge";

interface ReviewTypeBadgeProps {
  type: string;
}

export const ReviewTypeBadge = ({ type }: ReviewTypeBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    quarterly: { label: 'Quartalsgespräch', className: 'bg-primary/10 text-primary' },
    probation: { label: 'Probezeit', className: 'bg-purple-100 text-purple-700' },
    annual: { label: 'Jahresgespräch', className: 'bg-indigo-100 text-indigo-700' }
  };

  const { label, className } = config[type] || { label: type, className: 'bg-gray-100 text-gray-700' };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
